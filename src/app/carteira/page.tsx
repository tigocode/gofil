'use client';

import { useState, useEffect } from 'react';
import { WalletItem, FiiData } from "@/src/data/mocks";
import WalletRow from "@/src/components/WalletRow";
import { analyzeFII } from "@/src/utils/fii-analyzer";
import { FaWallet, FaHandHoldingDollar, FaChartSimple } from "react-icons/fa6";

export default function CarteiraPage() {
  const [wallet, setWallet] = useState<WalletItem[]>([]);
  const [marketFiis, setMarketFiis] = useState<FiiData[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      const [fiisRes, walletRes] = await Promise.all([
        fetch('/api/fiis'),
        fetch('/api/wallet')
      ]);
      
      const fiisData = await fiisRes.json();
      const walletData = await walletRes.json();

      if (Array.isArray(fiisData)) {
        setMarketFiis(fiisData);
      }
      
      if (Array.isArray(walletData)) {
        setWallet(walletData);
      }
    } catch (err) {
      console.error("Erro ao carregar dados:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRemove = async (ticker: string) => {
    if (confirm(`Deseja remover ${ticker} da sua carteira?`)) {
      try {
        const res = await fetch(`/api/wallet?ticker=${ticker}`, {
          method: 'DELETE',
        });
        if (res.ok) {
          setWallet(prev => prev.filter(item => item.ticker !== ticker));
        } else {
          alert("Erro ao remover do banco de dados.");
        }
      } catch (err) {
        alert("Erro de conexão ao tentar remover.");
      }
    }
  };

  // Lógica de Consolidação dos Dados
  const walletFullDataWithCalculations = wallet.map(item => {
    const marketData = marketFiis.find(f => f.ticker === item.ticker);
    
    if (!marketData) return null;

    const currentVal = item.qty * marketData.price;
    const lastDiv = Array.isArray(marketData.dividends) && marketData.dividends.length > 0 
      ? marketData.dividends[marketData.dividends.length - 1] 
      : 0;
    const income = item.qty * lastDiv;
    const analysis = analyzeFII(marketData);

    return { walletItem: item, marketData, currentVal, income, score: analysis.score };
  }).filter(item => item !== null);

  const { totalPatrimony, totalIncome, weightedScoreSum } = walletFullDataWithCalculations.reduce(
    (acc, item) => ({
      totalPatrimony: acc.totalPatrimony + item!.currentVal,
      totalIncome: acc.totalIncome + item!.income,
      weightedScoreSum: acc.weightedScoreSum + (item!.score * item!.currentVal),
    }),
    { totalPatrimony: 0, totalIncome: 0, weightedScoreSum: 0 }
  );

  const portfolioScore = totalPatrimony > 0 ? Math.round(weightedScoreSum / totalPatrimony) : 0;
  
  let scoreColor = 'text-red-400';
  if (portfolioScore > 70) scoreColor = 'text-emerald-400';
  else if (portfolioScore > 50) scoreColor = 'text-amber-400';

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        <div className="animate-pulse">Carregando carteira...</div>
      </div>
    );
  }

  return (
    <main className="min-h-screen p-6 md:p-10">
      <div className="max-w-7xl mx-auto">

        <div className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Minha Carteira</h1>
            <p className="text-slate-400 text-sm">Acompanhamento consolidado dos seus ativos.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="glass-panel p-6 rounded-xl relative overflow-hidden border-l-4 border-l-blue-500">
            <div className="relative z-10">
              <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Patrimônio Total</p>
              <h2 className="text-3xl font-bold text-white">
                R$ {totalPatrimony.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </h2>
            </div>
            <FaWallet className="absolute right-4 bottom-4 text-slate-700/20 text-6xl" />
          </div>

          <div className="glass-panel p-6 rounded-xl relative overflow-hidden border-l-4 border-l-emerald-500">
            <div className="relative z-10">
              <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Renda Mensal Est.</p>
              <h2 className="text-3xl font-bold text-white">
                R$ {totalIncome.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </h2>
              <p className="text-[10px] text-emerald-400 font-bold mt-1">
                Yield Médio: {totalPatrimony > 0 ? ((totalIncome * 12 / totalPatrimony) * 100).toFixed(2) : 0}% a.a.
              </p>
            </div>
            <FaHandHoldingDollar className="absolute right-4 bottom-4 text-slate-700/20 text-6xl" />
          </div>

          <div className="glass-panel p-6 rounded-xl relative overflow-hidden border-l-4 border-l-amber-500">
            <div className="relative z-10">
              <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Qualidade da Carteira</p>
              <h2 className={`text-3xl font-bold ${scoreColor}`}>
                {portfolioScore} <span className="text-sm text-slate-500 font-normal">/ 100</span>
              </h2>
              <p className="text-[10px] text-slate-500 font-medium mt-1">Média ponderada pelo valor investido</p>
            </div>
            <FaChartSimple className="absolute right-4 bottom-4 text-slate-700/20 text-6xl" />
          </div>
        </div>

        <div className="flex flex-col gap-4">
            <h3 className="text-slate-400 font-bold text-xs uppercase tracking-widest mb-2 px-1">Detalhamento dos Ativos</h3>
            
            {walletFullDataWithCalculations.map((item, index) => (
                <WalletRow 
                    key={item!.walletItem.ticker} 
                    walletItem={item!.walletItem} 
                    fiiData={item!.marketData} 
                    onRemove={handleRemove}
                />
            ))}

            {walletFullDataWithCalculations.length === 0 && (
                <div className="text-center py-20 text-slate-500 glass-panel rounded-xl">
                    Sua carteira está vazia. Comece adicionando ativos!
                </div>
            )}
        </div>

      </div>
    </main>
  );
}
