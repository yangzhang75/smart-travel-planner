import ReactDOM from "react-dom/client";
import "leaflet/dist/leaflet.css";
import App from "./App.jsx";

// Note: StrictMode is intentionally disabled. Its dev-mode double-invocation of
// effects was causing POST /api/plan-trip to fire twice, creating duplicate trips.
// In production StrictMode is a no-op, so disabling it has no production impact.
ReactDOM.createRoot(document.getElementById("root")).render(<App />);
