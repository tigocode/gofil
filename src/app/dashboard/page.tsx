'use client';

import { useState, useEffect } from 'react';
import { FiiData } from '@/src/data/mocks';
import FiiCard from '@/src/components/FiiCard';
import FiiDetailsModal from '@/src/components/FiiDetailsModal';
import { FaLayerGroup, FaClock } from "react-icons/fa6"; 

const FILTERS = ["Todos", "Logística", "Shopping", "Papel", "Energia", "Híbrido"];

export default function DashboardPage() {
  const [activeFilter, setActiveFilter] = useState("Todos");
  const [searchText, setSearchText] = useState("");
  const [marketFiis, setMarketFiis] = useState<FiiData[]>([]);
  const [lastUpdate, setLastUpdate] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedFii, setSelectedFii] = useState<FiiData | null>(null);

  const loadData = async () => {
    try {
      const res = await fetch('/api/fiis');
      const data = await res.json();
      
      // Lidar com o novo formato da API { fiis, lastUpdate }
      if (data.fiis && Array.isArray(data.fiis)) {
        setMarketFiis(data.fiis);
        setLastUpdate(data.lastUpdate);
      } else if (Array.isArray(data)) {
        // Fallback para o formato antigo
        setMarketFiis(data);
      }
    } catch (err) {
      console.error("Erro ao carregar FIIs:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredFiis = marketFiis.filter(fii => {
    const matchesFilter = activeFilter === "Todos" || fii.sector === activeFilter;
    const matchesSearch = fii.ticker.includes(searchText.toUpperCase()) || fii.name.toLowerCase().includes(searchText.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "---";
    const date = new Date(dateStr);
    return date.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <main className="min-h-screen p-6 md:p-10">
      {selectedFii && (
        <FiiDetailsModal 
          fii={selectedFii} 
          onClose={() => setSelectedFii(null)} 
          onUpdate={loadData}
        />
      )}

      <div className="max-w-7xl mx-auto">
        <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
              Análise de FIIs <span className="text-blue-500">6 Pilares</span>
            </h1>
            <p className="text-slate-400 text-sm max-w-2xl flex items-center gap-2 mt-3">
              <FaLayerGroup className="text-blue-500"/>
              Algoritmo que analisa P/VP, Yield, Vacância, Liquidez, Diversificação e Consistência.
            </p>
          </div>
          
          {lastUpdate && (
            <div className="flex items-center gap-2 text-[10px] text-slate-500 bg-slate-800/30 px-3 py-1.5 rounded-full border border-slate-700/50">
              <FaClock className="text-blue-500/70" />
              <span>Última extração: <strong>{formatDate(lastUpdate)}</strong></span>
            </div>
          )}
        </div>

        <div className="flex flex-col md:flex-row gap-6 mb-10 justify-between items-start md:items-center">
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide w-full md:w-auto">
            {FILTERS.map(filter => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all border whitespace-nowrap ${
                  activeFilter === filter
                    ? 'bg-slate-700 text-white border-slate-600 shadow-lg'
                    : 'bg-transparent text-slate-400 border-slate-700/50 hover:bg-slate-800 hover:text-white'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
          
          <div className="relative w-full md:w-64">
            <input 
              type="text"
              placeholder="Buscar FII..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="w-full bg-[#1e293b] border border-slate-700 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        {loading ? (
          <div className="text-center py-20 text-slate-500 animate-pulse">Carregando ativos...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredFiis.length > 0 ? (
              filteredFiis.map(fii => (
                <FiiCard 
                  key={fii.ticker} 
                  data={fii} 
                  onClick={() => setSelectedFii(fii)} 
                />
              ))
            ) : (
              <div className="col-span-full text-center text-slate-500 py-20">
                Nenhum ativo encontrado.
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
