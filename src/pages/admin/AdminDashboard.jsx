import { Link } from "react-router-dom";
import usePoll from "../../hooks/usePoll.js";
import { KEYS, local } from "../../lib/storage.js";
import { loadPrices } from "../../lib/stocks.js";
import { getOnline } from "../../lib/presence.js";
import { returnPct } from "../../lib/trading.js";
import { dateTime, pct, timeAgo } from "../../lib/format.js";
import StatCard from "../../components/StatCard.jsx";
import Badge from "../../components/Badge.jsx";

const DAY = 24 * 60 * 60 * 1000;

export default function AdminDashboard() {
  usePoll(4000);

  const users = local.get(KEYS.users, []);
  const logins = local.get(KEYS.logins, []);
  const prices = loadPrices();
  const online = getOnline();

  const since = Date.now() - DAY;
  const loginsToday = logins.filter((l) => l.status === "success" && l.time >= since).length;
  const failedToday = logins.filter((l) => l.status === "failed" && l.time >= since).length;

  const top = users
    .map((u) => ({ username: u.username, ret: returnPct(u, prices) }))
    .sort((a, b) => b.ret - a.ret)[0];

  const recent = logins.filter((l) => l.status === "success").slice(0, 6);

  return (
    <>
      <h2 className="page-title">Admin overview</h2>

      <div className="grid stats">
        <StatCard label="Registered traders" value={users.length} />
        <StatCard label="Online now" value={online.length} hint="Open tabs seen in the last 30s" />
        <StatCard label="Logins (24h)" value={loginsToday} />
        <StatCard
          label="Failed attempts (24h)"
          value={failedToday}
          tone={failedToday > 0 ? "neg" : ""}
        />
        <StatCard
          label="Top performer"
          value={top ? top.username : "—"}
          hint={top ? pct(top.ret) : "No traders yet"}
        />
      </div>

      <div className="card">
        <div className="card-head">
          <h3>Recent sign-ins</h3>
          <Link to="/admin/activity" className="link">Full activity log →</Link>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>User</th><th>Email</th><th>Role</th><th>When</th><th>Device</th>
              </tr>
            </thead>
            <tbody>
              {recent.map((l) => (
                <tr key={l.id}>
                  <td><b>{l.username}</b></td>
                  <td>{l.email || "—"}</td>
                  <td><Badge tone={l.role === "admin" ? "blue" : "neutral"}>{l.role}</Badge></td>
                  <td title={dateTime(l.time)}>{timeAgo(l.time)}</td>
                  <td>{l.device}</td>
                </tr>
              ))}
              {recent.length === 0 ? (
                <tr><td colSpan="5" className="empty">No sign-ins recorded yet.</td></tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
