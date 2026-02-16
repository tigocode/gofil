'use client';

import { useState, useEffect, useRef } from 'react';
import { FiiData } from '@/src/data/mocks';
import { FaMagnifyingGlass, FaChevronRight, FaPlus } from "react-icons/fa6";

interface SearchFiiModalProps {
  onClose: () => void;
  onSelect: (fii: FiiData) => void;
}

export default function SearchFiiModal({ onClose, onSelect }: SearchFiiModalProps) {
  const [query, setQuery] = useState("");
  const [fiis, setFiis] = useState<FiiData[]>([]);
  const [pendingFiis, setPendingFiis] = useState<{ticker: string}[]>([]);
  const [loading, setLoading] = useState(true);
  const [addingToQueue, setAddingToQueue] = useState(false);
  const [queueMessage, setQueueMessage] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const loadData = async () => {
    try {
      const [fiisRes, queueRes] = await Promise.all([
        fetch('/api/fiis'),
        fetch('/api/queue')
      ]);
      const fiisData = await fiisRes.json();
      const queueData = await queueRes.json();
      
      if (Array.isArray(fiisData)) setFiis(fiisData);
      if (Array.isArray(queueData)) setPendingFiis(queueData);
    } catch (err) {
      console.error("Erro ao carregar dados:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    inputRef.current?.focus();
    loadData();
  }, []);

  const filtered = query === "" 
    ? [] 
    : fiis.filter(f => 
        f.ticker.includes(query.toUpperCase()) || 
        f.name.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 5);

  const handleAddToQueue = async () => {
    if (!query || query.length < 5) return;
    
    setAddingToQueue(true);
    setQueueMessage("");
    
    try {
      const res = await fetch('/api/queue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ticker: query.toUpperCase() })
      });
      
      const data = await res.json();
      if (res.ok) {
        setQueueMessage(`Sucesso! O ticker ${query.toUpperCase()} será processado na próxima busca.`);
        setQuery("");
        loadData(); // Recarregar a lista de pendentes
      } else {
        setQueueMessage(data.error || "Erro ao adicionar à fila.");
      }
    } catch (err) {
      setQueueMessage("Erro de conexão.");
    } finally {
      setAddingToQueue(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-20 px-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={onClose}></div>

      <div className="relative w-full max-w-lg bg-[#0f172a] border border-slate-700 rounded-xl shadow-2xl overflow-hidden animate-enter ring-1 ring-white/10">
        
        <div className="flex items-center gap-3 p-4 border-b border-slate-700/50 bg-[#1e293b]/50">
          <FaMagnifyingGlass className="text-slate-500" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Digite o Ticker (ex: HGLG11)..."
            className="flex-1 bg-transparent border-none outline-none text-white placeholder-slate-500 font-medium text-lg uppercase"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setQueueMessage("");
            }}
          />
          <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors">
            <span className="text-xs font-bold px-2 py-1 rounded border border-slate-600">ESC</span>
          </button>
        </div>

        <div className="max-h-[60vh] overflow-y-auto custom-scrollbar p-2">
          {loading ? (
            <div className="p-8 text-center text-slate-500 text-sm italic">Carregando base de dados...</div>
          ) : (
            <>
              {query !== "" && filtered.length === 0 && (
                <div className="p-6 text-center">
                  <p className="text-slate-400 text-sm mb-4">
                    Nenhum ativo encontrado para "{query.toUpperCase()}".
                  </p>
                  <button
                    onClick={handleAddToQueue}
                    disabled={addingToQueue || query.length < 5}
                    className="flex items-center gap-2 mx-auto bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg font-bold text-sm transition-all disabled:opacity-50"
                  >
                    <FaPlus size={14} />
                    {addingToQueue ? "Adicionando..." : `Cadastrar ${query.toUpperCase()} para Busca`}
                  </button>
                </div>
              )}

              {queueMessage && (
                <div className="p-4 mx-2 my-2 bg-green-500/10 border border-green-500/50 text-green-400 text-xs rounded-lg text-center">
                  {queueMessage}
                </div>
              )}

              {query === "" && !queueMessage && (
                <div className="p-4">
                  <div className="text-center text-slate-500 text-xs mb-6">
                    <p>Busque por um ticker para adicionar à sua carteira.</p>
                  </div>
                  
                  {pendingFiis.length > 0 && (
                    <div className="mt-4 border-t border-slate-700/50 pt-4">
                      <h5 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3 px-2">
                        Aguardando Extração ({pendingFiis.length})
                      </h5>
                      <div className="grid grid-cols-2 gap-2 px-2">
                        {pendingFiis.map(item => (
                          <div key={item.ticker} className="flex items-center gap-2 p-2 rounded bg-slate-800/50 border border-slate-700/50 text-slate-300 text-xs">
                            <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                            <span className="font-bold">{item.ticker}</span>
                            <span className="text-[10px] text-slate-500 italic ml-auto">Pendente</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {filtered.map(fii => (
                <button
                  key={fii.ticker}
                  onClick={() => { onSelect(fii); onClose(); }}
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
            </>
          )}
        </div>
      </div>
    </div>
  );
}
