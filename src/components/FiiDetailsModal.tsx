"use client";

import { FiiData, MOCK_WALLET } from "@/src/data/mocks";
import { analyzeFII } from "@/src/utils/fii-analyzer";
import {
  FaBuilding,
  FaWallet,
  FaXmark,
  FaCheck,
  FaTriangleExclamation,
  FaChartSimple,
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
  Legend,
);

interface FiiDetailsModalProps {
  fii: FiiData;
  onClose: () => void;
}

export default function FiiDetailsModal({
  fii,
  onClose,
}: FiiDetailsModalProps) {
  const analysis = analyzeFII(fii);
  const isInWallet = MOCK_WALLET.some((w) => w.ticker === fii.ticker);

  // Configuração do Gráfico
  const chartData = {
    labels: [
      "Jan",
      "Fev",
      "Mar",
      "Abr",
      "Mai",
      "Jun",
      "Jul",
      "Ago",
      "Set",
      "Out",
      "Nov",
      "Dez",
    ],
    datasets: [
      {
        data: fii.dividends,
        backgroundColor: "#3b82f6", // Azul
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
      x: {
        grid: { display: false },
        ticks: { color: "#64748b", font: { size: 10 } },
      },
      y: {
        grid: { color: "#334155", drawBorder: false },
        ticks: { color: "#64748b", font: { size: 10 } },
      },
    },
  };

  // Cores dinâmicas para as barras de progresso
  const getBarColor = (val: number, type: "pvp" | "dy") => {
    if (type === "pvp")
      return val > 1.2 || val < 0.7 ? "bg-red-500" : "bg-emerald-500";
    return val > 16 || val < 6 ? "bg-amber-500" : "bg-emerald-500";
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Overlay Escuro (Fundo) */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      ></div>

      {/* Container Principal do Modal */}
      <div className="relative w-full max-w-5xl bg-[#0f172a] border border-slate-700 rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col md:flex-row animate-enter">
        
        {/* === COLUNA ESQUERDA (SIDEBAR / HEADER NO MOBILE) === */}
        <div className="w-full md:w-1/3 bg-[#1e293b]/50 md:border-r border-slate-700 flex flex-col shrink-0">
          {/* Container Superior (Padding ajustado para mobile/desktop) */}
          <div className="p-5 md:p-6 pb-2 md:pb-6">
            {/* 1. HEADER DO ATIVO (Flex row no mobile para economizar altura) */}
            <div className="flex flex-row md:flex-col justify-between items-start md:items-stretch gap-4">
              <div>
                {/* Badges */}
                <div className="flex flex-wrap items-center gap-2 mb-3 md:mb-3">
                  <span className="inline-flex items-center gap-1.5 text-[9px] md:text-[10px] font-bold text-blue-400 uppercase tracking-wider bg-blue-900/30 px-2 py-1 rounded border border-blue-500/20">
                    <FaBuilding size={9} /> {fii.sector}
                  </span>
                  {isInWallet && (
                    <span className="inline-flex items-center gap-1.5 text-[9px] md:text-[10px] font-bold text-yellow-400 uppercase tracking-wider bg-yellow-900/30 px-2 py-1 rounded border border-yellow-500/20">
                      <FaWallet size={9} /> Carteira
                    </span>
                  )}
                </div>

                {/* Ticker e Nome */}
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 md:mb-1 tracking-tighter leading-none">
                  {fii.ticker}
                </h2>
                <p className="text-slate-400 text-xs md:text-sm font-medium truncate max-w-[200px] md:max-w-none">
                  {fii.name}
                </p>
              </div>

              {/* 2. VEREDITO MOBILE (Só aparece no celular - Compacto) */}
              <div className="md:hidden flex flex-col items-end">
                <div
                  className={`px-3 py-1.5 rounded-lg border bg-opacity-10 flex items-center gap-2 ${analysis.veredict.bg} ${analysis.veredict.color.replace("text-", "border-")}`}
                >
                  <span className="text-lg">
                    {analysis.veredict.label === "Oportunidade"
                      ? "👍"
                      : analysis.veredict.label === "Cilada"
                        ? "💣"
                        : "👁️"}
                  </span>
                  <span
                    className={`text-xs font-bold ${analysis.veredict.color}`}
                  >
                    {analysis.veredict.label}
                  </span>
                </div>
                {/* Score Resumido Mobile */}
                <div className="mt-4 text-right">
                  <span className="text-[10px] text-slate-500 uppercase font-bold mr-2">
                    Score
                  </span>
                  <span
                    className={`font-bold ${analysis.score > 70 ? "text-emerald-400" : "text-amber-400"}`}
                  >
                    {analysis.score}
                  </span>
                </div>
              </div>
            </div>

            {/* 3. VEREDITO DESKTOP (Grande - Só aparece no Desktop) */}
            <div
              className={`hidden md:block mt-8 mb-8 border p-6 rounded-2xl text-center shadow-lg relative overflow-hidden bg-opacity-10 ${analysis.veredict.bg} ${analysis.veredict.color.replace("text-", "border-")}`}
            >
              <div className="relative z-10 flex flex-col items-center">
                <div className="text-4xl mb-3">
                  {analysis.veredict.label === "Oportunidade"
                    ? "👍"
                    : analysis.veredict.label === "Cilada"
                      ? "💣"
                      : "👁️"}
                </div>
                <h3
                  className={`text-2xl font-bold ${analysis.veredict.color} tracking-tight`}
                >
                  {analysis.veredict.label}
                </h3>
                <p className="text-[10px] text-slate-400 mt-2 uppercase tracking-widest font-semibold opacity-70">
                  Veredito do Algoritmo
                </p>
              </div>
            </div>

            {/* 4. RAIO-X DE RISCOS (Escondido no Mobile para economizar espaço, Visível Desktop) */}
            <div className="hidden md:block flex-grow space-y-3">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 block">
                Raio-X de Riscos
              </span>
              {analysis.warnings.length === 0 ? (
                <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-xl flex items-center gap-3">
                  <div className="bg-emerald-500/20 rounded-full p-1.5 text-emerald-400">
                    <FaCheck size={12} />
                  </div>
                  <span className="text-emerald-400 text-sm font-medium">
                    Excelente! Nenhum ponto crítico.
                  </span>
                </div>
              ) : (
                analysis.warnings.map((w, idx) => (
                  <div
                    key={idx}
                    className="bg-red-500/10 border border-red-500/20 p-3 rounded-xl flex items-start gap-3"
                  >
                    <div className="bg-red-500/20 rounded-full p-1.5 mt-0.5 text-red-400 shrink-0">
                      <FaTriangleExclamation size={10} />
                    </div>
                    <div>
                      <p className="text-red-300 text-xs font-bold uppercase">
                        {w.pillar}
                      </p>
                      <p className="text-red-400/80 text-xs leading-snug">
                        {w.msg}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* 5. BOTÕES DE AÇÃO (Fixo no Desktop, Compacto no Mobile) */}
          <div className="mt-auto px-5 pb-5 md:px-6 md:pb-6 pt-0 md:pt-6 md:border-t border-slate-700 space-y-4 md:space-y-3">
            <button className="w-full bg-blue-600 hover:bg-blue-500 text-white py-2.5 md:py-3 rounded-xl text-xs md:text-sm font-bold transition-all shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2">
              <FaWallet />{" "}
              {isInWallet ? "Editar Posição" : "Adicionar à Carteira"}
            </button>
            <button
              onClick={onClose}
              className="w-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white py-2.5 md:py-3 rounded-xl text-xs md:text-sm font-bold transition-all"
            >
              Fechar
            </button>
          </div>
        </div>

        {/* === COLUNA DIREITA (CONTEÚDO) === */}
        <div className="md:w-2/3 p-8 bg-[#0b1121] overflow-y-auto custom-scrollbar">
          {/* Header Score */}
          <div className="flex justify-between items-center mb-8 bg-[#1e293b]/40 p-4 rounded-xl border border-slate-700/50">
            <div className="flex items-center gap-3">
              <div className="bg-blue-500/20 p-2.5 rounded-lg text-blue-400">
                <FaChartSimple />
              </div>
              <h3 className="text-lg font-bold text-white">
                Análise dos 6 Pilares
              </h3>
            </div>
            <div className="text-right">
              <span
                className={`text-3xl font-bold block leading-none ${analysis.score > 70 ? "text-emerald-400" : "text-amber-400"}`}
              >
                {analysis.score}
              </span>
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                Score Geral
              </span>
            </div>
          </div>

          {/* GRID DE 6 CARDS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
            {/* 1. Preço */}
            <div className="bg-[#1e293b]/60 p-4 rounded-xl border border-slate-700/50">
              <div className="flex justify-between mb-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase">
                  1. Preço (P/VP)
                </span>
                <span
                  className={`text-sm font-bold ${analysis.pvpStatus === "Justo" ? "text-emerald-400" : "text-amber-400"}`}
                >
                  {fii.pvp}x
                </span>
              </div>
              <div className="w-full bg-slate-700 h-1.5 rounded-full overflow-hidden mb-3">
                <div
                  className={`h-full ${getBarColor(fii.pvp, "pvp")}`}
                  style={{ width: `${Math.min(fii.pvp * 80, 100)}%` }}
                ></div>
              </div>
              <p className="text-[11.4px] text-white-500">
                Ideal entre 0.85x e 1.05x
              </p>
            </div>

            {/* 2. Yield */}
            <div className="bg-[#1e293b]/60 p-4 rounded-xl border border-slate-700/50">
              <div className="flex justify-between mb-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase">
                  2. Yield (12m)
                </span>
                <span className="text-sm font-bold text-white">
                  {fii.dy_12m}%
                </span>
              </div>
              <div className="w-full bg-slate-700 h-1.5 rounded-full overflow-hidden mb-3">
                <div
                  className={`h-full ${getBarColor(fii.dy_12m, "dy")}`}
                  style={{ width: `${Math.min(fii.dy_12m * 6, 100)}%` }}
                ></div>
              </div>
              <p className="text-[11.4px] text-white-500">
                Alerta acima de 16%
              </p>
            </div>

            {/* 3. Vacância */}
            <div className="bg-[#1e293b]/60 p-4 rounded-xl border border-slate-700/50">
              <div className="flex justify-between items-center h-full">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase block mb-3">
                    3. Vacância
                  </span>
                  <p className="text-[11.4px] text-white-500">Física atual</p>
                </div>
                <span
                  className={`text-xl font-bold ${fii.vacancy > 10 ? "text-red-400" : "text-emerald-400"}`}
                >
                  {fii.vacancy}%
                </span>
              </div>
            </div>

            {/* 4. Liquidez */}
            <div className="bg-[#1e293b]/60 p-4 rounded-xl border border-slate-700/50">
              <div className="flex justify-between items-center h-full">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase block mb-3">
                    4. Liquidez
                  </span>
                  <p className="text-[11.4px] text-white-500">Média diária</p>
                </div>
                <span className="text-xl font-bold text-white">
                  R$ {(fii.liquidity / 1000).toFixed(0)}k
                </span>
              </div>
            </div>

            {/* 5. Portfólio */}
            <div className="bg-[#1e293b]/60 p-4 rounded-xl border border-slate-700/50">
              <div className="flex justify-between items-center h-full">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase block mb-3">
                    5. Portfólio
                  </span>
                  <p className="text-[11.4px] text-white-500">Diversificação</p>
                </div>
                <span className="text-xl font-bold text-white">
                  {fii.assets_count}{" "}
                  <span className="text-xs text-slate-500 font-normal">
                    Ativos
                  </span>
                </span>
              </div>
            </div>

            {/* 6. Estabilidade */}
            <div className="bg-[#1e293b]/60 p-4 rounded-xl border border-slate-700/50">
              <div className="flex justify-between items-center h-full">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase block mb-3">
                    6. Estabilidade (CV)
                  </span>
                  <p className="text-[11.4px] text-white-500">
                    Var. Dividendos
                  </p>
                </div>
                <span
                  className={`text-xl font-bold ${analysis.cvStatus === "Instável" ? "text-red-400" : "text-emerald-400"}`}
                >
                  Estável
                </span>
              </div>
            </div>
          </div>

          {/* Gráfico */}
          <div className="bg-[#1e293b]/40 p-6 rounded-2xl border border-slate-700/50">
            <h4 className="text-[12px] font-bold text-slate-400 uppercase tracking-widest mb-6">
              Histórico de Proventos (Últimos 12 meses)
            </h4>
            <div className="h-48 w-full">
              <Bar data={chartData} options={chartOptions} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
