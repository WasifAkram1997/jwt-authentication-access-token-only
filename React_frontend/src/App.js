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
    <div style={styles.container}>
      <h1 style={styles.title}>Welcome</h1>

      {auth.user ? (
        <div style={styles.card}>
          <p style={styles.text}>
            <strong>Logged in as:</strong> {auth.user.username}
          </p>
          <Link to="/profile" style={styles.button}>
            Go to Profile
          </Link>
        </div>
      ) : (
        <div style={styles.card}>
          <p style={styles.text}>You are not logged in.</p>
          <Link to="/login" style={styles.button}>
            Login
          </Link>
        </div>
      )}
    </div>
  );
}

export default function App() {
  return (
    <div>
      {/* Beautiful Navbar */}
      <nav style={styles.navbar}>
        <div style={styles.brand}>MyApp</div>

        <div>
          <Link to="/" style={styles.navLink}>
            Home
          </Link>
          <Link to="/profile" style={styles.navLink}>
            Profile
          </Link>
        </div>
      </nav>

      {/* Routes */}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route
          path="/profile"
          element={
            <PrivateRoute>
              <ProfilePage />
            </PrivateRoute>
          }
        />
      </Routes>
    </div>
  );
}

const styles = {
  // Navbar
  navbar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "12px 20px",
    backgroundColor: "#007bff",
    borderBottom: "2px solid #0056b3",
  },
  brand: {
    fontWeight: "bold",
    fontSize: "1.2rem",
    color: "white",
  },
  navLink: {
    marginRight: 15,
    color: "white",
    textDecoration: "none",
    fontWeight: "500",
  },

  // Home Page
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
    fontSize: "2rem",
    color: "#333",
  },
  card: {
    padding: "10px",
    fontSize: "1rem",
    lineHeight: "1.6",
  },
  text: {
    marginBottom: "15px",
    fontSize: "1rem",
    color: "#555",
  },
  button: {
    display: "inline-block",
    padding: "10px 20px",
    fontSize: "1rem",
    backgroundColor: "#007bff",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    textDecoration: "none",
    transition: "background 0.3s",
  },
};
