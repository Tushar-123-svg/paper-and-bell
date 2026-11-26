import { useAuth } from "../../context/AuthContext.jsx";
import { KEYS, local } from "../../lib/storage.js";
import { usePrices } from "../../lib/stocks.js";
import { returnPct, totalValue } from "../../lib/trading.js";
import { money, pct } from "../../lib/format.js";

export default function Leaderboard() {
  const { user } = useAuth();
  const prices = usePrices();

  const ranked = local
    .get(KEYS.users, [])
    .map((u) => ({
      id: u.id,
      username: u.username,
      value: totalValue(u, prices),
      ret: returnPct(u, prices),
    }))
    .sort((a, b) => b.ret - a.ret);

  return (
    <>
      <h2 className="page-title">Leaderboard</h2>
      <div className="card">
        <p className="muted">Every registered trader, ranked by live return.</p>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>#</th><th>Trader</th>
                <th className="num">Portfolio value</th><th className="num">Return</th>
              </tr>
            </thead>
            <tbody>
              {ranked.map((r, i) => (
                <tr key={r.id} className={r.id === user.id ? "me" : ""}>
                  <td>{i + 1}</td>
                  <td><b>{r.username}</b>{r.id === user.id ? " (you)" : ""}</td>
                  <td className="num">{money(r.value)}</td>
                  <td className={`num ${r.ret >= 0 ? "pos" : "neg"}`}>{pct(r.ret)}</td>
                </tr>
              ))}
              {ranked.length === 0 ? (
                <tr><td colSpan="4" className="empty">No traders yet.</td></tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
