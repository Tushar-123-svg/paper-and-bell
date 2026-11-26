// App.jsx is the map of the whole project: every page component is
// imported here, grouped by module.
import { Navigate, Route, Routes } from "react-router-dom";
import { ProtectedRoute, PublicOnly } from "./components/index.js";
import { useAuth } from "./context/AuthContext.jsx";
import { homeFor } from "./lib/routes.js";

// Public pages
import Login from "./pages/Login.jsx";
import Signup from "./pages/Signup.jsx";

// User module
import Market from "./pages/user/Market.jsx";
import Portfolio from "./pages/user/Portfolio.jsx";
import Leaderboard from "./pages/user/Leaderboard.jsx";

// Admin module
import AdminDashboard from "./pages/admin/AdminDashboard.jsx";
import LoginActivity from "./pages/admin/LoginActivity.jsx";
import ManageUsers from "./pages/admin/ManageUsers.jsx";

function Home() {
  const { user } = useAuth();
  return <Navigate to={user ? homeFor(user.role) : "/login"} replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />

      <Route path="/login" element={<PublicOnly><Login /></PublicOnly>} />
      <Route path="/signup" element={<PublicOnly><Signup /></PublicOnly>} />

      <Route element={<ProtectedRoute role="user" />}>
        <Route path="/market" element={<Market />} />
        <Route path="/portfolio" element={<Portfolio />} />
        <Route path="/leaderboard" element={<Leaderboard />} />
      </Route>

      <Route element={<ProtectedRoute role="admin" />}>
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/activity" element={<LoginActivity />} />
        <Route path="/admin/users" element={<ManageUsers />} />
      </Route>

      <Route path="*" element={<Home />} />
    </Routes>
  );
}
