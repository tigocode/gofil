import { FiiData } from "@/src/data/mocks";

export interface AnalysisResult {
  score: number;
  warnings: { pillar: string; msg: string; severity: 'high' | 'medium' | 'low' }[];
  veredict: { label: string; color: string; bg: string };
  cvStatus: string;
  dyStatus: string;
  pvpStatus: string;
  diversificationStatus: string;
}

export function analyzeFII(fii: FiiData): AnalysisResult {
  let score = 100;
  let warnings = [];
  
  // 1. P/VP (Regra do Vídeo: Não pagar ágio excessivo)
  let pvpStatus = "Neutro";
  if (fii.pvp > 1.20) {
      score -= 30;
      warnings.push({ pillar: "Preço", msg: `Ágio excessivo (P/VP ${fii.pvp}).`, severity: "high" as const });
      pvpStatus = "Caro";
  } else if (fii.pvp < 0.70 && !["Papel", "Energia", "Títulos e Valores Mobiliários"].includes(fii.sector)) {
      score -= 10;
      warnings.push({ pillar: "Preço", msg: `Desconto muito alto (P/VP ${fii.pvp}).`, severity: "medium" as const });
      pvpStatus = "Suspeito";
  } else if (fii.pvp >= 0.85 && fii.pvp <= 1.05) {
      pvpStatus = "Justo";
  }

  // 2. DY (Atrativo/Armadilha)
  let dyStatus = "Neutro";
  if (fii.dy_12m > 16.0) {
      score -= 25;
      warnings.push({ pillar: "Yield", msg: `DY de ${fii.dy_12m}% é anormalmente alto (Possível armadilha).`, severity: "high" as const });
      dyStatus = "Risco Alto";
  } else if (fii.dy_12m < 6.0) {
      score -= 10;
      warnings.push({ pillar: "Yield", msg: "Rentabilidade Baixa.", severity: "low" as const });
      dyStatus = "Baixo";
  }

  // 3. Vacância (Risco Oculto)
  if (fii.vacancy > 10.0 && !["Papel", "Energia", "Títulos e Valores Mobiliários"].includes(fii.sector)) {
      score -= 20;
      warnings.push({ pillar: "Vacância", msg: `Vacância alta de ${fii.vacancy}%.`, severity: "high" as const });
  }
  
  // 4. Liquidez (Segurança de Saída)
  if (fii.liquidity < 500000) {
      score -= 15;
      warnings.push({ pillar: "Liquidez", msg: "Baixa liquidez diária (Risco de saída).", severity: "high" as const });
  }

  // 5. Diversificação (Mono vs Multi)
  let diversificationStatus = fii.assets_count > 1 ? "Multi-Ativo" : "Mono-Ativo";
  if (fii.assets_count <= 1 && !["Papel", "Energia", "Títulos e Valores Mobiliários"].includes(fii.sector)) {
      score -= 15;
      warnings.push({ pillar: "Diversificação", msg: "Fundo Mono-Ativo (Exposição binária).", severity: "high" as const });
  }

  // 6. Estabilidade (Histórico e Consistência - Coeficiente de Variação)
  let cvStatus = "Estável";
  if (fii.dividends) {
      const divs = typeof fii.dividends === 'string' ? JSON.parse(fii.dividends) : fii.dividends;
      if (Array.isArray(divs) && divs.length >= 6) {
          const mean = divs.reduce((a, b) => a + b, 0) / divs.length;
          const variance = divs.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / divs.length;
          const stdDev = Math.sqrt(variance);
          const cv = (stdDev / mean) * 100;

          if (cv > 25) {
              score -= 20; // Penalidade maior para instabilidade excessiva
              warnings.push({ pillar: "Estabilidade", msg: "DY artificial ou não recorrente (Alta oscilação).", severity: "high" as const });
              cvStatus = "Instável";
          } else if (cv > 15) {
              score -= 10;
              cvStatus = "Alerta";
          }
      }
  }

  // Veredito: Score >= 80 é obrigatoriamente Oportunidade
  let veredict = { label: "Observar", color: "text-amber-400", bg: "bg-amber-500/10" };
  
  if (score >= 80) {
      veredict = { label: "Oportunidade", color: "text-emerald-400", bg: "bg-emerald-500/10" };
  } else if (score < 50) {
      veredict = { label: "Cilada", color: "text-red-400", bg: "bg-red-500/10" };
  }

  return { score, warnings, veredict, cvStatus, dyStatus, pvpStatus, diversificationStatus };
}
