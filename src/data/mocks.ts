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
    { ticker: "SNEL11", name: "Suno Energias Limpas", sector: "Energia", price: 9.85, pvp: 0.94, dy_12m: 13.2, vacancy: 0, liquidity: 1500000, assets_count: 5, dividends: [0.10, 0.11, 0.10, 0.12, 0.10, 0.10, 0.11, 0.10, 0.10, 0.10, 0.10, 0.12] },
    { ticker: "HGLG11", name: "CSHG Logística", sector: "Logística", price: 162.50, pvp: 1.05, dy_12m: 9.2, vacancy: 2.5, liquidity: 8500000, assets_count: 17, dividends: [1.10, 1.10, 1.10, 1.10, 1.50, 1.10, 1.10, 1.10, 1.10, 1.10, 2.20, 1.10] },
    { ticker: "VISC11", name: "Vinci Shopping Centers", sector: "Shopping", price: 118.90, pvp: 0.92, dy_12m: 8.9, vacancy: 6.5, liquidity: 5500000, assets_count: 25, dividends: [0.85, 0.90, 0.85, 0.95, 1.00, 0.80, 0.85, 0.92, 0.88, 0.90, 0.85, 0.95] },
    { ticker: "KNRI11", name: "Kinea Renda Imobiliária", sector: "Híbrido", price: 158.30, pvp: 0.98, dy_12m: 8.5, vacancy: 3.1, liquidity: 4200000, assets_count: 21, dividends: [1.00, 0.95, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 0.98, 1.01, 1.00] },
    { ticker: "DEVA11", name: "Devant Recebíveis", sector: "Papel", price: 42.10, pvp: 0.45, dy_12m: 16.5, vacancy: 0, liquidity: 1200000, assets_count: 45, dividends: [0.50, 0.45, 0.40, 0.35, 0.30, 0.55, 0.40, 0.30, 0.25, 0.20, 0.15, 0.40] },
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