import { useAuth } from "../../context/AuthContext.jsx";
import { START_CASH } from "../../config.js";
import { SEED_STOCKS, usePrices } from "../../lib/stocks.js";
import { holdingsValue, returnPct, totalValue } from "../../lib/trading.js";
import { dateOnly, dateTime, money, pct } from "../../lib/format.js";
import StatCard from "../../components/StatCard.jsx";
import Badge from "../../components/Badge.jsx";

export default function Portfolio() {
  const { user } = useAuth();
  const prices = usePrices();

  const holdings = Object.entries(user.holdings || {}).map(([symbol, h]) => {
    const price = prices[symbol] || 0;
    return {
      symbol,
      name: SEED_STOCKS.find((s) => s.symbol === symbol)?.name || symbol,
      qty: h.qty,
      avg: h.avg,
      price,
      value: h.qty * price,
      pl: (price - h.avg) * h.qty,
    };
  });

  const ret = returnPct(user, prices);

  return (
    <>
      <h2 className="page-title">Portfolio</h2>

      <div className="grid stats">
        <StatCard label="Cash" value={money(user.cash)} />
        <StatCard label="Holdings value" value={money(holdingsValue(user, prices))} />
        <StatCard label="Total value" value={money(totalValue(user, prices))} />
        <StatCard
          label="Total return"
          value={pct(ret)}
          tone={ret >= 0 ? "pos" : "neg"}
          hint={`Started with ${money(START_CASH)}`}
        />
      </div>

      <div className="card">
        <h3>Your account</h3>
        <dl className="details">
          <div><dt>Username</dt><dd>{user.username}</dd></div>
          <div><dt>Email</dt><dd>{user.email}</dd></div>
          <div><dt>Member since</dt><dd>{dateOnly(user.createdAt)}</dd></div>
          <div><dt>Last login</dt><dd>{dateTime(user.lastLogin)}</dd></div>
          <div><dt>Total logins</dt><dd>{user.loginCount || 0}</dd></div>
        </dl>
      </div>

      <div className="card">
        <h3>Holdings</h3>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Symbol</th><th>Name</th>
                <th className="num">Qty</th><th className="num">Avg cost</th>
                <th className="num">Price</th><th className="num">Value</th>
                <th className="num">P/L</th>
              </tr>
            </thead>
            <tbody>
              {holdings.map((h) => (
                <tr key={h.symbol}>
                  <td><b>{h.symbol}</b></td>
                  <td>{h.name}</td>
                  <td className="num">{h.qty}</td>
                  <td className="num">{money(h.avg)}</td>
                  <td className="num">{money(h.price)}</td>
                  <td className="num">{money(h.value)}</td>
                  <td className={`num ${h.pl >= 0 ? "pos" : "neg"}`}>{money(h.pl)}</td>
                </tr>
              ))}
              {holdings.length === 0 ? (
                <tr><td colSpan="7" className="empty">No holdings yet. Head to the Market to place your first order.</td></tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card">
        <h3>Recent orders</h3>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Time</th><th>Side</th><th>Symbol</th>
                <th className="num">Qty</th><th className="num">Price</th>
              </tr>
            </thead>
            <tbody>
              {(user.orders || []).slice(0, 10).map((o) => (
                <tr key={o.id}>
                  <td>{dateTime(o.time)}</td>
                  <td><Badge tone={o.side === "buy" ? "green" : "red"}>{o.side.toUpperCase()}</Badge></td>
                  <td><b>{o.symbol}</b></td>
                  <td className="num">{o.qty}</td>
                  <td className="num">{money(o.price)}</td>
                </tr>
              ))}
              {(user.orders || []).length === 0 ? (
                <tr><td colSpan="5" className="empty">No orders yet.</td></tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
