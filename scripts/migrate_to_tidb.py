import pymysql
import ssl
import os

# Credenciais fornecidas
DB_HOST = "gateway01.us-east-1.prod.aws.tidbcloud.com"
DB_USER = "3LWPSrGCXLpKVj9.root"
DB_PASS = "Wh3MlwrXLwbBDDIS"
DB_NAME = "test"
DB_PORT = 4000

def get_connection():
    return pymysql.connect(
        host=DB_HOST,
        user=DB_USER,
        password=DB_PASS,
        database=DB_NAME,
        port=DB_PORT,
        ssl={'ca': '/etc/ssl/certs/ca-certificates.crt'},
        autocommit=True
    )

def init_tidb():
    conn = get_connection()
    try:
        with conn.cursor() as cursor:
            print("Criando tabelas no TiDB...")
            
            # Tabela fiis
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS fiis (
                    ticker VARCHAR(20) PRIMARY KEY,
                    name VARCHAR(255),
                    sector VARCHAR(100),
                    price DECIMAL(10, 2),
                    pvp DECIMAL(10, 2),
                    dy_12m DECIMAL(10, 2),
                    vacancy DECIMAL(10, 2),
                    liquidity DECIMAL(15, 2),
                    assets_count INTEGER,
                    dividends TEXT,
                    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
                );
            """)

            # Tabela extraction_queue
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS extraction_queue (
                    ticker VARCHAR(20) PRIMARY KEY,
                    status VARCHAR(20) DEFAULT 'pending',
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
                );
            """)

            # Tabela wallet
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS wallet (
                    ticker VARCHAR(20) PRIMARY KEY,
                    qty INTEGER DEFAULT 0,
                    avg_price DECIMAL(10, 2) DEFAULT 0,
                    added_at DATETIME DEFAULT CURRENT_TIMESTAMP
                );
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
                cursor.executemany("INSERT INTO wallet (ticker, qty, avg_price) VALUES (%s, %s, %s)", mocks)
                print("Carteira inicializada com dados mockados no TiDB.")

            print("Banco de dados TiDB inicializado com sucesso.")
    finally:
        conn.close()

if __name__ == "__main__":
    init_tidb()
