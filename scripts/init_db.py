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

        CREATE TABLE IF NOT EXISTS wallet (
            ticker TEXT PRIMARY KEY,
            qty INTEGER DEFAULT 0,
            avg_price REAL DEFAULT 0,
            added_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
        -- Garantir que a tabela tenha as colunas corretas se já existir
        -- SQLite não suporta IF NOT EXISTS em ADD COLUMN facilmente, mas o INSERT vai falhar se a coluna faltar no runtime.
        
    """)
    # Popular com mocks se a carteira estiver vazia
    cursor.execute("SELECT COUNT(*) FROM wallet")
    if cursor.fetchone()[0] == 0:
        mocks = [
            ("SNEL11", 200, 10.00),
            ("SNM11", 150, 10.10),
            ("DEVA11", 50, 85.50),
            ("HGLG11", 15, 150.00)
        ]
        cursor.executemany("INSERT INTO wallet (ticker, qty, avg_price) VALUES (?, ?, ?)", mocks)
        print("Carteira inicializada com dados mockados.")

    conn.commit()
    conn.close()
    print("Banco de dados inicializado com sucesso.")

if __name__ == "__main__":
    init_db()
