'use client';

import { useState, useEffect } from 'react';
import { WalletItem, FiiData } from "@/src/data/mocks";
import WalletRow from "@/src/components/WalletRow";
import { analyzeFII } from "@/src/utils/fii-analyzer";
import { FaWallet, FaHandHoldingDollar, FaChartSimple, FaLightbulb, FaCoins } from "react-icons/fa6";

export default function CarteiraPage() {
  const [wallet, setWallet] = useState<WalletItem[]>([]);
  const [marketFiis, setMarketFiis] = useState<FiiData[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Estados para Aporte Inteligente
  const [investAmount, setInvestAmount] = useState<string>("");
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [loadingInvest, setLoadingInvest] = useState(false);

  const loadData = async () => {
    try {
      const [fiisRes, walletRes] = await Promise.all([
        fetch('/api/fiis'),
        fetch('/api/wallet')
      ]);
      
      const fiisData = await fiisRes.json();
      const walletData = await walletRes.json();

      if (Array.isArray(fiisData)) setMarketFiis(fiisData);
      if (Array.isArray(walletData)) setWallet(walletData);
    } catch (err) {
      console.error("Erro ao carregar dados:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCalculateInvest = async () => {
    if (!investAmount || Number(investAmount) <= 0) return;
    setLoadingInvest(true);
    try {
      const res = await fetch('/api/invest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: investAmount })
      });
      const data = await res.json();
      setSuggestions(data.suggestions || []);
    } catch (err) {
      alert("Erro ao calcular aporte.");
    } finally {
      setLoadingInvest(false);
    }
  };

  const handleRemove = async (ticker: string) => {
    if (confirm(`Deseja remover ${ticker} da sua carteira?`)) {
      try {
        const res = await fetch(`/api/wallet?ticker=${ticker}`, { method: 'DELETE' });
        if (res.ok) setWallet(prev => prev.filter(item => item.ticker !== ticker));
      } catch (err) {
        alert("Erro de conexão.");
      }
    }
  };

  const walletFullDataWithCalculations = wallet.map(item => {
    const marketData = marketFiis.find(f => f.ticker === item.ticker);
    if (!marketData) return null;
    const currentVal = item.qty * marketData.price;
    const lastDiv = Array.isArray(marketData.dividends) && marketData.dividends.length > 0 
      ? marketData.dividends[marketData.dividends.length - 1] : 0;
    const income = item.qty * lastDiv;
    const analysis = analyzeFII(marketData);
    return { walletItem: item, marketData, currentVal, income, score: analysis.score };
  }).filter(item => item !== null);

  const totals = walletFullDataWithCalculations.reduce(
    (acc, item) => ({
      totalPatrimony: acc.totalPatrimony + item!.currentVal,
      totalIncome: acc.totalIncome + item!.income,
      weightedScoreSum: acc.weightedScoreSum + (item!.score * item!.currentVal),
    }),
    { totalPatrimony: 0, totalIncome: 0, weightedScoreSum: 0 }
  );

  const portfolioScore = totals.totalPatrimony > 0 ? Math.round(totals.weightedScoreSum / totals.totalPatrimony) : 0;

  if (loading) return <div className="min-h-screen flex items-center justify-center text-white">Carregando...</div>;

  return (
    <main className="min-h-screen p-6 md:p-10">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-2">Minha Carteira</h1>
        <p className="text-slate-400 text-sm mb-10">Acompanhamento consolidado dos seus ativos.</p>

        {/* Resumo Financeiro */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="glass-panel p-6 rounded-xl border-l-4 border-l-blue-500">
            <p className="text-xs text-slate-400 font-bold uppercase mb-1">Patrimônio Total</p>
            <h2 className="text-3xl font-bold text-white">R$ {totals.totalPatrimony.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</h2>
          </div>
          <div className="glass-panel p-6 rounded-xl border-l-4 border-l-emerald-500">
            <p className="text-xs text-slate-400 font-bold uppercase mb-1">Renda Mensal Est.</p>
            <h2 className="text-3xl font-bold text-white">R$ {totals.totalIncome.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</h2>
          </div>
          <div className="glass-panel p-6 rounded-xl border-l-4 border-l-amber-500">
            <p className="text-xs text-slate-400 font-bold uppercase mb-1">Qualidade da Carteira</p>
            <h2 className={`text-3xl font-bold ${portfolioScore > 70 ? 'text-emerald-400' : 'text-amber-400'}`}>{portfolioScore} <span className="text-sm text-slate-500 font-normal">/ 100</span></h2>
          </div>
        </div>

        {/* Seção de Aporte Inteligente */}
        <div className="glass-panel p-6 rounded-2xl mb-10 border border-blue-500/20 bg-blue-500/5">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-blue-600 p-2.5 rounded-lg text-white shadow-lg shadow-blue-500/20">
              <FaLightbulb />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Aporte Inteligente</h3>
              <p className="text-xs text-slate-400">Sugestão baseada nos 6 pilares e melhores oportunidades.</p>
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-4 items-end mb-8">
            <div className="flex-1 w-full">
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-2 ml-1">Valor do Aporte Mensal (R$)</label>
              <div className="relative">
                <FaCoins className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                <input 
                  type="number" 
                  placeholder="Ex: 1000,00"
                  value={investAmount}
                  onChange={(e) => setInvestAmount(e.target.value)}
                  className="w-full bg-[#0f172a] border border-slate-700 rounded-xl pl-11 pr-4 py-3 text-white font-bold focus:border-blue-500 outline-none transition-all"
                />
              </div>
            </div>
            <button 
              onClick={handleCalculateInvest}
              disabled={loadingInvest}
              className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-3.5 rounded-xl font-bold text-sm transition-all shadow-lg shadow-blue-500/20 disabled:opacity-50 w-full md:w-auto"
            >
              {loadingInvest ? "Calculando..." : "Sugerir Distribuição"}
            </button>
          </div>

          {suggestions.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 animate-enter">
              {suggestions.map(s => (
                <div key={s.ticker} className="bg-[#1e293b]/60 border border-slate-700/50 p-4 rounded-xl">
                  <div className="flex justify-between items-start mb-3">
                    <span className="font-bold text-blue-400">{s.ticker}</span>
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded font-bold">Score {s.score}</span>
                  </div>
                  <p className="text-xs text-white font-bold mb-1">{s.suggestedQty} cotas</p>
                  <p className="text-[10px] text-slate-500">Custo est: R$ {s.totalCost.toFixed(2)}</p>
                  {s.isInWallet && <span className="text-[9px] text-yellow-500 font-bold mt-2 block">Já na carteira</span>}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Listagem da Carteira */}
        <div className="flex flex-col gap-4">
          <h3 className="text-slate-400 font-bold text-xs uppercase tracking-widest mb-2 px-1">Detalhamento dos Ativos</h3>
          {walletFullDataWithCalculations.map(item => (
            <WalletRow key={item!.walletItem.ticker} walletItem={item!.walletItem} fiiData={item!.marketData} onRemove={handleRemove} />
          ))}
          {walletFullDataWithCalculations.length === 0 && (
            <div className="text-center py-20 text-slate-500 glass-panel rounded-xl">Sua carteira está vazia.</div>
          )}
        </div>
      </div>
    </main>
  );
}
