import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthProvider";
import "./LoginPage.css";   // ✅ Import CSS file

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);

  const navigate = useNavigate();
  const auth = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await auth.login({ username, password });
      navigate("/profile");
    } catch {
      setError("Invalid credentials");
    }
  };

  return (
    <div className="login-container">
      <h2 className="login-title">Login</h2>

      <form className="login-form" onSubmit={handleSubmit}>
        <input
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Username"
          className="login-input"
        />

        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          className="login-input"
        />

        <button type="submit" className="login-button">
          Login
        </button>
      </form>

      {error && <p className="login-error">{error}</p>}

      <p className="signup-text">
        Don’t have an account? <Link to="/signup">Signup</Link>
      </p>
    </div>
  );
}
