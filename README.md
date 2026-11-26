# Paper & Bell — Virtual Stock Trading App (React)

A React + Vite version of the Paper & Bell trading simulator, with a **User module**
and an **Admin module** that shows who has logged in and their details.

## Run it

You need [Node.js](https://nodejs.org) 18 or newer.

```bash
cd paper-and-bell
npm install
npm run dev
```

Vite prints a local address (usually http://localhost:5173) and opens it in your browser.

Other commands:

```bash
npm run build     # production build into dist/
npm run preview   # serve the production build locally
```

In VS Code: **File → Open Folder → paper-and-bell**, then open the integrated terminal
(Ctrl + `) and run the two commands above.

## Logins

| Role  | Username | Password   |
|-------|----------|------------|
| Admin | `admin`  | `admin123` |
| User  | sign up from the Sign up page (starts with $100,000 virtual cash) |

To change the admin login, edit `src/config.js`.

## What each module does

**User module** — Market (live-ticking prices, buy/sell), Portfolio (cash, holdings, P/L,
orders, account details), Leaderboard (all traders ranked by return).

**Admin module**
- **Overview** — trader count, who is online now, logins and failed attempts in the last 24h, top performer, recent sign-ins.
- **Login Activity** — who is online right now, plus a full log of every login, failed attempt
  and logout with username, email, role, time, and device. Search, filter, export to CSV, clear.
- **Traders** — every trader's email, join date, last login, login count, value, return, and
  online status, with Reset and Delete actions. Passwords are never displayed.

## Changes from the original HTML version

1. Rebuilt in React with `react-router-dom` (one component per page, shared components).
2. **Login Activity log** with live "online now" status (new).
3. Back-button fix: login and signup are replaced in browser history, and while you are
   logged in `/login` redirects to your module. After you log out, protected pages send you
   back to the login page.
4. Login attempts are recorded, including failed ones, and signup validates username, email
   and password.

## Project map

```
paper-and-bell/
├── index.html
├── package.json
├── vite.config.js
└── src/
    ├── main.jsx                  # entry: Router + AuthProvider
    ├── App.jsx                   # all routes; imports every page
    ├── config.js                 # admin credentials, starting cash
    ├── index.css                 # all styling
    ├── context/
    │   └── AuthContext.jsx       # login, signup, logout, session, login log, presence
    ├── components/               # shared components (index.js lists them all)
    │   ├── Navbar.jsx  Layout.jsx  ProtectedRoute.jsx  PublicOnly.jsx
    │   └── StatCard.jsx  Badge.jsx
    ├── pages/
    │   ├── Login.jsx  Signup.jsx
    │   ├── user/   Market.jsx  Portfolio.jsx  Leaderboard.jsx
    │   └── admin/  AdminDashboard.jsx  LoginActivity.jsx  ManageUsers.jsx
    ├── hooks/usePoll.js          # keeps admin pages live
    └── lib/                      # storage, prices, trading maths, formatting, presence
```

## Trying the admin view

1. Open the app and sign up as a trader (e.g. `tushar`).
2. Open a **second browser tab** and log in as `admin` / `admin123`.
   Sessions are per tab, so both stay logged in.
3. In the admin tab, open **Login Activity**: the trader appears under "Online now" and in
   the event log. Log out in the first tab and the "Logged out" event appears.

## Limitations (demo by design)

- Data lives in the browser's `localStorage`, so it is per browser and clears if site data is cleared. There is no server.
- Passwords are stored as plain text in `localStorage`. Fine for a college demo, never for a real system.
- Prices are a random walk, not real market data.
