import { useEffect, useRef, useState } from "react";
import { Hands } from "@mediapipe/hands";
import { Camera } from "@mediapipe/camera_utils";

function App() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const currentRef = useRef(null);
  const templateRef = useRef(null); // ✅ FIX: useRef instead of state

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
    ctx.drawImage(results.image, 0, 0, canvas.width, canvas.height);

    // 🔴 Draw hand
    if (results.multiHandLandmarks?.length > 0) {
      const landmarks = results.multiHandLandmarks[0];
      currentRef.current = landmarks;

      for (let i = 0; i < landmarks.length; i++) {
        const x = landmarks[i].x * canvas.width;
        const y = landmarks[i].y * canvas.height;

        ctx.beginPath();
        ctx.arc(x, y, 5, 0, 2 * Math.PI);
        ctx.fillStyle = "red";
        ctx.fill();
      }
    }

    // 🟢 DRAW TEMPLATE (NOW WILL WORK)
    if (templateRef.current) {
      for (let i = 0; i < templateRef.current.length; i++) {
        const x = canvas.width / 2 + templateRef.current[i].x * 200;
        const y = canvas.height / 2 + templateRef.current[i].y * 200;

        ctx.beginPath();
        ctx.arc(x, y, 8, 0, 2 * Math.PI);
        ctx.fillStyle = "lime";
        ctx.fill();
      }
    } else {
      // 🟡 debug dot
      ctx.beginPath();
      ctx.arc(canvas.width / 2, canvas.height / 2, 10, 0, 2 * Math.PI);
      ctx.fillStyle = "yellow";
      ctx.fill();
    }
  }

  function saveTemplate() {
    if (!currentRef.current) {
      alert("No hand detected!");
      return;
    }

    const norm = normalize(currentRef.current);

    templateRef.current = norm; // ✅ FIX HERE
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
    if (!templateRef.current || !currentRef.current) {
      alert("Missing template or hand!");
      return;
    }

    const normCurrent = normalize(currentRef.current);

    let total = 0;

    for (let i = 0; i < 21; i++) {
      total += distance(templateRef.current[i], normCurrent[i]);
    }

    const avg = total / 21;

    if (avg < 0.20) {
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
        style={{ border: "3px solid black" }}
      />

      <div style={{ marginTop: "20px" }}>
        <button onClick={saveTemplate}>Save Gesture</button>

        <button
          onClick={checkGesture}
          style={{ marginLeft: "10px" }}
        >
          Check Gesture
        </button>
      </div>

      <h2>{result}</h2>

      <p>Template: {templateRef.current ? "Saved" : "Not Saved"}</p>
    </div>
  );
}

export default App;