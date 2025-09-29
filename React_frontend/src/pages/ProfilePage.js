import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthProvider";

const API_BASE = "http://localhost:8000";

export default function ProfilePage() {
  const [profile, setProfile] = useState(null);
  const auth = useAuth();

  useEffect(() => {
    (async () => {
      const res = await auth.authFetch(`${API_BASE}/me`);
      if (res.ok) {
        setProfile(await res.json());
      }
    })();
  }, [auth]);

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Profile</h2>

      {profile ? (
        <div style={styles.card}>
          <p>
            <strong>ID:</strong> {profile.id}
          </p>
          <p>
            <strong>Username:</strong> {profile.username}
          </p>

          <button style={styles.button} onClick={auth.logout}>
            Logout
          </button>
        </div>
      ) : (
        <p style={styles.message}>No profile data</p>
      )}
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
  card: {
    padding: "10px",
    fontSize: "1rem",
    lineHeight: "1.6",
  },
  button: {
    marginTop: "15px",
    padding: "10px 20px",
    fontSize: "1rem",
    backgroundColor: "#007bff",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    transition: "background 0.3s",
  },
  message: {
    fontSize: "1rem",
    color: "#777",
  },
};
