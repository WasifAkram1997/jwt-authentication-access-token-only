import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthProvider";

export default  function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const auth = useAuth();

//   const res = await fetch("http://localhost:8000/login", {
//   method: "POST",
//   headers: {
//     "Content-Type": "application/json",
//   },
//   credentials: "include",   // ✅ Important for cookies
//   body: JSON.stringify({ username, password }),
// });


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
    <div style={{ padding: 20 }}>
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <input value={username} onChange={e => setUsername(e.target.value)} placeholder="Username" />
        <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" />
        <button type="submit">Login</button>
      </form>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <Link to="/signup">Signup</Link>
    </div>
  );
}
