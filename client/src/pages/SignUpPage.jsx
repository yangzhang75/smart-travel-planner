import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { BrandPanel, OauthGroup, Legal } from "../components/BrandPanel";
import { api, auth } from "../utils/api";

export default function SignUpPage({ slide, setSlide, photo, onNavigate }) {
  const navigate = useNavigate();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const name = `${firstName} ${lastName}`.trim();
      const { token, user } = await api.register({ email, password, name });
      auth.setToken(token);
      auth.setUser(user);
      navigate("/home");
    } catch (err) {
      setError(err.message || "Sign up failed");
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
            <h1>Create account</h1>
            <p>
              Already have an account?{" "}
              <a onClick={() => { onNavigate?.(); navigate("/signin"); }}>
                Sign in
              </a>
            </p>
          </header>
          <form className="formStack" onSubmit={onSubmit}>
            <div className="fieldRow">
              <div className="field">
                <label className="fieldLabel" htmlFor="firstName">First name</label>
                <input
                  id="firstName"
                  className="fieldInput"
                  placeholder="Yoyo"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                />
              </div>
              <div className="field">
                <label className="fieldLabel" htmlFor="lastName">Last name</label>
                <input
                  id="lastName"
                  className="fieldInput"
                  placeholder="Lai"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="field">
              <label className="fieldLabel" htmlFor="signupEmail">Email</label>
              <input
                id="signupEmail"
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
              <label className="fieldLabel" htmlFor="signupPassword">Password</label>
              <input
                id="signupPassword"
                type="password"
                className="fieldInput"
                placeholder="At least 8 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                autoComplete="new-password"
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
              {loading ? "Creating account…" : "Create account"}
            </button>
          </form>
          <OauthGroup />
          <Legal />
        </div>
      </main>
    </div>
  );
}
