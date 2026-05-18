import {
  useEffect,
  useState,
} from "react";

import { loadTemplates } from "../utils/templateLoader";

import HandCanvas from "../components/HandCanvas";

import StatsCard from "../components/StatsCard";

function TextToISL() {
  // =========================
  // STATES
  // =========================

  const [templates, setTemplates] =
    useState({});

  const [text, setText] =
    useState("");

  const [letters, setLetters] =
    useState([]);

  const [currentIndex, setCurrentIndex] =
    useState(0);

  const [isPlaying, setIsPlaying] =
    useState(false);

  // =========================
  // CURRENT LETTER
  // =========================

  const currentLetter =
    letters[currentIndex];

  // =========================
  // LOAD TEMPLATES
  // =========================

  useEffect(() => {
    async function loadData() {
      const loadedTemplates =
        await loadTemplates();

      console.log(
        "TEMPLATES:",
        Object.keys(
          loadedTemplates
        )
      );

      setTemplates(
        loadedTemplates
      );
    }

    loadData();
  }, []);

  // =========================
  // GENERATE LETTERS
  // =========================

  function generateISL() {
    const clean =
      text
        .toUpperCase()
        .replace(
          /[^A-Z ]/g,
          ""
        );

    const chars =
      clean.split("");

    setLetters(chars);

    setCurrentIndex(0);
  }

  // =========================
  // NEXT LETTER
  // =========================

  function nextLetter() {
    if (
      currentIndex <
      letters.length - 1
    ) {
      setCurrentIndex(
        (prev) => prev + 1
      );
    }
  }

  // =========================
  // PREVIOUS LETTER
  // =========================

  function previousLetter() {
    if (currentIndex > 0) {
      setCurrentIndex(
        (prev) => prev - 1
      );
    }
  }

  // =========================
  // AUTOPLAY
  // =========================

  useEffect(() => {
    if (
      !isPlaying ||
      letters.length === 0
    ) {
      return;
    }

    const interval =
      setInterval(() => {
        setCurrentIndex(
          (prev) => {
            if (
              prev >=
              letters.length - 1
            ) {
              setIsPlaying(
                false
              );

              return prev;
            }

            return prev + 1;
          }
        );
      }, 1800);

    return () =>
      clearInterval(
        interval
      );
  }, [
    isPlaying,
    letters,
  ]);

  // =========================
  // SPEAK TEXT
  // =========================

  function speakText() {
    if (!text.trim()) return;

    const utterance =
      new SpeechSynthesisUtterance(
        text
      );

    utterance.rate = 0.9;

    utterance.pitch = 1;

    speechSynthesis.speak(
      utterance
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",

        background:
          "linear-gradient(to bottom right, #050816, #0f172a, #111827)",

        color: "white",

        padding: "30px",

        fontFamily:
          "Arial",
      }}
    >
      {/* HEADER */}

      <div
        style={{
          textAlign: "center",

          marginBottom:
            "40px",
        }}
      >
        <h1
          style={{
            fontSize: "58px",

            color: "#00ffff",

            marginBottom:
              "15px",
          }}
        >
          💬 Text → ISL
        </h1>

        <p
          style={{
            color: "#cbd5e1",

            fontSize: "20px",
          }}
        >
          Type text and
          learn how to sign
          it in ISL
        </p>
      </div>

      {/* INPUT */}

      <div
        style={{
          maxWidth: "900px",

          margin:
            "0 auto",

          display: "flex",

          gap: "15px",

          flexWrap: "wrap",

          justifyContent:
            "center",

          marginBottom:
            "40px",
        }}
      >
        <input
          type="text"

          value={text}

          onChange={(e) =>
            setText(
              e.target.value
            )
          }

          placeholder="Type text here..."

          style={{
            flex: 1,

            minWidth: "280px",

            padding: "18px",

            borderRadius:
              "18px",

            border:
              "2px solid #00ffff",

            background:
              "rgba(255,255,255,0.08)",

            color: "white",

            fontSize: "20px",

            outline: "none",
          }}
        />

        <button
          onClick={
            generateISL
          }
          style={{
            padding:
              "18px 28px",

            borderRadius:
              "18px",

            border: "none",

            background:
              "#00ffff",

            color: "black",

            fontWeight:
              "bold",

            fontSize: "18px",

            cursor:
              "pointer",
          }}
        >
          Generate ISL
        </button>
      </div>

      {/* MAIN */}

      <div
        style={{
          display: "flex",

          justifyContent:
            "center",

          gap: "30px",

          alignItems:
            "flex-start",

          flexWrap: "wrap",
        }}
      >
        {/* LEFT PANEL */}

        <div
          style={{
            width: "420px",

            display: "flex",

            flexDirection:
              "column",

            gap: "20px",
          }}
        >
          {/* CURRENT LETTER */}

          <StatsCard
            title="Current Letter"

            value={
              currentLetter ||
              "-"
            }

            color="#00ffff"

            large
          />

          {/* TEMPLATE */}

          {templates[
            currentLetter
          ]?.landmarks ? (
            <HandCanvas
              landmarks={
                templates[
                  currentLetter
                ]?.landmarks ||
                []
              }

              width={320}

              height={320}

              mirrored={true}

              title="ISL Gesture"
            />
          ) : (
            <div
              style={{
                width: "320px",

                height: "320px",

                borderRadius:
                  "22px",

                background:
                  "rgba(255,255,255,0.08)",

                display: "flex",

                justifyContent:
                  "center",

                alignItems:
                  "center",

                color:
                  "#ff3b3b",

                fontSize:
                  "22px",

                fontWeight:
                  "bold",

                border:
                  "2px solid rgba(255,255,255,0.1)",
              }}
            >
              No Template Found
            </div>
          )}
        </div>

        {/* RIGHT PANEL */}

        <div
          style={{
            width: "340px",

            display: "flex",

            flexDirection:
              "column",

            gap: "20px",
          }}
        >
          {/* GENERATED LETTERS */}

          <div
            style={{
              background:
                "rgba(255,255,255,0.08)",

              border:
                "1px solid rgba(255,255,255,0.08)",

              borderRadius:
                "22px",

              padding: "24px",
            }}
          >
            <h2
              style={{
                color:
                  "#22c55e",

                marginBottom:
                  "20px",
              }}
            >
              Generated Letters
            </h2>

            <div
              style={{
                display: "flex",

                flexWrap:
                  "wrap",

                gap: "10px",
              }}
            >
              {letters.map(
                (
                  letter,
                  index
                ) => (
                  <div
                    key={index}

                    style={{
                      width: "44px",

                      height:
                        "44px",

                      borderRadius:
                        "12px",

                      background:
                        index ===
                        currentIndex
                          ? "#00ffff"
                          : "rgba(255,255,255,0.12)",

                      color:
                        index ===
                        currentIndex
                          ? "black"
                          : "white",

                      display:
                        "flex",

                      justifyContent:
                        "center",

                      alignItems:
                        "center",

                      fontWeight:
                        "bold",

                      fontSize:
                        "18px",
                    }}
                  >
                    {letter}
                  </div>
                )
              )}
            </div>
          </div>

          {/* CONTROLS */}

          <div
            style={{
              display: "flex",

              flexDirection:
                "column",

              gap: "14px",
            }}
          >
            <button
              onClick={
                previousLetter
              }
              style={{
                padding:
                  "16px",

                borderRadius:
                  "16px",

                border: "none",

                background:
                  "#334155",

                color:
                  "white",

                fontWeight:
                  "bold",

                cursor:
                  "pointer",

                fontSize:
                  "16px",
              }}
            >
              ⬅ Previous
            </button>

            <button
              onClick={
                nextLetter
              }
              style={{
                padding:
                  "16px",

                borderRadius:
                  "16px",

                border: "none",

                background:
                  "#00ffff",

                color:
                  "black",

                fontWeight:
                  "bold",

                cursor:
                  "pointer",

                fontSize:
                  "16px",
              }}
            >
              Next ➡
            </button>

            <button
              onClick={() =>
                setIsPlaying(
                  !isPlaying
                )
              }
              style={{
                padding:
                  "16px",

                borderRadius:
                  "16px",

                border: "none",

                background:
                  isPlaying
                    ? "#ff3b3b"
                    : "#22c55e",

                color:
                  "white",

                fontWeight:
                  "bold",

                cursor:
                  "pointer",

                fontSize:
                  "16px",
              }}
            >
              {isPlaying
                ? "⏹ Stop AutoPlay"
                : "▶ Start AutoPlay"}
            </button>

            <button
              onClick={
                speakText
              }
              style={{
                padding:
                  "16px",

                borderRadius:
                  "16px",

                border: "none",

                background:
                  "#facc15",

                color:
                  "black",

                fontWeight:
                  "bold",

                cursor:
                  "pointer",

                fontSize:
                  "16px",
              }}
            >
              🔊 Speak Text
            </button>
          </div>

          {/* PROGRESS */}

          <StatsCard
            title="Progress"

            value={
              letters.length ===
              0
                ? "0/0"
                : `${currentIndex + 1}/${letters.length}`
            }

            subtitle="Current learning progress"

            color="#facc15"
          />
        </div>
      </div>
    </div>
  );
}

export default TextToISL;