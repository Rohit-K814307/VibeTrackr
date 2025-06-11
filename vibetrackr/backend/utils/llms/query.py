import os
from google import genai
from google.genai import types


#make the google ai gemini client to be reused elsewhere (for easy use)
def make_client():
    key = os.environ.get("aistudiokey")
    client = genai.Client(api_key=key)
    return client

#.text for actual response text
def make_query(querytext, client):
    return client.models.generate_content(
        model="gemini-2.0-flash",
        contents=querytext
    )