import React, { useState, useEffect } from "react";
import { supabase } from "./supabaseClient";
import "./App.css"; // same styling

export default function ForgotPasswordReq() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState({ msg: "", ok: false });

  const [sending, setSending] = useState(false); // API call in flight
  const [cooldown, setCooldown] = useState(0); // seconds left

  // --- start / stop the countdown -----------------------------------------
  useEffect(() => {
    if (cooldown === 0) return; // no timer needed
    const id = setInterval(() => {
      setCooldown((sec) => (sec <= 1 ? 0 : sec - 1));
    }, 1000);
    return () => clearInterval(id); // clean up on unmount
  }, [cooldown]);
  // ------------------------------------------------------------------------

  const handleSend = async (e) => {
    e.preventDefault();
    setSending(true);
    setStatus({ msg: "", ok: false });

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: "https://forgot-password-one.vercel.app/",
    });

    if (error) {
      setStatus({ msg: error.message, ok: false });
    } else {
      setStatus({ msg: "Check your inbox for the reset link!", ok: true });
      setCooldown(60); // start 60-sec lockout
    }
    setSending(false);
  };

  const isDisabled = sending || cooldown > 0;

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

        <button type="submit" disabled={isDisabled}>
          {sending
            ? "Sending…"
            : cooldown > 0
            ? `Wait ${cooldown}s`
            : "Send reset link"}
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
