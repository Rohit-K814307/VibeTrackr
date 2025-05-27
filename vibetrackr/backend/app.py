from flask import Flask, request, jsonify, make_response
from firebase_admin import auth, credentials, initialize_app
import firebase_admin
from functools import wraps
from flask_cors import CORS
from flasgger import Swagger
from datetime import datetime, timedelta

from database.dbsetup import load_firebase_app#,load_firebase_local
from utils.llms.prompts import get_spotify_client, get_spotify_recs, query_mood_mentor
from utils.llms.query import make_client
from utils.ml.query_api_bert import analyze_journal

# === Setup ===
app = Flask(__name__)

# --- CORS Configuration ---
CORS(app, origins=["http://localhost:3000", "http://localhost:5173", "https://vibetrackr.netlify.app"], supports_credentials=True)

swagger = Swagger(app, template={
    "securityDefinitions": {
        "CookieAuth": {
            "type": "apiKey",
            "name": "session",
            "in": "cookie",
            "description": "Firebase session cookie"
        }
    }
})

db = load_firebase_app()
spotify = get_spotify_client()
gai = make_client()

# === Firebase Auth Decorator ===
def verify_session_cookie(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        session_cookie = request.cookies.get('session')
        if not session_cookie:
            return jsonify({'error': 'Unauthorized - No session cookie provided'}), 401
        try:
            decoded_token = auth.verify_session_cookie(session_cookie, check_revoked=True)
            request.user = decoded_token  # Add user info to the request context
        except auth.InvalidSessionCookieError:
            return jsonify({'error': 'Invalid session cookie. Please login again.'}), 401
        except auth.RevokedSessionCookieError:
            return jsonify({'error': 'Session cookie has been revoked. Please login again.'}), 401
        except Exception as e:
            app.logger.error(f"Error verifying session cookie: {e}")
            return jsonify({'error': 'Failed to verify session cookie', 'details': str(e)}), 401
        return f(*args, **kwargs)
    return decorated

# === Routes ===
@app.route('/login', methods=['POST'])
def login():
    data = request.json
    id_token = data.get('idToken')
    if not id_token:
        return jsonify({'error': 'Missing idToken'}), 400

    try:
        expires_in = timedelta(days=14)

        session_cookie = auth.create_session_cookie(id_token, expires_in=expires_in)
        response = make_response(jsonify({'message': 'Successfully logged in'}))
        
        # --- Cookie Settings ---
        # secure=True: Cookie only sent over HTTPS. Essential for production and for SameSite=None.
        # httponly=True: Cookie not accessible via client-side JavaScript. Essential for security.
        # samesite='None': Allows cross-site cookie usage (frontend on one domain, backend on another).
        # Requires secure=True.
        # For local HTTP development (Flask default), 'secure=True' might prevent cookie setting
        # unless Flask runs HTTPS (e.g., ssl_context='adhoc') or you use a reverse proxy.
        # If testing locally over HTTP, you might temporarily use samesite='Lax' and secure=False,
        # BUT REMEMBER TO CHANGE BACK for production and for cross-origin requests.
        # Given your CORS setup, 'None' and 'Secure' is the correct long-term approach.
        
        is_production = not app.debug # A simple way to check if in production
        secure_cookie = is_production or request.is_secure # Be secure if prod or if request is already secure
        samesite_policy = 'None' if secure_cookie else 'Lax'

        if samesite_policy == 'None' and not secure_cookie:
            app.logger.warning("SameSite=None requires Secure attribute. Cookie may not be set correctly.")
            secure_cookie = True


        response.set_cookie(
            'session',
            session_cookie,
            max_age=int(expires_in.total_seconds()),
            httponly=True,
            secure=secure_cookie,
            samesite=samesite_policy
        )
        app.logger.info(f"Login: Setting cookie with Secure={secure_cookie} and SameSite={samesite_policy}")
        return response
    except auth.FirebaseAuthException as e:
        app.logger.error(f"Firebase auth exception during login: {e}")
        return jsonify({'error': 'Failed to create session cookie (Firebase Auth)', 'details': str(e)}), 401
    except Exception as e:
        app.logger.error(f"Generic exception during login: {e}")
        return jsonify({'error': 'An unexpected error occurred during login', 'details': str(e)}), 500

@app.route('/logout', methods=['POST'])
def logout():
    session_cookie = request.cookies.get('session')
    if not session_cookie:
        return jsonify({'message': 'No active session to log out from.'}), 200 

    response = make_response(jsonify({'message': 'Successfully logged out'}))
    try:
        # Verify the cookie to get claims, including 'sub' (user_id)
        decoded_claims = auth.verify_session_cookie(session_cookie) 
        auth.revoke_refresh_tokens(decoded_claims['sub'])
        app.logger.info(f"User {decoded_claims['sub']} tokens revoked.")
    except auth.InvalidSessionCookieError:
        app.logger.warning("Logout attempt with an invalid session cookie.")
    except Exception as e:
        app.logger.error(f"Error during token revocation or cookie verification on logout: {e}")
  
    is_production = not app.debug
    secure_cookie = is_production or request.is_secure
    samesite_policy = 'None' if secure_cookie else 'Lax'
    if samesite_policy == 'None' and not secure_cookie:
        secure_cookie = True

    response.set_cookie(
        'session', '', expires=0,
        httponly=True, secure=secure_cookie, samesite=samesite_policy
    )
    app.logger.info(f"Logout: Clearing cookie with Secure={secure_cookie} and SameSite={samesite_policy}")
    return response


@app.route('/create-user', methods=['POST'])
@verify_session_cookie  
def create_user():
    data = request.json
    uid = request.user['uid'] 

    user_ref = db.collection('users').document(uid)
    if user_ref.get().exists:
        return jsonify({'message': 'User profile already exists in database.'}), 200 

    try:
        firebase_user = auth.get_user(uid)
        name = data.get('name', firebase_user.display_name or uid) 
        email = data.get('email', firebase_user.email)
    except Exception as e:
        app.logger.error(f"Could not fetch Firebase user {uid} details: {e}")
        
        name = data.get('name', uid) 
        email = data.get('email')
        if not email:
            return jsonify({'error': 'Email is required and could not be determined.'}), 400


    if not name or not email:
        return jsonify({'error': 'Name and email are required to create user profile'}), 400

    db.collection('users').document(uid).set({
        'name': name,
        'email': email,
        'uid': uid,
        'createdAt': datetime.now().isoformat()
    })

    db.collection('users').document(uid).collection('journals').document('init_journal').set({
        'title': 'Placeholder to instantiate collection.',
        'content': "placeholder journal",
        'timestamp': int(datetime.now().timestamp()),
        'date': datetime.now().strftime('%Y-%m-%d')
    })

    return jsonify({'message': 'User profile created successfully in database', 'uid': uid, 'name': name, 'email': email}), 201

@app.route('/get-user', methods=['GET'])
@verify_session_cookie
def get_user():
    uid = request.user['uid']
    user_ref = db.collection('users').document(uid)
    user_doc = user_ref.get()

    if not user_doc.exists:
        try:
            firebase_user_record = auth.get_user(uid)
            return jsonify({
                'message': 'User authenticated but no profile found in VibeTrackr database. Please complete profile creation.',
                'uid': uid,
                'email': firebase_user_record.email, 
                'name': firebase_user_record.display_name,
                'profileExistsInDB': False
            }), 404 
        except Exception as e:
            app.logger.error(f"Error fetching Firebase user {uid} for 404 /get-user response: {e}")
            return jsonify({'error': 'User authenticated but profile missing and Firebase details could not be fetched.'}), 404


    journals_ref = user_ref.collection('journals')
    journals_query = journals_ref.where("id", "!=", "init_journal").order_by("timestamp", direction=firebase_admin.firestore.firestore.Query.DESCENDING).stream()
    journal_list = [{'id': j.id, **j.to_dict()} for j in journals_query]

    user_data = user_doc.to_dict()
    user_data['journals'] = journal_list
    user_data['uid'] = uid 
    user_data['profileExistsInDB'] = True
    return jsonify(user_data), 200


@app.route('/add-journal', methods=['POST'])
@verify_session_cookie
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
@verify_session_cookie
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
@verify_session_cookie
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
@verify_session_cookie
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
@verify_session_cookie
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
@verify_session_cookie
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


# === Run ===
if __name__ == '__main__':
    app.run(debug=False)
