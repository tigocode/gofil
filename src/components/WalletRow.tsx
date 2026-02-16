import { FiiData, WalletItem } from "@/src/data/mocks";
import { analyzeFII } from "@/src/utils/fii-analyzer";
import { FaArrowTrendUp, FaArrowTrendDown, FaWallet, FaTrashCan } from "react-icons/fa6";

interface WalletRowProps {
  walletItem: WalletItem;
  fiiData: FiiData;
  onRemove?: (ticker: string) => void;
}

export default function WalletRow({ walletItem, fiiData, onRemove }: WalletRowProps) {
  const analysis = analyzeFII(fiiData);

  // Cálculos Financeiros
  const currentTotal = walletItem.qty * fiiData.price;
  const costTotal = walletItem.qty * walletItem.avg_price;
  const resultValue = currentTotal - costTotal;
  const resultPercent = ((fiiData.price - walletItem.avg_price) / walletItem.avg_price) * 100;
  
  // O último dividendo mockado (pegamos o último do array)
  const lastDividend = fiiData.dividends[fiiData.dividends.length - 1];
  const monthlyIncome = walletItem.qty * lastDividend;

  // Estilos Condicionais
  const isProfit = resultValue >= 0;
  const resultColor = isProfit ? "text-emerald-400" : "text-red-400";
  const IconTrend = isProfit ? FaArrowTrendUp : FaArrowTrendDown;

  return (
    <div className="glass-panel rounded-xl p-5 mb-4 flex flex-col lg:flex-row items-center justify-between gap-6 hover:bg-slate-800/60 transition-all border-l-4 border-l-transparent hover:border-l-blue-500 group">
      
      {/* 1. Identificação do Ativo */}
      <div className="flex items-center gap-4 w-full lg:w-1/4">
        <div className="w-12 h-12 rounded-lg bg-[#0b1121] flex items-center justify-center border border-slate-700 font-bold text-white shadow-lg">
          {fiiData.ticker.substring(0, 2)}
        </div>
        <div>
          <h3 className="font-bold text-lg text-white leading-tight">{fiiData.ticker}</h3>
          <div className="flex items-center gap-2 mt-1">
             <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase border border-opacity-30 ${analysis.veredict.color.replace('text-', 'border-')} ${analysis.veredict.color} bg-opacity-10 bg-slate-500`}>
                {analysis.veredict.label}
             </span>
             <span className="text-xs text-slate-500 font-medium flex items-center gap-1">
                <FaWallet size={10} /> {walletItem.qty} cotas
             </span>
          </div>
        </div>
      </div>

      {/* 2. Grid de Dados Financeiros */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 w-full lg:w-2/3">
        
        {/* Preço Médio */}
        <div>
          <p className="text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-1">Preço Médio</p>
          <p className="font-semibold text-slate-300">R$ {walletItem.avg_price.toFixed(2)}</p>
        </div>

        {/* Valor Atual */}
        <div>
          <p className="text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-1">Valor Atual</p>
          <p className="font-bold text-white">R$ {fiiData.price.toFixed(2)}</p>
        </div>

        {/* Resultado (Lucro/Prejuízo) */}
        <div>
          <p className="text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-1">Resultado</p>
          <div className={`font-bold flex items-center gap-1.5 ${resultColor}`}>
            <IconTrend size={12} />
            <span>R$ {Math.abs(resultValue).toFixed(2)}</span>
          </div>
          <span className={`text-[10px] ${resultColor} opacity-80`}>
            ({isProfit ? '+' : ''}{resultPercent.toFixed(1)}%)
          </span>
        </div>

        {/* Proventos Estimados */}
        <div>
          <p className="text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-1">Renda Mensal</p>
          <p className="font-bold text-emerald-400">R$ {monthlyIncome.toFixed(2)}</p>
        </div>
      </div>

      {/* 3. Ações */}
      <div className="flex items-center justify-end lg:w-auto w-full">
        <button 
          onClick={() => onRemove && onRemove(fiiData.ticker)}
          className="p-3 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-400/10 transition-all opacity-0 group-hover:opacity-100"
          title="Remover da Carteira"
        >
          <FaTrashCan size={18} />
        </button>
      </div>
    </div>
  );
}
