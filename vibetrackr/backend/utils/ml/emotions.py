import numpy as np


EMOTION_VAD = {
    "Angry":       np.array([(-0.6 + -0.8)/2, (0.6 + 0.9)/2, (0.4 + 0.7)/2]),
    "Anxious":     np.array([(-0.5 + -0.7)/2, (0.7 + 0.9)/2, (-0.3 + -0.6)/2]),
    "Distressed":  np.array([-0.7, 0.8, -0.5]),
    "Pessimistic": np.array([-0.6, -0.3, -0.4]),
    "Rejected":    np.array([-0.8, 0.5, -0.7]),
    "Surprised":   np.array([(0.5 + 0.7)/2, (0.8 + 0.9)/2, (0.2 + 0.5)/2]),
    "Sad":         np.array([(-0.7 + -0.9)/2, (-0.3 + -0.5)/2, (-0.5 + -0.7)/2]),
    "Excited":     np.array([(0.7 + 0.9)/2, (0.7 + 0.9)/2, (0.5 + 0.7)/2]),
    "Relaxed":     np.array([(0.6 + 0.8)/2, (-0.5 + -0.7)/2, (0.3 + 0.5)/2]),
    "Satisfied":   np.array([(0.7 + 0.9)/2, (-0.2 + 0.2)/2, (0.4 + 0.6)/2]),
    "Neutral":     np.array([0.0, 0.0, 0.0]),
}

def cosine_similarity(a, b):
    return np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b) + 1e-8)

def classify_emotion(vad):
    vad = np.array(vad)
    best_emotion = None
    best_score = -1

    for emotion, prototype in EMOTION_VAD.items():
        sim = cosine_similarity(vad, prototype)

        if sim > best_score:
            best_score = sim
            best_emotion = emotion

    return best_emotion, (np.arccos(best_score) * np.pi) / 180


def vibescore(v, a, d):
    return v * np.linalg.norm(np.array([v,a,d]))
