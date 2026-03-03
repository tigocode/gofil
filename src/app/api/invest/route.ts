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
    
    // Pegar as 10 melhores oportunidades gerais para considerar novos aportes
    const topOpportunities = allOpportunities
      .sort((a: any, b: any) => {
        // Critério: Score alto + Preferência Base 10 como peso extra (+5 pontos)
        const scoreA = a.analysis.score + (a.price <= 10.50 ? 5 : 0);
        const scoreB = b.analysis.score + (b.price <= 10.50 ? 5 : 0);
        return scoreB - scoreA;
      })
      .slice(0, 10);

    // Unir ativos da carteira com as top oportunidades
    const candidateTickers = new Set([...walletTickers, ...topOpportunities.map(o => o.ticker)]);
    const candidates = Array.from(candidateTickers).map(ticker => {
      const fiiInfo = allOpportunities.find(o => o.ticker === ticker) || 
                      fiis.find((f: any) => f.ticker === ticker);
      
      // Se não for oportunidade no momento, mas estiver na carteira, ainda precisamos considerar para balanceamento
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
    });

    // Calcular valor total da carteira pós-aporte planejado
    const currentTotalValue = candidates.reduce((acc, c) => acc + c.currentValue, 0);
    const projectedTotalValue = currentTotalValue + investAmount;
    
    // Definir Alvo: Cada candidato deveria idealmente ter uma fatia proporcional ao seu Score
    const totalCandidateScore = candidates.reduce((acc, c) => acc + c.score, 0);
    
    const candidatesWithGaps = candidates.map(c => {
      const idealProportion = c.score / totalCandidateScore;
      const idealValue = projectedTotalValue * idealProportion;
      const gapValue = Math.max(0, idealValue - c.currentValue); // Quanto falta para o ideal

      return { ...c, gapValue };
    }).filter(c => c.isOpportunity && c.gapValue > 0); // Só sugerir aporte em Oportunidades que estão abaixo do alvo

    // 4. Lógica de Distribuição do Aporte Baseada no Gap (Balanceamento)
    const totalGap = candidatesWithGaps.reduce((acc, c) => acc + c.gapValue, 0);
    
    if (totalGap === 0) {
        // Fallback caso todos estejam acima do alvo: sugerir os top scores que sejam oportunidade
        const fallbackSuggestions = topOpportunities.slice(0, 5).map(fii => {
            const quantity = Math.floor((investAmount / 5) / fii.price);
            return {
                ticker: fii.ticker,
                name: fii.name,
                price: fii.price,
                score: fii.analysis.score,
                suggestedQty: quantity,
                totalCost: quantity * fii.price,
                isInWallet: walletTickers.has(fii.ticker)
            };
        }).filter(s => s.suggestedQty > 0);

        return NextResponse.json({ investAmount, suggestions: fallbackSuggestions });
    }

    const suggestions = candidatesWithGaps.map(c => {
      const proportionOfAport = c.gapValue / totalGap;
      const suggestedValue = investAmount * proportionOfAport;
      const quantity = Math.floor(suggestedValue / c.price);
      const totalCost = quantity * c.price;
      
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
    .filter(s => s.suggestedQty > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 8);

    return NextResponse.json({
      investAmount,
      suggestions
    });

  } catch (error: any) {
    console.error('Erro na API de Investimento:', error);
    return NextResponse.json({ error: 'Erro ao processar sugestão' }, { status: 500 });
  }
}
