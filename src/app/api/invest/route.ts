import { NextResponse } from 'next/server';
import { query } from '@/src/lib/db';
import { analyzeFII } from '@/src/utils/fii-analyzer';

export async function POST(request: Request) {
  try {
    const { amount } = await request.json();
    const investAmount = Number(amount);

    if (isNaN(investAmount) || investAmount <= 0) {
      return NextResponse.json({ error: 'Valor de aporte inválido' }, { status: 400 });
    }

    // 1. Buscar todos os FIIs e a Carteira
    const [fiis, wallet]: any = await Promise.all([
      query('SELECT * FROM fiis'),
      query('SELECT * FROM wallet')
    ]);

    // 2. Analisar todos os FIIs da base de dados
    const allOpportunities = fiis.map((fii: any) => {
      const parsedFii = {
        ...fii,
        price: Number(fii.price),
        pvp: Number(fii.pvp),
        dy_12m: Number(fii.dy_12m),
        vacancy: Number(fii.vacancy),
        liquidity: Number(fii.liquidity),
        assets_count: Number(fii.assets_count || 10),
        dividends: typeof fii.dividends === 'string' ? JSON.parse(fii.dividends) : fii.dividends
      };
      const analysis = analyzeFII(parsedFii);
      return { ...parsedFii, analysis };
    }).filter((f: any) => f.analysis.veredict.label === "Oportunidade");

    if (allOpportunities.length === 0) {
      return NextResponse.json({ 
        message: 'Nenhum FII classificado como Oportunidade no momento.',
        suggestions: [] 
      });
    }

    // 3. Calcular Alvos de Balanceamento
    const walletTickers = new Set(wallet.map((w: any) => w.ticker));
    
    // Pegar as top oportunidades (aumentado para 15 para maior diversidade)
    const topOpportunities = allOpportunities
      .sort((a: any, b: any) => {
        // Critério: Score alto + Preferência Base 10 como peso extra (+5 pontos)
        const scoreA = a.analysis.score + (a.price <= 10.50 ? 5 : 0);
        const scoreB = b.analysis.score + (b.price <= 10.50 ? 5 : 0);
        return scoreB - scoreA;
      })
      .slice(0, 15);

    // Unir ativos da carteira com as top oportunidades
    const candidateTickers = new Set([...walletTickers, ...topOpportunities.map(o => o.ticker)]);
    const candidates = Array.from(candidateTickers).map(ticker => {
      const fiiInfo = allOpportunities.find(o => o.ticker === ticker) || 
                      fiis.find((f: any) => f.ticker === ticker);
      
      if (!fiiInfo) return null;

      const analysis = fiiInfo?.analysis || analyzeFII({
        ...fiiInfo,
        price: Number(fiiInfo.price),
        pvp: Number(fiiInfo.pvp),
        dy_12m: Number(fiiInfo.dy_12m),
        vacancy: Number(fiiInfo.vacancy),
        liquidity: Number(fiiInfo.liquidity),
        assets_count: Number(fiiInfo.assets_count || 10),
        dividends: typeof fiiInfo.dividends === 'string' ? JSON.parse(fiiInfo.dividends) : fiiInfo.dividends
      });

      const walletItem = wallet.find((w: any) => w.ticker === ticker);
      const currentQuantity = Number(walletItem?.quantity || 0);
      const currentPrice = Number(fiiInfo?.price || walletItem?.average_price || 0);
      const currentValue = currentQuantity * currentPrice;

      return {
        ticker,
        name: fiiInfo?.name || walletItem?.name,
        price: currentPrice,
        score: analysis.score,
        veredict: analysis.veredict.label,
        currentValue,
        isOpportunity: analysis.veredict.label === "Oportunidade"
      };
    }).filter(c => c !== null);

    // Calcular valor total da carteira pós-aporte planejado
    const currentTotalValue = candidates.reduce((acc, c) => acc + (c?.currentValue || 0), 0);
    const projectedTotalValue = currentTotalValue + investAmount;
    
    // Definir Alvo: Cada candidato deveria idealmente ter uma fatia proporcional ao seu Score
    const totalCandidateScore = candidates.reduce((acc, c) => acc + (c?.score || 0), 0);
    
    const candidatesWithGaps = candidates.map(c => {
      const idealProportion = (c?.score || 0) / totalCandidateScore;
      const idealValue = projectedTotalValue * idealProportion;
      const gapValue = Math.max(0, idealValue - (c?.currentValue || 0));

      return { ...c, gapValue };
    }).filter(c => c.isOpportunity && c.gapValue > 0);

    // 4. Lógica de Distribuição do Aporte Baseada no Gap (Balanceamento)
    const totalGap = candidatesWithGaps.reduce((acc, c) => acc + c.gapValue, 0);
    
    let finalSuggestions: any[] = [];

    if (totalGap > 0) {
      finalSuggestions = candidatesWithGaps.map(c => {
        const proportionOfAport = c.gapValue / totalGap;
        const suggestedValue = investAmount * proportionOfAport;
        const quantity = Math.floor(suggestedValue / (c?.price || 1));
        const totalCost = quantity * (c?.price || 0);
        
        return {
          ticker: c.ticker,
          name: c.name,
          price: c.price,
          score: c.score,
          suggestedQty: quantity,
          totalCost: totalCost,
          isInWallet: walletTickers.has(c.ticker)
        };
      })
      .filter(s => s.suggestedQty > 0);
    }

    // Se as sugestões de balanceamento não consumirem todo o aporte ou não existirem, 
    // complementamos com as melhores oportunidades que ainda cabem no aporte restante
    const currentCost = finalSuggestions.reduce((acc, s) => acc + s.totalCost, 0);
    let remainingAmount = investAmount - currentCost;

    if (remainingAmount > 5) { // Se sobrar mais que o preço médio de uma cota barata
      const potentialAdds = topOpportunities
        .filter(o => !finalSuggestions.some(s => s.ticker === o.ticker))
        .sort((a, b) => b.analysis.score - a.analysis.score);

      for (const opt of potentialAdds) {
        if (remainingAmount <= 0) break;
        const qty = Math.floor(remainingAmount / opt.price);
        if (qty > 0) {
          finalSuggestions.push({
            ticker: opt.ticker,
            name: opt.name,
            price: opt.price,
            score: opt.analysis.score,
            suggestedQty: qty,
            totalCost: qty * opt.price,
            isInWallet: walletTickers.has(opt.ticker)
          });
          remainingAmount -= qty * opt.price;
        }
      }
    }

    // Ordenar por Score e limitar a exibição
    const suggestions = finalSuggestions
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);

    return NextResponse.json({
      investAmount,
      suggestions
    });

  } catch (error: any) {
    console.error('Erro na API de Investimento:', error);
    return NextResponse.json({ error: 'Erro ao processar sugestão' }, { status: 500 });
  }
}
