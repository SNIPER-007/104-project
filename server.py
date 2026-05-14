from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import pandas as pd

app = Flask(__name__)
CORS(app)

# LOAD TRAINED MODEL
model = joblib.load("gesture_model.pkl")

print("Model Loaded Successfully ✅")

# LABEL MAPPING
gesture_map = {
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
    try:
        data = request.json

        landmarks = data["landmarks"]

        # CONVERT TO DATAFRAME
        df = pd.DataFrame([landmarks])

        # PREDICT
        prediction = model.predict(df)[0]

        # GET LABEL
        gesture = gesture_map.get(
            int(prediction),
            str(prediction)
        )

        return jsonify({
            "prediction": gesture
        })

    except Exception as e:
        return jsonify({
            "error": str(e)
        })

if __name__ == "__main__":
    app.run(debug=True)
    