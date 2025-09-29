import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthProvider";

export default function PrivateRoute({ children }) {
  const auth = useAuth();
  if (auth.loading) return <p>Loading...</p>;
  return auth.user ? children : <Navigate to="/login" replace />;
}
