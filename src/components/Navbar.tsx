'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { FaMagnifyingGlass, FaPlus, FaChartLine, FaWallet, FaTrophy } from 'react-icons/fa6';
import SearchFiiModal from './SearchFiiModal';
import FiiDetailsModal from './FiiDetailsModal';
import { FiiData } from '@/src/data/mocks';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const isActive = (path: string) => pathname === path;

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [selectedFii, setSelectedFii] = useState<FiiData | null>(null);

  const linkBaseStyle = "text-sm font-bold transition-all px-4 py-2 rounded-lg flex items-center gap-2";
  const activeStyle = "bg-slate-800 text-white shadow-inner";
  const inactiveStyle = "text-slate-400 hover:text-white hover:bg-slate-800/50";

  const mobileLinkBase = "flex flex-col items-center justify-center w-full h-full gap-1 pt-1";
  const mobileActive = "text-blue-500";
  const mobileInactive = "text-slate-500 hover:text-slate-300";

  const handleUpdate = () => {
    // Forçar atualização da página atual para refletir mudanças na carteira
    router.refresh();
  };

  return (
    <>
      {isSearchOpen && (
        <SearchFiiModal 
          onClose={() => setIsSearchOpen(false)} 
          onSelect={(fii) => setSelectedFii(fii)}
        />
      )}

      {selectedFii && (
        <FiiDetailsModal 
          fii={selectedFii} 
          onClose={() => setSelectedFii(null)} 
          onUpdate={handleUpdate}
        />
      )}

      <nav className="sticky top-0 z-40 w-full border-b border-slate-800 bg-[#0b1121]/95 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-4">
            
            <Link href="/dashboard" className="flex items-center gap-3 shrink-0">
              <div className="w-9 h-9 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-blue-500/20">
                GO
              </div>
              <span className="font-bold text-lg text-white tracking-tight hidden sm:block">
                GO FIIs
              </span>
            </Link>

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

            <div className="flex items-center gap-2 sm:gap-3 flex-1 justify-end md:flex-none md:justify-start min-w-0">
              <div 
                className="relative flex-1 max-w-[180px] md:max-w-[220px] cursor-pointer group"
                onClick={() => setIsSearchOpen(true)}
              >
                <FaMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-xs group-hover:text-blue-500 transition-colors" />
                <div className="w-full bg-[#1e293b] text-sm rounded-full pl-8 pr-3 py-1.5 border border-slate-700 text-slate-400 group-hover:border-blue-500 group-hover:text-white transition-all shadow-inner truncate select-none">
                   Buscar...
                </div>
              </div>

              <button 
                onClick={() => setIsSearchOpen(true)}
                className="flex items-center justify-center gap-2 border border-slate-700 bg-slate-800/50 hover:bg-blue-600 hover:border-blue-500 text-slate-300 hover:text-white h-8 w-8 sm:h-9 sm:w-auto sm:px-4 rounded-full text-xs font-bold transition-all shrink-0"
              >
                <FaPlus className="text-blue-500 sm:text-inherit" />
                <span className="hidden sm:inline">Novo</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0b1121] border-t border-slate-800 h-16 pb-safe">
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
      
      <div className="h-16 md:hidden"></div>
    </>
  );
}
