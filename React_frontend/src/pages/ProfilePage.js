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
    <div style={{ padding: 20 }}>
      <h2>Profile</h2>
      {profile ? (
        <div>
          <p>ID: {profile.id}</p>
          <p>Username: {profile.username}</p>
          <button onClick={auth.logout}>Logout</button>
        </div>
      ) : (
        <p>No profile data</p>
      )}
    </div>
  );
}
