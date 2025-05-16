import { useState, useEffect } from "react";
import { supabase } from "./supabaseClient";
import "./App.css";

function App() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // ← NEW: exchange the code for a session on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");
    if (code) {
      // supabase-js v2:
      supabase.auth
        .exchangeCodeForSession(code)
        .then(({ data, error }) => {
          if (error) setMessage("Could not validate reset link.");
        })
        .catch(() => {
          setMessage("Unexpected error validating reset link.");
        });
    }
  }, []);

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setMessage("");
    setLoading(true);

    if (password !== confirmPassword) {
      setMessage("Passwords do not match");
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setMessage("Password must be at least 6 characters long");
      setLoading(false);
      return;
    }

    try {
      // now that we have a session, this will work
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;

      setMessage("Password updated successfully!");
      setPassword("");
      setConfirmPassword("");
    } catch (error) {
      setMessage(error.message || "An error occurred while updating password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="password-reset-container">
      <h1>Reset Your Password</h1>
      <form onSubmit={handleResetPassword} className="password-reset-form">
        className="password-reset-form">
        <div className="form-group">
          <label htmlFor="password">New Password</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter new password"
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="confirmPassword">Confirm Password</label>
          <input
            id="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm new password"
            required
          />
        </div>
        <button type="submit" disabled={loading}>
          {loading ? "Updating..." : "Reset Password"}
        </button>
        {message && (
          <div
            className={`message ${
              message.includes("successfully") ? "success" : "error"
            }`}
          >
            {message}
          </div>
        )}
      </form>
    </div>
  );
}

export default App;
