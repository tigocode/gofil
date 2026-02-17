import requests
from bs4 import BeautifulSoup
import json
import re
import time
import pymysql
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
        autocommit=True,
        ssl={'ssl': True}
    )

def parse_br_number(value):
    if not value or value == '-' or value.strip() == '':
        return 0.0
    # Remove R$, %, espaços e pontos de milhar, troca vírgula por ponto
    clean_value = value.replace('R$', '').replace('%', '').replace(' ', '').replace('.', '').replace(',', '.')
    
    # Trata sufixos M (Milhões) e B (Bilhões)
    multiplier = 1.0
    if 'M' in clean_value.upper():
        multiplier = 1000000.0
        clean_value = clean_value.upper().replace('M', '')
    elif 'B' in clean_value.upper():
        multiplier = 1000000000.0
        clean_value = clean_value.upper().replace('B', '')
    elif 'K' in clean_value.upper():
        multiplier = 1000.0
        clean_value = clean_value.upper().replace('K', '')

    try:
        return float(clean_value) * multiplier
    except ValueError:
        return 0.0

def get_fii_details(ticker, headers):
    detail_url = f"https://investidor10.com.br/fiis/{ticker.lower()}/"
    try:
        print(f"Processando {ticker}...")
        res = requests.get(detail_url, headers=headers, timeout=15)
        if res.status_code == 200:
            dsoup = BeautifulSoup(res.content, 'html.parser')
            
            name = ticker
            name_elem = dsoup.find('h1', class_='page-title') or dsoup.find('h1')
            if name_elem:
                name = name_elem.text.strip()
            
            # 1. Capturar Dados Principais (Cards do Topo)
            price = 0.0
            pvp = 0.0
            dy = 0.0
            liquidity = 0.0
            
            cards = dsoup.find_all('div', class_='_card')
            for card in cards:
                title_elem = card.find('span', class_='_card-title') or card.find('span')
                value_elem = card.find('div', class_='_card-body') or card.find('span', class_='value')
                if title_elem and value_elem:
                    t_text = title_elem.text.upper()
                    v_text = value_elem.text.strip()
                    
                    if 'COTAÇÃO' in t_text: price = parse_br_number(v_text)
                    elif 'P/VP' in t_text: pvp = parse_br_number(v_text)
                    elif 'DY' in t_text: dy = parse_br_number(v_text)
                    elif 'LIQUIDEZ' in t_text: liquidity = parse_br_number(v_text)

            # 2. Capturar Dados Detalhados (Seção de Informações)
            vpa = 0.0
            vacancy = 0.0
            sector = "Híbrido"
            
            # Procura por labels específicas em divs de descrição
            descs = dsoup.find_all('div', class_='desc')
            for desc in descs:
                label = desc.find('span', class_='label')
                value = desc.find('span', class_='value')
                if label and value:
                    l_text = label.text.upper()
                    if 'VACÂNCIA' in l_text:
                        vacancy = parse_br_number(value.text)
                    elif 'VAL. PATRIMONIAL P/ COTA' in l_text or 'VALOR PATRIMONIAL P/ COTA' in l_text:
                        vpa = parse_br_number(value.text)
                    elif 'SEGMENTO' in l_text or 'SETOR' in l_text:
                        sector = value.text.strip()

            # Fallback para Vacância e VPA se não achou via classes específicas
            if vacancy == 0 or vpa == 0:
                all_text = dsoup.get_text(separator=" ").upper()
                if vacancy == 0:
                    vac_match = re.search(r'VACÂNCIA\s*([\d,]+)%', all_text)
                    if vac_match: vacancy = parse_br_number(vac_match.group(1))
                if vpa == 0:
                    vpa_match = re.search(r'VALOR PATRIMONIAL P/ COTA\s*R\$\s*([\d,.]+)', all_text)
                    if vpa_match: vpa = parse_br_number(vpa_match.group(1))

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
                "dividends": json.dumps([round(dy/12, 2)] * 12),
                "vpa": vpa
            }
    except Exception as e:
        print(f"Erro ao processar {ticker}: {e}")
    return None

def run_extraction():
    headers = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36"}
    conn = get_connection()
    try:
        with conn.cursor() as cursor:
            cursor.execute("SELECT ticker FROM fiis")
            existing_tickers = [row[0] for row in cursor.fetchall()]
            
            cursor.execute("SELECT ticker FROM extraction_queue WHERE status = 'pending'")
            queued_tickers = [row[0] for row in cursor.fetchall()]
            
            tickers_to_process = set(existing_tickers + queued_tickers)
            print(f"Total de tickers para atualizar: {len(tickers_to_process)}")

            for ticker in list(tickers_to_process):
                data = get_fii_details(ticker, headers)
                if data and data['price'] > 0:
                    cursor.execute("""
                        INSERT INTO fiis (ticker, name, sector, price, pvp, dy_12m, vacancy, liquidity, assets_count, dividends, vpa, updated_at)
                        VALUES (%(ticker)s, %(name)s, %(sector)s, %(price)s, %(pvp)s, %(dy_12m)s, %(vacancy)s, %(liquidity)s, %(assets_count)s, %(dividends)s, %(vpa)s, CURRENT_TIMESTAMP)
                        ON DUPLICATE KEY UPDATE
                            name=VALUES(name), sector=VALUES(sector), price=VALUES(price), pvp=VALUES(pvp),
                            dy_12m=VALUES(dy_12m), vacancy=VALUES(vacancy), liquidity=VALUES(liquidity),
                            assets_count=VALUES(assets_count), dividends=VALUES(dividends), vpa=VALUES(vpa), updated_at=CURRENT_TIMESTAMP
                    """, data)
                    cursor.execute("DELETE FROM extraction_queue WHERE ticker = %s", (ticker,))
                    print(f"Ticker {ticker} atualizado: R$ {data['price']} | Vac: {data['vacancy']}% | Liq: {data['liquidity']}")
                    time.sleep(1)
    finally:
        conn.close()

if __name__ == "__main__":
    run_extraction()
