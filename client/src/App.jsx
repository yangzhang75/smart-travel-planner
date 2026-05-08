import { useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import "./App.css";

import SignInPage from "./pages/SignInPage";
import SignUpPage from "./pages/SignUpPage";
import HomePage from "./pages/HomePage";
import ProfilePage from "./pages/ProfilePage";
import PlanWithAIPage from "./pages/PlanWithAIPage";

// ───── Photo pool for auth pages ─────
const PHOTOS = [
  "https://images.unsplash.com/photo-1533105079780-92b9be482077?w=1600&q=80&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1600&q=80&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=1600&q=80&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1473580044384-7ba9967e16a0?w=1600&q=80&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1506953823976-52e1fdc0149a?w=1600&q=80&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1499678329028-101435549a4e?w=1600&q=80&auto=format&fit=crop",
];

function pickIndex(excluded) {
  const pool = PHOTOS.map((_, i) => i).filter((i) => !excluded.includes(i));
  return pool[Math.floor(Math.random() * pool.length)];
}

function App() {
  const [slide, setSlide] = useState(0);
  const [photos, setPhotos] = useState(() => {
    const a = pickIndex([]);
    const b = pickIndex([a]);
    return { signin: a, signup: b };
  });

  // Reroll photo when navigating between auth pages
  const rerollPhoto = (page) => {
    setPhotos((prev) => {
      const other = page === "signin" ? prev.signup : prev.signin;
      const fresh = pickIndex([prev[page], other]);
      return { ...prev, [page]: fresh };
    });
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/signin" element={<SignInPage slide={slide} setSlide={setSlide} photo={PHOTOS[photos.signin]} onNavigate={() => rerollPhoto("signup")} />} />
        <Route path="/signup" element={<SignUpPage slide={slide} setSlide={setSlide} photo={PHOTOS[photos.signup]} onNavigate={() => rerollPhoto("signin")} />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="*" element={<Navigate to="/signin" replace />} />
        <Route path="/plan" element={<PlanWithAIPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
