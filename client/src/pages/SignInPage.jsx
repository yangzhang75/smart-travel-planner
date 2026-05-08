import { useNavigate } from "react-router-dom";
import { BrandPanel, OauthGroup, Legal } from "../components/BrandPanel";

export default function SignInPage({ slide, setSlide, photo, onNavigate }) {
  const navigate = useNavigate();
  return (
    <div className="page">
      <BrandPanel activeIndex={slide} onDot={setSlide} photo={photo} />
      <main className="formPanel">
        <div className="formInner">
          <header className="formHeader">
            <h1>Sign in</h1>
            <p>New to Voyage? <a onClick={() => { onNavigate?.(); navigate("/signup"); }}>Create an account</a></p>
          </header>
          <form className="formStack" onSubmit={(e) => { e.preventDefault(); navigate("/home"); }}>
            <div className="field">
              <label className="fieldLabel" htmlFor="email">Email</label>
              <input id="email" type="email" className="fieldInput" placeholder="you@example.com" />
            </div>
            <div className="field">
              <label className="fieldLabel" htmlFor="password">Password</label>
              <input id="password" type="password" className="fieldInput" placeholder="Your password" />
            </div>
            <button type="submit" className="btnPrimary">Sign in</button>
          </form>
          <OauthGroup />
          <Legal />
        </div>
      </main>
    </div>
  );
}
