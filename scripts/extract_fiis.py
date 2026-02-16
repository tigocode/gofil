import requests
from bs4 import BeautifulSoup
import json
import re
import time
import pymysql
import ssl
import os

# Credenciais TiDB
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

def parse_br_number(value):
    if not value or value == '-' or value.strip() == '':
        return 0.0
    clean_value = value.replace('R$', '').replace('%', '').replace(' ', '').replace('.', '').replace(',', '.')
    try:
        return float(clean_value)
    except ValueError:
        return 0.0

def get_fii_details(ticker, headers):
    detail_url = f"https://investidor10.com.br/fiis/{ticker.lower()}/"
    try:
        print(f"Processando {ticker}...")
        res = requests.get(detail_url, headers=headers, timeout=10)
        if res.status_code == 200:
            dsoup = BeautifulSoup(res.content, 'html.parser')
            
            name = ticker
            name_elem = dsoup.find('h1', class_='page-title') or dsoup.find('h1')
            if name_elem:
                name = name_elem.text.strip()
            
            sector = "Híbrido"
            for item in dsoup.find_all(['div', 'span'], class_=['desc', 'value']):
                parent = item.parent
                if 'Setor' in parent.text or 'Segmento' in parent.text:
                    sector = item.text.strip()
                    break
            
            pvp = 0.0
            dy = 0.0
            price = 0.0
            cards = dsoup.find_all('div', class_='_card')
            for card in cards:
                title = card.find('span', class_='_card-title') or card.find('span')
                value = card.find('div', class_='_card-body') or card.find('span', class_='value')
                if title and value:
                    t_text = title.text.upper()
                    v_text = value.text.strip()
                    if 'P/VP' in t_text: pvp = parse_br_number(v_text)
                    elif 'DIVIDEND' in t_text or 'DY' in t_text: dy = parse_br_number(v_text)
                    elif 'COTAÇÃO' in t_text or 'PREÇO' in t_text: price = parse_br_number(v_text)

            liquidity = 0.0
            vacancy = 0.0
            for desc in dsoup.find_all('div', class_='desc'):
                label = desc.find('span', class_='label')
                val = desc.find('span', class_='value')
                if label and val:
                    if 'Liquidez' in label.text: liquidity = parse_br_number(val.text)
                    elif 'Vacância' in label.text: vacancy = parse_br_number(val.text)

            return {
                "ticker": ticker,
                "name": name,
                "sector": sector,
                "price": price,
                "pvp": pvp,
                "dy_12m": dy,
                "vacancy": vacancy,
                "liquidity": liquidity,
                "assets_count": 10,
                "dividends": json.dumps([round(dy/12, 2)] * 12)
            }
    except Exception as e:
        print(f"Erro ao processar {ticker}: {e}")
    return None

def run_extraction():
    headers = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"}
    conn = get_connection()
    try:
        with conn.cursor() as cursor:
            # 1. Buscar tickers da fila de espera
            cursor.execute("SELECT ticker FROM extraction_queue WHERE status = 'pending'")
            queued_tickers = [row[0] for row in cursor.fetchall()]
            
            # 2. Buscar tickers do ranking (para manter atualizado)
            ranking_url = "https://investidor10.com.br/fiis/rankings/"
            tickers_to_process = set(queued_tickers)
            
            try:
                response = requests.get(ranking_url, headers=headers, timeout=15)
                if response.status_code == 200:
                    soup = BeautifulSoup(response.content, 'html.parser')
                    for a in soup.find_all('a', href=re.compile(r'/fiis/([^/]+)/$')):
                        t = a.text.strip().split('\n')[0].strip()
                        if len(t) >= 5 and t[:4].isalpha() and t[4:].isdigit():
                            tickers_to_process.add(t)
            except Exception as e:
                print(f"Erro ao buscar ranking: {e}")

            print(f"Total de tickers para processar: {len(tickers_to_process)}")

            for ticker in list(tickers_to_process):
                data = get_fii_details(ticker, headers)
                if data:
                    cursor.execute("""
                        INSERT INTO fiis (ticker, name, sector, price, pvp, dy_12m, vacancy, liquidity, assets_count, dividends, updated_at)
                        VALUES (%(ticker)s, %(name)s, %(sector)s, %(price)s, %(pvp)s, %(dy_12m)s, %(vacancy)s, %(liquidity)s, %(assets_count)s, %(dividends)s, CURRENT_TIMESTAMP)
                        ON DUPLICATE KEY UPDATE
                            name=VALUES(name), sector=VALUES(sector), price=VALUES(price), pvp=VALUES(pvp),
                            dy_12m=VALUES(dy_12m), vacancy=VALUES(vacancy), liquidity=VALUES(liquidity),
                            assets_count=VALUES(assets_count), dividends=VALUES(dividends), updated_at=CURRENT_TIMESTAMP
                    """, data)
                    # Remover da fila após processamento bem-sucedido
                    cursor.execute("DELETE FROM extraction_queue WHERE ticker = %s", (ticker,))
                    print(f"Ticker {ticker} processado e removido da fila.")
                    time.sleep(1)
    finally:
        conn.close()

if __name__ == "__main__":
    run_extraction()
