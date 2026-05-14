import { useEffect, useRef, useState } from "react";
import { Hands, HAND_CONNECTIONS } from "@mediapipe/hands";
import { Camera } from "@mediapipe/camera_utils";
import templates from "./templates.json";

import {
  drawConnectors,
  drawLandmarks,
} from "@mediapipe/drawing_utils";

import { lessons } from "./lessonData";

function App() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  // LIVE HANDS
  const currentRef = useRef([]);

  // TEMPLATE
  const templateRef = useRef([]);

  const [accuracy, setAccuracy] =
    useState(0);

  const [correct, setCorrect] =
    useState(false);

  const [result, setResult] =
    useState("");

  const [currentLessonIndex, setCurrentLessonIndex] =
    useState(0);

  const currentLesson =
    lessons[currentLessonIndex];

  // =========================
  // MEDIAPIPE
  // =========================

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
          await hands.send({
            image: videoRef.current,
          });
        }
      },
      width: 1920,
      height: 1080,
    });

    camera.start();

    generateTemplate();
  }, [currentLessonIndex]);

  // =========================
  // TEMPLATE GENERATOR
  // =========================

function generateTemplate() {
  const letter = currentLesson.label;

  if (templates[letter]) {
    templateRef.current = templates[letter];
  }
}

  // =========================
  // NORMALIZE
  // =========================

  function normalize(landmarks) {
    const base = landmarks[0];

    return landmarks.map((p) => ({
      x: p.x - base.x,
      y: p.y - base.y,
      z: p.z - base.z,
    }));
  }

  // =========================
  // DISTANCE
  // =========================

  function distance(p1, p2) {
    return Math.sqrt(
      Math.pow(p1.x - p2.x, 2) +
        Math.pow(p1.y - p2.y, 2) +
        Math.pow(p1.z - p2.z, 2)
    );
  }

  // =========================
  // ACCURACY CHECK
  // =========================

  function checkLearningAccuracy(
    currentLandmarks
  ) {
    if (
      !templateRef.current ||
      templateRef.current.length === 0
    ) {
      return;
    }

    const normCurrent =
      normalize(currentLandmarks);

    const normTemplate =
      normalize(
        templateRef.current
      );

    let total = 0;

    for (let i = 0; i < 21; i++) {
      total += distance(
        normCurrent[i],
        normTemplate[i]
      );
    }

    const avg = total / 21;

    let score = Math.max(
      0,
      100 - avg * 500
    );

    score = Math.round(score);

    setAccuracy(score);

    // SUCCESS
    if (score >= 60 && !correct) {
      setCorrect(true);

      setResult(
        "Correct Gesture ✅"
      );

    
      setTimeout(() => {
        setCorrect(false);

        if (
          currentLessonIndex <
          lessons.length - 1
        ) {
          setCurrentLessonIndex(
            (prev) => prev + 1
          );

          generateTemplate();
        }
      }, 1500);
    }
  }

  // =========================
  // MAIN DETECTION
  // =========================

  function onResults(results) {
    const canvas = canvasRef.current;

    const ctx =
      canvas.getContext("2d");

    ctx.clearRect(
      0,
      0,
      canvas.width,
      canvas.height
    );

    // =========================
    // MIRROR CAMERA
    // =========================

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

    // =========================
    // USER HANDS
    // =========================

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

        // FIX SELFIE MODE
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

        // ACCURACY
        checkLearningAccuracy(
          landmarks
        );

        // COLORS
        const lineColor =
          handedness === "Left"
            ? "#ff3b3b"
            : "#0099ff";

        const pointColor =
          handedness === "Left"
            ? "#ffd700"
            : "#00ff99";

        // MIRROR USER HAND
        const mirroredLandmarks =
          landmarks.map((p) => ({
            x: 1 - p.x,
            y: p.y,
            z: p.z,
          }));

        // DRAW USER HAND
        drawConnectors(
          ctx,
          mirroredLandmarks,
          HAND_CONNECTIONS,
          {
            color: lineColor,
            lineWidth: 4,
          }
        );

        drawLandmarks(
          ctx,
          mirroredLandmarks,
          {
            color: pointColor,
            radius: 6,
          }
        );

        // HAND LABEL
        const x =
          mirroredLandmarks[0].x *
          canvas.width;

        const y =
          mirroredLandmarks[0].y *
          canvas.height;

        ctx.font =
          "bold 30px Arial";

        ctx.fillStyle =
          "white";

        ctx.fillText(
          handedness + " Hand",
          x,
          y - 30
        );
      }
    }

    // =========================
    // HOLOGRAPHIC TEMPLATE
    // =========================

    if (
      templateRef.current &&
      templateRef.current.length > 0
    ) {
      const templateLandmarks =
        templateRef.current.map(
          (p) => ({
            x:
              0.84 -
              p.x * 0.42,

            y:
              0.12 +
              p.y * 0.42,

            z: p.z,
          })
        );

      // GLOW
      ctx.shadowColor =
        "#00ffff";

      ctx.shadowBlur = 25;

      // MAIN CONNECTORS
      drawConnectors(
        ctx,
        templateLandmarks,
        HAND_CONNECTIONS,
        {
          color:
            "rgba(0,255,255,0.9)",
          lineWidth: 16,
        }
      );

      // INNER GLOW
      drawConnectors(
        ctx,
        templateLandmarks,
        HAND_CONNECTIONS,
        {
          color:
            "rgba(255,255,255,0.35)",
          lineWidth: 8,
        }
      );

      // JOINTS
      drawLandmarks(
        ctx,
        templateLandmarks,
        {
          color: "#ffffff",
          radius: 12,
        }
      );

      // PALM GLOW
      const palm =
        templateLandmarks[0];

      const palmX =
        palm.x * canvas.width;

      const palmY =
        palm.y * canvas.height;

      const gradient =
        ctx.createRadialGradient(
          palmX,
          palmY,
          10,
          palmX,
          palmY,
          120
        );

      gradient.addColorStop(
        0,
        "rgba(0,255,255,0.5)"
      );

      gradient.addColorStop(
        1,
        "rgba(0,255,255,0)"
      );

      ctx.fillStyle = gradient;

      ctx.beginPath();

      ctx.arc(
        palmX,
        palmY,
        120,
        0,
        2 * Math.PI
      );

      ctx.fill();

      // RESET SHADOW
      ctx.shadowBlur = 0;

      // TEMPLATE LABEL
      ctx.font =
        "bold 42px Arial";

      ctx.fillStyle =
        "#00ffff";

      ctx.fillText(
        `Learn ${currentLesson.label}`,
        canvas.width - 580,
        70
      );

      // GUIDE LABEL
      ctx.font =
        "bold 28px Arial";

      ctx.fillStyle =
        "#ffffff";

      ctx.fillText(
        "Holographic Guide",
        canvas.width - 580,
        120
      );

      // TEMPLATE BOX
      ctx.strokeStyle =
        "rgba(0,255,255,0.5)";

      ctx.lineWidth = 4;

      ctx.strokeRect(
        canvas.width - 700,
        40,
        620,
        700
      );
    }

    // =========================
    // SUCCESS TICK
    // =========================

    if (correct) {
      ctx.font =
        "bold 160px Arial";

      ctx.fillStyle =
        "#22c55e";

      ctx.fillText(
        "✓",
        canvas.width / 2 - 60,
        180
      );
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
          backdropFilter:
            "blur(12px)",
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
            Learn Indian Sign Language
          </h1>

          <p
            style={{
              color: "#cbd5e1",
              fontSize: "18px",
            }}
          >
            AI-powered guided
            sign learning using
            MediaPipe
          </p>
        </div>

        <video
          ref={videoRef}
          style={{
            display: "none",
          }}
        />

        {/* MAIN CONTENT */}
        <div
          style={{
            display: "flex",
            gap: "25px",
            alignItems:
              "flex-start",
            justifyContent:
              "center",
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
                background:
                  "black",
              }}
            />
          </div>

          {/* RIGHT PANEL */}
          <div
            style={{
              flex: 1,
              minWidth: "300px",
              display: "flex",
              flexDirection:
                "column",
              gap: "20px",
            }}
          >
            {/* CURRENT LETTER */}
            <div
              style={{
                background:
                  "rgba(255,255,255,0.08)",
                padding: "20px",
                borderRadius:
                  "18px",
              }}
            >
              <h3
                style={{
                  color:
                    "#ff66ff",
                }}
              >
                Current Letter
              </h3>

              <h1
                style={{
                  fontSize:
                    "72px",
                }}
              >
                {
                  currentLesson.label
                }
              </h1>
            </div>

            {/* STATUS */}
            <div
              style={{
                background:
                  "rgba(255,255,255,0.08)",
                padding: "20px",
                borderRadius:
                  "18px",
              }}
            >
              <h3
                style={{
                  color:
                    "#00ffff",
                }}
              >
                Status
              </h3>

              <p
                style={{
                  fontSize:
                    "24px",
                  fontWeight:
                    "bold",
                }}
              >
                {correct
                  ? "✅ Correct"
                  : "⏳ Copy Template"}
              </p>
            </div>

            {/* ACCURACY */}
            <div
              style={{
                background:
                  "rgba(255,255,255,0.08)",
                padding: "20px",
                borderRadius:
                  "18px",
              }}
            >
              <h3
                style={{
                  color:
                    "#22c55e",
                }}
              >
                Accuracy
              </h3>

              <h1
                style={{
                  fontSize:
                    "48px",
                }}
              >
                {accuracy}%
              </h1>
            </div>

            {/* PROGRESS */}
            <div
              style={{
                background:
                  "rgba(255,255,255,0.08)",
                padding: "20px",
                borderRadius:
                  "18px",
              }}
            >
              <h3
                style={{
                  color:
                    "#facc15",
                }}
              >
                Progress
              </h3>

              <h2>
                {currentLessonIndex +
                  1}{" "}
                /{" "}
                {
                  lessons.length
                }
              </h2>
            </div>

            {/* HAND GUIDE */}
            <div
              style={{
                background:
                  "rgba(255,255,255,0.08)",
                padding: "20px",
                borderRadius:
                  "18px",
              }}
            >
              <h3
                style={{
                  color:
                    "#00ffff",
                }}
              >
                Hand Colors
              </h3>

              <p>
                🔴 Left Hand
              </p>

              <p>
                🔵 Right Hand
              </p>

              <p>
                💠 Cyan = Template
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;