function Completion({
  title = "Completed",
  subtitle = "",
  primaryButtonText = "Continue",
  secondaryButtonText = "",
  onPrimaryClick,
  onSecondaryClick,
  children,
}) {
  return (
    <div
      style={{
        position: "fixed",

        top: 0,
        left: 0,

        width: "100%",
        height: "100%",

        background:
          "rgba(0,0,0,0.82)",

        display: "flex",

        justifyContent:
          "center",

        alignItems:
          "center",

        zIndex: 9999,

        padding: "20px",
      }}
    >
      {/* CARD */}

      <div
        style={{
          width: "100%",

          maxWidth: "720px",

          background:
            "linear-gradient(to bottom right, #0f172a, #111827)",

          borderRadius:
            "32px",

          padding: "45px",

          border:
            "2px solid rgba(0,255,255,0.25)",

          boxShadow:
            "0 0 40px rgba(0,255,255,0.18)",

          textAlign:
            "center",

          color: "white",
        }}
      >
        {/* TITLE */}

        <h1
          style={{
            fontSize: "56px",

            color: "#22c55e",

            marginBottom:
              "18px",

            textShadow:
              "0 0 20px rgba(34,197,94,0.35)",
          }}
        >
          🎉 {title}
        </h1>

        {/* SUBTITLE */}

        {subtitle && (
          <p
            style={{
              color:
                "#cbd5e1",

              fontSize:
                "20px",

              lineHeight:
                "1.7",

              marginBottom:
                "30px",
            }}
          >
            {subtitle}
          </p>
        )}

        {/* CUSTOM CONTENT */}

        {children && (
          <div
            style={{
              marginBottom:
                "35px",
            }}
          >
            {children}
          </div>
        )}

        {/* BUTTONS */}

        <div
          style={{
            display: "flex",

            justifyContent:
              "center",

            gap: "18px",

            flexWrap: "wrap",
          }}
        >
          {/* PRIMARY */}

          <button
            onClick={
              onPrimaryClick
            }
            style={{
              padding:
                "16px 30px",

              borderRadius:
                "18px",

              border: "none",

              background:
                "#00ffff",

              color: "black",

              fontSize: "18px",

              fontWeight:
                "bold",

              cursor:
                "pointer",

              boxShadow:
                "0 0 20px rgba(0,255,255,0.25)",
            }}
          >
            {
              primaryButtonText
            }
          </button>

          {/* SECONDARY */}

          {secondaryButtonText && (
            <button
              onClick={
                onSecondaryClick
              }
              style={{
                padding:
                  "16px 30px",

                borderRadius:
                  "18px",

                border:
                  "1px solid rgba(255,255,255,0.1)",

                background:
                  "rgba(255,255,255,0.08)",

                color: "white",

                fontSize:
                  "18px",

                fontWeight:
                  "bold",

                cursor:
                  "pointer",
              }}
            >
              {
                secondaryButtonText
              }
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default Completion;