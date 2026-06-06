import { useState } from 'react';
import { motion } from 'motion/react';
import { Search, Info, ShieldAlert, Cpu } from 'lucide-react';
import { cn } from '../lib/utils';
import Markdown from 'react-markdown';

export function MedIHub() {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');

  const handleSearch = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setResult('');
    try {
      const res = await fetch('/api/symptom-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ symptoms: query })
      });
      const data = await res.json();
      setResult(data.result);
    } catch (err) {
      console.error(err);
      setResult('An error occurred while fetching information.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 pb-20">
      <header className="max-w-3xl">
        <h1 className="text-4xl font-display font-bold text-[#2A3B33] mb-2">
          MedI Hub <span className="text-xl text-[#5A7D6C] font-normal tracking-wide">/ Intelligence Engine</span>
        </h1>
        <p className="text-[#6B7F75] leading-relaxed max-w-2xl">
          Enter your symptoms. The Intelligence Engine will analyze potential 
          intersections between physiological states and mental wellness.
        </p>
      </header>

      <div className="glass-card p-2 flex items-center relative z-20 max-w-3xl">
        <div className="pl-4 pr-2">
          <Search className="w-5 h-5 text-[#94A69A]" />
        </div>
        <input 
          type="text" 
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSearch()}
          placeholder="e.g., 'Waking up exhausted, tight chest, scattered thoughts...'"
          className="flex-1 bg-transparent border-none text-[#2A3B33] focus:ring-0 p-3 outline-none placeholder-[#94A69A]"
        />
        <button 
          onClick={handleSearch}
          disabled={loading || !query.trim()}
          className="glass-button bg-[#5A7D6C] hover:bg-[#4A6B5C] rounded-xl px-6 py-2 ml-2 transition-all flex items-center gap-2 !shadow-none"
        >
          {loading ? <Cpu className="w-5 h-5 animate-spin" /> : 'Analyze'}
        </button>
      </div>

      {(result || loading) && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl"
        >
          <div className="glass-card p-1">
            <div className="bg-white/60 rounded-t-3xl p-4 flex gap-3 items-center border-b border-[#E5EADD]">
                <Info className="w-5 h-5 text-[#5A7D6C]" />
                <span className="text-[#334139] text-xs font-bold uppercase tracking-widest">AI SYNTHESIS REPORT</span>
            </div>
            
            <div className="p-8 prose prose-emerald max-w-none text-[#2A3B33]">
              {loading ? (
                <div className="animate-pulse space-y-4">
                  <div className="h-4 bg-[#E5EADD] rounded w-3/4"></div>
                  <div className="h-4 bg-[#E5EADD] rounded w-1/2"></div>
                  <div className="h-4 bg-[#E5EADD] rounded w-5/6"></div>
                </div>
              ) : (
                <Markdown>{result}</Markdown>
              )}
            </div>
            
            {!loading && result && (
               <div className="bg-[#F9EAEA] rounded-b-3xl p-6 flex gap-4 items-start border-t border-[#F2D7D7]">
                 <ShieldAlert className="w-6 h-6 text-[#E74C3C] flex-shrink-0 mt-1" />
                 <div>
                   <h4 className="text-[#C0392B] font-bold text-sm mb-1 uppercase tracking-wider">Disclaimer</h4>
                   <p className="text-[#D98282] text-[11px] line-clamp-2">
                     Aura's AI Synthesis is for informational purposes and holistic understanding of mind-body connections. It is not a clinical diagnosis. Always consult a certified healthcare professional.
                   </p>
                 </div>
               </div>
            )}
          </div>
        </motion.div>
      )}

    </div>
  );
}
