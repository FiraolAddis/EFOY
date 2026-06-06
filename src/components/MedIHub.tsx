import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { UserProfile, SymptomAnalysis, DictionaryItem } from "../types";
import { Stethoscope, BookOpen, Search, AlertTriangle, ArrowRight } from "lucide-react";

interface MedIHubProps {
  profile: UserProfile;
}

// Preset dictionary items
const PRESET_DICTIONARY: DictionaryItem[] = [
  {
    term: "PMDD",
    definition: "Premenstrual Dysphoric Disorder - a severe neuroendocrine form of PMS affecting mood, anxiety, and brain neurotransmitter pathways.",
    category: "Mental Health",
    clinicalUsage: "Addressed using cognitive behavioral therapy (CBT), selective environmental pacing adjustments, and dedicated neurochemistry support, or lifestyle synchronizations.",
    cautionStatement: "Differentiated from standard PMS by its acute cyclical mental health drops, frequently requiring specialized physician management."
  },
  {
    term: "Cortisol",
    definition: "The body's primary stress hormone produced by adrenal glands, modulating blood pressure, blood glucose, metabolic pathways, and vascular tension.",
    category: "Physiology",
    clinicalUsage: "Monitored via blood or salivary cortisol curves to trace adrenal reserves, systemic fatigue vectors, and extreme workplace burnout dynamics.",
    cautionStatement: "Chronically elevated cortisol triggers sustained anxiety levels, immune suppression, gut motility disorders, and sleep quality deterioration."
  },
  {
    term: "SSRI",
    definition: "Selective Serotonin Reuptake Inhibitor - a widely prescribed class of pharmaceutical medications designed to increase somatic serotonin activity in brain synapses.",
    category: "Pharmaceutical",
    clinicalUsage: "Employed clinically to handle severe depressive shifts, obsessive-compulsive disorders (OCD), and persistent general anxiety triggers.",
    cautionStatement: "May initiate short-term fatigue or metabolic adjustments. Discontinuance must always be tapered slowly under direct clinical guidance."
  },
  {
    term: "CBT",
    definition: "Cognitive Behavioral Therapy - a high-fidelity psychological protocol that trains individuals to identify, challenge, and alter unhealthy thought and behavioral patterns.",
    category: "Mental Health",
    clinicalUsage: "First-line non-pharmacologic clinical treatment for panic attacks, persistent workplace stress, performance anxiety, and insomnia schedules.",
    cautionStatement: "Depends heavily on daily active habit pacing and deliberate neural engagement to rewire automatic stress response loops."
  }
];

