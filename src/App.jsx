import {
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import Navbar from "./components/Navbar";

import Home from "./pages/Home";

import Learn from "./pages/Learn";

import Translate from "./pages/Translate";

import TextToISL from "./pages/TextToISL";

// TEMP PLACEHOLDER
function Practice() {
  return (
    <div
      style={{
        minHeight: "100vh",

        display: "flex",

        justifyContent:
          "center",

        alignItems:
          "center",

        background:
          "#050816",

        color: "white",

        fontSize: "42px",

        fontWeight:
          "bold",
      }}
    >
      ✋ Practice Mode
    </div>
  );
}

function App() {
  return (
    <>
      {/* NAVBAR */}

      <Navbar />

      {/* ROUTES */}

      <Routes>

        {/* HOME */}

        <Route
          path="/"
          element={<Home />}
        />

        {/* LEARN */}

        <Route
          path="/learn"
          element={<Learn />}
        />

        {/* TRANSLATE */}

        <Route
          path="/translate"
          element={<Translate />}
        />

        {/* TEXT TO ISL */}

        <Route
          path="/text-to-isl"
          element={<TextToISL />}
        />

        {/* PRACTICE */}

        <Route
          path="/practice"
          element={<Practice />}
        />

        {/* FALLBACK */}

        <Route
          path="*"
          element={
            <Navigate to="/" />
          }
        />

      </Routes>
    </>
  );
}

export default App;