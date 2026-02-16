import requests
from bs4 import BeautifulSoup
import json
import re
import time

def parse_br_number(value):
    if not value or value == '-' or value.strip() == '':
        return 0.0
    # Remove R$, %, espaços e pontos de milhar, troca vírgula por ponto
    clean_value = value.replace('R$', '').replace('%', '').replace(' ', '').replace('.', '').replace(',', '.')
    try:
        return float(clean_value)
    except ValueError:
        return 0.0

def get_fii_data_from_investidor10_rankings():
    url = "https://investidor10.com.br/fiis/rankings/"
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    }
    
    all_fiis_data = []
    try:
        print(f"Acessando {url}...")
        response = requests.get(url, headers=headers, timeout=15)
        if response.status_code == 200:
            soup = BeautifulSoup(response.content, 'html.parser')
            tickers_found = set()
            # Encontrar links de FIIs na tabela de ranking
            for a in soup.find_all('a', href=re.compile(r'/fiis/([^/]+)/$')):
                ticker_text = a.text.strip().split('\n')[0].strip()
                # Filtrar apenas tickers válidos (geralmente 4 letras + 2 números)
                if len(ticker_text) >= 5 and ticker_text[:4].isalpha() and ticker_text[4:].isdigit():
                    tickers_found.add(ticker_text)
            
            print(f"Encontrados {len(tickers_found)} tickers válidos.")
            
            tickers_to_process = list(tickers_found)[:15]
            
            for ticker in tickers_to_process: 
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
                        # Busca o setor em spans ou divs específicos
                        for item in dsoup.find_all(['div', 'span'], class_=['desc', 'value']):
                            parent = item.parent
                            if 'Setor' in parent.text or 'Segmento' in parent.text:
                                sector = item.text.strip()
                                break
                        
                        pvp = 0.0
                        dy = 0.0
                        price = 0.0
                        
                        # Seletores comuns para os cards de indicadores
                        cards = dsoup.find_all('div', class_='_card')
                        for card in cards:
                            title = card.find('span', class_='_card-title') or card.find('span')
                            value = card.find('div', class_='_card-body') or card.find('span', class_='value')
                            
                            if title and value:
                                t_text = title.text.upper()
                                v_text = value.text.strip()
                                if 'P/VP' in t_text:
                                    pvp = parse_br_number(v_text)
                                elif 'DIVIDEND' in t_text or 'DY' in t_text:
                                    dy = parse_br_number(v_text)
                                elif 'COTAÇÃO' in t_text or 'PREÇO' in t_text:
                                    price = parse_br_number(v_text)

                        # Liquidez e Vacância
                        liquidity = 0.0
                        vacancy = 0.0
                        for desc in dsoup.find_all('div', class_='desc'):
                            label = desc.find('span', class_='label')
                            val = desc.find('span', class_='value')
                            if label and val:
                                if 'Liquidez' in label.text:
                                    liquidity = parse_br_number(val.text)
                                elif 'Vacância' in label.text:
                                    vacancy = parse_br_number(val.text)

                        all_fiis_data.append({
                            "ticker": ticker,
                            "name": name,
                            "sector": sector,
                            "price": price,
                            "pvp": pvp,
                            "dy_12m": dy,
                            "vacancy": vacancy,
                            "liquidity": liquidity,
                            "assets_count": 10,
                            "dividends": [round(dy/12, 2)] * 12
                        })
                        time.sleep(0.5)
                except Exception as e:
                    print(f"Erro ao processar {ticker}: {e}")
        else:
            print(f"Erro ao acessar ranking: Status {response.status_code}")
    except Exception as e:
        print(f"Erro ao buscar rankings: {e}")
    
    return all_fiis_data

def update_mocks_file(data):
    if not data:
        print("Nenhum dado capturado.")
        return

    mocks_path = "/home/ubuntu/gofil/src/data/mocks.ts"
    
    # Validar setores para bater com a interface
    valid_sectors = ["Logística", "Shopping", "Papel", "Laje", "Energia", "Híbrido"]
    for fii in data:
        if fii['sector'] not in valid_sectors:
            if "Logística" in fii['sector']: fii['sector'] = "Logística"
            elif "Shopping" in fii['sector']: fii['sector'] = "Shopping"
            elif "Papel" in fii['sector'] or "Recebíveis" in fii['sector']: fii['sector'] = "Papel"
            elif "Laje" in fii['sector'] or "Escritórios" in fii['sector']: fii['sector'] = "Laje"
            elif "Energia" in fii['sector']: fii['sector'] = "Energia"
            else: fii['sector'] = "Híbrido"

    content = """// Definição do Tipo (Interface) do FII
export interface FiiData {
  ticker: string;
  name: string;
  sector: "Logística" | "Shopping" | "Papel" | "Laje" | "Energia" | "Híbrido";
  price: number;
  pvp: number;
  dy_12m: number;
  vacancy: number;
  liquidity: number;
  assets_count: number;
  dividends: number[];
}

// Dados atualizados via script de extração
export const MOCK_FIIS: FiiData[] = """
    
    content += json.dumps(data, indent=4, ensure_ascii=False)
    content += ";\n\n"
    
    content += """// Nova Interface para itens da carteira
export interface WalletItem {
  ticker: string;
  qty: number;
  avg_price: number;
}

// Carteira Simulada
export const MOCK_WALLET: WalletItem[] = [
  { ticker: "SNEL11", qty: 200, avg_price: 10.00 },
  { ticker: "SNM11", qty: 150, avg_price: 10.10 },
  { ticker: "DEVA11", qty: 50, avg_price: 85.50 },
  { ticker: "HGLG11", qty: 15, avg_price: 150.00 },
];"""

    with open(mocks_path, "w", encoding="utf-8") as f:
        f.write(content)
    print(f"Mocks atualizados com {len(data)} FIIs.")

if __name__ == "__main__":
    fiis_data = get_fii_data_from_investidor10_rankings()
    update_mocks_file(fiis_data)
