import React from "react";
import { Routes, Route, Link } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import ProfilePage from "./pages/ProfilePage";
import PrivateRoute from "./components/PrivateRoute";
import { useAuth } from "./context/AuthProvider";

function Home() {
  const auth = useAuth();
  return (
    <div style={{ padding: 20 }}>
      <h1>Welcome</h1>
      {auth.user ? (
        <div>
          <p>Logged in as {auth.user.username}</p>
          <Link to="/profile">Profile</Link>
        </div>
      ) : (
        <Link to="/login">Login</Link>
      )}
    </div>
  );
}

export default function App() {
  return (
    <div>
      <nav style={{ padding: 10, borderBottom: "1px solid gray" }}>
        <Link to="/" style={{ marginRight: 10 }}>Home</Link>
        <Link to="/profile">Profile</Link>
      </nav>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/profile" element={
          <PrivateRoute>
            <ProfilePage />
          </PrivateRoute>
        } />
      </Routes>
    </div>
  );
}
