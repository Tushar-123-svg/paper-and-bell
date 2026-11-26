import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { START_CASH } from "../config.js";
import { money } from "../lib/format.js";
import { homeFor } from "../lib/routes.js";

export default function Signup() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const [error, setError] = useState("");

  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = (e) => {
    e.preventDefault();
    const result = signup(form);
    if (!result.ok) return setError(result.error);
    navigate(homeFor(result.role), { replace: true });
  };

  return (
    <div className="auth-shell">
      <div className="card auth-card">
        <h1>Paper &amp; Bell</h1>
        <p className="muted">
          Create your trading account — {money(START_CASH)} in virtual cash to start.
        </p>

        {error ? <div className="form-error">{error}</div> : null}

        <form onSubmit={submit}>
          <label className="field">
            <span>Username</span>
            <input name="username" value={form.username} onChange={change} autoComplete="username" autoFocus />
          </label>
          <label className="field">
            <span>Email</span>
            <input name="email" type="email" value={form.email} onChange={change} autoComplete="email" />
          </label>
          <label className="field">
            <span>Password</span>
            <input name="password" type="password" value={form.password} onChange={change} autoComplete="new-password" />
          </label>
          <button className="btn btn-primary btn-block" type="submit">
            Create account
          </button>
        </form>

        <p className="auth-switch">
          Already have an account? <Link to="/login">Log in</Link>
        </p>
      </div>
    </div>
  );
}
