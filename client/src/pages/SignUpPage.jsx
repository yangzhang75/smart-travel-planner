import { useNavigate } from "react-router-dom";
import { BrandPanel, OauthGroup, Legal } from "../components/BrandPanel";

export default function SignUpPage({ slide, setSlide, photo, onNavigate }) {
  const navigate = useNavigate();
  return (
    <div className="page">
      <BrandPanel activeIndex={slide} onDot={setSlide} photo={photo} />
      <main className="formPanel">
        <div className="formInner">
          <header className="formHeader">
            <h1>Create account</h1>
            <p>Already have an account? <a onClick={() => { onNavigate?.(); navigate("/signin"); }}>Sign in</a></p>
          </header>
          <form className="formStack" onSubmit={(e) => { e.preventDefault(); navigate("/home"); }}>
            <div className="fieldRow">
              <div className="field">
                <label className="fieldLabel" htmlFor="firstName">First name</label>
                <input id="firstName" className="fieldInput" placeholder="Yoyo" />
              </div>
              <div className="field">
                <label className="fieldLabel" htmlFor="lastName">Last name</label>
                <input id="lastName" className="fieldInput" placeholder="Lai" />
              </div>
            </div>
            <div className="field">
              <label className="fieldLabel" htmlFor="signupEmail">Email</label>
              <input id="signupEmail" type="email" className="fieldInput" placeholder="you@example.com" />
            </div>
            <div className="field">
              <label className="fieldLabel" htmlFor="signupPassword">Password</label>
              <input id="signupPassword" type="password" className="fieldInput" placeholder="At least 8 characters" />
            </div>
            <button type="submit" className="btnPrimary">Create account</button>
          </form>
          <OauthGroup />
          <Legal />
        </div>
      </main>
    </div>
  );
}
