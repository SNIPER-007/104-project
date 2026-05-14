import pandas as pd
import json

# LOAD CSV
file_path = "dataset/Indian Sign Language Gesture Landmarks.csv"

df = pd.read_csv(file_path)

# LETTER MAP
labels = {
    0: "A",
    1: "B",
    2: "C",
    3: "D",
    4: "E",
    5: "F",
    6: "G",
    7: "H",
    8: "I",
    9: "J",
    10: "K",
    11: "L",
    12: "M",
    13: "N",
    14: "O",
    15: "P",
    16: "Q",
    17: "R",
    18: "S",
    19: "T",
    20: "U",
    21: "V",
    22: "W",
    23: "X",
    24: "Y",
    25: "Z",
}

final_templates = {}

for target, letter in labels.items():
    sample = df[df["target"] == target].iloc[0]

    landmarks = []

    # LEFT HAND
    for i in range(21):
        x = sample[f"left_hand_x_{i}"]
        y = sample[f"left_hand_y_{i}"]
        z = sample[f"left_hand_z_{i}"]

        landmarks.append({
            "x": float(x),
            "y": float(y),
            "z": float(z),
        })

    final_templates[letter] = landmarks

# SAVE JSON
with open("src/templates.json", "w") as f:
    json.dump(final_templates, f, indent=2)

print("templates.json created successfully ✅")
