import { ONLINE_WINDOW_MS } from "../config.js";
import { KEYS, local } from "./storage.js";

const DAY = 24 * 60 * 60 * 1000;

export function setPresence(sid, data) {
  const all = local.get(KEYS.presence, {});
  const now = Date.now();
  for (const key of Object.keys(all)) {
    if (now - all[key].lastSeen > DAY) delete all[key]; // drop long-dead tabs
  }
  all[sid] = data;
  local.set(KEYS.presence, all);
}

export function clearPresence(sid) {
  const all = local.get(KEYS.presence, {});
  delete all[sid];
  local.set(KEYS.presence, all);
}

export function clearPresenceForUser(username) {
  const all = local.get(KEYS.presence, {});
  for (const key of Object.keys(all)) {
    if (all[key].username === username) delete all[key];
  }
  local.set(KEYS.presence, all);
}

// Every open tab that has pinged recently.
export function getOnline() {
  const all = local.get(KEYS.presence, {});
  const now = Date.now();
  return Object.entries(all)
    .filter(([, v]) => now - v.lastSeen <= ONLINE_WINDOW_MS)
    .map(([sid, v]) => ({ sid, ...v }))
    .sort((a, b) => b.since - a.since);
}

export const isOnline = (username) =>
  getOnline().some((s) => s.username === username);
