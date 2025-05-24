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
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Check URL hash for access token (implicit flow)
        const hashParams = new URLSearchParams(
          window.location.hash.substring(1)
        );
        const accessToken = hashParams.get("access_token");
        const type = hashParams.get("type");

        // Get email from URL query params
        const urlParams = new URLSearchParams(window.location.search);
        const emailParam = urlParams.get("email");

        if (emailParam) {
          setEmail(emailParam);
        }

        // First check if we already have a session
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (session) {
          setIsAuthenticated(true);
          setMessage("You can now reset your password.");
        }
        // If no session but we have an access token in the URL
        else if (accessToken && type === "recovery") {
          try {
            // Set the access token
            const { error } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: null,
            });

            if (error) {
              throw error;
            }

            setIsAuthenticated(true);
            setMessage("You can now reset your password.");

            // Clean up the URL
            window.history.replaceState(
              {},
              document.title,
              window.location.pathname
            );
          } catch (error) {
            console.error("Auth error:", error);
            setMessage("This reset link is invalid. Need a new one?");
          }
        } else {
          setMessage(
            "Please use a valid password reset link or request a new one."
          );
        }
      } catch (error) {
        console.error("Auth check error:", error);
        setMessage("Error checking authentication. Need a new reset link?");
      } finally {
        setAuthChecked(true);
      }
    };

    checkAuth();
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
      setIsSuccess(true);

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

  // Show success message only
  if (isSuccess) {
    return (
      <div className="password-reset-container">
        <h1>Reset Your Password</h1>
        <div className="message success">{message}</div>
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
          {message && !isSuccess && (
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
