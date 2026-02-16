'use client';

import { useState, useEffect } from 'react';
import { FiiData } from "@/src/data/mocks";
import { analyzeFII } from "@/src/utils/fii-analyzer";
import { FaBuilding, FaBomb, FaThumbsUp, FaEye, FaStar } from "react-icons/fa6";

interface FiiCardProps {
  data: FiiData & { vpa?: number };
  onClick?: () => void; 
}

export default function FiiCard({ data, onClick }: FiiCardProps) {
  const [isInWallet, setIsInWallet] = useState(false);
  const analysis = analyzeFII(data);

  useEffect(() => {
    const checkWallet = async () => {
      try {
        const res = await fetch('/api/wallet');
        const wallet = await res.json();
        if (Array.isArray(wallet)) {
          setIsInWallet(wallet.some(item => item.ticker === data.ticker));
        }
      } catch (err) {
        console.error("Erro ao verificar carteira no card:", err);
      }
    };
    checkWallet();
  }, [data.ticker]);

  const dyColor = analysis.dyStatus === "Risco Alto" ? "text-red-400" : "text-emerald-400";
  const pvpColor = analysis.pvpStatus === "Justo" ? "text-emerald-400" : analysis.pvpStatus === "Caro" ? "text-red-400" : "text-amber-400";
  
  let scoreBarColor = "bg-red-500";
  if (analysis.score > 70) scoreBarColor = "bg-emerald-500";
  else if (analysis.score > 40) scoreBarColor = "bg-amber-500";

  const getVeredictIcon = () => {
    if (analysis.veredict.label === "Oportunidade") return <FaThumbsUp />;
    if (analysis.veredict.label === "Cilada") return <FaBomb />;
    return <FaEye />;
  };

  const borderColor = analysis.veredict.color.replace("text-", "border-");

  return (
    <div 
      onClick={onClick} 
      className="glass-panel rounded-xl p-5 hover:border-slate-500 transition-all duration-300 cursor-pointer group relative flex flex-col h-full hover:-translate-y-1 bg-[#151e32]"
    >
      
      {/* Badge de Carteira */}
      {isInWallet && (
        <div className="absolute top-0 left-0 z-20 bg-yellow-500/20 text-yellow-400 text-[10px] font-bold px-3 py-1.5 rounded-br-xl rounded-tl-lg border-r border-b border-yellow-500/30 flex items-center gap-1.5 backdrop-blur-sm shadow-[0_0_10px_rgba(234,179,8,0.2)]">
          <FaStar className="text-xs" />
          <span>NA CARTEIRA</span>
        </div>
      )}

      {/* Cabeçalho */}
      <div className="flex justify-between items-start mb-10 relative z-10 top-6">
        <div>
          <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-blue-400 uppercase tracking-wider bg-blue-900/30 px-2 py-1 rounded mb-4 border border-blue-500/20">
            <FaBuilding className="text-[9px]" />
            {data.sector}
          </span>
          <h3 className="text-2xl font-bold text-white tracking-tight leading-none mb-3">
            {data.ticker}
          </h3>
          <p className="text-xs text-slate-400 font-medium mt-1">{data.name}</p>
        </div>

        <div className={`px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wide flex items-center gap-1.5 border border-opacity-40 bg-opacity-10 ${borderColor} ${analysis.veredict.color}`}>
          {getVeredictIcon()}
          {analysis.veredict.label}
        </div>
      </div>

      {/* DADOS */}
      <div className="grid grid-cols-2 gap-y-5 gap-x-4 mb-6 relative z-10">
        <div>
          <p className="text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-1">Preço</p>
          <p className="font-semibold text-sm text-slate-100">R$ {data.price.toFixed(2)}</p>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-1">VPA</p>
          <p className="font-semibold text-sm text-slate-100">R$ {(data.vpa || 0).toFixed(2)}</p>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-1">P/VP</p>
          <p className={`font-semibold text-sm ${pvpColor}`}>{data.pvp}</p>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-1">DY (12m)</p>
          <p className={`font-semibold text-sm ${dyColor}`}>{data.dy_12m}%</p>
        </div>
      </div>

      {/* FOOTER */}
      <div className="mt-auto pt-4 border-t border-slate-700/50 relative z-10">
        <div className="flex justify-between items-center text-xs mb-2 gap-2">
          <span className="text-slate-500 font-bold uppercase tracking-wide text-[10px]">Score GO FIIs</span>
          <div className="flex-grow h-1.5 bg-slate-800 rounded-full overflow-hidden mx-2">
            <div
              className={`h-full ${scoreBarColor} shadow-[0_0_10px_rgba(0,0,0,0.5)]`}
              style={{ width: `${Math.max(5, analysis.score)}%` }}
            ></div>
          </div>
          <span className="font-bold text-white">{analysis.score}</span>
        </div>
      </div>
    </div>
  );
}
