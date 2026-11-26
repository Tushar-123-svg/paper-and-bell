import { useEffect, useRef, useState } from "react";
import { KEYS, local } from "./storage.js";

// Fictional companies, so nothing here is real market data.
export const SEED_STOCKS = [
  { symbol: "NOVA", name: "Nova Dynamics", price: 182.4 },
  { symbol: "ORBT", name: "Orbit Systems", price: 94.15 },
  { symbol: "LUMN", name: "Lumen Energy", price: 47.8 },
  { symbol: "HZON", name: "Horizon Bank", price: 126.3 },
  { symbol: "QNTM", name: "Quantum Foods", price: 61.9 },
  { symbol: "ATLS", name: "Atlas Logistics", price: 73.25 },
  { symbol: "PLSR", name: "Pulsar Media", price: 33.6 },
  { symbol: "VRDN", name: "Verdant Health", price: 208.7 },
];

export const openPrice = (symbol) =>
  SEED_STOCKS.find((s) => s.symbol === symbol)?.price ?? 0;

export function loadPrices() {
  const saved = local.get(KEYS.prices, null);
  if (saved) return saved;
  const fresh = {};
  SEED_STOCKS.forEach((s) => (fresh[s.symbol] = s.price));
  local.set(KEYS.prices, fresh);
  return fresh;
}

function tick(prices) {
  const next = {};
  for (const symbol of Object.keys(prices)) {
    const move = (Math.random() - 0.5) * 0.02; // +/- 1% random walk
    next[symbol] = Math.max(1, +(prices[symbol] * (1 + move)).toFixed(2));
  }
  local.set(KEYS.prices, next);
  return next;
}

// Live-ticking prices, shared through localStorage.
export function usePrices() {
  const [prices, setPrices] = useState(loadPrices);
  const ref = useRef(prices);

  useEffect(() => {
    const id = setInterval(() => {
      ref.current = tick(ref.current);
      setPrices(ref.current);
    }, 3000);
    return () => clearInterval(id);
  }, []);

  return prices;
}
