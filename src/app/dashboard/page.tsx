'use client';

import { useState } from 'react';
import { MOCK_FIIS, FiiData } from '@/src/data/mocks'; // Atenção ao caminho @/src/
import FiiCard from '@/src/components/FiiCard';
import FiiDetailsModal from '@/src/components/FiiDetailsModal'; // Importando o Modal
import { FaLayerGroup } from "react-icons/fa6"; 

const FILTERS = ["Todos", "Logística", "Shopping", "Papel", "Energia", "Híbrido"];

export default function DashboardPage() {
  const [activeFilter, setActiveFilter] = useState("Todos");
  const [searchText, setSearchText] = useState("");
  
  // 1. ESTADO PARA CONTROLAR O MODAL
  const [selectedFii, setSelectedFii] = useState<FiiData | null>(null);

  const filteredFiis = MOCK_FIIS.filter(fii => {
    const matchesFilter = activeFilter === "Todos" || fii.sector === activeFilter;
    const matchesSearch = fii.ticker.includes(searchText.toUpperCase()) || fii.name.toLowerCase().includes(searchText.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <main className="min-h-screen p-6 md:p-10">
      
      {/* 2. RENDERIZA O MODAL SE TIVER UM FII SELECIONADO */}
      {selectedFii && (
        <FiiDetailsModal 
          fii={selectedFii} 
          onClose={() => setSelectedFii(null)} 
        />
      )}

      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
            Análise de FIIs <span className="text-blue-500">6 Pilares</span>
          </h1>
          <p className="text-slate-400 text-sm max-w-2xl flex items-center gap-2 mt-3">
            <FaLayerGroup className="text-blue-500"/>
            Algoritmo que analisa P/VP, Yield, Vacância, Liquidez, Diversificação e Consistência.
          </p>
        </div>

        {/* Filtros */}
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
        </div>

        {/* Grid de Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredFiis.length > 0 ? (
            filteredFiis.map(fii => (
              <FiiCard 
                key={fii.ticker} 
                data={fii} 
                // 3. AQUI ESTÁ O SEGREDO: PASSANDO A FUNÇÃO DE ABRIR
                onClick={() => setSelectedFii(fii)} 
              />
            ))
          ) : (
            <div className="col-span-full text-center text-slate-500 py-20">
              Nenhum ativo encontrado.
            </div>
          )}
        </div>

      </div>
    </main>
  );
}