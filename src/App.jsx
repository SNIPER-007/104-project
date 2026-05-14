import { useEffect, useRef, useState } from "react";
import { Hands, HAND_CONNECTIONS } from "@mediapipe/hands";
import { Camera } from "@mediapipe/camera_utils";

import {
  drawConnectors,
  drawLandmarks,
} from "@mediapipe/drawing_utils";

function App() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const currentRef = useRef([]);
  const templateRef = useRef(null);

  const [result, setResult] = useState("");
  const [accuracy, setAccuracy] = useState(0);
  const [templateHand, setTemplateHand] =
    useState("");

  useEffect(() => {
    const hands = new Hands({
      locateFile: (file) =>
        `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
    });

    hands.setOptions({
      maxNumHands: 2,
      modelComplexity: 1,
      minDetectionConfidence: 0.7,
      minTrackingConfidence: 0.7,
    });

    hands.onResults(onResults);

    const camera = new Camera(videoRef.current, {
      onFrame: async () => {
        if (videoRef.current) {
          await hands.send({ image: videoRef.current });
        }
      },
      width: 1920,
      height: 1080,
    });

    camera.start();
  }, []);

  // Normalize landmarks
  function normalize(landmarks) {
    const base = landmarks[0];

    return landmarks.map((p) => ({
      x: p.x - base.x,
      y: p.y - base.y,
      z: p.z - base.z,
    }));
  }

  function onResults(results) {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // MIRROR CAMERA
    ctx.save();

    ctx.scale(-1, 1);

    ctx.drawImage(
      results.image,
      -canvas.width,
      0,
      canvas.width,
      canvas.height
    );

    ctx.restore();

    // MULTIPLE HANDS
    if (
      results.multiHandLandmarks &&
      results.multiHandedness
    ) {
      currentRef.current = [];

      for (
        let i = 0;
        i < results.multiHandLandmarks.length;
        i++
      ) {
        const landmarks =
          results.multiHandLandmarks[i];

        // FIX SELFIE LABELS
        let handedness =
          results.multiHandedness[i].label;

        handedness =
          handedness === "Left"
            ? "Right"
            : "Left";

        currentRef.current.push({
          landmarks,
          handedness,
        });

        // COLORS
        const lineColor =
          handedness === "Left"
            ? "#ff3b3b"
            : "#0099ff";

        const pointColor =
          handedness === "Left"
            ? "#ffd700"
            : "#00ff99";

        // MIRROR HAND DRAWING
        const mirroredLandmarks =
          landmarks.map((p) => ({
            x: 1 - p.x,
            y: p.y,
            z: p.z,
          }));

        // DRAW HAND
        drawConnectors(
          ctx,
          mirroredLandmarks,
          HAND_CONNECTIONS,
          {
            color: lineColor,
            lineWidth: 4,
          }
        );

        drawLandmarks(ctx, mirroredLandmarks, {
          color: pointColor,
          radius: 5,
        });

        // HAND LABEL
        const x =
          mirroredLandmarks[0].x *
          canvas.width;

        const y =
          mirroredLandmarks[0].y *
          canvas.height;

        ctx.font = "bold 28px Arial";
        ctx.fillStyle = "white";

        ctx.fillText(
          handedness + " Hand",
          x,
          y - 25
        );
      }
    }

    // TEMPLATE HAND
    if (templateRef.current) {
      const templateLandmarks =
        templateRef.current.landmarks.map(
          (p) => ({
            // FIX MIRRORED TEMPLATE
            x: 0.82 - p.x * 0.28,
            y: 0.30 + p.y * 0.28,
            z: p.z,
          })
        );

      drawConnectors(
        ctx,
        templateLandmarks,
        HAND_CONNECTIONS,
        {
          color: "#00ffff",
          lineWidth: 5,
        }
      );

      drawLandmarks(ctx, templateLandmarks, {
        color: "white",
        radius: 7,
      });

      // TEMPLATE LABEL
      ctx.font = "bold 28px Arial";
      ctx.fillStyle = "#00ffff";

      ctx.fillText(
        `Template (${templateHand} Hand)`,
        canvas.width - 500,
        50
      );
    }
  }

  function saveTemplate() {
    if (currentRef.current.length === 0) {
      alert("No hand detected!");
      return;
    }

    const selectedHand =
      currentRef.current[0];

    const norm = normalize(
      selectedHand.landmarks
    );

    templateRef.current = {
      landmarks: norm,
      handedness:
        selectedHand.handedness,
    };

    setTemplateHand(
      selectedHand.handedness
    );

    setResult(
      `Template Saved (${selectedHand.handedness} Hand) ✅`
    );
  }

  function distance(p1, p2) {
    return Math.sqrt(
      Math.pow(p1.x - p2.x, 2) +
        Math.pow(p1.y - p2.y, 2) +
        Math.pow(p1.z - p2.z, 2)
    );
  }

  function checkGesture() {
    if (
      !templateRef.current ||
      currentRef.current.length === 0
    ) {
      alert("Missing template or hand!");
      return;
    }

    // FIND SAME HAND
    const matchingHand =
      currentRef.current.find(
        (h) =>
          h.handedness ===
          templateRef.current.handedness
      );

    if (!matchingHand) {
      setResult(
        `Show ${templateRef.current.handedness} Hand ❌`
      );
      return;
    }

    const normCurrent = normalize(
      matchingHand.landmarks
    );

    let total = 0;

    for (let i = 0; i < 21; i++) {
      total += distance(
        templateRef.current.landmarks[i],
        normCurrent[i]
      );
    }

    const avg = total / 21;

    let score = Math.max(
      0,
      100 - avg * 500
    );

    score = Math.round(score);

    setAccuracy(score);

    if (avg < 0.12) {
      setResult("Correct Gesture ✅");
    } else {
      setResult("Try Again ❌");
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        width: "100%",
        background:
          "linear-gradient(to bottom right, #050816, #0f172a, #111827)",
        color: "white",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "20px",
        boxSizing: "border-box",
        fontFamily: "Arial",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "100%",
          background:
            "rgba(255,255,255,0.05)",
          backdropFilter: "blur(12px)",
          border:
            "1px solid rgba(255,255,255,0.1)",
          borderRadius: "28px",
          padding: "25px",
          boxShadow:
            "0 0 40px rgba(0,255,255,0.15)",
        }}
      >
        {/* HEADER */}
        <div
          style={{
            marginBottom: "25px",
            textAlign: "center",
          }}
        >
          <h1
            style={{
              fontSize: "42px",
              marginBottom: "10px",
              color: "#00ffff",
            }}
          >
            AI Sign Language Learning System
          </h1>

          <p
            style={{
              color: "#cbd5e1",
              fontSize: "18px",
            }}
          >
            Real-time sign language learning
            using MediaPipe & AI
          </p>
        </div>

        <video
          ref={videoRef}
          style={{ display: "none" }}
        />

        {/* MAIN CONTENT */}
        <div
          style={{
            display: "flex",
            gap: "25px",
            alignItems: "flex-start",
            justifyContent: "center",
            flexWrap: "wrap",
          }}
        >
          {/* CAMERA */}
          <div style={{ flex: 3 }}>
            <canvas
              ref={canvasRef}
              width="1920"
              height="1080"
              style={{
                border:
                  "4px solid #00ffff",
                borderRadius: "24px",
                width: "100%",
                maxWidth: "1000px",
                boxShadow:
                  "0 0 30px rgba(0,255,255,0.4)",
                background: "black",
              }}
            />
          </div>

          {/* RIGHT PANEL */}
          <div
            style={{
              flex: 1,
              minWidth: "300px",
              display: "flex",
              flexDirection: "column",
              gap: "20px",
            }}
          >
            {/* CONTROLS */}
            <div
              style={{
                background:
                  "rgba(255,255,255,0.08)",
                padding: "20px",
                borderRadius: "18px",
              }}
            >
              <h3
                style={{
                  color: "#00ffff",
                  marginBottom: "15px",
                }}
              >
                Controls
              </h3>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "15px",
                }}
              >
                <button
                  onClick={saveTemplate}
                  style={{
                    padding: "15px",
                    borderRadius: "14px",
                    border: "none",
                    background: "#00ffff",
                    color: "black",
                    fontSize: "16px",
                    fontWeight: "bold",
                    cursor: "pointer",
                  }}
                >
                  Save Gesture
                </button>

                <button
                  onClick={checkGesture}
                  style={{
                    padding: "15px",
                    borderRadius: "14px",
                    border: "none",
                    background: "#22c55e",
                    color: "white",
                    fontSize: "16px",
                    fontWeight: "bold",
                    cursor: "pointer",
                  }}
                >
                  Check Gesture
                </button>
              </div>
            </div>

            {/* RESULT */}
            <div
              style={{
                background:
                  "rgba(255,255,255,0.08)",
                padding: "20px",
                borderRadius: "18px",
              }}
            >
              <h3 style={{ color: "#00ffff" }}>
                Result
              </h3>

              <p>{result || "Waiting..."}</p>
            </div>

            {/* ACCURACY */}
            <div
              style={{
                background:
                  "rgba(255,255,255,0.08)",
                padding: "20px",
                borderRadius: "18px",
              }}
            >
              <h3 style={{ color: "#22c55e" }}>
                Accuracy
              </h3>

              <p>{accuracy}%</p>
            </div>

            {/* HANDS */}
            <div
              style={{
                background:
                  "rgba(255,255,255,0.08)",
                padding: "20px",
                borderRadius: "18px",
              }}
            >
              <h3 style={{ color: "#facc15" }}>
                Hands Detected
              </h3>

              <p>
                {currentRef.current.length}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;