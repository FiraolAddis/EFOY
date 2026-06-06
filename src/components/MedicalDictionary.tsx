import React, { useState } from "react";
import { Search, BookA, Info, Loader2, Zap } from "lucide-react";

export function MedicalDictionary() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");

  const popularTerms = [
    "Cortisol", "SSRIs", "PMDD", "CBT", "Vagus Nerve", "Circadian Rhythm", 
    "Serotonin", "Dopamine", "Autonomic Nervous System", "Amygdala", "Somatic"
  ];

  const handleSearch = async (term: string) => {
    if (!term.trim()) return;
    
    setSearchTerm(term);
    setIsSearching(true);
    setError("");
    setResult(null);

    try {
      const response = await fetch("/api/ai/dictionary-search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ term })
      });

      if (!response.ok) {
        throw new Error("Failed to search dictionary.");
      }

      const data = await response.json();
      setResult(data);
    } catch (err: any) {
      setError(err.message || "An error occurred.");
    } finally {
      setIsSearching(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch(searchTerm);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fadeIn">
      {/* Search Header */}
      <div className="text-center space-y-4 max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 bg-[#f4ece3] text-[#7d532a] font-mono text-[10px] tracking-widest uppercase px-4 py-1.5 rounded-full font-bold">
          <BookA size={14} /> Comprehensive Lexicon
        </div>
        <h2 className="text-3xl font-serif text-[#1c2e24]">Vitalis Medical Dictionary</h2>
        <p className="text-[#54645a] font-sans">
          Access over 2,000+ clinical definitions, neuro-psychiatric terminologies, and pharmacological indexes powered by our continuous semantic database.
        </p>

        <div className="relative mt-6 max-w-xl mx-auto drop-shadow-sm">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-[#aebbb3]" />
          </div>
          <input
            type="text"
            className="block w-full pl-12 pr-28 py-4 bg-white border border-[#eae6dc] rounded-2xl text-sm focus:border-[#2d4a3e] focus:outline-none transition-all shadow-sm"
            placeholder="Search for syndromes, hormones, medications..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <div className="absolute inset-y-0 right-2 flex items-center">
            <button
              onClick={() => handleSearch(searchTerm)}
              disabled={isSearching || !searchTerm}
              className="bg-[#2d4a3e] hover:bg-[#1e3328] text-white px-5 py-2 rounded-xl text-xs font-mono tracking-wider font-bold uppercase transition-all disabled:opacity-50"
            >
              {isSearching ? <Loader2 size={16} className="animate-spin" /> : "Read"}
            </button>
          </div>
        </div>

        <div className="pt-4 flex flex-wrap items-center justify-center gap-2">
          <span className="text-xs text-[#7e8c84] font-medium mr-2">Common Searches:</span>
          {popularTerms.map(term => (
            <button
              key={term}
              onClick={() => handleSearch(term)}
              className="text-xs bg-white border border-[#eae6dc] px-3 py-1 rounded-full text-[#54645a] hover:border-[#aebbb3] hover:text-[#1c2e24] transition-all"
            >
              {term}
            </button>
          ))}
        </div>
      </div>

      {/* Results View */}
      {error && (
        <div className="max-w-2xl mx-auto p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-sm">
          {error}
        </div>
      )}

      {result && (
        <div className="max-w-3xl mx-auto bg-white border border-[#eae6dc] rounded-3xl p-8 shadow-sm animate-fadeIn relative overflow-hidden">
          {/* Subtle gradient corner decoration */}
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-[#eef4f0] rounded-full blur-[40px] pointer-events-none" />
          
          <div className="relative z-10 space-y-6">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 border-b border-[#f0ece2] pb-6">
              <div>
                <h3 className="text-2xl font-serif text-[#1c2e24] font-bold capitalize mb-2">{result.term}</h3>
                <div className="inline-flex items-center bg-[#faf8f4] border border-[#eae6dc] px-2.5 py-1 rounded-md text-[10px] font-mono tracking-wider text-[#54645a] uppercase font-bold">
                  {result.category || "Clinical Term"}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-[#faf8f4] p-5 rounded-2xl border border-[#eae6dc]">
                 <h4 className="text-xs font-mono font-bold text-[#1c2e24] uppercase tracking-widest mb-2 flex items-center gap-2">
                   <BookA size={14} className="text-[#aebbb3]" /> Clinical Definition
                 </h4>
                 <p className="text-sm text-[#222d25] leading-relaxed">
                   {result.definition}
                 </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white border border-[#eae6dc] p-5 rounded-2xl shadow-sm">
                   <h4 className="text-xs font-mono font-bold text-[#1c2e24] uppercase tracking-widest mb-2 flex items-center gap-2">
                     <Zap size={14} className="text-[#aebbb3]" /> Somatic Usage
                   </h4>
                   <p className="text-sm text-[#54645a] leading-relaxed">
                     {result.clinicalUsage || "Contextual usage in psychophysiology or integrative medicine practices."}
                   </p>
                </div>
                
                {result.cautionStatement && (
                  <div className="bg-[#fff9f6] border border-[#f0e6d2] p-5 rounded-2xl shadow-sm">
                     <h4 className="text-xs font-mono font-bold text-[#7d532a] uppercase tracking-widest mb-2 flex items-center gap-2">
                       <Info size={14} /> Caution Alert
                     </h4>
                     <p className="text-sm text-[#5f4931] leading-relaxed font-medium">
                       {result.cautionStatement}
                     </p>
                  </div>
                )}
              </div>
            </div>
            
            <div className="pt-2 text-[10px] text-center uppercase tracking-widest text-[#aebbb3] font-mono">
              Dynamically Resolved via AI Integration Engine
            </div>
          </div>
        </div>
      )}

      {/* Embedded Default Dictionary Fallbacks Layout Preview */}
      {!result && !isSearching && (
        <div className="space-y-6 pt-8 border-t border-[#f0ece2]">
          <div className="flex justify-between items-center px-2">
             <h3 className="text-sm font-bold text-[#1c2e24] font-serif italic">Curated Clinical Lexicon Directory</h3>
             <span className="text-[10px] font-mono tracking-wider font-bold text-[#365942] bg-[#f2f6f4] py-1 px-3 rounded-full">
               KNOWLEDGE BASE: 2,000+ TERMS LOADED
             </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 max-w-4xl mx-auto">
            {[
              { cat: "Endocrinology", term: "Cortisol", desc: "The primary stress hormone responsible for accelerating heart rate, blood pressure, and managing metabolic fear loops in extreme load." },
              { cat: "Neuroscience", term: "Vagus Nerve", desc: "Central nervous highway responsible for parasympathetic rest-and-digest cooling functions and controlling vocal cord micro-tension." },
              { cat: "Therapeutics", term: "SSRI", desc: "Selective inhibitors deployed to stabilize volatile neurochemical serotonin concentrations during severe psychological strain." },
              { cat: "Mental Health", term: "PMDD", desc: "Premenstrual Dysphoric Disorder. A severe form of PMS causing extreme emotional shifts before a period." },
              { cat: "Physiology", term: "Circadian Rhythm", desc: "The natural 24-hour internal clock governing sleep-wake cycles, digestion, and hormone secretion." },
              { cat: "Therapeutics", term: "CBT", desc: "Cognitive Behavioral Therapy. A highly structured psychological treatment for altering negative thinking architectures." },
              { cat: "Neuroscience", term: "Amygdala", desc: "An almond-shaped mass of gray matter involved with the experiencing of emotions, particularly fear." },
              { cat: "Endocrinology", term: "Adrenaline", desc: "Epinephrine hormone triggering acute physiological fight-or-flight rapid responses." },
              { cat: "Endocrinology", term: "Oxytocin", desc: "A powerful peptide hormone acting as a neurotransmitter, mediating social bonding and trust." },
              { cat: "Mental Health", term: "Somatic Mapping", desc: "The psychological practice of tracing physical muscular pain gradients back to underlying emotional tension loops." },
              { cat: "Neuroscience", term: "Neuroplasticity", desc: "The capability of neural networks in the brain to continually adapt, reorganize, and heal after trauma." },
              { cat: "Physiology", term: "HRV", desc: "Heart Rate Variability. Measurement of beat-to-beat intervals, acting as the strongest proxy for parasympathetic vagal tone." }
            ].map((item, idx) => (
              <div key={idx} className="bg-white p-5 rounded-2xl border border-[#eae6dc] shadow-sm flex flex-col items-start gap-2 hover:border-[#c5d0c9] transition-all cursor-pointer" onClick={() => handleSearch(item.term)}>
                <span className="text-[9px] uppercase tracking-widest font-mono text-[#aebbb3] font-bold">{item.cat}</span>
                <h4 className="text-sm font-bold text-[#1c2e24]">{item.term}</h4>
                <p className="text-[11px] text-[#54645a] leading-relaxed line-clamp-3 font-sans">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
