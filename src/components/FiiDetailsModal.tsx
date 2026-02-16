"use client";

import { useState, useEffect } from "react";
import { FiiData, WalletItem } from "@/src/data/mocks";
import { analyzeFII } from "@/src/utils/fii-analyzer";
import {
  FaBuilding,
  FaWallet,
  FaCheck,
  FaTriangleExclamation,
  FaChartSimple,
  FaXmark,
  FaBan,
  FaFloppyDisk,
} from "react-icons/fa6";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";

// Registrando os componentes do Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface FiiDetailsModalProps {
  fii: FiiData;
  onClose: () => void;
  onUpdate?: () => void; // Callback para recarregar dados na página pai
}

export default function FiiDetailsModal({
  fii,
  onClose,
  onUpdate,
}: FiiDetailsModalProps) {
  const analysis = analyzeFII(fii);
  
  // --- ESTADOS PARA EDIÇÃO ---
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ qty: 0, price: 0 });
  const [walletItem, setWalletItem] = useState<WalletItem | null>(null);
  const [loadingWallet, setLoadingWallet] = useState(true);

  // Carregar dados da carteira para este FII específico
  useEffect(() => {
    const fetchWalletItem = async () => {
      try {
        const res = await fetch('/api/wallet');
        const data = await res.json();
        if (Array.isArray(data)) {
          const item = data.find((w: any) => w.ticker === fii.ticker);
          setWalletItem(item || null);
        }
      } catch (err) {
        console.error("Erro ao carregar item da carteira:", err);
      } finally {
        setLoadingWallet(false);
      }
    };
    fetchWalletItem();
  }, [fii.ticker]);

  const isInWallet = !!walletItem;

  // --- LÓGICA DE EDIÇÃO ---
  const handleStartEdit = () => {
    if (walletItem) {
      setFormData({ qty: walletItem.qty, price: walletItem.avg_price });
    } else {
      setFormData({ qty: 10, price: fii.price });
    }
    setIsEditing(true);
  };

  const handleSave = async () => {
    const newQty = Number(formData.qty);
    const newPrice = Number(formData.price);

    if (newQty <= 0 || newPrice <= 0) return;

    try {
      const res = await fetch('/api/wallet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ticker: fii.ticker,
          qty: newQty,
          avg_price: newPrice
        })
      });

      if (res.ok) {
        setWalletItem({ ticker: fii.ticker, qty: newQty, avg_price: newPrice });
        setIsEditing(false);
        if (onUpdate) onUpdate();
      } else {
        alert("Erro ao salvar na carteira.");
      }
    } catch (err) {
      alert("Erro de conexão ao salvar.");
    }
  };

  // --- CONFIGURAÇÃO GRÁFICO ---
  const chartData = {
    labels: ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"],
    datasets: [
      {
        data: fii.dividends,
        backgroundColor: "#3b82f6",
        borderRadius: 4,
        hoverBackgroundColor: "#60a5fa",
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: "#1e293b",
        titleColor: "#94a3b8",
        padding: 12,
        displayColors: false,
      },
    },
    scales: {
      x: { grid: { display: false }, ticks: { color: "#64748b", font: { size: 10 } } },
      y: { grid: { color: "#334155", drawBorder: false }, ticks: { color: "#64748b", font: { size: 10 } } },
    },
  };

  const getBarColor = (val: number, type: "pvp" | "dy") => {
    if (type === "pvp") return val > 1.2 || val < 0.7 ? "bg-red-500" : "bg-emerald-500";
    return val > 16 || val < 6 ? "bg-amber-500" : "bg-emerald-500";
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center md:p-4">
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      ></div>

      <div className="relative w-full max-w-5xl bg-[#0f172a] md:border border-slate-700 rounded-t-3xl md:rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col md:flex-row animate-enter h-[90vh] md:h-auto">
        <div className="w-full md:w-1/3 bg-[#1e293b]/50 md:border-r border-slate-700 flex flex-col shrink-0 transition-all">
          <div className="p-5 md:p-6 pb-2 md:pb-6 flex flex-col h-full">
            <div className="flex flex-row md:flex-col justify-between items-start md:items-stretch gap-4 mb-6 md:mb-0">
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  <span className="inline-flex items-center gap-1.5 text-[9px] md:text-[10px] font-bold text-blue-400 uppercase tracking-wider bg-blue-900/30 px-2 py-1 rounded border border-blue-500/20">
                    <FaBuilding size={9} /> {fii.sector}
                  </span>
                  {!loadingWallet && isInWallet && !isEditing && (
                    <span className="inline-flex items-center gap-1.5 text-[9px] md:text-[10px] font-bold text-yellow-400 uppercase tracking-wider bg-yellow-900/30 px-2 py-1 rounded border border-yellow-500/20">
                      <FaWallet size={9} /> Carteira
                    </span>
                  )}
                </div>

                <h2 className="text-3xl md:text-4xl font-bold text-white mb-2 md:mb-1 tracking-tighter leading-none">
                  {fii.ticker}
                </h2>
                <p className="text-slate-400 text-xs md:text-sm font-medium truncate max-w-[200px] md:max-w-none">
                  {fii.name}
                </p>
              </div>

              {!isEditing && (
                <div className="md:hidden flex flex-col items-end">
                  <div
                    className={`px-3 py-1.5 rounded-lg border bg-opacity-10 flex items-center gap-2 ${analysis.veredict.bg} ${analysis.veredict.color.replace("text-", "border-")}`}
                  >
                    <span className="text-lg">
                      {analysis.veredict.label === "Oportunidade" ? "👍" : analysis.veredict.label === "Cilada" ? "💣" : "👁️"}
                    </span>
                    <span className={`text-xs font-bold ${analysis.veredict.color}`}>
                      {analysis.veredict.label}
                    </span>
                  </div>
                  <div className="mt-3 text-right">
                    <span className="text-[10px] text-slate-500 uppercase font-bold mr-2">Score</span>
                    <span className={`font-bold ${analysis.score > 70 ? "text-emerald-400" : "text-amber-400"}`}>
                      {analysis.score}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {isEditing ? (
                <div className="mt-2 md:mt-6 flex-grow animate-enter flex flex-col">
                    <div className="bg-slate-800/50 border border-slate-700 p-4 rounded-xl space-y-5 mb-6">
                        <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-700 pb-2">
                            <FaWallet className="text-blue-500" /> 
                            {isInWallet ? 'Editar Posição' : 'Novo Aporte'}
                        </h3>
                        
                        <div>
                            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5">Quantidade de Cotas</label>
                            <input 
                                type="number" 
                                value={formData.qty}
                                onChange={(e) => setFormData({...formData, qty: Number(e.target.value)})}
                                className="w-full bg-[#0f172a] border border-slate-600 rounded-lg px-3 py-2.5 text-white font-bold focus:border-blue-500 focus:outline-none transition-colors"
                            />
                        </div>

                        <div>
                            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5">Preço Médio (R$)</label>
                            <input 
                                type="number" 
                                step="0.01"
                                value={formData.price}
                                onChange={(e) => setFormData({...formData, price: Number(e.target.value)})}
                                className="w-full bg-[#0f172a] border border-slate-600 rounded-lg px-3 py-2.5 text-white font-bold focus:border-blue-500 focus:outline-none transition-colors"
                            />
                        </div>
                    </div>

                    <div className="flex gap-3 mt-auto md:mt-4">
                        <button onClick={() => setIsEditing(false)} className="flex-1 bg-slate-700 hover:bg-slate-600 text-white py-3 rounded-xl text-xs md:text-sm font-bold flex items-center justify-center gap-2 transition-all">
                            <FaBan /> Cancelar
                        </button>
                        <button onClick={handleSave} className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white py-3 rounded-xl text-xs md:text-sm font-bold flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition-all">
                            <FaFloppyDisk /> Salvar
                        </button>
                    </div>
                </div>
            ) : (
                <>
                    <div className={`hidden md:block mt-8 mb-8 border p-6 rounded-2xl text-center shadow-lg relative overflow-hidden bg-opacity-10 ${analysis.veredict.bg} ${analysis.veredict.color.replace("text-", "border-")}`}>
                      <div className="relative z-10 flex flex-col items-center">
                        <div className="text-4xl mb-3">
                          {analysis.veredict.label === "Oportunidade" ? "👍" : analysis.veredict.label === "Cilada" ? "💣" : "👁️"}
                        </div>
                        <h3 className={`text-2xl font-bold ${analysis.veredict.color} tracking-tight`}>
                          {analysis.veredict.label}
                        </h3>
                        <p className="text-[10px] text-slate-400 mt-2 uppercase tracking-widest font-semibold opacity-70">
                          Veredito do Algoritmo
                        </p>
                      </div>
                    </div>

                    <div className="hidden md:block flex-grow space-y-3">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 block">Raio-X de Riscos</span>
                      {analysis.warnings.length === 0 ? (
                        <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-xl flex items-center gap-3">
                          <div className="bg-emerald-500/20 rounded-full p-1.5 text-emerald-400">
                            <FaCheck size={12} />
                          </div>
                          <span className="text-emerald-400 text-sm font-medium">Excelente! Nenhum ponto crítico.</span>
                        </div>
                      ) : (
                        analysis.warnings.map((w, idx) => (
                          <div key={idx} className="bg-red-500/10 border border-red-500/20 p-3 rounded-xl flex items-start gap-3">
                            <div className="bg-red-500/20 rounded-full p-1.5 mt-0.5 text-red-400 shrink-0">
                              <FaTriangleExclamation size={10} />
                            </div>
                            <div>
                              <p className="text-red-300 text-xs font-bold uppercase">{w.pillar}</p>
                              <p className="text-red-400/80 text-xs leading-snug">{w.msg}</p>
                            </div>
                          </div>
                        ))
                      )}
                    </div>

                    <div className="mt-auto px-5 pb-5 md:px-6 md:pb-6 pt-4 md:pt-6 md:border-t border-slate-700 space-y-4 md:space-y-3">
                        <button 
                            onClick={handleStartEdit}
                            disabled={loadingWallet}
                            className="w-full bg-blue-600 hover:bg-blue-500 text-white py-2.5 md:py-3 rounded-xl text-xs md:text-sm font-bold transition-all shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                          <FaWallet /> {isInWallet ? "Editar Posição" : "Adicionar à Carteira"}
                        </button>
                        <button
                          onClick={onClose}
                          className="w-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white py-2.5 md:py-3 rounded-xl text-xs md:text-sm font-bold transition-all"
                        >
                          Fechar
                        </button>
                    </div>
                </>
            )}
          </div>
        </div>

        <div className="md:w-2/3 p-8 bg-[#0b1121] overflow-y-auto custom-scrollbar">
          <div className="flex justify-between items-center mb-8 bg-[#1e293b]/40 p-4 rounded-xl border border-slate-700/50">
            <div className="flex items-center gap-3">
              <div className="bg-blue-500/20 p-2.5 rounded-lg text-blue-400">
                <FaChartSimple />
              </div>
              <h3 className="text-lg font-bold text-white">Análise dos 6 Pilares</h3>
            </div>
            <div className="text-right">
              <span className={`text-3xl font-bold block leading-none ${analysis.score > 70 ? "text-emerald-400" : "text-amber-400"}`}>
                {analysis.score}
              </span>
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Score Geral</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
            <div className="bg-[#1e293b]/60 p-4 rounded-xl border border-slate-700/50">
              <div className="flex justify-between mb-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase">1. Preço (P/VP)</span>
                <span className={`text-sm font-bold ${analysis.pvpStatus === "Justo" ? "text-emerald-400" : "text-amber-400"}`}>
                  {fii.pvp}x
                </span>
              </div>
              <div className="w-full bg-slate-700 h-1.5 rounded-full overflow-hidden mb-3">
                <div className={`h-full ${getBarColor(fii.pvp, "pvp")}`} style={{ width: `${Math.min(fii.pvp * 80, 100)}%` }}></div>
              </div>
              <p className="text-[11.4px] text-white-500">Ideal entre 0.85x e 1.05x</p>
            </div>

            <div className="bg-[#1e293b]/60 p-4 rounded-xl border border-slate-700/50">
              <div className="flex justify-between mb-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase">2. Yield (12m)</span>
                <span className="text-sm font-bold text-white">{fii.dy_12m}%</span>
              </div>
              <div className="w-full bg-slate-700 h-1.5 rounded-full overflow-hidden mb-3">
                <div className={`h-full ${getBarColor(fii.dy_12m, "dy")}`} style={{ width: `${Math.min(fii.dy_12m * 6, 100)}%` }}></div>
              </div>
              <p className="text-[11.4px] text-white-500">Alerta acima de 16%</p>
            </div>

            <div className="bg-[#1e293b]/60 p-4 rounded-xl border border-slate-700/50">
              <div className="flex justify-between items-center h-full">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase block mb-3">3. Vacância</span>
                  <p className="text-[11.4px] text-white-500">Física atual</p>
                </div>
                <span className={`text-xl font-bold ${fii.vacancy > 10 ? "text-red-400" : "text-emerald-400"}`}>{fii.vacancy}%</span>
              </div>
            </div>

            <div className="bg-[#1e293b]/60 p-4 rounded-xl border border-slate-700/50">
              <div className="flex justify-between items-center h-full">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase block mb-3">4. Liquidez</span>
                  <p className="text-[11.4px] text-white-500">Média diária</p>
                </div>
                <span className="text-xl font-bold text-white">R$ {(fii.liquidity / 1000).toFixed(0)}k</span>
              </div>
            </div>

            <div className="bg-[#1e293b]/60 p-4 rounded-xl border border-slate-700/50">
              <div className="flex justify-between items-center h-full">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase block mb-3">5. Portfólio</span>
                  <p className="text-[11.4px] text-white-500">Diversificação</p>
                </div>
                <span className="text-xl font-bold text-white">{fii.assets_count} <span className="text-xs text-slate-500 font-normal">Ativos</span></span>
              </div>
            </div>

            <div className="bg-[#1e293b]/60 p-4 rounded-xl border border-slate-700/50">
              <div className="flex justify-between items-center h-full">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase block mb-3">6. Estabilidade (CV)</span>
                  <p className="text-[11.4px] text-white-500">Var. Dividendos</p>
                </div>
                <span className={`text-xl font-bold ${analysis.cvStatus === "Instável" ? "text-red-400" : "text-emerald-400"}`}>{analysis.cvStatus}</span>
              </div>
            </div>
          </div>

          <div className="bg-[#1e293b]/40 p-6 rounded-2xl border border-slate-700/50">
            <h4 className="text-[12px] font-bold text-slate-400 uppercase tracking-widest mb-6">Histórico de Proventos (Últimos 12 meses)</h4>
            <div className="h-48 w-full">
              <Bar data={chartData} options={chartOptions} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
