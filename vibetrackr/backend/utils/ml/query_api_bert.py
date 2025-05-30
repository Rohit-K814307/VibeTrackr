import numpy as np
from gradio_client import Client
import time
from utils.ml.emotions import classify_emotion, vibescore


def calc_vad(text, client=Client("RobroKools/vad-emotion")):

    valence, arousal, dominance = client.predict(text, api_name="/predict")
    return (valence, arousal, dominance)


def analyze_journal(text):
    
    valence, arousal, dominance = calc_vad(text)
    vad_mean = [valence, arousal, dominance]

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