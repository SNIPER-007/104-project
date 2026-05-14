import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score
import joblib

# LOAD DATASET
df = pd.read_csv(
    "dataset/Indian Sign Language Gesture Landmarks.csv"
)

print("Dataset Loaded Successfully ✅")
print(df.head())

# TARGET COLUMN = LABEL
y = df["target"]

# FEATURES = ALL OTHER COLUMNS
X = df.drop("target", axis=1)

print("\nFeatures Shape:", X.shape)
print("Labels Shape:", y.shape)

# SPLIT DATASET
X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.2,
    random_state=42,
)

# CREATE MODEL
model = RandomForestClassifier(
    n_estimators=100,
    random_state=42
)

print("\nTraining Model...")

# TRAIN MODEL
model.fit(X_train, y_train)

print("Model Training Complete ✅")

# PREDICT
y_pred = model.predict(X_test)

# CHECK ACCURACY
accuracy = accuracy_score(y_test, y_pred)

print(f"\nModel Accuracy: {accuracy * 100:.2f}%")

# SAVE MODEL
joblib.dump(model, "gesture_model.pkl")

print("\nModel Saved as gesture_model.pkl ✅")