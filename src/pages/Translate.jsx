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

import StatsCard from "../components/StatsCard";

import Completion from "../components/Completion";

function Translate() {
  // =========================
  // SETTINGS
  // =========================

  const MIN_CONFIDENCE = 60;

  const STABLE_FRAMES_REQUIRED = 12;

  // =========================
  // REFS
  // =========================

  const videoRef =
    useRef(null);

  const canvasRef =
    useRef(null);

  const predictionBuffer =
    useRef([]);

  const cooldownRef =
    useRef(false);

  const compareCooldownRef =
    useRef(false);

  // =========================
  // STATES
  // =========================

  const [prediction, setPrediction] =
    useState("");

  const [confidence, setConfidence] =
    useState(0);

  const [sentence, setSentence] =
    useState("");

  const [lastLetter, setLastLetter] =
    useState("");

  const [stableFrames, setStableFrames] =
    useState(0);

  const [captureCooldown, setCaptureCooldown] =
    useState(false);

  const [handPresent, setHandPresent] =
    useState(false);

  const [isTranslating, setIsTranslating] =
    useState(false);

  const [showFinalOverlay, setShowFinalOverlay] =
    useState(false);

  const [translationCount, setTranslationCount] =
    useState(0);

  const [timeTaken, setTimeTaken] =
    useState(0);

  const [startTime, setStartTime] =
    useState(0);

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
  // SMOOTHING
  // =========================

  function getSmoothedPrediction(
    newPrediction
  ) {
    predictionBuffer.current.push(
      newPrediction
    );

    if (
      predictionBuffer.current
        .length > 10
    ) {
      predictionBuffer.current.shift();
    }

    const counts = {};

    predictionBuffer.current.forEach(
      (letter) => {
        counts[letter] =
          (counts[letter] || 0) + 1;
      }
    );

    let best = "";

    let max = 0;

    for (const key in counts) {
      if (counts[key] > max) {
        max = counts[key];

        best = key;
      }
    }

    return best;
  }

  // =========================
  // FIND BEST MATCH
  // =========================

  function findBestMatch(
    landmarks
  ) {
    const normalizedInput =
      normalize(
        landmarks
      );

    let bestLetter = "";

    let bestScore = 0;

    Object.keys(templates).forEach(
      (letter) => {
        // FIX TEMPLATE STRUCTURE

        const template =
          templates[letter]
            ?.landmarks;

        if (
          !template ||
          template.length === 0
        ) {
          return;
        }

        const normalizedTemplate =
          normalize(
            template
          );

        let total = 0;

        for (
          let i = 0;
          i < 21;
          i++
        ) {
          total += distance(
            normalizedInput[
              i
            ],
            normalizedTemplate[
              i
            ]
          );
        }

        const avg =
          total / 21;

        const score =
          Math.max(
            0,
            100 - avg * 500
          );

        if (
          score > bestScore
        ) {
          bestScore = score;

          bestLetter =
            letter;
        }
      }
    );

    return {
      letter:
        bestLetter,

      confidence:
        Math.round(
          bestScore
        ),
    };
  }

  // =========================
  // PROCESS PREDICTION
  // =========================

  function processPrediction(
    landmarks
  ) {
    if (
      compareCooldownRef.current
    ) {
      return;
    }

    compareCooldownRef.current =
      true;

    const result =
      findBestMatch(
        landmarks
      );

    const smooth =
      getSmoothedPrediction(
        result.letter
      );

    setPrediction(smooth);

    setConfidence(
      result.confidence
    );

    // STABILITY

    if (
      smooth === lastLetter
    ) {
      setStableFrames(
        (prev) => prev + 1
      );
    } else {
      setLastLetter(smooth);

      setStableFrames(0);
    }

    // CAPTURE LETTER

    if (
      result.confidence >=
        MIN_CONFIDENCE &&
      stableFrames >=
        STABLE_FRAMES_REQUIRED &&
      !cooldownRef.current &&
      isTranslating
    ) {
      cooldownRef.current =
        true;

      setCaptureCooldown(
        true
      );

      setSentence(
        (prev) =>
          prev + smooth
      );

      setTranslationCount(
        (prev) => prev + 1
      );

      predictionBuffer.current =
        [];

      setStableFrames(0);

      setTimeout(() => {
        cooldownRef.current =
          false;

        setCaptureCooldown(
          false
        );
      }, 1400);
    }

    setTimeout(() => {
      compareCooldownRef.current =
        false;
    }, 100);
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

    // NO HAND

    if (
      !results.multiHandLandmarks ||
      results
        .multiHandLandmarks
        .length === 0
    ) {
      setHandPresent(false);

      return;
    }

    // HAND FOUND

    setHandPresent(true);

    const landmarks =
      results
        .multiHandLandmarks[0];

    let handedness =
      results
        .multiHandedness[0]
        .label;

    // FIX MIRRORED SELFIE LABELS

    handedness =
      handedness === "Left"
        ? "Right"
        : "Left";

    // MIRROR LANDMARKS

    const mirrored =
      landmarks.map((p) => ({
        x: 1 - p.x,
        y: p.y,
        z: p.z,
      }));

    const handColor =
      handedness === "Left"
        ? "#00ffff"
        : "#22c55e";

    // DRAW CONNECTIONS

    drawConnectors(
      ctx,
      mirrored,
      HAND_CONNECTIONS,
      {
        color: handColor,

        lineWidth: 4,
      }
    );

    // DRAW LANDMARKS

    drawLandmarks(
      ctx,
      mirrored,
      {
        color: "#ffffff",

        radius: 6,
      }
    );

    // LABEL

    ctx.font =
      "bold 24px Arial";

    ctx.fillStyle =
      handColor;

    ctx.fillText(
      handedness.toUpperCase(),
      mirrored[0].x *
        canvas.width,
      mirrored[0].y *
        canvas.height -
        20
    );

    // PROCESS

    if (isTranslating) {
      processPrediction(
        landmarks
      );
    }

    // CAPTURED

    if (captureCooldown) {
      ctx.font =
        "bold 42px Arial";

      ctx.fillStyle =
        "#22c55e";

      ctx.fillText(
        "✓ Captured",
        40,
        60
      );
    }
  }

  // =========================
  // START / STOP
  // =========================

  function toggleTranslation() {
    // START

    if (!isTranslating) {
      setSentence("");

      setPrediction("");

      setConfidence(0);

      setStableFrames(0);

      setTranslationCount(0);

      setStartTime(
        Date.now()
      );

      predictionBuffer.current =
        [];

      setIsTranslating(true);

      return;
    }

    // STOP

    setIsTranslating(false);

    const endTime =
      Date.now();

    setTimeTaken(
      Math.floor(
        (endTime -
          startTime) /
          1000
      )
    );

    setShowFinalOverlay(true);

    // SPEAK

    if (sentence.trim()) {
      const utterance =
        new SpeechSynthesisUtterance(
          sentence
        );

      utterance.rate = 0.9;

      speechSynthesis.speak(
        utterance
      );
    }
  }

  // =========================
  // SPEAK
  // =========================

  function speakSentence() {
    if (!sentence) return;

    const utterance =
      new SpeechSynthesisUtterance(
        sentence
      );

    speechSynthesis.speak(
      utterance
    );
  }

  return (
    <div
      style={{
        minHeight:
          "100vh",

        background:
          "linear-gradient(to bottom right,#050816,#0f172a,#111827)",

        color: "white",

        padding: "20px",
      }}
    >
      {/* HEADER */}

      <div
        style={{
          textAlign:
            "center",

          marginBottom:
            "20px",
        }}
      >
        <h1
          style={{
            color:
              "#00ffff",

            fontSize:
              "52px",
          }}
        >
          🎙 ISL → Text
        </h1>
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
          display:
            "flex",

          gap: "20px",

          justifyContent:
            "center",

          alignItems:
            "flex-start",

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
            title="Detected"
            value={
              prediction || "-"
            }
            subtitle={`Confidence: ${confidence}%`}
            color="#00ffff"
            large
          />

          <StatsCard
            title="Sentence"
            value={
              sentence || "-"
            }
            color="#22c55e"
          />

          <StatsCard
            title="Hand Detection"
            value={
              handPresent
                ? "Detected"
                : "No Hand"
            }
            color={
              handPresent
                ? "#22c55e"
                : "#ff3b3b"
            }
          />

          <StatsCard
            title="Status"
            value={
              captureCooldown
                ? "Cooldown"
                : isTranslating
                ? "Active"
                : "Stopped"
            }
            subtitle={`Frames: ${stableFrames}`}
            color="#facc15"
          />

          <StatsCard
            title="Letters"
            value={
              translationCount
            }
            color="#00ffff"
          />

          {/* BUTTON */}

          <button
            onClick={
              toggleTranslation
            }
            style={{
              padding:
                "18px",

              borderRadius:
                "18px",

              border:
                "none",

              background:
                isTranslating
                  ? "#ff3b3b"
                  : "#22c55e",

              color:
                "white",

              fontSize:
                "18px",

              fontWeight:
                "bold",

              cursor:
                "pointer",
            }}
          >
            {isTranslating
              ? "⏹ Stop"
              : "▶ Start"}
          </button>
        </div>
      </div>

      {/* COMPLETION */}

      {showFinalOverlay && (
        <Completion
          title="Translation Complete"
          subtitle="Your ISL gestures were translated successfully."
          primaryButtonText="🔊 Speak Again"
          secondaryButtonText="Close"
          onPrimaryClick={
            speakSentence
          }
          onSecondaryClick={() =>
            setShowFinalOverlay(
              false
            )
          }
        >
          <StatsCard
            title="Final Sentence"
            value={
              sentence || "-"
            }
            subtitle={`Time: ${timeTaken}s`}
            color="#22c55e"
          />
        </Completion>
      )}
    </div>
  );
}

export default Translate;