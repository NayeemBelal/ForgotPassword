// src/App.js
import React, { useState, useEffect } from "react";
import { supabase } from "./supabaseClient";
import "./App.css";

export default function App() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // null = still checking link, false = bad link, true = ok
  const [linkValid, setLinkValid] = (useState < null) | (boolean > null);

  useEffect(() => {
    // 1) listen for the PASSWORD_RECOVERY event
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY" && session) {
        setLinkValid(true);
      }
    });

    // 2) trigger Supabase to parse the URL and emit that event
    supabase.auth.getSessionFromUrl({ storeSession: true }).catch((err) => {
      console.error("getSessionFromUrl error:", err);
      setLinkValid(false);
      setMessage("Invalid or expired reset link.");
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // show spinner/message while we’re validating the link
  if (linkValid === null) {
    return (
      <div className="password-reset-container">Verifying reset link…</div>
    );
  }

  // if link is bad, bail early
  if (!linkValid) {
    return (
      <div className="password-reset-container">
        <h1>Reset Your Password</h1>
        <div className="message error">Invalid or expired reset link.</div>
      </div>
    );
  }

  // otherwise the link is good, show the form:
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
