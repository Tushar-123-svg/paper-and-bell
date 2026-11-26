// ---------------------------------------------------------------
// Predefined admin account. Change these two values to change the
// admin login. The admin is NOT stored in the users list, so it
// never shows up as a trader.
// ---------------------------------------------------------------
export const ADMIN = {
  username: "admin",
  password: "admin123",
  email: "admin@paperbell.local",
};

export const START_CASH = 100000; // virtual cash for every new trader
export const HEARTBEAT_MS = 10000; // how often an open tab says "I'm still here"
export const ONLINE_WINDOW_MS = 30000; // seen within this window = "online"
