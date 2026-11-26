// localStorage is shared by every tab (users, login log, prices, presence).
// sessionStorage is per-tab, which is what lets two tabs be logged in as
// two different people at once (e.g. a user in one tab, admin in another).

export const KEYS = {
  users: "pb_users",
  logins: "pb_logins",
  presence: "pb_presence",
  prices: "pb_prices",
  session: "pb_session",
};

function make(store) {
  return {
    get(key, fallback) {
      try {
        const raw = store.getItem(key);
        return raw ? JSON.parse(raw) : fallback;
      } catch {
        return fallback;
      }
    },
    set(key, value) {
      try {
        store.setItem(key, JSON.stringify(value));
      } catch {
        /* storage full or blocked - ignore for a demo */
      }
    },
    remove(key) {
      try {
        store.removeItem(key);
      } catch {
        /* ignore */
      }
    },
  };
}

export const local = make(window.localStorage);
export const tab = make(window.sessionStorage);

export const uid = () =>
  Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
