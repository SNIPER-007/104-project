function StatsCard({
  title,
  value,
  subtitle = "",
  color = "#00ffff",
  large = false,
}) {
  return (
    <div
      style={{
        background:
          "rgba(255,255,255,0.08)",

        border:
          "1px solid rgba(255,255,255,0.08)",

        borderRadius:
          "22px",

        padding: "24px",

        backdropFilter:
          "blur(12px)",

        boxShadow:
          `0 0 20px ${color}22`,

        width: "100%",
      }}
    >
      {/* TITLE */}

      <h3
        style={{
          color,

          marginBottom:
            "16px",

          fontSize: "20px",

          fontWeight:
            "bold",
        }}
      >
        {title}
      </h3>

      {/* VALUE */}

      <h1
        style={{
          fontSize: large
            ? "90px"
            : "46px",

          margin: "0",

          color: "white",

          fontWeight:
            "bold",

          lineHeight: "1",
        }}
      >
        {value}
      </h1>

      {/* SUBTITLE */}

      {subtitle && (
        <p
          style={{
            marginTop:
              "14px",

            color:
              "#cbd5e1",

            lineHeight:
              "1.6",

            fontSize:
              "15px",
          }}
        >
          {subtitle}
        </p>
      )}
    </div>
  );
}

export default StatsCard;