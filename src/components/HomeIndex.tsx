import { UserProfile, DailyCheckIn, WellnessScoreBreakdown, Gender } from "../types";
import { motion } from "motion/react";
import { 
  Sparkles, 
  Activity, 
  BookOpen, 
  Heart, 
  ArrowRight, 
  CheckCircle, 
  Clock, 
  TrendingUp, 
  ShieldAlert, 
  Droplets,
  Calendar
} from "lucide-react";

interface HomeIndexProps {
  profile: UserProfile;
  checkInHistory: DailyCheckIn[];
  scoreReport: WellnessScoreBreakdown | null;
  onNavigate: (tab: any) => void;
  onOpenCheckIn: () => void;
}

export default function HomeIndex({ 
  profile, 
  checkInHistory, 
  scoreReport, 
  onNavigate,
  onOpenCheckIn
}: HomeIndexProps) {

  // Dynamic welcome message
  const getGreeting = () => {
    const hr = new Date().getHours();
    if (hr < 12) return "Good Morning";
    if (hr < 18) return "Good Afternoon";
    return "Good Evening";
  };

  const isHighStress = (scoreReport?.score && scoreReport.score < 55) || 
    (checkInHistory[0]?.stressScore && checkInHistory[0].stressScore >= 7);

  return (
    <div className="space-y-8 animate-fadeIn">
      
      {/* 1. HERO BIO-WELCOME SECTION */}
      <div className="rounded-3xl border border-[#eae6dc] bg-gradient-to-br from-[#faf8f4] to-white p-6 sm:p-8 relative overflow-hidden shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="absolute top-0 right-0 h-44 w-44 bg-gradient-to-bl from-[#365942]/5 to-transparent rounded-bl-full pointer-events-none" />
        
        <div className="space-y-3 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 p-1 px-3 bg-[#f2f6f4] border border-[#d3e5db] rounded-full text-[10px] font-mono font-bold text-[#2d4a3e] uppercase tracking-wider">
            <Activity size={10} /> Active Somatic Workspace
          </div>
          <h1 className="text-3xl sm:text-4xl font-serif italic font-bold tracking-tight text-[#14231b]">
            {getGreeting()}, {profile.name}
          </h1>
          <p className="text-xs text-[#54645a] leading-relaxed max-w-lg font-medium font-sans">
            Your physiological alignment and neural stress scores are calculated against live diurnal cycles. Today, we recommend focusing on{" "}
            {isHighStress 
              ? "parasympathetic calming loops and vagal nerve down-regulation." 
              : "sustained focus blocks and optimal cardio-metabolic efficiency."
            }
          </p>
          
          <div className="flex flex-wrap gap-2.5 pt-2">
            <button
              onClick={onOpenCheckIn}
              className="rounded-xl bg-[#2d4a3e] hover:bg-[#1e3328] text-white px-5 py-2.5 font-mono text-[10px] font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 shadow-sm"
            >
              <CheckCircle size={12} /> Log Daily Check-In
            </button>
            <button
              onClick={() => onNavigate("settings")}
              className="rounded-xl bg-white hover:bg-[#faf8f4] border border-[#eae6dc] text-[#54645a] hover:text-[#1c2e24] px-5 py-2.5 font-mono text-[10px] font-bold uppercase tracking-wider transition-all flex items-center gap-1.5"
            >
              Configure Parameters
            </button>
          </div>
        </div>

        {/* Dynamic Circular Stats Ring */}
        <div className="p-5.5 rounded-2xl bg-white border border-[#efece2] shadow-3xs flex flex-col items-center justify-center shrink-0 w-full md:w-44 text-center">
          <span className="text-[9px] font-mono text-[#6e7d73] uppercase tracking-wider font-bold">COHERENCE INDEX</span>
          {scoreReport ? (
            <div className="space-y-1 mt-2">
              <span className="text-4xl font-serif italic font-extrabold text-[#112117] block leading-none">
                {scoreReport.score}%
              </span>
              <span className={`text-[9px] font-mono uppercase font-bold px-2 py-0.5 rounded-full inline-block border ${
                scoreReport.score >= 70 
                  ? "bg-[#f2f6f4] border-[#d3e5db] text-[#2d4a3e]" 
                  : scoreReport.score >= 50 
                    ? "bg-[#faf6ed] border-[#f0e6d2] text-[#7d561a]" 
                    : "bg-[#fbf1ee] border-[#efe0da] text-[#8a3c25]"
              }`}>
                {scoreReport.status}
              </span>
            </div>
          ) : (
            <span className="text-xs font-mono text-[#6e7d73] mt-2 block animate-pulse">Calculating alignment...</span>
          )}
        </div>
      </div>

      {/* 2. DYNAMIC BROADCAST SYSTEM & HEALTH SUMMARY */}
      <div className={`grid grid-cols-1 ${profile.gender === Gender.FEMALE ? "md:grid-cols-3" : "md:grid-cols-2"} gap-6`}>
        
        {/* Endocrine Quick Widget */}
        {profile.gender === Gender.FEMALE && (
          <div 
            onClick={() => onNavigate("cycle")}
            className="p-5 bg-white border border-[#eae6dc] rounded-2xl hover:border-[#365942] transition-all cursor-pointer flex flex-col justify-between group space-y-4"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Droplets className="text-[#a2533b]" size={15} />
                <span className="text-[10px] font-mono text-[#8a3c25] uppercase tracking-wider font-bold">Endocrine Rhythm</span>
              </div>
              <span className="h-2 w-2 rounded-full bg-[#a2533b]" />
            </div>
            <div>
              <span className="text-2xl font-serif italic font-semibold text-[#14231b] block">
                {profile.menstrual ? "Hormonal Sync Active" : "Baseline Rhythm"}
              </span>
              <p className="text-[11px] text-[#6e7d73] mt-1 leading-normal font-medium max-w-xs line-clamp-2">
                {profile.menstrual 
                  ? `Track endocrine phase indicators, cycle days (${profile.menstrual.cycleDays} daysavg), and clinical symptom overlays dynamically.`
                  : "Continuous metabolic pattern active. Monitor circadian sleep parameters, vagal spikes, and cortisol trends."
                }
              </p>
            </div>
            <div className="flex items-center justify-between text-[10px] font-mono font-bold text-[#8a3c25] border-t border-[#fcfcfb] pt-2">
              <span>Explore rhythm charts</span>
              <ArrowRight size={12} className="transform group-hover:translate-x-1.5 transition-transform" />
            </div>
          </div>
        )}

        {/* Somatic Search Quick Widget */}
        <div 
          onClick={() => onNavigate("medi")}
          className="p-5 bg-white border border-[#eae6dc] rounded-2xl hover:border-[#365942] transition-all cursor-pointer flex flex-col justify-between group space-y-4"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BookOpen className="text-[#2d4a3e]" size={15} />
              <span className="text-[10px] font-mono text-[#2d4a3e] uppercase tracking-wider font-bold">Somatic Lexicon</span>
            </div>
            <span className="h-2 w-2 rounded-full bg-[#2d4a3e]" />
          </div>
          <div>
            <span className="text-2xl font-serif italic font-semibold text-[#14231b] block">
              MedI Explorer
            </span>
            <p className="text-[11px] text-[#6e7d73] mt-1 leading-normal font-medium max-w-xs line-clamp-2">
              Investigate localized physiological symptoms, understand high-cortisol adrenaline interplay, and lookup clinical pharmaceutical definitions.
            </p>
          </div>
          <div className="flex items-center justify-between text-[10px] font-mono font-bold text-[#2d4a3e] border-t border-[#fcfcfb] pt-2">
            <span>Query active symptom guides</span>
            <ArrowRight size={12} className="transform group-hover:translate-x-1.5 transition-transform" />
          </div>
        </div>

        {/* Sleep Circadian Widget */}
        <div 
          onClick={() => onNavigate("wellness")}
          className="p-5 bg-white border border-[#eae6dc] rounded-2xl hover:border-[#365942] transition-all cursor-pointer flex flex-col justify-between group space-y-4"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="text-[#3b3c5e]" size={15} />
              <span className="text-[10px] font-mono text-[#3b3c5e] uppercase tracking-wider font-bold">Circadian Sleep</span>
            </div>
            <span className="h-2 w-2 rounded-full bg-[#3b3c5e]" />
          </div>
          <div>
            <span className="text-2xl font-serif italic font-semibold text-[#14231b] block leading-snug">
              Wake {profile.sleepSchedule?.wakeupTime || "07:00"} • Bed {profile.sleepSchedule?.bedtime || "23:00"}
            </span>
            <span className="inline-flex mt-1 text-[9px] bg-[#f2f2fa] text-[#3b3c5e] border border-[#e1e1f2] font-mono uppercase font-bold py-0.5 px-2 rounded-full">
              Chronotype: {profile.sleepSchedule?.chronotype || "BEAR"}
            </span>
          </div>
          <div className="flex items-center justify-between text-[10px] font-mono font-bold text-[#3b3c5e] border-t border-[#fcfcfb] pt-2">
            <span>Tune sleep schedules</span>
            <ArrowRight size={12} className="transform group-hover:translate-x-1.5 transition-transform" />
          </div>
        </div>

      </div>

      {/* 3. COHERENCE RECOMMENDATIONS & ROADMAP BLOCK */}
      {scoreReport && scoreReport.recommendations && scoreReport.recommendations.length > 0 && (
        <div className="rounded-3xl border border-[#eae6dc] bg-white p-6 sm:p-7 space-y-4 shadow-sm">
          <div className="flex items-center gap-2 border-b border-[#f3f0e8] pb-3">
            <Sparkles className="text-[#365942]" size={16} />
            <h3 className="text-xs font-mono uppercase text-[#1c2e24] font-bold tracking-wider">Clinically Suggested Practices Today</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {scoreReport.recommendations.map((rec, i) => (
              <div 
                key={i} 
                className="flex items-start gap-3 p-4 rounded-xl border border-[#efece2] bg-[#faf8f4] hover:bg-white transition-all font-sans font-medium text-xs text-[#333e38] leading-relaxed"
              >
                <span className="h-5 w-5 rounded-full bg-[#f2f6f4] border border-[#d3e5db] text-[#2d4a3e] flex items-center justify-center text-[10px] font-sans font-bold shrink-0 mt-0.5">
                  ✓
                </span>
                <p>{rec}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. BIO-RHYTHM METRIC PROGRESS SUMMARY */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pb-6">
        
        {/* Clinically Structured Health Matrix (Left) */}
        <div className="lg:col-span-8 rounded-3xl border border-[#eae6dc] bg-white p-6 sm:p-7 space-y-6">
          <div className="border-b border-[#f3f0e8] pb-4">
            <h3 className="text-xs font-mono uppercase text-[#1c2e24] font-bold tracking-wider">Historical Bio-Alignment Indices</h3>
            <p className="text-[11px] text-[#6e7d73] font-mono mt-1">Somatic feedback tracking timeline</p>
          </div>

          <div className="space-y-4">
            {checkInHistory.slice(0, 3).map((item, id) => (
              <div key={id} className="p-4 bg-[#faf8f4] border border-[#efece2] rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <span className="text-[9px] font-mono uppercase font-bold text-[#6e7d73] block">{item.date} check-in</span>
                  <p className="text-xs italic text-[#14231b] leading-normal font-sans font-semibold">"{item.moodNotes || 'Baseline status logged'}"</p>
                </div>
                
                <div className="flex gap-2 text-[9px] font-mono font-bold shrink-0 text-center">
                  <span className="p-1 px-3 bg-[#fbf1ee] text-[#8a3c25] border border-[#efe0da] rounded-lg">Stress: {item.stressScore}/10</span>
                  <span className="p-1 px-3 bg-[#f2f6f4] text-[#2d4a3e] border border-[#d3e5db] rounded-lg">Sleep: {item.sleepQuality}/10</span>
                  <span className="p-1 px-3 bg-[#f2f2fa] text-[#3b3c5e] border border-[#e1e1f2] rounded-lg">Energy: {item.energyLevel}/10</span>
                </div>
              </div>
            ))}

            <button
              onClick={() => onNavigate("wellness")}
              className="text-xs font-mono font-bold text-[#365942] hover:text-[#1c2e24] flex items-center gap-1.5 pt-1 transition-all"
            >
              Access entire biofeedback dashboard <ArrowRight size={12} />
            </button>
          </div>
        </div>

        {/* System Coherence State Overview (Right) */}
        <div className="lg:col-span-4 rounded-3xl border border-[#eae6dc] bg-white p-6 sm:p-7 space-y-6 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="border-b border-[#f3f0e8] pb-3">
              <h3 className="text-xs font-mono uppercase text-[#1c2e24] font-bold tracking-wider">Sub-score Alignments</h3>
            </div>

            {scoreReport ? (
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <div className="flex justify-between text-[10px] font-mono font-bold uppercase text-[#54645a]">
                    <span>Mental Alignment</span>
                    <span>{scoreReport.mentalScore}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-[#faf8f4] border border-[#eae6dc] rounded-full overflow-hidden">
                    <div className="h-full bg-[#365942] transition-all" style={{ width: `${scoreReport.mentalScore}%` }} />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between text-[10px] font-mono font-bold uppercase text-[#54645a]">
                    <span>Somatic Resilience</span>
                    <span>{scoreReport.physicalScore}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-[#faf8f4] border border-[#eae6dc] rounded-full overflow-hidden">
                    <div className="h-full bg-[#8a3c25] transition-all" style={{ width: `${scoreReport.physicalScore}%` }} />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between text-[10px] font-mono font-bold uppercase text-[#54645a]">
                    <span>Cognitive Workpace</span>
                    <span>{scoreReport.lifestyleScore}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-[#faf8f4] border border-[#eae6dc] rounded-full overflow-hidden">
                    <div className="h-full bg-[#3b3c5e] transition-all" style={{ width: `${scoreReport.lifestyleScore}%` }} />
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-28 flex items-center justify-center text-xs font-mono text-[#6e7d73] animate-pulse">
                Mapping metrics...
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-[#fcfcfb] text-[10px] font-mono text-[#6e7d73] flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>Zero-Trust Security Active</span>
          </div>
        </div>

      </div>

    </div>
  );
}
