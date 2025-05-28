import os
import json
import firebase_admin
from firebase_admin import credentials, firestore


def load_firebase_app():
    with open("/etc/secrets/vibetrackr-firebase-admin-sdk.json") as f:
        firebase_config = json.load(f)
    cred = credentials.Certificate(firebase_config)
    firebase_admin.initialize_app(cred)
    return firestore.client()


def load_firebase_local():
    with open("/Users/rohitkulkarni/Documents/VibeTrackr/vibetrackr/backend/database/vibetrackr-firebase-admin-sdk.json") as f:
        firebase_config = json.load(f)
    cred = credentials.Certificate(firebase_config)
    firebase_admin.initialize_app(cred)
    return firestore.client()


"""
Content that needs to be logged in database
users (collection)
  └── userId (document)
        ├── name
        ├── email
        └── journals (subcollection)
              └── journalId (document)
                    ├── date
                    ├── journalText
                    ├── moodEmojivalue
                    ├── Emotion
                    ├── V
                    ├── A
                    ├── D
                    ├── VScaledByMag
                    ├── EmotiveAngularDistance
                    ├── musicRecommendations
                    └── mentorSteps
"""