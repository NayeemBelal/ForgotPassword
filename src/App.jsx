// src/App.js
import React, { useState, useEffect } from "react";
import { supabase } from "./supabaseClient";
import "./App.css";

function App() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // 1) On load, exchange the one-time code for a session
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");
    if (code) {
      supabase.auth
        .exchangeCodeForSession(code) // v2 SDK
        .then(({ data, error }) => {
          if (error) {
            console.error("Code exchange error:", error);
            setMessage("Invalid or expired reset link.");
          }
        })
        .catch((err) => {
          console.error("Unexpected exchange error:", err);
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
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;

      setMessage("Password updated successfully!");
      setPassword("");
      setConfirmPassword("");
    } catch (error) {
      console.error("Update error:", error);
      setMessage(error.message || "An error occurred while updating password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="password-reset-container">
      <h1>Reset Your Password</h1>
      <form onSubmit={handleResetPassword} className="password-reset-form">
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
