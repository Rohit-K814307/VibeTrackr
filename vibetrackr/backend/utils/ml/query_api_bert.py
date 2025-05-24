import numpy as np
from gradio_client import Client
import time
from utils.ml.emotions import classify_emotion, vibescore


def calc_vad(text, client=Client("RobroKools/vad-emotion")):

    valence, arousal, dominance = client.predict(text, api_name="/predict")
    return (valence, arousal, dominance)


def analyze_journal(text, max_length=128, stride=32):

    vad_scores = []
    length = len(text)

    for i in range(0, length, stride):
        chunk = text[i:i + max_length]
        if not chunk.strip():
            continue
        valence, arousal, dominance = calc_vad(chunk)
        time.sleep(0.5)
        vad_scores.append([valence, arousal, dominance])
        if i + max_length >= length:
            break

    vad_mean = np.mean(vad_scores, axis=0).tolist()

    vad_mean[0] = (2 * vad_mean[0] / 5) - 1
    vad_mean[1] = (2 * vad_mean[1] / 5) - 1
    vad_mean[2] = (2 * vad_mean[2] / 5) - 1

    emotion, dist = classify_emotion(vad_mean)

    vs = vibescore(vad_mean[0], vad_mean[1],vad_mean[2])

    return {"V": vad_mean[0], 
            "A": vad_mean[1], 
            "D": vad_mean[2], 
            "Emotion":emotion,
            "Valence_Scaled_By_Mag":vs.item(), 
            "Emotive_Angular_Distance":dist.item()}


if __name__ == "__main__":
    print(analyze_journal("I felt terrible, gross, fucking hurting all day long."))