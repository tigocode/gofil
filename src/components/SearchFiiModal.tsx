'use client';

import { useState, useEffect, useRef } from 'react';
import { MOCK_FIIS, FiiData } from '@/src/data/mocks';
import { FaMagnifyingGlass, FaChevronRight } from "react-icons/fa6";

interface SearchFiiModalProps {
  onClose: () => void;
  onSelect: (fii: FiiData) => void;
}

export default function SearchFiiModal({ onClose, onSelect }: SearchFiiModalProps) {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  // Focar no input assim que abrir
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Filtragem local dos dados Mockados
  const filtered = query === "" 
    ? [] // Não mostra nada se estiver vazio (ou mostre os Top 5 se preferir)
    : MOCK_FIIS.filter(f => 
        f.ticker.includes(query.toUpperCase()) || 
        f.name.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 5); // Limita a 5 resultados para não poluir

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-20 px-4">
      {/* Overlay Escuro */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={onClose}></div>

      {/* Caixa de Busca */}
      <div className="relative w-full max-w-lg bg-[#0f172a] border border-slate-700 rounded-xl shadow-2xl overflow-hidden animate-enter ring-1 ring-white/10">
        
        {/* Header da Busca */}
        <div className="flex items-center gap-3 p-4 border-b border-slate-700/50 bg-[#1e293b]/50">
          <FaMagnifyingGlass className="text-slate-500" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Digite o Ticker (ex: HGLG11)..."
            className="flex-1 bg-transparent border-none outline-none text-white placeholder-slate-500 font-medium text-lg uppercase"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors">
            <span className="text-xs font-bold px-2 py-1 rounded border border-slate-600">ESC</span>
          </button>
        </div>

        {/* Lista de Resultados */}
        <div className="max-h-[60vh] overflow-y-auto custom-scrollbar p-2">
          
          {query !== "" && filtered.length === 0 && (
            <div className="p-8 text-center text-slate-500 text-sm">
              Nenhum ativo encontrado para "{query}".
            </div>
          )}

          {query === "" && (
            <div className="p-8 text-center text-slate-500 text-xs">
              <p>Busque para adicionar à sua carteira.</p>
            </div>
          )}

          {filtered.map(fii => (
            <button
              key={fii.ticker}
              onClick={() => { onSelect(fii); onClose(); }} // Seleciona e fecha a busca
              className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-slate-800 transition-all group text-left mb-1"
            >
              <div className="flex items-center gap-3">
                 <div className="w-10 h-10 rounded bg-[#0b1121] border border-slate-700 flex items-center justify-center font-bold text-white text-xs shadow-sm group-hover:border-blue-500/50 group-hover:bg-blue-600 group-hover:text-white transition-all">
                    {fii.ticker.substring(0, 2)}
                 </div>
                 <div>
                    <h4 className="font-bold text-white group-hover:text-blue-400 transition-colors">{fii.ticker}</h4>
                    <p className="text-xs text-slate-500 truncate max-w-[200px]">{fii.name}</p>
                 </div>
              </div>
              <div className="flex items-center gap-3 text-right">
                 <div>
                    <span className="block text-xs font-bold text-slate-300">R$ {fii.price.toFixed(2)}</span>
                    <span className="block text-[10px] text-slate-500 uppercase">{fii.sector}</span>
                 </div>
                 <FaChevronRight className="text-slate-600 group-hover:text-blue-500" size={12} />
              </div>
            </button>
          ))}
        </div>

      </div>
    </div>
  );
}