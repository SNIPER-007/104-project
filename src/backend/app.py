from flask import Flask, request, jsonify
from flask_cors import CORS

import joblib
import numpy as np

app = Flask(__name__)
CORS(app)

# LOAD MODEL
model = joblib.load("../../gesture_model.pkl")

# LABEL MAP
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

@app.route("/predict", methods=["POST"])
def predict():

    data = request.json

    landmarks = data["landmarks"]

    landmarks = np.array(landmarks).reshape(1, -1)

    prediction = model.predict(landmarks)[0]

    probabilities = model.predict_proba(
        landmarks
    )[0]

    confidence = np.max(probabilities)

    return jsonify({
        "prediction":
            labels[int(prediction)],

        "confidence":
            round(float(confidence) * 100, 2)
    })

if __name__ == "__main__":
    app.run(debug=True)