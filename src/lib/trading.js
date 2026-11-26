import { START_CASH } from "../config.js";
import { KEYS, local, uid } from "./storage.js";

export const holdingsValue = (user, prices) =>
  Object.entries(user.holdings || {}).reduce(
    (sum, [symbol, h]) => sum + h.qty * (prices[symbol] || 0),
    0
  );

export const totalValue = (user, prices) =>
  user.cash + holdingsValue(user, prices);

export const returnPct = (user, prices) =>
  ((totalValue(user, prices) - START_CASH) / START_CASH) * 100;

export function placeOrder(userId, side, symbol, rawQty, price) {
  const qty = Math.floor(Number(rawQty));
  if (!qty || qty < 1) return { ok: false, error: "Enter a quantity of at least 1." };

  const users = local.get(KEYS.users, []);
  const i = users.findIndex((u) => u.id === userId);
  if (i === -1) return { ok: false, error: "Account not found." };

  const u = {
    ...users[i],
    holdings: { ...users[i].holdings },
    orders: [...(users[i].orders || [])],
  };
  const amount = +(qty * price).toFixed(2);

  if (side === "buy") {
    if (amount > u.cash) return { ok: false, error: "Not enough cash for this order." };
    const h = u.holdings[symbol] || { qty: 0, avg: 0 };
    const newQty = h.qty + qty;
    u.holdings[symbol] = {
      qty: newQty,
      avg: +((h.qty * h.avg + amount) / newQty).toFixed(4),
    };
    u.cash = +(u.cash - amount).toFixed(2);
  } else {
    const h = u.holdings[symbol];
    if (!h || h.qty < qty) return { ok: false, error: "You don't own that many shares." };
    const left = h.qty - qty;
    if (left === 0) delete u.holdings[symbol];
    else u.holdings[symbol] = { ...h, qty: left };
    u.cash = +(u.cash + amount).toFixed(2);
  }

  u.orders.unshift({ id: uid(), side, symbol, qty, price, time: Date.now() });
  u.orders = u.orders.slice(0, 50);

  users[i] = u;
  local.set(KEYS.users, users);
  return { ok: true, user: u };
}
