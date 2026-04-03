import React, { useState } from "react";

export default function ForgotPasswordForm({ onBack }) {
  const [email, setEmail] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    if (email) {
      alert("Password reset link sent! (demo)");
    } else {
      alert("Please enter your email");
    }
  };

  return (
    <form className="auth-form" onSubmit={handleSubmit}>
      <h2>Forgot Password</h2>

      <input
        type="email"
        placeholder="Enter your email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />

      <button type="submit">Send Reset Link</button>

      <p className="back-link" onClick={onBack}>
        Back to Login
      </p>
    </form>
  );
}