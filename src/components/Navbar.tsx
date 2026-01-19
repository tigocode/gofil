'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FaMagnifyingGlass, FaPlus, FaChartLine, FaWallet, FaTrophy } from 'react-icons/fa6';

export default function Navbar() {
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  // Estilos Desktop
  const linkBaseStyle = "text-sm font-bold transition-all px-4 py-2 rounded-lg flex items-center gap-2";
  const activeStyle = "bg-slate-800 text-white shadow-inner";
  const inactiveStyle = "text-slate-400 hover:text-white hover:bg-slate-800/50";

  // Estilos Mobile (Bottom Bar)
  const mobileLinkBase = "flex flex-col items-center justify-center w-full h-full gap-1 pt-1";
  const mobileActive = "text-blue-500";
  const mobileInactive = "text-slate-500 hover:text-slate-300";

  return (
    <>
      {/* --- TOP BAR (Fixa no topo) --- */}
      <nav className="sticky top-0 z-50 w-full border-b border-slate-800 bg-[#0b1121]/95 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20 gap-4">
            
            {/* 1. LOGO (Esquerda) */}
            <Link href="/dashboard" className="flex items-center gap-3 shrink-0">
              <div className="w-9 h-9 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-blue-500/20">
                GO
              </div>
              {/* Texto "GO FIIs" some em telas muito pequenas para dar espaço à busca */}
              <span className="font-bold text-lg text-white tracking-tight hidden sm:block">
                GO FIIs
              </span>
            </Link>

            {/* 2. NAVEGAÇÃO DESKTOP (Centro - Some no Mobile) */}
            <div className="hidden md:flex items-center gap-1 absolute left-1/2 transform -translate-x-1/2">
              <Link href="/dashboard" className={`${linkBaseStyle} ${isActive('/dashboard') ? activeStyle : inactiveStyle}`}>
                Dashboard
              </Link>
              <Link href="/carteira" className={`${linkBaseStyle} ${isActive('/carteira') ? activeStyle : inactiveStyle}`}>
                Carteira
              </Link>
              <Link href="/ranking" className={`${linkBaseStyle} ${isActive('/ranking') ? activeStyle : inactiveStyle}`}>
                Ranking
              </Link>
            </div>

            {/* 3. AÇÕES (Direita - Busca e Botão Novo) */}
            <div className="flex items-center gap-3 flex-1 justify-end md:flex-none md:justify-start">
              
              {/* Barra de Busca (Agora visível no mobile, com largura flexível) */}
              <div className="relative w-full max-w-[140px] sm:max-w-[200px]">
                <FaMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-xs" />
                <input 
                  type="text" 
                  placeholder="Buscar..." 
                  className="w-full bg-[#1e293b] text-sm rounded-full pl-8 pr-3 py-1.5 border border-slate-700 focus:outline-none focus:border-blue-500 text-white placeholder-slate-500 transition-all shadow-inner"
                />
              </div>

              {/* Botão Novo FII (Icone apenas no mobile para economizar espaço) */}
              <button className="flex items-center justify-center gap-2 border border-slate-700 bg-slate-800/50 hover:bg-blue-600 hover:border-blue-500 text-slate-300 hover:text-white h-9 w-9 sm:w-auto sm:px-4 rounded-full text-xs font-bold transition-all shrink-0">
                <FaPlus className="text-blue-500 sm:text-inherit" />
                <span className="hidden sm:inline">Novo FII</span>
              </button>

            </div>

          </div>
        </div>
      </nav>

      {/* --- BOTTOM BAR (Navegação Mobile - Só aparece em telas pequenas) --- */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#0b1121] border-t border-slate-800 h-16 pb-safe">
        <div className="flex justify-around items-center h-full max-w-md mx-auto">
           
           <Link href="/dashboard" className={`${mobileLinkBase} ${isActive('/dashboard') ? mobileActive : mobileInactive}`}>
              <FaChartLine size={20} />
              <span className="text-[10px] font-medium">Dash</span>
           </Link>
           
           <Link href="/carteira" className={`${mobileLinkBase} ${isActive('/carteira') ? mobileActive : mobileInactive}`}>
              <FaWallet size={20} />
              <span className="text-[10px] font-medium">Carteira</span>
           </Link>
           
           <Link href="/ranking" className={`${mobileLinkBase} ${isActive('/ranking') ? mobileActive : mobileInactive}`}>
              <FaTrophy size={20} />
              <span className="text-[10px] font-medium">Ranking</span>
           </Link>

        </div>
      </div>
      
      {/* Espaçador para o conteúdo não ficar escondido atrás da Bottom Bar no mobile */}
      <div className="h-6 md:hidden"></div>
    </>
  );
}