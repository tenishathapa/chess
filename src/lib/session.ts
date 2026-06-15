import session from "express-session";
import connectSqlite3 from "connect-sqlite3";

const SQLiteStore = connectSqlite3(session);

export function setupSession() {
  return session({
    store: new SQLiteStore({ db: "sessions.db", dir: "prisma" }) as session.Store,
    secret: process.env.SESSION_SECRET ?? "chess-dev-secret",
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 24 * 60 * 60 * 1000 },
  });
}
