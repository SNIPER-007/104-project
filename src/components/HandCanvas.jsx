import {
  useEffect,
  useRef,
} from "react";

import {
  HAND_CONNECTIONS,
} from "@mediapipe/hands";

export default function HandCanvas({
  landmarks,

  width = 300,

  height = 300,

  title = "Gesture Template",
}) {
  const canvasRef =
    useRef(null);

  useEffect(() => {
    const canvas =
      canvasRef.current;

    if (
      !canvas ||
      !landmarks ||
      landmarks.length === 0
    ) {
      return;
    }

    const ctx =
      canvas.getContext("2d");

    ctx.clearRect(
      0,
      0,
      width,
      height
    );

    // BACKGROUND

    ctx.fillStyle =
      "#0f172a";

    ctx.fillRect(
      0,
      0,
      width,
      height
    );

    // =========================
    // FIND BOUNDS
    // =========================

    const xs =
      landmarks.map(
        (p) => p.x
      );

    const ys =
      landmarks.map(
        (p) => p.y
      );

    const minX =
      Math.min(...xs);

    const maxX =
      Math.max(...xs);

    const minY =
      Math.min(...ys);

    const maxY =
      Math.max(...ys);

    const handWidth =
      maxX - minX;

    const handHeight =
      maxY - minY;

    // =========================
    // SCALE
    // =========================

    const scale =
      Math.min(
        width /
          (handWidth * 1.8),

        height /
          (handHeight * 1.8)
      );

    // =========================
    // CENTER HAND
    // =========================

    const offsetX =
      width / 2 -
      ((minX + maxX) / 2) *
        scale;

    const offsetY =
      height / 2 -
      ((minY + maxY) / 2) *
        scale;

    // =========================
    // DRAW CONNECTIONS
    // =========================

    HAND_CONNECTIONS.forEach(
      ([start, end]) => {
        const p1 =
          landmarks[start];

        const p2 =
          landmarks[end];

        if (!p1 || !p2)
          return;

        ctx.beginPath();

        ctx.moveTo(
          p1.x * scale +
            offsetX,

          p1.y * scale +
            offsetY
        );

        ctx.lineTo(
          p2.x * scale +
            offsetX,

          p2.y * scale +
            offsetY
        );

        ctx.strokeStyle =
          "#00ffff";

        ctx.lineWidth = 4;

        ctx.stroke();
      }
    );

    // =========================
    // DRAW LANDMARKS
    // =========================

    landmarks.forEach(
      (point) => {
        ctx.beginPath();

        ctx.arc(
          point.x * scale +
            offsetX,

          point.y * scale +
            offsetY,

          6,

          0,

          Math.PI * 2
        );

        ctx.fillStyle =
          "#ffffff";

        ctx.fill();
      }
    );
  }, [
    landmarks,
    width,
    height,
  ]);

  return (
    <div
      style={{
        background:
          "rgba(255,255,255,0.08)",

        border:
          "1px solid rgba(255,255,255,0.08)",

        borderRadius:
          "22px",

        padding: "20px",

        textAlign:
          "center",
      }}
    >
      <h2
        style={{
          color: "#00ffff",

          marginBottom:
            "16px",
        }}
      >
        {title}
      </h2>

      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        style={{
          width: "100%",

          borderRadius:
            "18px",

          background:
            "#0f172a",
        }}
      />
    </div>
  );
}