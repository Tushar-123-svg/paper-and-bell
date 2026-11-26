import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { homeFor } from "../lib/routes.js";
import Layout from "./Layout.jsx";

// Guards a whole module. Not logged in -> login page. Wrong role -> that
// role's own home. `replace` keeps these redirects out of the history, so
// the Back button can never bounce someone into a page they can't use.
export default function ProtectedRoute({ role }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== role) return <Navigate to={homeFor(user.role)} replace />;
  return <Layout />;
}
