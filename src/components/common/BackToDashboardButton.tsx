import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export function BackToDashboardButton() {
  const navigate = useNavigate();
  return (
    <button
      type="button"
      onClick={() => navigate('/')}
      title="Back to Dashboard"
      aria-label="Back to Dashboard"
      className="inline-flex items-center gap-1.5 px-2 py-2 sm:px-3 rounded-lg text-sm font-medium border border-[#E0E0E5] text-[#383B54] hover:bg-[#F2F2F5] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0073E6] transition-colors"
    >
      <ArrowLeft size={16} />
      <span className="hidden sm:inline">Back to Dashboard</span>
    </button>
  );
}
