import { useState } from "react";
import usePoll from "../../hooks/usePoll.js";
import { START_CASH } from "../../config.js";
import { KEYS, local } from "../../lib/storage.js";
import { loadPrices } from "../../lib/stocks.js";
import { clearPresenceForUser, getOnline } from "../../lib/presence.js";
import { returnPct, totalValue } from "../../lib/trading.js";
import { dateOnly, dateTime, money, pct } from "../../lib/format.js";
import Badge from "../../components/Badge.jsx";

export default function ManageUsers() {
  usePoll(4000);
  const [, setVersion] = useState(0);
  const refresh = () => setVersion((v) => v + 1);

  const users = local.get(KEYS.users, []);
  const prices = loadPrices();
  const onlineNames = new Set(getOnline().map((s) => s.username));

  const reset = (u) => {
    if (!window.confirm(`Reset ${u.username} back to ${money(START_CASH)} and clear their holdings?`)) return;
    local.set(
      KEYS.users,
      users.map((x) => (x.id === u.id ? { ...x, cash: START_CASH, holdings: {}, orders: [] } : x))
    );
    refresh();
  };

  const remove = (u) => {
    if (!window.confirm(`Delete ${u.username}? Their account and portfolio will be removed.`)) return;
    // Remove the account, its login activity records, and online presence.
    local.set(KEYS.users, users.filter((x) => x.id !== u.id));
    const loginActivity = local.get(KEYS.logins, []);
    local.set(KEYS.logins, loginActivity.filter((entry) => entry.username !== u.username));
    clearPresenceForUser(u.username);
    refresh();
  };

  return (
    <>
      <h2 className="page-title">Traders</h2>
      <div className="card">
        <p className="muted">Account details for every registered trader. Use <b>Delete</b> to permanently remove a trader, their portfolio, login history, and online presence. Passwords are never shown.</p>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Trader</th><th>Email</th><th>Status</th><th>Joined</th>
                <th>Last login</th><th className="num">Logins</th>
                <th className="num">Value</th><th className="num">Return</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => {
                const ret = returnPct(u, prices);
                return (
                  <tr key={u.id}>
                    <td><b>{u.username}</b></td>
                    <td>{u.email}</td>
                    <td>
                      {onlineNames.has(u.username)
                        ? <Badge tone="green">Online</Badge>
                        : <Badge>Offline</Badge>}
                    </td>
                    <td>{dateOnly(u.createdAt)}</td>
                    <td>{dateTime(u.lastLogin)}</td>
                    <td className="num">{u.loginCount || 0}</td>
                    <td className="num">{money(totalValue(u, prices))}</td>
                    <td className={`num ${ret >= 0 ? "pos" : "neg"}`}>{pct(ret)}</td>
                    <td>
                      <div className="trade-row">
                        <button className="btn btn-ghost" onClick={() => reset(u)}>Reset</button>
                        <button className="btn btn-danger-ghost" onClick={() => remove(u)}>Delete</button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {users.length === 0 ? (
                <tr><td colSpan="9" className="empty">No traders have signed up yet.</td></tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
