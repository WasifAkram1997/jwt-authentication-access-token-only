import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthProvider";

export default function SignupPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);

  const navigate = useNavigate();
  const auth = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await auth.signup({ username, password });
      navigate("/login");
    } catch {
      setError("Signup failed");
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Signup</h2>

      <form style={styles.form} onSubmit={handleSubmit}>
        <input
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Username"
          style={styles.input}
        />

        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          style={styles.input}
        />

        <button type="submit" style={styles.button}>
          Create account
        </button>
      </form>

      {error && <p style={styles.error}>{error}</p>}

      <p style={styles.linkText}>
        Already have an account? <Link to="/login">Back to Login</Link>
      </p>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: "400px",
    margin: "60px auto",
    padding: "30px",
    border: "1px solid #ddd",
    borderRadius: "10px",
    background: "#fafafa",
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
    textAlign: "center",
    fontFamily: "Arial, sans-serif",
  },
  title: {
    marginBottom: "20px",
    fontSize: "1.8rem",
    color: "#333",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "15px",
  },
  input: {
    padding: "10px",
    fontSize: "1rem",
    border: "1px solid #bbb",
    borderRadius: "6px",
    outline: "none",
    transition: "border 0.3s",
  },
  button: {
    padding: "10px",
    fontSize: "1rem",
    backgroundColor: "#007bff",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    transition: "background 0.3s",
  },
  buttonHover: {
    backgroundColor: "#0056b3",
  },
  error: {
    marginTop: "10px",
    color: "red",
    fontSize: "0.9rem",
  },
  linkText: {
    marginTop: "15px",
    fontSize: "0.9rem",
  },
};
