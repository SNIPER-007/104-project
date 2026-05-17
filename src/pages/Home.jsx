import { useNavigate } from "react-router-dom";

function Home() {

  const navigate =
    useNavigate();

  const features = [
    {
      title: "📚 Learn ISL",
      desc:
        "Learn Indian Sign Language alphabets with realtime AI feedback.",

      path: "/learn",
    },

    {
      title: "✋ Practice Mode",
      desc:
        "Practice hand signs and improve gesture accuracy live.",

      path: "/practice",
    },

    {
      title:
        "🎙 Live Translation",

      desc:
        "Translate ISL gestures into text and speech in realtime.",

      path: "/translate",
    },

    {
      title:
        "💬 Text → ISL",

      desc:
        "Type words and learn how to perform them in ISL.",

      path: "/text-to-isl",
    },
  ];

  return (
    <div
      style={{
        minHeight: "100vh",

        background:
          "linear-gradient(to bottom right, #050816, #0f172a, #111827)",

        color: "white",

        padding: "40px 20px",

        fontFamily:
          "Arial",
      }}
    >
      {/* HERO */}

      <div
        style={{
          textAlign: "center",

          marginBottom: "70px",
        }}
      >
        <h1
          style={{
            fontSize: "64px",

            fontWeight:
              "bold",

            color: "#00ffff",

            marginBottom:
              "20px",

            textShadow:
              "0 0 25px rgba(0,255,255,0.5)",
          }}
        >
          AI Powered
          <br />
          ISL Communication
          System
        </h1>

        <p
          style={{
            maxWidth: "900px",

            margin:
              "0 auto",

            fontSize: "22px",

            color: "#cbd5e1",

            lineHeight: "1.7",
          }}
        >
          Learn, practice,
          and translate
          Indian Sign
          Language using
          realtime AI,
          MediaPipe hand
          tracking, and
          intelligent gesture
          recognition.
        </p>

        <button
          onClick={() =>
            navigate(
              "/translate"
            )
          }
          style={{
            marginTop: "35px",

            padding:
              "18px 36px",

            borderRadius:
              "18px",

            border: "none",

            background:
              "#00ffff",

            color: "black",

            fontSize: "20px",

            fontWeight:
              "bold",

            cursor:
              "pointer",

            boxShadow:
              "0 0 25px rgba(0,255,255,0.5)",
          }}
        >
          🚀 Start Translating
        </button>
      </div>

      {/* FEATURES */}

      <div
        style={{
          display: "grid",

          gridTemplateColumns:
            "repeat(auto-fit, minmax(280px, 1fr))",

          gap: "30px",

          maxWidth: "1300px",

          margin: "0 auto",
        }}
      >
        {features.map(
          (
            feature,
            index
          ) => (
            <div
              key={index}

              style={{
                background:
                  "rgba(255,255,255,0.08)",

                border:
                  "1px solid rgba(255,255,255,0.12)",

                borderRadius:
                  "28px",

                padding: "30px",

                backdropFilter:
                  "blur(12px)",

                transition:
                  "0.3s",

                boxShadow:
                  "0 0 20px rgba(0,255,255,0.08)",
              }}
            >
              <h2
                style={{
                  fontSize:
                    "32px",

                  marginBottom:
                    "18px",

                  color:
                    "#00ffff",
                }}
              >
                {
                  feature.title
                }
              </h2>

              <p
                style={{
                  color:
                    "#cbd5e1",

                  lineHeight:
                    "1.7",

                  fontSize:
                    "18px",

                  marginBottom:
                    "28px",
                }}
              >
                {
                  feature.desc
                }
              </p>

              <button
                onClick={() =>
                  navigate(
                    feature.path
                  )
                }
                style={{
                  padding:
                    "14px 24px",

                  borderRadius:
                    "14px",

                  border:
                    "none",

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
                Open Module →
              </button>
            </div>
          )
        )}
      </div>

      {/* STATS */}

      <div
        style={{
          marginTop: "80px",

          display: "flex",

          justifyContent:
            "center",

          gap: "30px",

          flexWrap: "wrap",
        }}
      >
        {[
          "26 ISL Alphabets",

          "Realtime AI Detection",

          "MediaPipe Tracking",

          "Speech Output",
        ].map(
          (
            item,
            index
          ) => (
            <div
              key={index}

              style={{
                background:
                  "rgba(255,255,255,0.08)",

                padding:
                  "22px 30px",

                borderRadius:
                  "20px",

                fontWeight:
                  "bold",

                color:
                  "#00ffff",

                fontSize:
                  "18px",

                boxShadow:
                  "0 0 15px rgba(0,255,255,0.12)",
              }}
            >
              {item}
            </div>
          )
        )}
      </div>
    </div>
  );
}

export default Home;