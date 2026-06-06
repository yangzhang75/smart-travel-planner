import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { BrandPanel, OauthGroup, Legal } from "../components/BrandPanel";
import { api, auth } from "../utils/api";

export default function SignInPage({ slide, setSlide, photo, onNavigate }) {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { token, user } = await api.login({ email, password });
      auth.setToken(token);
      auth.setUser(user);
      navigate("/home");
    } catch (err) {
      setError(err.message || "Sign in failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <BrandPanel activeIndex={slide} onDot={setSlide} photo={photo} />
      <main className="formPanel">
        <div className="formInner">
          <header className="formHeader">
            <h1>Sign in</h1>
            <p>
              New to Voyage?{" "}
              <a onClick={() => { onNavigate?.(); navigate("/signup"); }}>
                Create an account
              </a>
            </p>
          </header>
          <form className="formStack" onSubmit={onSubmit}>
            <div className="field">
              <label className="fieldLabel" htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                className="fieldInput"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>
            <div className="field">
              <label className="fieldLabel" htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                className="fieldInput"
                placeholder="Your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
            </div>
            {error && (
              <div
                role="alert"
                style={{
                  color: "#b00020",
                  background: "#fdecea",
                  padding: "8px 12px",
                  borderRadius: 6,
                  fontSize: 14,
                }}
              >
                {error}
              </div>
            )}
            <button type="submit" className="btnPrimary" disabled={loading}>
              {loading ? "Signing in…" : "Sign in"}
            </button>
          </form>
          <OauthGroup />
          <Legal />
        </div>
      </main>
    </div>
  );
}
