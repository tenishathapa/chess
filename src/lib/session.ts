import session from "express-session";

export function setupSession() {
  return session({
    secret: process.env.SESSION_SECRET ?? "chess-dev-secret",
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 24 * 60 * 60 * 1000 },
  });
}
