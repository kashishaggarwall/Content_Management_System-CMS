import { useState } from "react";
import { login } from "../services/api";
import "./Login.css";

function Login({ onLoginSuccess }) {
  const [email, setEmail] = useState("admin@cms.com");
  const [password, setPassword] = useState("CMS_DEMO_PASSWORD");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError("Please enter both email and password.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      const response = await login(email.trim(), password);
      const user = response.data;
      localStorage.setItem("cms_user", JSON.stringify(user));
      onLoginSuccess(user);
    } catch (err) {
      console.error("Login failed:", err);
      setError(err.friendlyMessage || "Invalid email or password.");
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = (demoEmail) => {
    setEmail(demoEmail);
    setPassword("CMS_DEMO_PASSWORD");
    setError("");
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <div className="login-brand-icon">C</div>
          <h1>ContentHub CMS</h1>
          <p className="login-subtitle">
            Enterprise Digital Asset & Content Management System
          </p>
        </div>

        {error && <div className="login-error-alert">{error}</div>}

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="login-email">Email Address</label>
            <input
              id="login-email"
              type="email"
              placeholder="e.g. admin@cms.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoFocus
            />
          </div>

          <div className="form-group">
            <label htmlFor="login-password">Password</label>
            <input
              id="login-password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="login-submit-btn"
            disabled={loading}
          >
            {loading ? "Authenticating..." : "Sign In to Workspace →"}
          </button>
        </form>

        <div className="demo-credentials-section">
          <p className="demo-title">⚡ Quick Demo Logins (Click to autofill):</p>
          <div className="demo-pills">
            <button
              type="button"
              className="demo-pill admin"
              onClick={() => handleQuickLogin("admin@cms.com")}
            >
              <strong>Admin</strong> (Aarav)
            </button>
            <button
              type="button"
              className="demo-pill producer"
              onClick={() => handleQuickLogin("priya@cms.com")}
            >
              <strong>Producer</strong> (Priya)
            </button>
            <button
              type="button"
              className="demo-pill manager"
              onClick={() => handleQuickLogin("rohan@cms.com")}
            >
              <strong>Manager</strong> (Rohan)
            </button>
            <button
              type="button"
              className="demo-pill inactive"
              onClick={() => handleQuickLogin("aditya@cms.com")}
              title="Test inactive user blocking"
            >
              <strong>Inactive User</strong> (Aditya)
            </button>
          </div>
          <span className="demo-note">Default demo password: <code>CMS_DEMO_PASSWORD</code></span>
        </div>

        <div className="login-footer">
          <span>MCA 2nd Year Project · ABES Engineering College</span>
        </div>
      </div>
    </div>
  );
}

export default Login;
