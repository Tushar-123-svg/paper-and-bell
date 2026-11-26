import { useState } from "react";
import usePoll from "../../hooks/usePoll.js";
import { KEYS, local } from "../../lib/storage.js";
import { getOnline } from "../../lib/presence.js";
import { dateTime, timeAgo } from "../../lib/format.js";
import Badge from "../../components/Badge.jsx";

const EVENT = {
  success: { label: "Logged in", tone: "green" },
  failed: { label: "Failed attempt", tone: "red" },
  logout: { label: "Logged out", tone: "neutral" },
};

// Stop spreadsheet apps from running a cell that starts with = + - @
const safe = (v) => {
  const s = String(v ?? "");
  return /^[=+\-@]/.test(s) ? `'${s}` : s;
};

function toCsv(rows) {
  const head = ["Time", "Username", "Email", "Role", "Event", "Device", "Note"];
  const esc = (v) => `"${safe(v).replace(/"/g, '""')}"`;
  const lines = rows.map((r) =>
    [dateTime(r.time), r.username, r.email, r.role, EVENT[r.status]?.label, r.device, r.reason || ""]
      .map(esc)
      .join(",")
  );
  return [head.map(esc).join(","), ...lines].join("\n");
}

export default function LoginActivity() {
  usePoll(4000);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [role, setRole] = useState("all");
  const [, setVersion] = useState(0);

  const all = local.get(KEYS.logins, []);
  const online = getOnline();

  const q = search.trim().toLowerCase();
  const rows = all.filter(
    (l) =>
      (status === "all" || l.status === status) &&
      (role === "all" || l.role === role) &&
      (!q || (l.username + " " + (l.email || "")).toLowerCase().includes(q))
  );

  const exportCsv = () => {
    const blob = new Blob([toCsv(rows)], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "login-activity.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const clearLog = () => {
    if (!window.confirm("Clear the entire login activity log? This cannot be undone.")) return;
    local.set(KEYS.logins, []);
    setVersion((v) => v + 1);
  };

  return (
    <>
      <h2 className="page-title">Login activity</h2>

      <div className="card">
        <h3>Online now ({online.length})</h3>
        {online.length === 0 ? (
          <p className="muted">Nobody is online right now.</p>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr><th>User</th><th>Email</th><th>Role</th><th>Signed in</th><th>Last seen</th></tr>
              </thead>
              <tbody>
                {online.map((s) => (
                  <tr key={s.sid}>
                    <td><span className="dot" /> <b>{s.username}</b></td>
                    <td>{s.email || "—"}</td>
                    <td><Badge tone={s.role === "admin" ? "blue" : "neutral"}>{s.role}</Badge></td>
                    <td>{dateTime(s.since)}</td>
                    <td>{timeAgo(s.lastSeen)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="card">
        <div className="card-head wrap">
          <h3>All events ({rows.length})</h3>
          <div className="filters">
            <input
              className="search"
              placeholder="Search username or email"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <select value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="all">All events</option>
              <option value="success">Logged in</option>
              <option value="failed">Failed attempts</option>
              <option value="logout">Logged out</option>
            </select>
            <select value={role} onChange={(e) => setRole(e.target.value)}>
              <option value="all">All roles</option>
              <option value="user">Traders</option>
              <option value="admin">Admin</option>
            </select>
            <button className="btn btn-ghost" onClick={exportCsv} disabled={rows.length === 0}>
              Export CSV
            </button>
            <button className="btn btn-danger-ghost" onClick={clearLog} disabled={all.length === 0}>
              Clear log
            </button>
          </div>
        </div>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Time</th><th>User</th><th>Email</th><th>Role</th>
                <th>Event</th><th>Device</th><th>Note</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((l) => (
                <tr key={l.id}>
                  <td>{dateTime(l.time)}</td>
                  <td><b>{l.username}</b></td>
                  <td>{l.email || "—"}</td>
                  <td><Badge tone={l.role === "admin" ? "blue" : "neutral"}>{l.role}</Badge></td>
                  <td><Badge tone={EVENT[l.status]?.tone}>{EVENT[l.status]?.label}</Badge></td>
                  <td>{l.device}</td>
                  <td>{l.reason || ""}</td>
                </tr>
              ))}
              {rows.length === 0 ? (
                <tr><td colSpan="7" className="empty">No events match.</td></tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
