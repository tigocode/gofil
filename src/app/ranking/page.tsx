'use client';

import { MOCK_FIIS } from "@/src/data/mocks";
import { analyzeFII } from "@/src/utils/fii-analyzer";
import { FaTrophy, FaMedal, FaSortDown } from "react-icons/fa6";

export default function RankingPage() {

  // 1. Processar e Ordenar os Dados
  const rankedFIIs = MOCK_FIIS.map(fii => {
    return { 
      ...fii, 
      analysis: analyzeFII(fii) 
    };
  }).sort((a, b) => b.analysis.score - a.analysis.score); // Ordena do maior Score para o menor

  // Função auxiliar para o ícone de Rank
  const getRankBadge = (index: number) => {
    if (index === 0) return <FaTrophy className="text-yellow-400 text-lg drop-shadow-md" />; // Ouro
    if (index === 1) return <FaMedal className="text-slate-300 text-lg drop-shadow-md" />;   // Prata
    if (index === 2) return <FaMedal className="text-amber-600 text-lg drop-shadow-md" />;    // Bronze
    return <span className="font-bold text-slate-500 text-sm">#{index + 1}</span>;
  };

  return (
    <main className="min-h-screen p-6 md:p-10">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
            <FaSortDown className="text-blue-500" />
            Ranking Geral
          </h1>
          <p className="text-slate-400 text-sm max-w-2xl">
            Os melhores ativos classificados automaticamente pelo nosso algoritmo de 6 pilares.
          </p>
        </div>

        {/* Tabela em Container Glass */}
        <div className="glass-panel rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              
              {/* Cabeçalho da Tabela */}
              <thead className="bg-[#0f172a]/80 text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-700">
                <tr>
                  <th className="p-5 pl-8 w-20 text-center">Rank</th>
                  <th className="p-5">Ativo</th>
                  <th className="p-5 hidden md:table-cell">Setor</th>
                  <th className="p-5">Preço</th>
                  <th className="p-5 hidden sm:table-cell">DY (12m)</th>
                  <th className="p-5 hidden lg:table-cell">P/VP</th>
                  <th className="p-5 hidden md:table-cell">Veredito</th>
                  <th className="p-5 pr-8 text-right">Score</th>
                </tr>
              </thead>

              {/* Corpo da Tabela */}
              <tbody className="text-sm divide-y divide-slate-700/50">
                {rankedFIIs.map((item, index) => {
                  
                  // Estilos Dinâmicos para Linha
                  const isTop3 = index < 3;
                  const rowBg = isTop3 ? 'bg-blue-500/5' : 'hover:bg-slate-800/40';
                  
                  // Cores de métricas
                  const dyColor = item.analysis.dyStatus === 'Risco Alto' ? 'text-red-400' : 'text-emerald-400';
                  const pvpColor = item.analysis.pvpStatus === 'Justo' ? 'text-emerald-400' : 'text-amber-400';
                  
                  // Cor do Score
                  let scoreColor = 'text-red-500';
                  if (item.analysis.score > 70) scoreColor = 'text-emerald-400';
                  else if (item.analysis.score > 40) scoreColor = 'text-amber-400';

                  return (
                    <tr key={item.ticker} className={`transition-colors cursor-pointer group ${rowBg}`}>
                      
                      {/* Coluna 1: Rank (Ícone ou Número) */}
                      <td className="p-5 pl-8 text-center">
                        <div className="flex justify-center items-center h-full">
                          {getRankBadge(index)}
                        </div>
                      </td>

                      {/* Coluna 2: Ticker e Nome */}
                      <td className="p-5">
                        <div className="flex items-center gap-3">
                           <div className="w-10 h-10 rounded bg-[#0b1121] border border-slate-700 flex items-center justify-center font-bold text-slate-200 text-xs shadow-sm group-hover:border-blue-500/50 transition-colors">
                              {item.ticker.substring(0, 2)}
                           </div>
                           <div>
                              <p className="font-bold text-white text-base leading-none">{item.ticker}</p>
                              <p className="text-slate-500 text-xs mt-1 truncate max-w-[120px]">{item.name}</p>
                           </div>
                        </div>
                      </td>

                      {/* Coluna 3: Setor */}
                      <td className="p-5 hidden md:table-cell">
                        <span className="text-[10px] font-bold text-slate-300 uppercase tracking-wider bg-slate-800 px-2 py-1 rounded border border-slate-700">
                          {item.sector}
                        </span>
                      </td>

                      {/* Coluna 4: Preço */}
                      <td className="p-5 font-semibold text-slate-200">
                        R$ {item.price.toFixed(2)}
                      </td>

                      {/* Coluna 5: DY */}
                      <td className={`p-5 font-bold ${dyColor} hidden sm:table-cell`}>
                        {item.dy_12m}%
                      </td>

                      {/* Coluna 6: P/VP */}
                      <td className={`p-5 font-bold ${pvpColor} hidden lg:table-cell`}>
                        {item.pvp}
                      </td>

                      {/* Coluna 7: Veredito (Pílula) */}
                      <td className="p-5 hidden md:table-cell">
                        <span className={`text-[10px] px-2 py-1 rounded font-bold uppercase tracking-wide border border-opacity-30 ${item.analysis.veredict.color.replace('text-', 'border-')} ${item.analysis.veredict.color} bg-opacity-10 bg-slate-500 whitespace-nowrap`}>
                          {item.analysis.veredict.label}
                        </span>
                      </td>

                      {/* Coluna 8: Score Final */}
                      <td className="p-5 pr-8 text-right">
                        <span className={`text-xl font-bold ${scoreColor}`}>
                          {item.analysis.score}
                        </span>
                      </td>

                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </main>
  );
}