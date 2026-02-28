import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

// Ensure data directory exists
const defaultDbPath = path.join(process.cwd(), 'data', 'database.sqlite');
const dbPath = process.env.DB_PATH || defaultDbPath;
const dbDir = path.dirname(dbPath);

if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

// Initialize database
const db = new Database(dbPath, { verbose: null });
db.pragma('journal_mode = WAL');

// Define schema
db.exec(`
  CREATE TABLE IF NOT EXISTS offenses (
    user_id TEXT PRIMARY KEY,
    count INTEGER NOT NULL DEFAULT 0,
    last_offense_date TEXT
  )
`);

const statements = {
  getOffenses: db.prepare('SELECT count FROM offenses WHERE user_id = ?'),
  incrementOffense: db.prepare(`
    INSERT INTO offenses (user_id, count, last_offense_date) 
    VALUES (?, 1, datetime('now')) 
    ON CONFLICT(user_id) DO UPDATE SET 
      count = count + 1, 
      last_offense_date = datetime('now')
  `),
  resetAll: db.prepare('UPDATE offenses SET count = 0'),
  resetUser: db.prepare('UPDATE offenses SET count = 0 WHERE user_id = ?'),
  getAllOffenses: db.prepare(
    'SELECT user_id, count, last_offense_date FROM offenses ORDER BY count DESC'
  ),
};

export const statements_raw = statements;

export function getOffenseCount(userId) {
  const row = statements.getOffenses.get(userId);
  return row ? row.count : 0;
}

export function incrementOffenseCount(userId) {
  statements.incrementOffense.run(userId);
  return getOffenseCount(userId);
}

export function resetAllOffenses() {
  const result = statements.resetAll.run();
  return result.changes;
}

export function resetUserOffenses(userId) {
  const result = statements.resetUser.run(userId);
  return result.changes;
}

export default {
  getOffenseCount,
  incrementOffenseCount,
  resetAllOffenses,
  resetUserOffenses,
};
