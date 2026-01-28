import { useEffect, useRef } from "react";
import { Hands } from "@mediapipe/hands";
import { Camera } from "@mediapipe/camera_utils";

function App() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

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
        await hands.send({ image: videoRef.current });
      },
      width: 640,
      height: 480,
    });

    camera.start();
  }, []);

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

    if (results.multiHandLandmarks) {
      for (const landmarks of results.multiHandLandmarks) {
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
  }

  return (
    <div style={{ textAlign: "center" }}>
      <h1>AI Sign Detection - Day 2</h1>

      <video
        ref={videoRef}
        style={{ display: "none" }}
      />

      <canvas
        ref={canvasRef}
        width="640"
        height="480"
        style={{
          border: "2px solid black",
        }}
      />
    </div>
  );
}

export default App;
