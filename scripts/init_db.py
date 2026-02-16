import sqlite3
import os

DB_PATH = "/home/ubuntu/gofil/gofii.db"

def init_db():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.executescript("""
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
            dividends TEXT,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS extraction_queue (
            ticker TEXT PRIMARY KEY,
            status TEXT DEFAULT 'pending',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
    """)
    conn.commit()
    conn.close()
    print("Banco de dados inicializado com sucesso.")

if __name__ == "__main__":
    init_db()
