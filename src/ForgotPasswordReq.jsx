import React, { useState } from "react";
import { supabase } from "./supabaseClient";
import "./App.css"; // reuse the same styles you already ship

export default function ForgotPasswordReq() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState({ msg: "", ok: false });
  const [sending, setSending] = useState(false);

  const handleSend = async (e) => {
    e.preventDefault();
    setSending(true);
    setStatus({ msg: "", ok: false });

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: "https://forgot-password-one.vercel.app/", // ← your reset page
    });

    if (error) {
      setStatus({ msg: error.message, ok: false });
    } else {
      setStatus({ msg: "Check your inbox for the reset link!", ok: true });
    }
    setSending(false);
  };

  return (
    <div className="password-reset-container">
      <h1>Forgot your password?</h1>

      <form onSubmit={handleSend} className="password-reset-form">
        <div className="form-group">
          <label htmlFor="email">Email address</label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
          />
        </div>

        <button type="submit" disabled={sending}>
          {sending ? "Sending…" : "Send reset link"}
        </button>

        {status.msg && (
          <div className={`message ${status.ok ? "success" : "error"}`}>
            {status.msg}
          </div>
        )}
      </form>
    </div>
  );
}
