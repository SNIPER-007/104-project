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

  // HARD LOCK
  const transitionLock =
    useRef(false);

  const [accuracy, setAccuracy] =
    useState(0);

  const [correct, setCorrect] =
    useState(false);

  const [showTick, setShowTick] =
    useState(false);

  const [currentLessonIndex, setCurrentLessonIndex] =
    useState(0);

  const currentLesson =
    lessons[
      Math.min(
        currentLessonIndex,
        lessons.length - 1
      )
    ];

  // =========================
  // LOAD TEMPLATE
  // =========================

  useEffect(() => {
    generateTemplate();
  }, [currentLessonIndex]);

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

      // OPTIMIZED
      width: 1280,
      height: 720,
    });

    camera.start();
  }, []);

  // =========================
  // GENERATE TEMPLATE
  // =========================

  function generateTemplate() {
    const letter =
      currentLesson.label;

    if (templates[letter]) {
      templateRef.current =
        templates[letter];
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

    // HARD LOCK
    if (
      transitionLock.current
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

    // =========================
    // SUCCESS
    // =========================

    if (score >= 65) {

      // LOCK IMMEDIATELY
      transitionLock.current =
        true;

      setCorrect(true);

      setShowTick(true);

      // WAIT
      setTimeout(() => {

        // NEXT LETTER
        setCurrentLessonIndex(
          (prev) => {

            // STOP AT Z
            if (
              prev >=
              lessons.length - 1
            ) {
              return prev;
            }

            return prev + 1;
          }
        );

        // RESET
        setCorrect(false);

        setShowTick(false);

        setAccuracy(0);

        // COOLDOWN
        setTimeout(() => {

          transitionLock.current =
            false;

        }, 1200);

      }, 2000);
    }
  }

  // =========================
  // MAIN DETECTION
  // =========================

  function onResults(results) {

    const canvas =
      canvasRef.current;

    if (!canvas) return;

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
        i <
        results.multiHandLandmarks
          .length;
        i++
      ) {
        const landmarks =
          results
            .multiHandLandmarks[i];

        // FIX SELFIE MODE
        let handedness =
          results
            .multiHandedness[i]
            .label;

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
          mirroredLandmarks[0]
            .x *
          canvas.width;

        const y =
          mirroredLandmarks[0]
            .y *
          canvas.height;

        ctx.font =
          "bold 28px Arial";

        ctx.fillStyle =
          "white";

        ctx.fillText(
          handedness +
            " Hand",
          x,
          y - 25
        );
      }
    }

    // =========================
    // TEMPLATE OVERLAY
    // =========================

    if (
      templateRef.current &&
      templateRef.current.length >
        0
    ) {

      // MIRRORED TEMPLATE
      const templateLandmarks =
        templateRef.current.map(
          (p) => ({
            x:
              0.5 -
              (p.x - 0.5) *
                0.9,

            y:
              0.5 +
              (p.y - 0.5) *
                0.9,

            z: p.z,
          })
        );

      // GLOW
      ctx.shadowColor =
        "#00ffff";

      ctx.shadowBlur = 30;

      // OUTER GLOW
      drawConnectors(
        ctx,
        templateLandmarks,
        HAND_CONNECTIONS,
        {
          color:
            "rgba(0,255,255,0.25)",

          lineWidth: 22,
        }
      );

      // INNER HAND
      drawConnectors(
        ctx,
        templateLandmarks,
        HAND_CONNECTIONS,
        {
          color:
            "rgba(0,255,255,0.9)",

          lineWidth: 10,
        }
      );

      // JOINTS
      drawLandmarks(
        ctx,
        templateLandmarks,
        {
          color:
            "rgba(255,255,255,0.95)",

          radius: 10,
        }
      );

      ctx.shadowBlur = 0;

      // GUIDE TEXT
      ctx.font =
        "bold 42px Arial";

      ctx.fillStyle =
        "#00ffff";

      ctx.fillText(
        `Copy Sign: ${currentLesson.label}`,
        40,
        60
      );

      ctx.font =
        "bold 24px Arial";

      ctx.fillStyle =
        "white";

      ctx.fillText(
        "Match your hand with hologram",
        40,
        100
      );
    }

    // =========================
    // SUCCESS ANIMATION
    // =========================

    if (showTick) {

      ctx.shadowColor =
        "#22c55e";

      ctx.shadowBlur = 40;

      // CIRCLE
      ctx.beginPath();

      ctx.arc(
        canvas.width / 2,
        canvas.height / 2,
        120,
        0,
        2 * Math.PI
      );

      ctx.fillStyle =
        "rgba(34,197,94,0.25)";

      ctx.fill();

      // TICK
      ctx.font =
        "bold 180px Arial";

      ctx.fillStyle =
        "#22c55e";

      ctx.fillText(
        "✓",
        canvas.width / 2 - 70,
        canvas.height / 2 + 60
      );

      ctx.shadowBlur = 0;
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

        justifyContent:
          "center",

        alignItems: "center",

        padding: "20px",

        boxSizing:
          "border-box",

        fontFamily: "Arial",
      }}
    >
      <div
        style={{
          width: "100%",

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
            marginBottom:
              "25px",

            textAlign:
              "center",
          }}
        >
          <h1
            style={{
              fontSize:
                "42px",

              marginBottom:
                "10px",

              color:
                "#00ffff",
            }}
          >
            Learn Indian Sign
            Language
          </h1>

          <p
            style={{
              color:
                "#cbd5e1",

              fontSize:
                "18px",
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

        {/* MAIN */}

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
              width="1280"
              height="720"
              style={{
                border:
                  "4px solid #00ffff",

                borderRadius:
                  "24px",

                width: "100%",

                maxWidth:
                  "1000px",

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

              minWidth:
                "300px",

              display: "flex",

              flexDirection:
                "column",

              gap: "20px",
            }}
          >
            {/* LETTER */}

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
                  : "⏳ Learning"}
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

            {/* GUIDE */}

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
                💠 Cyan =
                Template
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;