import { useEffect, useRef, useState } from "react";

import {
  Hands,
  HAND_CONNECTIONS,
} from "@mediapipe/hands";

import { Camera } from "@mediapipe/camera_utils";

import {
  drawConnectors,
  drawLandmarks,
} from "@mediapipe/drawing_utils";

import templates from "../templates.json";

import { lessons } from "../lessonData";

import StatsCard from "../components/StatsCard";

import Completion from "../components/Completion";

function Learn() {
  // =========================
  // REFS
  // =========================

  const videoRef = useRef(null);

  const canvasRef = useRef(null);

  const templateRef = useRef([]);

  const transitionLock =
    useRef(false);

  const accuracyCooldownRef =
    useRef(false);

  // =========================
  // STATES
  // =========================

  const [accuracy, setAccuracy] =
    useState(0);

  const [correct, setCorrect] =
    useState(false);

  const [showTick, setShowTick] =
    useState(false);

  const [
    currentLessonIndex,
    setCurrentLessonIndex,
  ] = useState(0);

  const [completed, setCompleted] =
    useState(false);

  const [startTime] =
    useState(Date.now());

  const [timeTaken, setTimeTaken] =
    useState(0);

  const [
    averageAccuracy,
    setAverageAccuracy,
  ] = useState(0);

  const [
    accuracyHistory,
    setAccuracyHistory,
  ] = useState([]);

  // =========================
  // CURRENT LESSON
  // =========================

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
    const letter =
      currentLesson.label;

    if (templates[letter]) {
      templateRef.current =
        templates[letter];
    }
  }, [currentLessonIndex]);

  // =========================
  // MEDIAPIPE
  // =========================

  useEffect(() => {
    if (!videoRef.current)
      return;

    const hands = new Hands({
      locateFile: (file) =>
        `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
    });

    hands.setOptions({
      maxNumHands: 1,

      modelComplexity: 1,

      minDetectionConfidence: 0.7,

      minTrackingConfidence: 0.7,
    });

    hands.onResults(onResults);

    const camera =
      new Camera(videoRef.current, {
        onFrame: async () => {
          if (videoRef.current) {
            await hands.send({
              image:
                videoRef.current,
            });
          }
        },

        width: 1280,

        height: 720,
      });

    camera.start();

    return () => {
      camera.stop();
    };
  }, []);

  // =========================
  // NORMALIZE
  // =========================

  function normalize(
    landmarks
  ) {
    const base =
      landmarks[0];

    return landmarks.map(
      (p) => ({
        x: p.x - base.x,
        y: p.y - base.y,
        z: p.z - base.z,
      })
    );
  }

  // =========================
  // DISTANCE
  // =========================

  function distance(
    p1,
    p2
  ) {
    return Math.sqrt(
      Math.pow(
        p1.x - p2.x,
        2
      ) +
        Math.pow(
          p1.y - p2.y,
          2
        ) +
        Math.pow(
          p1.z - p2.z,
          2
        )
    );
  }

  // =========================
  // ACCURACY
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

    if (
      transitionLock.current
    ) {
      return;
    }

    const normCurrent =
      normalize(
        currentLandmarks
      );

    const normTemplate =
      normalize(
        templateRef.current
      );

    let total = 0;

    for (
      let i = 0;
      i < 21;
      i++
    ) {
      total += distance(
        normCurrent[i],
        normTemplate[i]
      );
    }

    const avg =
      total / 21;

    let score =
      Math.max(
        0,
        100 - avg * 500
      );

    score =
      Math.round(score);

    setAccuracy(score);

    // SUCCESS

    if (score >= 60) {
      transitionLock.current =
        true;

      setCorrect(true);

      setShowTick(true);

      setAccuracyHistory(
        (prev) => [
          ...prev,
          score,
        ]
      );

      setTimeout(() => {
        // COMPLETED

        if (
          currentLessonIndex >=
          lessons.length - 1
        ) {
          const endTime =
            Date.now();

          const totalSeconds =
            Math.floor(
              (endTime -
                startTime) /
                1000
            );

          setTimeTaken(
            totalSeconds
          );

          const avgAcc =
            [...accuracyHistory,
              score,
            ].reduce(
              (
                a,
                b
              ) => a + b,
              0
            ) /
            [...accuracyHistory,
              score,
            ].length;

          setAverageAccuracy(
            Math.floor(
              avgAcc
            )
          );

          setCompleted(
            true
          );

          return;
        }

        // NEXT

        setCurrentLessonIndex(
          (prev) =>
            prev + 1
        );

        setCorrect(false);

        setShowTick(false);

        setAccuracy(0);

        setTimeout(() => {
          transitionLock.current =
            false;
        }, 700);
      }, 1200);
    }
  }

  // =========================
  // MAIN RESULTS
  // =========================

  function onResults(
    results
  ) {
    const canvas =
      canvasRef.current;

    if (!canvas) return;

    const ctx =
      canvas.getContext(
        "2d"
      );

    ctx.clearRect(
      0,
      0,
      canvas.width,
      canvas.height
    );

    // =========================
    // MIRROR VIDEO
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
    // USER HAND
    // =========================

    if (
      results.multiHandLandmarks &&
      results.multiHandedness &&
      results
        .multiHandLandmarks
        .length > 0
    ) {
      const landmarks =
        results
          .multiHandLandmarks[0];

      let handedness =
        results
          .multiHandedness[0]
          .label;

      // FIX SELFIE LABEL

      handedness =
        handedness ===
        "Left"
          ? "Right"
          : "Left";

      // THROTTLE

      if (
        !accuracyCooldownRef.current
      ) {
        accuracyCooldownRef.current =
          true;

        checkLearningAccuracy(
          landmarks
        );

        setTimeout(() => {
          accuracyCooldownRef.current =
            false;
        }, 100);
      }

      // MIRROR LANDMARKS

      const mirroredLandmarks =
        landmarks.map(
          (p) => ({
            x: 1 - p.x,
            y: p.y,
            z: p.z,
          })
        );

      // COLORS

      const lineColor =
        handedness ===
        "Left"
          ? "#ff3b3b"
          : "#0099ff";

      const pointColor =
        handedness ===
        "Left"
          ? "#ffd700"
          : "#00ff99";

      // DRAW USER

      drawConnectors(
        ctx,
        mirroredLandmarks,
        HAND_CONNECTIONS,
        {
          color:
            lineColor,

          lineWidth: 4,
        }
      );

      drawLandmarks(
        ctx,
        mirroredLandmarks,
        {
          color:
            pointColor,

          radius: 6,
        }
      );

      // LABEL

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

    // =========================
    // TEMPLATE
    // =========================

    if (
      templateRef.current &&
      templateRef.current
        .length > 0
    ) {
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

      ctx.shadowColor =
        "#00ffff";

      ctx.shadowBlur = 30;

      // OUTER

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

      // INNER

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
    }

    // =========================
    // SUCCESS TICK
    // =========================

    if (showTick) {
      ctx.shadowColor =
        "#22c55e";

      ctx.shadowBlur = 40;

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

      ctx.font =
        "bold 180px Arial";

      ctx.fillStyle =
        "#22c55e";

      ctx.fillText(
        "✓",
        canvas.width / 2 -
          70,
        canvas.height / 2 +
          60
      );

      ctx.shadowBlur = 0;
    }
  }

  // =========================
  // RESTART
  // =========================

  function restartLearning() {
    setCurrentLessonIndex(
      0
    );

    setAccuracy(0);

    setCorrect(false);

    setShowTick(false);

    setCompleted(false);

    setAccuracyHistory(
      []
    );

    transitionLock.current =
      false;
  }

  // =========================
  // COMPLETION
  // =========================

  if (completed) {
    return (
      <Completion
        title="🎉 Congratulations!"
        subtitle="You learned all 26 ISL alphabets successfully."
        primaryButtonText="🔄 Learn Again"
        onPrimaryClick={
          restartLearning
        }
      >
        <div
          style={{
            display: "flex",

            gap: "20px",

            justifyContent:
              "center",

            flexWrap:
              "wrap",
          }}
        >
          <StatsCard
            title="Alphabets"
            value="26/26"
            color="#22c55e"
          />

          <StatsCard
            title="Average Accuracy"
            value={`${averageAccuracy}%`}
            color="#00ffff"
          />

          <StatsCard
            title="Time Taken"
            value={`${timeTaken}s`}
            color="#facc15"
          />
        </div>
      </Completion>
    );
  }

  // =========================
  // UI
  // =========================

  return (
    <div
      style={{
        minHeight:
          "100vh",

        background:
          "linear-gradient(to bottom right,#050816,#0f172a,#111827)",

        color: "white",

        padding: "20px",

        fontFamily:
          "Arial",
      }}
    >
      {/* HEADER */}

      <div
        style={{
          textAlign:
            "center",

          marginBottom:
            "25px",
        }}
      >
        <h1
          style={{
            fontSize:
              "48px",

            color:
              "#00ffff",
          }}
        >
          📚 Learn ISL
        </h1>

        <p
          style={{
            color:
              "#cbd5e1",
          }}
        >
          AI-powered guided
          sign learning
        </p>
      </div>

      <video
        ref={videoRef}
        style={{
          display:
            "none",
        }}
      />

      {/* MAIN */}

      <div
        style={{
          display:
            "flex",

          gap: "24px",

          alignItems:
            "flex-start",

          justifyContent:
            "center",

          flexWrap:
            "wrap",
        }}
      >
        {/* CAMERA */}

        <div
          style={{
            flex: 1,

            minWidth: "0",

            maxWidth:
              "950px",

            background:
              "rgba(255,255,255,0.05)",

            border:
              "1px solid rgba(255,255,255,0.08)",

            borderRadius:
              "28px",

            padding:
              "20px",

            backdropFilter:
              "blur(12px)",

            boxShadow:
              "0 0 30px rgba(0,255,255,0.12)",
          }}
        >
          <canvas
            ref={canvasRef}
            width="1280"
            height="720"
            style={{
              width: "100%",

              aspectRatio:
                "16/9",

              objectFit:
                "cover",

              borderRadius:
                "22px",

              border:
                "4px solid #00ffff",

              background:
                "black",
            }}
          />
        </div>

        {/* SIDEBAR */}

        <div
          style={{
            width:
              "280px",

            display:
              "flex",

            flexDirection:
              "column",

            gap: "12px",

            flexShrink: 0,
          }}
        >
          <StatsCard
            title="Current Letter"
            value={
              currentLesson.label
            }
            color="#00ffff"
            large
          />

          <StatsCard
            title="Accuracy"
            value={`${accuracy}%`}
            color="#22c55e"
            large
          />

          <StatsCard
            title="Status"
            value={
              correct
                ? "✅ Correct"
                : "⏳ Learning"
            }
            color="#facc15"
          />

          <StatsCard
            title="Progress"
            value={`${
              currentLessonIndex +
              1
            } / ${
              lessons.length
            }`}
            subtitle={`${Math.floor(
              ((currentLessonIndex +
                1) /
                lessons.length) *
                100
            )}% Completed`}
            color="#ff66ff"
          />

          <StatsCard
            title="Guide"
            value="🔴 Left | 🔵 Right"
            subtitle="💠 Cyan = Template"
            color="#00ffff"
          />
        </div>
      </div>
    </div>
  );
}

export default Learn;