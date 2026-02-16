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

// Dados atualizados via script de extração
export const MOCK_FIIS: FiiData[] = [
    {
        "ticker": "GARE11",
        "name": "GARE11",
        "sector": "Híbrido",
        "price": 8.57,
        "pvp": 0.92,
        "dy_12m": 11.62,
        "vacancy": 0.0,
        "liquidity": 0.0,
        "assets_count": 10,
        "dividends": [
            0.97,
            0.97,
            0.97,
            0.97,
            0.97,
            0.97,
            0.97,
            0.97,
            0.97,
            0.97,
            0.97,
            0.97
        ]
    },
    {
        "ticker": "XPML11",
        "name": "XPML11",
        "sector": "Híbrido",
        "price": 111.0,
        "pvp": 1.03,
        "dy_12m": 9.95,
        "vacancy": 0.0,
        "liquidity": 0.0,
        "assets_count": 10,
        "dividends": [
            0.83,
            0.83,
            0.83,
            0.83,
            0.83,
            0.83,
            0.83,
            0.83,
            0.83,
            0.83,
            0.83,
            0.83
        ]
    },
    {
        "ticker": "VGHF11",
        "name": "VGHF11",
        "sector": "Híbrido",
        "price": 7.2,
        "pvp": 0.83,
        "dy_12m": 13.89,
        "vacancy": 0.0,
        "liquidity": 0.0,
        "assets_count": 10,
        "dividends": [
            1.16,
            1.16,
            1.16,
            1.16,
            1.16,
            1.16,
            1.16,
            1.16,
            1.16,
            1.16,
            1.16,
            1.16
        ]
    },
    {
        "ticker": "VSLH11",
        "name": "VSLH11",
        "sector": "Híbrido",
        "price": 2.18,
        "pvp": 0.21,
        "dy_12m": 16.7,
        "vacancy": 0.0,
        "liquidity": 0.0,
        "assets_count": 10,
        "dividends": [
            1.39,
            1.39,
            1.39,
            1.39,
            1.39,
            1.39,
            1.39,
            1.39,
            1.39,
            1.39,
            1.39,
            1.39
        ]
    },
    {
        "ticker": "BRZP11",
        "name": "BRZP11",
        "sector": "Híbrido",
        "price": 169.37,
        "pvp": 0.77,
        "dy_12m": 0.0,
        "vacancy": 0.0,
        "liquidity": 0.0,
        "assets_count": 10,
        "dividends": [
            0.0,
            0.0,
            0.0,
            0.0,
            0.0,
            0.0,
            0.0,
            0.0,
            0.0,
            0.0,
            0.0,
            0.0
        ]
    },
    {
        "ticker": "VINO11",
        "name": "VINO11",
        "sector": "Híbrido",
        "price": 5.53,
        "pvp": 0.56,
        "dy_12m": 11.39,
        "vacancy": 0.0,
        "liquidity": 0.0,
        "assets_count": 10,
        "dividends": [
            0.95,
            0.95,
            0.95,
            0.95,
            0.95,
            0.95,
            0.95,
            0.95,
            0.95,
            0.95,
            0.95,
            0.95
        ]
    },
    {
        "ticker": "DEVA11",
        "name": "DEVA11",
        "sector": "Híbrido",
        "price": 24.79,
        "pvp": 0.25,
        "dy_12m": 18.92,
        "vacancy": 0.0,
        "liquidity": 0.0,
        "assets_count": 10,
        "dividends": [
            1.58,
            1.58,
            1.58,
            1.58,
            1.58,
            1.58,
            1.58,
            1.58,
            1.58,
            1.58,
            1.58,
            1.58
        ]
    },
    {
        "ticker": "HRES11",
        "name": "HRES11",
        "sector": "Híbrido",
        "price": 0.0,
        "pvp": 0.0,
        "dy_12m": 30.29,
        "vacancy": 0.0,
        "liquidity": 0.0,
        "assets_count": 10,
        "dividends": [
            2.52,
            2.52,
            2.52,
            2.52,
            2.52,
            2.52,
            2.52,
            2.52,
            2.52,
            2.52,
            2.52,
            2.52
        ]
    },
    {
        "ticker": "BCFF11",
        "name": "BCFF11",
        "sector": "Híbrido",
        "price": 7.28,
        "pvp": 0.83,
        "dy_12m": 0.0,
        "vacancy": 0.0,
        "liquidity": 0.0,
        "assets_count": 10,
        "dividends": [
            0.0,
            0.0,
            0.0,
            0.0,
            0.0,
            0.0,
            0.0,
            0.0,
            0.0,
            0.0,
            0.0,
            0.0
        ]
    },
    {
        "ticker": "KNRI11",
        "name": "KNRI11",
        "sector": "Híbrido",
        "price": 166.2,
        "pvp": 1.01,
        "dy_12m": 7.3,
        "vacancy": 0.0,
        "liquidity": 0.0,
        "assets_count": 10,
        "dividends": [
            0.61,
            0.61,
            0.61,
            0.61,
            0.61,
            0.61,
            0.61,
            0.61,
            0.61,
            0.61,
            0.61,
            0.61
        ]
    },
    {
        "ticker": "RBRI11",
        "name": "RBRI11",
        "sector": "Híbrido",
        "price": 650.0,
        "pvp": 1.34,
        "dy_12m": 31.38,
        "vacancy": 0.0,
        "liquidity": 0.0,
        "assets_count": 10,
        "dividends": [
            2.61,
            2.61,
            2.61,
            2.61,
            2.61,
            2.61,
            2.61,
            2.61,
            2.61,
            2.61,
            2.61,
            2.61
        ]
    },
    {
        "ticker": "PNPR11",
        "name": "PNPR11",
        "sector": "Híbrido",
        "price": 48.0,
        "pvp": 1.32,
        "dy_12m": 0.0,
        "vacancy": 0.0,
        "liquidity": 0.0,
        "assets_count": 10,
        "dividends": [
            0.0,
            0.0,
            0.0,
            0.0,
            0.0,
            0.0,
            0.0,
            0.0,
            0.0,
            0.0,
            0.0,
            0.0
        ]
    },
    {
        "ticker": "ISEN11",
        "name": "ISEN11",
        "sector": "Híbrido",
        "price": 110.2,
        "pvp": 1.02,
        "dy_12m": 0.0,
        "vacancy": 0.0,
        "liquidity": 0.0,
        "assets_count": 10,
        "dividends": [
            0.0,
            0.0,
            0.0,
            0.0,
            0.0,
            0.0,
            0.0,
            0.0,
            0.0,
            0.0,
            0.0,
            0.0
        ]
    },
    {
        "ticker": "PLAG11",
        "name": "PLAG11",
        "sector": "Híbrido",
        "price": 62.0,
        "pvp": 1.0,
        "dy_12m": 9.18,
        "vacancy": 0.0,
        "liquidity": 0.0,
        "assets_count": 10,
        "dividends": [
            0.77,
            0.77,
            0.77,
            0.77,
            0.77,
            0.77,
            0.77,
            0.77,
            0.77,
            0.77,
            0.77,
            0.77
        ]
    },
    {
        "ticker": "PICE11",
        "name": "PICE11",
        "sector": "Híbrido",
        "price": 30.82,
        "pvp": 0.23,
        "dy_12m": 2.92,
        "vacancy": 0.0,
        "liquidity": 0.0,
        "assets_count": 10,
        "dividends": [
            0.24,
            0.24,
            0.24,
            0.24,
            0.24,
            0.24,
            0.24,
            0.24,
            0.24,
            0.24,
            0.24,
            0.24
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
  { ticker: "HGLG11", qty: 15, avg_price: 150.00 },
];