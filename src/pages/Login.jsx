import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { ADMIN } from "../config.js";
import { homeFor } from "../lib/routes.js";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState("");

  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = (e) => {
    e.preventDefault();
    const result = login(form);
    if (!result.ok) return setError(result.error);
    // replace: the login page is swapped out of history, not stacked on it.
    navigate(homeFor(result.role), { replace: true });
  };

  return (
    <div className="auth-shell">
      <div className="card auth-card">
        <h1>Paper &amp; Bell</h1>
        <p className="muted">Simulated trading floor. Log in to continue.</p>

        {error ? <div className="form-error">{error}</div> : null}

        <form onSubmit={submit}>
          <label className="field">
            <span>Username</span>
            <input
              name="username"
              value={form.username}
              onChange={change}
              autoComplete="username"
              autoFocus
            />
          </label>
          <label className="field">
            <span>Password</span>
            <input
              name="password"
              type="password"
              value={form.password}
              onChange={change}
              autoComplete="current-password"
            />
          </label>
          <button className="btn btn-primary btn-block" type="submit">
            Log in
          </button>
        </form>

        <p className="auth-switch">
          New here? <Link to="/signup">Create an account</Link>
        </p>
        <p className="auth-hint">
          Admin demo login — username <b>{ADMIN.username}</b>, password{" "}
          <b>{ADMIN.password}</b>
        </p>
      </div>
    </div>
  );
}
