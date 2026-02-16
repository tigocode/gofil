// Definição do Tipo (Interface) do FII
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

// Dados simulados (Copiados do seu HTML)
export const MOCK_FIIS: FiiData[] = [
    {
        "ticker": "XPML11",
        "name": "XP Malls",
        "sector": "Shopping",
        "price": 100.0,
        "pvp": 1.03,
        "dy_12m": 9.95,
        "vacancy": 0.0,
        "liquidity": 14460000,
        "assets_count": 10,
        "dividends": [
            0.1,
            0.1,
            0.1,
            0.1,
            0.1,
            0.1,
            0.1,
            0.1,
            0.1,
            0.1,
            0.1,
            0.1
        ]
    },
    {
        "ticker": "XPLG11",
        "name": "XP Log",
        "sector": "Logística",
        "price": 100.0,
        "pvp": 0.97,
        "dy_12m": 9.62,
        "vacancy": 0.0,
        "liquidity": 5890000,
        "assets_count": 10,
        "dividends": [
            0.1,
            0.1,
            0.1,
            0.1,
            0.1,
            0.1,
            0.1,
            0.1,
            0.1,
            0.1,
            0.1,
            0.1
        ]
    },
    {
        "ticker": "XPIN11",
        "name": "XP Indl",
        "sector": "Logística",
        "price": 100.0,
        "pvp": 0.7,
        "dy_12m": 13.15,
        "vacancy": 0.0,
        "liquidity": 477290,
        "assets_count": 10,
        "dividends": [
            0.1,
            0.1,
            0.1,
            0.1,
            0.1,
            0.1,
            0.1,
            0.1,
            0.1,
            0.1,
            0.1,
            0.1
        ]
    },
    {
        "ticker": "XPSF11",
        "name": "XP Seleção",
        "sector": "Híbrido",
        "price": 100.0,
        "pvp": 0.84,
        "dy_12m": 11.31,
        "vacancy": 0.0,
        "liquidity": 2390000,
        "assets_count": 10,
        "dividends": [
            0.1,
            0.1,
            0.1,
            0.1,
            0.1,
            0.1,
            0.1,
            0.1,
            0.1,
            0.1,
            0.1,
            0.1
        ]
    }
];

// Nova Interface para itens da carteira
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
  { ticker: "HGLG11", qty: 15, avg_price: 150.00 }, // Adicionei um de tijolo pra variar
];