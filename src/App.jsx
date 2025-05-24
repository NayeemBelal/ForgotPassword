import React, { useState, useEffect } from "react";
import { supabase, handlePasswordReset } from "./supabaseClient";
import "./App.css";

function App() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const [email, setEmail] = useState("");

  useEffect(() => {
    const checkSession = async () => {
      try {
        // Get the current session
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();

        if (sessionError) throw sessionError;

        // Check URL parameters
        const params = new URLSearchParams(window.location.search);
        const code = params.get("code");
        const emailParam = params.get("email"); // Get email from URL if present

        if (emailParam) {
          setEmail(emailParam);
        }

        if (session) {
          setIsAuthenticated(true);
        } else if (code) {
          try {
            // Try to exchange the code for a session
            const { error } = await supabase.auth.exchangeCodeForSession(code);

            if (error) {
              console.error("Code exchange error:", error);
              // If code exchange fails, we'll need to request a new reset link
              setMessage(
                "This reset link has expired or is invalid. Need a new one?"
              );
            } else {
              setIsAuthenticated(true);
              setMessage("You can now reset your password.");

              // Clean up the URL
              window.history.replaceState(
                {},
                document.title,
                window.location.pathname
              );
            }
          } catch (err) {
            console.error("Exchange error:", err);
            setMessage("An error occurred. Need a new reset link?");
          }
        } else {
          setMessage(
            "Please use a valid password reset link or request a new one."
          );
        }
      } catch (error) {
        console.error("Session check error:", error);
        setMessage("Error checking session. Need a new reset link?");
      } finally {
        setAuthChecked(true);
      }
    };

    checkSession();
  }, []);

  const requestNewResetLink = async () => {
    if (!email) {
      setMessage("Please enter your email address.");
      return;
    }

    setLoading(true);
    try {
      const { success, error } = await handlePasswordReset(email);
      if (success) {
        setMessage("Check your email for a new password reset link!");
      } else {
        setMessage(
          error.message || "Failed to send reset link. Please try again."
        );
      }
    } catch (error) {
      setMessage("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

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

      setMessage(
        "Password updated successfully! You can now log in with your new password."
      );
      setPassword("");
      setConfirmPassword("");

      // Sign out after successful password reset
      await supabase.auth.signOut();
      setIsAuthenticated(false);
    } catch (error) {
      console.error("Update error:", error);
      setMessage(
        error.message || "Failed to update password. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

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
        <div className="request-reset-form">
          <div className="message error">{message}</div>
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email address"
              required
            />
          </div>
          <button
            onClick={requestNewResetLink}
            disabled={loading || !email}
            className="request-link-button"
          >
            {loading ? "Sending..." : "Get New Reset Link"}
          </button>
        </div>
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
