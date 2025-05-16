import React, { useState, useEffect } from "react";
import { supabase } from "./supabaseClient";
import "./App.css";

function App() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);

  // Check for authentication on component mount
  useEffect(() => {
    const checkSession = async () => {
      // Get the current session
      const { data } = await supabase.auth.getSession();

      if (data.session) {
        setIsAuthenticated(true);
      } else {
        // Check if there's a code in the URL that needs to be exchanged
        const params = new URLSearchParams(window.location.search);
        const code = params.get("code");

        if (code) {
          try {
            // Let Supabase handle the code exchange through the configured client
            const { error } = await supabase.auth.exchangeCodeForSession(code);

            if (error) {
              console.error("Code exchange error:", error);
              setMessage(
                "Invalid or expired reset link. Please request a new password reset email."
              );
            } else {
              setIsAuthenticated(true);
              setMessage("You can now reset your password.");

              // Optional: Clean up the URL by removing the code parameter
              window.history.replaceState(
                {},
                document.title,
                window.location.pathname
              );
            }
          } catch (err) {
            console.error("Unexpected exchange error:", err);
            setMessage("An error occurred while validating your reset link.");
          }
        } else {
          setMessage("Please use the password reset link from your email.");
        }
      }

      setAuthChecked(true);
    };

    checkSession();
  }, []);

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setMessage("");
    setLoading(true);

    // Validate passwords
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
      // Update the user's password
      const { error } = await supabase.auth.updateUser({ password });

      if (error) throw error;

      setMessage(
        "Password updated successfully! You can now log in with your new password."
      );
      setPassword("");
      setConfirmPassword("");

      // Optional: Sign the user out after successful password reset
      // await supabase.auth.signOut();
      // setIsAuthenticated(false);
    } catch (error) {
      console.error("Update error:", error);
      setMessage(
        error.message || "An error occurred while updating your password"
      );
    } finally {
      setLoading(false);
    }
  };

  // Show loading state while checking authentication
  if (!authChecked) {
    return (
      <div className="password-reset-container">
        <h1>Reset Your Password</h1>
        <div className="loading">Verifying your request...</div>
      </div>
    );
  }

  return (
    <div className="password-reset-container">
      <h1>Reset Your Password</h1>

      {!isAuthenticated ? (
        <div className="message error">{message}</div>
      ) : (
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
      )}
    </div>
  );
}

export default App;
