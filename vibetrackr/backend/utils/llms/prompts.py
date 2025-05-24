from backend.utils.llms.query import make_query, make_client
import os
import math
import spotipy
from spotipy.oauth2 import SpotifyClientCredentials
import json


#make prompting + response parsing for spotify music recommendations

def get_spotify_client():
    return spotipy.Spotify(auth_manager=SpotifyClientCredentials(client_id=os.environ.get("Spotifyid"), client_secret=os.environ.get("Spotifysecret")))

def get_spotify_recs(journals, gai_client, sp):
    
    prompt = f"""
        You are a music therapist AI. A person writes journals every day. Here are their latest journals: "{journals}".
        Suggest 3 music genres that could help to improve or maintain their mood and well-being depending on if they are doing not well or well. Your are the judge. Be specific. These genres must be spotify approved genres.
        Example format: "[genre1, genre2, genre3]". DO NOT INCLUDE ANY OTHER INFORMATION OTHER THAN WHAT IS SHOWN IN THE EXAMPLE.
    """
    genres = json.loads(make_query(prompt, gai_client).text.strip().lower())[0].split(', ')

    max_total_tracks = 20
    tracks_per_genre = math.ceil(max_total_tracks / len(genres))

    final_tracks = []
    artists_seen = set()

    for genre in genres:
        artists_results = sp.search(q=f'genre:"{genre}"', type='artist', limit=10)
        artists = artists_results['artists']['items']
        
        genre_tracks_collected = 0
        
        for artist in artists:
            if genre_tracks_collected >= tracks_per_genre:
                break
            
            if artist['id'] in artists_seen:
                continue
            
            top_tracks = sp.artist_top_tracks(artist['id'], country='US')['tracks']
            
            max_tracks_per_artist = 2
            
            for track in top_tracks[:max_tracks_per_artist]:
                if genre_tracks_collected >= tracks_per_genre:
                    break

                final_tracks.append({
                    'track_name': track['name'],
                    'artist_name': artist['name'],
                    'genre': genre,
                    'track_id': track['id'],
                    'image_url': track['album']['images'][0]['url'] if track['album']['images'] else None
                })
                genre_tracks_collected += 1
            
            artists_seen.add(artist['id'])

    final_tracks = final_tracks[:max_total_tracks]

    return final_tracks


#make the prompts + responses for mood mentor

def query_mood_mentor(journals, gai_client):

    prompt = f"""You are a psychologist's assisstant. You will find credible and factual information backed by verified and trusted sources about mental health.
                Here are a few journals your patient has been writing documenting their day: {journals}. Identify any issues, provide actionable steps and therapies, and include sources for every single thing you say that the patient can visit for more information.
                The format MUST BE in json format. Example format that you must follow: {"[{'Issue 1': {'Steps':['step 1', 'step 2'], 'Therapies':['Therapy 1', 'Therapy 2'], 'Sources':['Source 1 link', 'Source 2 link']}}, {'Issue 2': {'Steps':['step 1', 'step 2'], 'Therapies':['Therapy 1', 'Therapy 2'], 'Sources':['Source 1 link', 'Source 2 link']}}]"}. DO NOT INCLUDE ANY INFORMATION OUTSIDE OF THIS FORMAT. Links should be LINKS ONLY
            """

    results = json.loads(make_query(prompt, gai_client).text.replace("json","").strip().replace("```json", "").replace("```", "").strip())

    return results



# if __name__=="__main__":


#     gai_client = make_client()
#     spot_client = get_spotify_client()
    

#     journal_entries = """
#         March 2, 2023
#         I'm so happy I could fly through the sky. This makes me feel too happy and fullfilled.

#         March 3, 2023
#         I'm feeling excited and ready to get the world. But I'm also burnt out a bit. Need to relax a bit.

#         March 4, 2023
#         Really tired but still excited for some reason. I know that I need to keep on pushing.
#         """
    
#     print(query_mood_mentor(journal_entries,gai_client))

    #print(get_spotify_recs(journal_entries, gai_client, spot_client))