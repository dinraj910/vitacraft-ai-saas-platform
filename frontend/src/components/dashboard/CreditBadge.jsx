import { Zap } from 'lucide-react';
import useCredits from '../../hooks/useCredits';

const CreditBadge = () => {
  const { balance, total, percent } = useCredits();

  const color =
    percent > 50 ? 'text-green-400 border-green-500/30 bg-green-500/10' :
    percent > 20 ? 'text-yellow-400 border-yellow-500/30 bg-yellow-500/10' :
                   'text-red-400 border-red-500/30 bg-red-500/10';

  return (
    <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-semibold ${color}`}>
      <Zap className="w-3 h-3" />
      {balance} / {total} credits
    </div>
  );
};

export default CreditBadge;