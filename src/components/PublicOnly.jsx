import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { homeFor } from "../lib/routes.js";

// Login / signup pages. While someone is logged in they are sent straight
// to their module - so Back can't reach the login page until they log out.
export default function PublicOnly({ children }) {
  const { user } = useAuth();
  if (user) return <Navigate to={homeFor(user.role)} replace />;
  return children;
}
