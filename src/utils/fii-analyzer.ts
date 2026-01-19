import { FiiData } from "@/src/data/mocks";

export interface AnalysisResult {
  score: number;
  warnings: { pillar: string; msg: string; severity: 'high' | 'medium' | 'low' }[];
  veredict: { label: string; color: string; bg: string }; // Removi o 'icon' daqui
  cvStatus: string;
  dyStatus: string;
  pvpStatus: string;
}

export function analyzeFII(fii: FiiData): AnalysisResult {
  let score = 100;
  let warnings = [];
  
  // 1. P/VP
  let pvpStatus = "Neutro";
  if (fii.pvp > 1.20) {
      score -= 30;
      warnings.push({ pillar: "Preço", msg: `Ágio excessivo (P/VP ${fii.pvp}).`, severity: "high" as const });
      pvpStatus = "Caro";
  } else if (fii.pvp < 0.70 && !["Papel", "Energia"].includes(fii.sector)) {
      score -= 10;
      warnings.push({ pillar: "Preço", msg: `Desconto muito alto (P/VP ${fii.pvp}).`, severity: "medium" as const });
      pvpStatus = "Suspeito";
  } else if (fii.pvp >= 0.85 && fii.pvp <= 1.05) {
      pvpStatus = "Justo";
  }

  // 2. DY
  let dyStatus = "Neutro";
  if (fii.dy_12m > 16.0) {
      score -= 25;
      warnings.push({ pillar: "Yield", msg: `DY de ${fii.dy_12m}% é anormalmente alto.`, severity: "high" as const });
      dyStatus = "Risco Alto";
  } else if (fii.dy_12m < 6.0) {
      score -= 10;
      warnings.push({ pillar: "Yield", msg: "Rentabilidade Baixa.", severity: "low" as const });
      dyStatus = "Baixo";
  }

  // 3. Vacância
  if (fii.vacancy > 10.0 && !["Papel", "Energia"].includes(fii.sector)) {
      score -= 20;
      warnings.push({ pillar: "Vacância", msg: `Vacância alta de ${fii.vacancy}%.`, severity: "high" as const });
  }
  // 4. Liquidez
  if (fii.liquidity < 500000) {
      score -= 15;
      warnings.push({ pillar: "Liquidez", msg: "Baixa liquidez diária.", severity: "high" as const });
  }

  // Veredito
  let veredict = { label: "Observar", color: "text-amber-400", bg: "bg-amber-500/10" };
  
  if (score >= 80 && warnings.filter(w => w.severity === 'high').length === 0) {
      veredict = { label: "Oportunidade", color: "text-emerald-400", bg: "bg-emerald-500/10" };
  } else if (score < 50) {
      veredict = { label: "Cilada", color: "text-red-400", bg: "bg-red-500/10" };
  }

  return { score, warnings, veredict, cvStatus: "Estável", dyStatus, pvpStatus };
}