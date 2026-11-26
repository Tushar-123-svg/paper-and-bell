import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { ADMIN, HEARTBEAT_MS, START_CASH } from "../config.js";
import { KEYS, local, tab, uid } from "../lib/storage.js";
import { describeDevice } from "../lib/device.js";
import { clearPresence, setPresence } from "../lib/presence.js";

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

const BAD_LOGIN = { ok: false, error: "Incorrect username or password." };

// Every login, failed attempt and logout is written here. The admin's
// "Login Activity" page reads this list.
function logEvent(entry) {
  const list = local.get(KEYS.logins, []);
  list.unshift({ id: uid(), time: Date.now(), device: describeDevice(), ...entry });
  local.set(KEYS.logins, list.slice(0, 500));
}

function findUser(session) {
  if (!session) return null;
  if (session.role === "admin") {
    return { id: "admin", username: ADMIN.username, email: ADMIN.email, role: "admin" };
  }
  return local.get(KEYS.users, []).find((u) => u.id === session.userId) || null;
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(() => tab.get(KEYS.session, null));
  const [version, setVersion] = useState(0);

  const refreshUser = useCallback(() => setVersion((v) => v + 1), []);
  const user = useMemo(() => findUser(session), [session, version]);

  // Another tab changed the data (e.g. admin reset this account).
  useEffect(() => {
    window.addEventListener("storage", refreshUser);
    return () => window.removeEventListener("storage", refreshUser);
  }, [refreshUser]);

  // Account deleted by the admin while logged in -> end the session.
  useEffect(() => {
    if (session && !user) {
      clearPresence(session.sid);
      tab.remove(KEYS.session);
      setSession(null);
    }
  }, [session, user]);

  // Heartbeat: lets the admin see who is online right now.
  useEffect(() => {
    if (!session) return undefined;
    const beat = () => {
      if (!tab.get(KEYS.session, null)) return;
      const u = findUser(session);
      if (!u) return;
      setPresence(session.sid, {
        username: session.username,
        email: u.email,
        role: session.role,
        since: session.at,
        lastSeen: Date.now(),
      });
    };
    beat();
    const id = setInterval(beat, HEARTBEAT_MS);
    return () => clearInterval(id);
  }, [session]);

  const login = useCallback(({ username, password }) => {
    const name = (username || "").trim();
    if (!name || !password) {
      return { ok: false, error: "Enter your username and password." };
    }
    const lower = name.toLowerCase();
    let account = null;

    if (lower === ADMIN.username.toLowerCase()) {
      if (password !== ADMIN.password) {
        logEvent({
          status: "failed", username: ADMIN.username, email: ADMIN.email,
          role: "admin", reason: "Wrong password",
        });
        return BAD_LOGIN;
      }
      account = { id: "admin", username: ADMIN.username, email: ADMIN.email, role: "admin" };
    } else {
      const users = local.get(KEYS.users, []);
      const idx = users.findIndex((u) => {
        const savedUsername = String(u?.username ?? u?.name ?? "").trim().toLowerCase();
        return savedUsername === lower;
      });
      if (idx === -1) {
        logEvent({ status: "failed", username: name, email: "", role: "unknown", reason: "Unknown username" });
        return BAD_LOGIN;
      }
      if (String(users[idx]?.password ?? "") !== String(password)) {
        logEvent({
          status: "failed", username: users[idx].username, email: users[idx].email,
          role: "user", reason: "Wrong password",
        });
        return BAD_LOGIN;
      }
      users[idx] = {
        ...users[idx],
        lastLogin: Date.now(),
        loginCount: (users[idx].loginCount || 0) + 1,
      };
      local.set(KEYS.users, users);
      account = users[idx];
    }

    logEvent({
      status: "success", username: account.username, email: account.email, role: account.role,
    });
    const next = {
      sid: uid(), userId: account.id, username: account.username,
      role: account.role, at: Date.now(),
    };
    tab.set(KEYS.session, next);
    setSession(next);
    return { ok: true, role: account.role };
  }, []);

  const signup = useCallback(
    ({ username, email, password }) => {
      const name = (username || "").trim();
      const mail = (email || "").trim();

      if (!/^[A-Za-z0-9_]{3,20}$/.test(name)) {
        return { ok: false, error: "Username must be 3-20 letters, numbers or underscores." };
      }
      if (name.toLowerCase() === ADMIN.username.toLowerCase()) {
        return { ok: false, error: "That username is reserved." };
      }
      if (!/^\S+@\S+\.\S+$/.test(mail)) {
        return { ok: false, error: "Enter a valid email address." };
      }
      if ((password || "").length < 6) {
        return { ok: false, error: "Password must be at least 6 characters." };
      }

      const users = local.get(KEYS.users, []);
      if (users.some((u) => u.username.toLowerCase() === name.toLowerCase())) {
        return { ok: false, error: "That username is already taken." };
      }

      users.push({
        id: uid(), username: name, email: mail, password, role: "user",
        cash: START_CASH, holdings: {}, orders: [],
        createdAt: Date.now(), lastLogin: null, loginCount: 0,
      });
      local.set(KEYS.users, users);
      return login({ username: name, password });
    },
    [login]
  );

  const logout = useCallback(() => {
    if (!session) return;
    const u = findUser(session);
    logEvent({
      status: "logout", username: session.username,
      email: u?.email || "", role: session.role,
    });
    clearPresence(session.sid);
    tab.remove(KEYS.session);
    setSession(null);
  }, [session]);

  const value = useMemo(
    () => ({ user, login, signup, logout, refreshUser }),
    [user, login, signup, logout, refreshUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