export default function MedIHub({ profile }: MedIHubProps) {
  const [activeTab, setActiveTab] = useState<"symptom" | "dictionary">("symptom");
  
  // States of psychosomatic symptom query
  const [symptomInput, setSymptomInput] = useState("");
  const [symptomResult, setSymptomResult] = useState<SymptomAnalysis | null>(null);
  const [isSymptomLoading, setIsSymptomLoading] = useState(false);

  // States of dictionary querying
  const [dictInput, setDictInput] = useState("");
  const [dictResult, setDictResult] = useState<DictionaryItem | null>(null);
  const [isDictLoading, setIsDictLoading] = useState(false);
  
  // Filtered presets based on input
  const [filteredPresets, setFilteredPresets] = useState<DictionaryItem[]>(PRESET_DICTIONARY);

  // Filter dictionary presets locally when typing
  useEffect(() => {
    if (!dictInput.trim()) {
      setFilteredPresets(PRESET_DICTIONARY);
    } else {
      const q = dictInput.toLowerCase();
      const filtered = PRESET_DICTIONARY.filter(
        item => item.term.toLowerCase().includes(q) || item.definition.toLowerCase().includes(q)
      );
      setFilteredPresets(filtered);
    }
  }, [dictInput]);

  const handleSymptomSearch = async (termToSearch?: string) => {
    const finalInput = termToSearch || symptomInput;
    if (!finalInput.trim()) return;

    setIsSymptomLoading(true);
    setSymptomResult(null);

    try {
      const res = await fetch("/api/ai/medi-search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ symptom: finalInput, profile }),
      });
      const data = await res.json();
      setSymptomResult(data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSymptomLoading(false);
    }
  };

  const handleDictSearch = async (termToSearch?: string) => {
    const finalInput = termToSearch || dictInput;
    if (!finalInput.trim()) return;

    setIsDictLoading(true);
    setDictResult(null);

    try {
      const res = await fetch("/api/ai/dictionary-search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ term: finalInput }),
      });
      const data = await res.json();
      setDictResult(data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsDictLoading(false);
    }
  };

  const getCategoryBadgeClass = (category: string) => {
    switch (category.toLowerCase()) {
      case "pharmaceutical":
        return "text-[#2d4a3e] bg-[#f2f6f4] border-[#d3e5db]";
      case "physiology":
        return "text-[#3b3c5e] bg-[#f2f2fa] border-[#e1e1f2]";
      case "mental health":
        return "text-[#8a3c25] bg-[#fbf1ee] border-[#efe0da]";
      default:
        return "text-[#7d561a] bg-[#faf6ed] border-[#f0e6d2]";
    }
  };

  return (
    <div id="medi_hub_viewport" className="rounded-3xl border border-[#eae6dc] bg-white p-6 sm:p-8 space-y-8 text-[#222d25] shadow-sm">
      
      {/* HEADER CONTROLS AND SELECTORS */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-[#f3f0e8] pb-6">
        <div>
          <span className="inline-flex items-center gap-1.5 p-1 px-3.5 rounded-full bg-[#f2f6f4] border border-[#d3e5db] text-[10px] font-mono text-[#2d4a3e] font-bold uppercase tracking-wider mb-2">
            <Stethoscope size={11} /> Somatic Health Intelligence
          </span>
          <h2 id="medi_hub_title" className="text-3xl font-serif italic text-[#14231b] font-bold tracking-tight">
            MedI Information Hub
          </h2>
          <p className="text-xs text-[#54645a] leading-relaxed mt-1 font-sans font-medium max-w-xl font-medium">
            Understand the connection between physical symptoms and mental health. Investigate biochemical feedback cues and clinical terminology.
          </p>
        </div>

        {/* Dynamic Tab Switcher */}
        <div className="flex bg-[#faf8f4] p-1.5 rounded-2xl border border-[#eae6dc] self-start shrink-0">
          <button
            onClick={() => setActiveTab("symptom")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-mono tracking-wider transition-all uppercase ${
              activeTab === "symptom"
                ? "bg-white text-[#1c2e24] border border-[#e1ddd3] shadow-sm font-bold"
                : "text-[#54645a] hover:text-[#1c2e24]"
            }`}
          >
            <Search size={13} />
            Symptom Search
          </button>
          <button
            onClick={() => setActiveTab("dictionary")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-mono tracking-wider transition-all uppercase ${
              activeTab === "dictionary"
                ? "bg-white text-[#1c2e24] border border-[#e1ddd3] shadow-sm font-bold"
                : "text-[#54645a] hover:text-[#1c2e24]"
            }`}
          >
            <BookOpen size={13} />
            Medical Dictionary
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === "symptom" ? (
          <motion.div
            key="symptom-view"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            <div className="space-y-4">
              <div className="space-y-1">
                <h3 className="text-lg font-serif italic font-semibold text-[#1c2e24]">Symptom-Based Search</h3>
                <p className="text-xs text-[#54645a] leading-relaxed">
                  Search for a symptom to understand its physical causes and mental health connections. Physical manifestations like gut cramps, chronic migraines, and rapid pulse are tightly mapped to neurobiological adrenal stress curves.
                </p>
              </div>

              {/* Informative Green Notice Box from Image */}
              <div className="p-4 bg-[#f2f6f4] border border-[#d3e5db] rounded-2xl text-xs text-[#2d4a3e] font-sans font-medium leading-relaxed shadow-3xs flex items-start gap-2.5">
                <span className="shrink-0 text-base">💡</span>
                <p>Start typing a symptom to explore its physical causes and mental health connections.</p>
              </div>

              {/* Input Action Group */}
              <div className="flex gap-2 relative">
                <input
                  type="text"
                  value={symptomInput}
                  onChange={(e) => setSymptomInput(e.target.value)}
                  placeholder="e.g., headache, stomach pain, anxiety, fatigue, irregular period..."
                  className="w-full rounded-2xl border border-[#eae6dc] bg-[#faf8f4] p-4 pl-11 text-xs text-[#1e2e24] placeholder-[#8b918a] focus:outline-none focus:ring-1 focus:ring-[#365942] transition-all shadow-3xs"
                  onKeyDown={(e) => e.key === "Enter" && handleSymptomSearch()}
                />
                <Search size={15} className="absolute left-4 top-4.5 text-[#8b918a]" />
                
                <button
                  onClick={() => handleSymptomSearch()}
                  disabled={isSymptomLoading}
                  className="rounded-2xl bg-[#2d4a3e] hover:bg-[#1e3328] text-white px-6 font-mono text-xs font-semibold tracking-wider uppercase transition-all flex items-center justify-center shrink-0 shadow-sm disabled:opacity-50"
                >
                  {isSymptomLoading ? "Decoding..." : "Analyze"}
                </button>
              </div>

              {/* Quick links preset exploration */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <span className="text-[10px] font-mono text-[#6e7d73] uppercase font-bold tracking-wider">Quick Inquiries:</span>
                {[
                  "Intestinal Pain & Bloating",
                  "Vagal Nerve Fluttering",
                  "Vascular Headaches",
                  "Chronic Fatigue",
                  "Irregular Period"
                ].map((term) => (
                  <button
                    key={term}
                    onClick={() => {
                      setSymptomInput(term);
                      handleSymptomSearch(term);
                    }}
                    className="text-[10px] font-mono rounded-full bg-[#faf8f4] border border-[#eae6dc] px-3.5 py-1 text-[#3d4f43] hover:border-[#1c2e24] hover:bg-white hover:text-[#1c2e24] transition-all font-medium"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>

            {/* Response section */}
            <AnimatePresence>
              {symptomResult && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  className={`rounded-2xl border p-6 space-y-6 shadow-sm ${
                    symptomResult.isUrgent 
                      ? "border-[#efe0da] bg-[#fbf1ee]" 
                      : "border-[#eae6dc] bg-[#faf8f4]"
                  }`}
                >
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-[#f3eee3] pb-4">
                    <div>
                      <span className="text-[10px] font-mono uppercase text-[#6e7d73] font-bold tracking-wider">Somatic Manifestation Diagnostics</span>
                      <h4 className="text-xl font-serif italic font-semibold text-[#1c2e24] mt-1">{symptomResult.symptom}</h4>
                    </div>
                    {symptomResult.isUrgent && (
                      <span className="flex items-center gap-1.5 text-[9px] font-mono font-bold px-3 py-1 rounded-full bg-rose-100 text-rose-800 uppercase animate-pulse border border-rose-200 shrink-0">
                        <AlertTriangle size={11} strokeWidth={2.5} /> Urgent Stress Alert
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="space-y-1.5 p-4.5 bg-white rounded-xl border border-[#efece2]">
                        <span className="text-[10px] font-mono uppercase text-[#a2533b] font-bold tracking-wider block">Potential Root Causes</span>
                        <p className="text-xs text-[#333e38] leading-relaxed font-sans font-medium">{symptomResult.potentialCauses}</p>
                      </div>

                      <div className="space-y-1.5 p-4.5 bg-white rounded-xl border border-[#efece2]">
                        <span className="text-[10px] font-mono uppercase text-[#2d4a3e] font-bold tracking-wider block">Preventive Care & Immediate Relief</span>
                        <p className="text-xs text-[#333e38] leading-relaxed font-sans font-medium">{symptomResult.preventiveTips}</p>
                      </div>
                    </div>

                    <div className="space-y-4 md:border-l md:border-[#f3eee3] md:pl-6">
                      <div className="space-y-1.5 p-4.5 bg-white rounded-xl border border-[#efece2]">
                        <span className="text-[10px] font-mono uppercase text-[#2d4a3e] font-bold tracking-wider block">Somato-Emotional Connection</span>
                        <p className="text-xs text-[#333e38] leading-relaxed font-sans font-medium">{symptomResult.mindBodyConnection}</p>
                      </div>

                      <div className="space-y-2 p-4.5 bg-white rounded-xl border border-[#efece2]">
                        <span className="text-[10px] font-mono uppercase text-[#6e7d73] font-bold tracking-wider block">Recommended Specialists</span>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {symptomResult.recommendedPhysicians.map((phys, i) => (
                            <span key={i} className="text-[10px] font-mono px-3 py-1.5 rounded-lg bg-[#faf8f4] border border-[#eae6dc] text-[#54645a] font-bold shadow-none font-sans">
                               {phys}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ) : (
          <motion.div
            key="dictionary-view"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            <div className="space-y-4">
              <div className="space-y-1">
                <h3 className="text-lg font-serif italic font-semibold text-[#1c2e24]">Clinical Terminology Dictionary</h3>
                <p className="text-xs text-[#54645a] leading-relaxed font-medium">
                  Search medical terms to explore pharmaceutical indicators, neurobiology states, behavioral counseling, and physical safety cautions.
                </p>
              </div>

              {/* Input section with custom placeholder from specs */}
              <div className="flex gap-2 relative">
                <input
                  type="text"
                  value={dictInput}
                  onChange={(e) => setDictInput(e.target.value)}
                  placeholder="Search medical terms..."
                  className="w-full rounded-2xl border border-[#eae6dc] bg-[#faf8f4] p-4 pl-11 text-xs text-[#1e2e24] placeholder-[#8b918a] focus:outline-none focus:ring-1 focus:ring-[#365942] transition-colors shadow-3xs"
                  onKeyDown={(e) => e.key === "Enter" && handleDictSearch()}
                />
                <BookOpen size={15} className="absolute left-4 top-4.5 text-[#8b918a]" />
                <button
                  onClick={() => handleDictSearch()}
                  disabled={isDictLoading}
                  className="rounded-2xl bg-[#2d4a3e] hover:bg-[#1e3328] text-white px-6 font-mono text-xs font-semibold tracking-wider uppercase transition-all flex items-center justify-center shrink-0 shadow-sm"
                >
                  {isDictLoading ? "Indexing..." : "Search"}
                </button>
              </div>
            </div>

            {/* DYNAMIC RESPONSE CARD (If queried term is defined) */}
            <AnimatePresence>
              {dictResult && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  className="rounded-2xl border border-[#eae6dc] bg-[#faf8f4] p-6 space-y-4 shadow-sm"
                >
                  <div className="flex items-start justify-between border-b border-[#f3eee3] pb-3">
                    <div>
                      <span className={`text-[9px] font-mono uppercase border font-bold py-1 px-3 rounded-full inline-block mb-2 ${getCategoryBadgeClass(dictResult.category)}`}>
                        {dictResult.category}
                      </span>
                      <h4 className="text-xl font-serif italic font-bold text-[#1c2e24]">{dictResult.term}</h4>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="space-y-1 pb-1">
                        <span className="text-[10px] font-mono uppercase text-[#8a3c25] font-bold tracking-wider block">Clinical Definition</span>
                        <p className="text-xs text-[#333e38] font-medium leading-relaxed font-sans">{dictResult.definition}</p>
                      </div>

                      {dictResult.clinicalUsage && (
                        <div className="space-y-1">
                          <span className="text-[10px] font-mono uppercase text-[#2d4a3e] font-bold tracking-wider block">Therapeutic Applications</span>
                          <p className="text-xs text-[#333e38] font-medium leading-relaxed font-sans">{dictResult.clinicalUsage}</p>
                        </div>
                      )}
                    </div>

                    <div className="space-y-4 md:border-l md:border-[#efebe2] md:pl-6 flex flex-col justify-center">
                      <div className="rounded-2xl border border-[#efe0da] bg-[#fbf1ee] p-5 space-y-2">
                        <div className="flex items-start gap-2.5 text-[#8a3c25]">
                          <AlertTriangle size={15} className="mt-0.5 shrink-0 animate-pulse" />
                          <div>
                            <span className="text-[10px] font-mono uppercase font-bold tracking-wider block">Circadian / Anxiety Caution Warning</span>
                            <p className="text-xs text-[#333e38] leading-relaxed font-sans font-medium mt-1 select-all">{dictResult.cautionStatement}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* MAIN GLOSSARY PRESETS SECTION (Always visible as highly styled cards from images!) */}
            <div className="space-y-4 pt-2">
              <h4 className="text-xs font-mono uppercase text-[#6e7d73] font-bold tracking-wider">Common Reference Index ({filteredPresets.length})</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredPresets.map((item, idx) => (
                  <div
                    key={idx}
                    onClick={() => {
                      setDictResult(item);
                      setDictInput(item.term);
                    }}
                    className="p-5 bg-white border border-[#eae6dc] rounded-2xl hover:border-[#365942] hover:shadow-xs cursor-pointer transition-all duration-300 flex flex-col justify-between space-y-4 relative group"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h5 className="text-base font-serif italic font-bold text-[#1c2e24] group-hover:text-[#365942] transition-colors">{item.term}</h5>
                        <p className="text-xs text-[#6e7d73] leading-normal font-sans mt-1 line-clamp-2 pr-2 font-medium">{item.definition}</p>
                      </div>
                      
                      <span className={`text-[9px] font-mono uppercase border font-bold px-2.5 py-0.5 rounded-full shrink-0 ${getCategoryBadgeClass(item.category)}`}>
                        {item.category.replace("Health", "")}
                      </span>
                    </div>

                    <div className="border-t border-[#fcfcfb] pt-2 flex items-center justify-between text-[10px] font-mono font-bold text-[#365942]">
                      <span className="opacity-0 group-hover:opacity-100 transition-opacity">Analyze Therapeutic Contexts</span>
                      <ArrowRight size={12} className="text-[#365942] transform group-hover:translate-x-1.5 transition-transform" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
