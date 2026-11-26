// Where each role lands after logging in.
export const homeFor = (role) => (role === "admin" ? "/admin" : "/market");
