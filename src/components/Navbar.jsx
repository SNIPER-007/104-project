import {
  Link,
  useLocation,
} from "react-router-dom";

function Navbar() {
  const location =
    useLocation();

  const links = [
    {
      name: "Home",
      path: "/",
    },

    {
      name: "Learn",
      path: "/learn",
    },

    {
      name: "Translate",
      path: "/translate",
    },

    {
      name: "Text → ISL",
      path: "/text-to-isl",
    },
  ];

  return (
    <nav
      style={{
        width: "100%",

        position: "sticky",

        top: 0,

        zIndex: 999,

        backdropFilter:
          "blur(16px)",

        background:
          "rgba(5,8,22,0.82)",

        borderBottom:
          "1px solid rgba(255,255,255,0.08)",

        padding:
          "14px 18px",

        boxSizing:
          "border-box",
      }}
    >
      <div
        style={{
          maxWidth: "1400px",

          margin: "0 auto",

          display: "flex",

          justifyContent:
            "space-between",

          alignItems:
            "center",

          gap: "18px",

          flexWrap: "wrap",
        }}
      >
        {/* LOGO */}

        <div
          style={{
            color: "#00ffff",

            fontSize: "26px",

            fontWeight:
              "bold",

            whiteSpace:
              "nowrap",
          }}
        >
          🤟 ISL AI
        </div>

        {/* LINKS */}

        <div
          style={{
            display: "flex",

            gap: "10px",

            flexWrap: "wrap",

            justifyContent:
              "center",
          }}
        >
          {links.map(
            (link) => {
              const active =
                location.pathname ===
                link.path;

              return (
                <Link
                  key={link.path}

                  to={link.path}

                  style={{
                    padding:
                      "10px 16px",

                    borderRadius:
                      "14px",

                    textDecoration:
                      "none",

                    fontWeight:
                      "bold",

                    transition:
                      "0.3s",

                    background:
                      active
                        ? "#00ffff"
                        : "rgba(255,255,255,0.08)",

                    color:
                      active
                        ? "black"
                        : "white",

                    fontSize:
                      "15px",
                  }}
                >
                  {link.name}
                </Link>
              );
            }
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;