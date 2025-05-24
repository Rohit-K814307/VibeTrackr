from flask import Flask, request, jsonify
from firebase_admin import auth
from functools import wraps
from flask_cors import CORS
from flasgger import Swagger
from datetime import datetime

from backend.database.dbsetup import load_firebase_local, load_firebase_app
from backend.utils.llms.prompts import get_spotify_client, get_spotify_recs, query_mood_mentor
from backend.utils.llms.query import make_client
from backend.utils.ml.query_api_bert import analyze_journal

# === Setup ===
app = Flask(__name__)
CORS(app, origins=["http://localhost:3000", "https://vibetrackr.netlify.app"])
#CORS(app)

swagger = Swagger(app, template={
    "securityDefinitions": {
        "Bearer": {
            "type": "apiKey",
            "name": "Authorization",
            "in": "header",
            "description": "JWT Authorization header using the Bearer scheme. Example: 'Bearer {token}'"
        }
    }
})

db = load_firebase_app()
spotify = get_spotify_client()
gai = make_client()

# === Firebase Auth Decorator ===
def verify_firebase_token(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        auth_header = request.headers.get('Authorization', None)
        if not auth_header or not auth_header.startswith('Bearer '):
            return jsonify({'error': 'Unauthorized'}), 401
        id_token = auth_header.split('Bearer ')[1]
        try:
            decoded_token = auth.verify_id_token(id_token)
            request.user = decoded_token
        except Exception as e:
            return jsonify({'error': 'Invalid token', 'details': str(e)}), 401
        return f(*args, **kwargs)
    return decorated


# === Routes ===

@app.route('/create-user', methods=['POST'])
@verify_firebase_token
def create_user():
    """
    Create a new user.
    ---
    tags:
      - Users
    security:
      - Bearer: []
    parameters:
      - in: body
        name: body
        required: true
        schema:
          type: object
          required:
            - name
            - email
          properties:
            name:
              type: string
              example: John Doe
            email:
              type: string
              example: john@example.com
    responses:
      201:
        description: User created successfully
      401:
        description: Unauthorized
    """
    data = request.json
    name = data.get('name')
    email = data.get('email')
    uid = request.user['uid']

    db.collection('users').document(uid).set({
        'name': name,
        'email': email
    })

    db.collection('users').document(uid).collection('journals').document('init_journal').set({
        'title': 'Placeholder to instantiate collection.',
        'content':"placeholder journal",
        'timestamp':int(datetime.now().timestamp()),
        'date':datetime.now().strftime('%Y-%m-%d')
    })

    return jsonify({'message': 'User created'}), 201


@app.route('/get-user', methods=['GET'])
@verify_firebase_token
def get_user():
    """
    Get the user's profile and their journals.
    ---
    tags:
      - Users
    security:
      - Bearer: []
    responses:
      200:
        description: User data with journals
        schema:
          type: object
          properties:
            name:
              type: string
            email:
              type: string
            journals:
              type: array
              items:
                type: object
                properties:
                  id:
                    type: string
                  title:
                    type: string
                  content:
                    type: string
                  analysis:
                    type: object
      401:
        description: Unauthorized
      404:
        description: User not found
    """
    uid = request.user['uid']
    user_ref = db.collection('users').document(uid)
    user_doc = user_ref.get()
    if not user_doc.exists:
        return jsonify({'error': 'User not found'}), 404

    journals = user_ref.collection('journals').stream()
    journal_list = [{**j.to_dict(), 'id': j.id} for j in journals]

    user_data = user_doc.to_dict()
    user_data['journals'] = journal_list
    return jsonify(user_data), 200


@app.route('/add-journal', methods=['POST'])
@verify_firebase_token
def add_journal():
    """
    Add a new journal entry.
    ---
    tags:
      - Journals
    security:
      - Bearer: []
    parameters:
      - in: body
        name: body
        required: true
        schema:
          type: object
          required:
            - title
            - content
          properties:
            title:
              type: string
              example: Today's Mood
            content:
              type: string
              example: Feeling good
    responses:
      201:
        description: Journal added successfully
        schema:
          type: object
          properties:
            message:
              type: string
            journalId:
              type: string
      401:
        description: Unauthorized
    """
    uid = request.user['uid']
    journal_data = request.json

    journal_analysis = analyze_journal(journal_data.get("content"))
    journal_data["analysis"] = journal_analysis
    journal_data["timestamp"] = int(datetime.now().timestamp())
    journal_data["date"] = datetime.now().strftime('%Y-%m-%d')

    journal_ref = db.collection('users').document(uid).collection('journals').document()
    journal_ref.set(journal_data)
    return jsonify({'message': 'Journal added', 'journalId': journal_ref.id}), 201


@app.route('/get-journals', methods=['GET'])
@verify_firebase_token
def get_journals():
    """
    Get all journals for the authenticated user.
    ---
    tags:
      - Journals
    security:
      - Bearer: []
    responses:
      200:
        description: List of journals
        schema:
          type: array
          items:
            type: object
            properties:
              id:
                type: string
              title:
                type: string
              content:
                type: string
              analysis:
                type: object
      401:
        description: Unauthorized
    """
    uid = request.user['uid']
    journal_ref = db.collection('users').document(uid).collection('journals')
    journal_docs = journal_ref.stream()
    journals = [{**doc.to_dict(), 'id': doc.id} for doc in journal_docs if doc.id != "init_journal"]
    return jsonify(journals), 200


@app.route('/delete-journal', methods=['DELETE'])
@verify_firebase_token
def delete_journal():
    """
    Delete a specific journal by its ID.
    ---
    tags:
      - Journals
    security:
      - Bearer: []
    parameters:
      - in: query
        name: journal_id
        type: string
        required: true
        description: ID of the journal to delete
    responses:
      200:
        description: Journal deleted
      401:
        description: Unauthorized
      404:
        description: Journal not found
    """
    journal_id = request.args.get('journal_id')
    if not journal_id:
        return jsonify({'error': 'Missing journal_id'}), 400

    uid = request.user['uid']
    journal_ref = db.collection('users').document(uid).collection('journals').document(journal_id)
    if not journal_ref.get().exists:
        return jsonify({'error': 'Journal not found'}), 404

    journal_ref.delete()
    return jsonify({'message': 'Journal deleted'}), 200


@app.route('/update-journal', methods=['PUT'])
@verify_firebase_token
def update_journal():
    """
    Update a specific journal.
    ---
    tags:
      - Journals
    security:
      - Bearer: []
    parameters:
      - in: query
        name: journal_id
        type: string
        required: true
        description: ID of the journal to update
      - in: body
        name: body
        required: true
        schema:
          type: object
          properties:
            title:
              type: string
              example: Updated Title
            content:
              type: string
              example: New content...
    responses:
      200:
        description: Journal updated
      401:
        description: Unauthorized
      404:
        description: Journal not found
    """
    journal_id = request.args.get('journal_id')
    if not journal_id:
        return jsonify({'error': 'Missing journal_id'}), 400

    uid = request.user['uid']
    journal_data = request.json
    journal_ref = db.collection('users').document(uid).collection('journals').document(journal_id)

    if not journal_ref.get().exists:
        return jsonify({'error': 'Journal not found'}), 404

    journal_analysis = analyze_journal(journal_data.get("content"))
    journal_data["analysis"] = journal_analysis
    journal_data["timestamp"] = int(datetime.now().timestamp())
    journal_data["date"] = datetime.now().strftime('%Y-%m-%d')

    journal_ref.update(journal_data)
    return jsonify({'message': 'Journal updated'}), 200


@app.route('/get-spot-recs', methods=['GET'])
@verify_firebase_token
def get_spot_recs():
    """
    Get Spotify recommendations based on the latest journal entries.
    ---
    tags:
      - Spotify
    summary: Generate music recommendations using journal entries.
    description: |
      Returns Spotify track recommendations based on the 5 most recent journal entries 
      from a Firebase-authenticated user. If fewer than 2 entries exist, returns null.
    security:
      - Bearer: []
    responses:
      200:
        description: A list of Spotify track recommendations or null.
        content:
          application/json:
            schema:
              type: object
              properties:
                recs:
                  type: array
                  items:
                    type: object
                    properties:
                      title:
                        type: string
                        example: "Happy Vibes"
                      artist:
                        type: string
                        example: "John Doe"
                      url:
                        type: string
                        example: "https://open.spotify.com/track/abc123"
                  nullable: true
    """
    uid = request.user['uid']
    journals = db.collection('users').document(uid).collection('journals').stream()
    journal_list = [{**j.to_dict(), 'id': j.id} for j in journals if j.id != "init_journal"]

    latest_entries = sorted(journal_list, key=lambda x: x["timestamp"], reverse=True)[:5]
    journals_str = "\n\n".join(j.get("content", "") for j in latest_entries)

    tracks = get_spotify_recs(journals_str, gai, spotify)

    return jsonify({'recs': tracks}), 200


@app.route('/get-mood-mentor', methods=['GET'])
@verify_firebase_token
def get_mood_mentor():
    """
    Get mood mentor suggestions based on the latest journal entries.
    ---
    tags:
      - Mood Mentor
    summary: Receive supportive, AI-driven reflections from your recent entries.
    description: |
      Uses AI to read your latest 5 journal entries and provides supportive, mood-based reflections. 
      Returns null if not enough entries are available.
    security:
      - Bearer: []
    responses:
      200:
        description: A mood mentor suggestion or null.
        content:
          application/json:
            schema:
              type: object
              properties:
                mentor:
                  type: string
                  example: "Remember, it's okay to feel overwhelmed sometimes — take a deep breath."
                  nullable: true
    """
    uid = request.user['uid']
    journals = db.collection('users').document(uid).collection('journals').stream()
    journal_list = [{**j.to_dict(), 'id': j.id} for j in journals if j.id != "init_journal"]

    latest_entries = sorted(journal_list, key=lambda x: x["timestamp"], reverse=True)[:5]
    journals_str = "\n\n".join(j.get("content", "") for j in latest_entries)

    mentor = query_mood_mentor(journals_str, gai)

    return jsonify({'mentor': mentor}), 200


# === Run locally ===
if __name__ == '__main__':
    app.run(debug=False)
