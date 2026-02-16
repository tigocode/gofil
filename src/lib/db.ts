import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.join(process.cwd(), 'gofii.db');
const db = new Database(dbPath);

// Inicializar tabelas
db.exec(`
  CREATE TABLE IF NOT EXISTS fiis (
    ticker TEXT PRIMARY KEY,
    name TEXT,
    sector TEXT,
    price REAL,
    pvp REAL,
    dy_12m REAL,
    vacancy REAL,
    liquidity REAL,
    assets_count INTEGER,
    dividends TEXT, -- Armazenado como JSON string
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS extraction_queue (
    ticker TEXT PRIMARY KEY,
    status TEXT DEFAULT 'pending', -- pending, processing, completed, error
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

export default db;
