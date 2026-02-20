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

    // 2. Analisar cada FII e filtrar apenas os que são "Oportunidade" (Score >= 80)
    const opportunities = fiis.map((fii: any) => {
      const parsedFii = {
        ...fii,
        price: Number(fii.price),
        pvp: Number(fii.pvp),
        dy_12m: Number(fii.dy_12m),
        vacancy: Number(fii.vacancy),
        liquidity: Number(fii.liquidity),
        assets_count: Number(fii.assets_count || 10), // Fallback
        dividends: typeof fii.dividends === 'string' ? JSON.parse(fii.dividends) : fii.dividends
      };
      const analysis = analyzeFII(parsedFii);
      return { ...parsedFii, analysis };
    }).filter((f: any) => f.analysis.veredict.label === "Oportunidade")
      .sort((a: any, b: any) => {
        // Ordenação Dinâmica: Prioriza Score, mas adiciona um fator de aleatoriedade leve
        // para não sugerir SEMPRE os mesmos se os scores forem idênticos.
        // Também prioriza FIIs que NÃO estão na carteira para diversificação se o score for alto.
        const scoreA = a.analysis.score;
        const scoreB = b.analysis.score;
        if (scoreA !== scoreB) return scoreB - scoreA;
        return Math.random() - 0.5;
      });

    if (opportunities.length === 0) {
      return NextResponse.json({ 
        message: 'Nenhum FII classificado como Oportunidade no momento.',
        suggestions: [] 
      });
    }

    // 3. Lógica de Distribuição: 
    // Vamos pegar uma amostra maior (top 10) e selecionar 5 aleatoriamente entre elas
    // para garantir que a lista mude e o usuário veja diferentes opções de "Oportunidade".
    const topPool = opportunities.slice(0, 10);
    const shuffled = topPool.sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, 5);
    
    const totalScore = selected.reduce((acc: number, f: any) => acc + f.analysis.score, 0);
    
    const suggestions = selected.map((fii: any) => {
      const proportion = fii.analysis.score / totalScore;
      const suggestedValue = investAmount * proportion;
      const quantity = Math.floor(suggestedValue / fii.price);
      const totalCost = quantity * fii.price;
      
      return {
        ticker: fii.ticker,
        name: fii.name,
        price: fii.price,
        score: fii.analysis.score,
        suggestedQty: quantity,
        totalCost: totalCost,
        isInWallet: wallet.some((w: any) => w.ticker === fii.ticker)
      };
    }).filter((s: any) => s.suggestedQty > 0);

    return NextResponse.json({
      investAmount,
      suggestions
    });

  } catch (error: any) {
    console.error('Erro na API de Investimento:', error);
    return NextResponse.json({ error: 'Erro ao processar sugestão' }, { status: 500 });
  }
}
