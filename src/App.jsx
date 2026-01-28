import { useEffect, useRef, useState } from "react";
import { Hands } from "@mediapipe/hands";
import { Camera } from "@mediapipe/camera_utils";

function App() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const currentRef = useRef(null); // Live landmarks
  const [template, setTemplate] = useState(null); // Saved gesture
  const [result, setResult] = useState("");

  useEffect(() => {
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

    const camera = new Camera(videoRef.current, {
      onFrame: async () => {
        if (videoRef.current) {
          await hands.send({ image: videoRef.current });
        }
      },
      width: 640,
      height: 480,
    });

    camera.start();
  }, []);

  // Normalize landmarks (position invariant)
  function normalize(landmarks) {
    const base = landmarks[0]; // Wrist

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

    ctx.drawImage(
      results.image,
      0,
      0,
      canvas.width,
      canvas.height
    );

    if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
      const landmarks = results.multiHandLandmarks[0];

      // Store live hand
      currentRef.current = landmarks;

      // Draw points
      for (let i = 0; i < landmarks.length; i++) {
        const x = landmarks[i].x * canvas.width;
        const y = landmarks[i].y * canvas.height;

        ctx.beginPath();
        ctx.arc(x, y, 5, 0, 2 * Math.PI);
        ctx.fillStyle = "red";
        ctx.fill();
      }
    }
  }

  function saveTemplate() {
    if (!currentRef.current) {
      alert("No hand detected!");
      return;
    }

    // Normalize before saving
    const norm = normalize(currentRef.current);

    setTemplate(norm);
    setResult("Template Saved ✅");
  }

  function distance(p1, p2) {
    return Math.sqrt(
      Math.pow(p1.x - p2.x, 2) +
        Math.pow(p1.y - p2.y, 2) +
        Math.pow(p1.z - p2.z, 2)
    );
  }

  function checkGesture() {
    if (!template || !currentRef.current) {
      alert("Missing template or hand!");
      return;
    }

    // Normalize live hand
    const normCurrent = normalize(currentRef.current);

    let total = 0;

    for (let i = 0; i < 21; i++) {
      total += distance(template[i], normCurrent[i]);
    }

    const avg = total / 21;

    // Flexible threshold
    if (avg < 0.12) {
      setResult("Correct Gesture ✅");
    } else {
      setResult("Try Again ❌");
    }
  }

  return (
    <div style={{ textAlign: "center" }}>
      <h1>Sign Learning Mode</h1>

      <video ref={videoRef} style={{ display: "none" }} />

      <canvas
        ref={canvasRef}
        width="640"
        height="480"
        style={{ border: "2px solid black" }}
      />

      <div style={{ marginTop: "20px" }}>
        <button onClick={saveTemplate}>
          Save Gesture
        </button>

        <button
          onClick={checkGesture}
          style={{ marginLeft: "10px" }}
        >
          Check Gesture
        </button>
      </div>

      <h2>{result}</h2>
    </div>
  );
}

export default App;
