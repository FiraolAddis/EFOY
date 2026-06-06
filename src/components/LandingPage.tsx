import { useState } from "react";
import { motion } from "motion/react";
import { 
  Sparkles, 
  Wind, 
  Clock, 
  Droplets, 
  BookOpen, 
  ChevronRight, 
  ArrowRight,
  ShieldAlert, 
  Zap, 
  LogIn, 
  Anchor,
  Stethoscope,
  Heart,
  Activity,
  Smile,
  ShieldCheck
} from "lucide-react";
import { REGISTERED_PROFESSIONALS } from "./ProfessionalsDirectory";

interface LandingPageProps {
  onEnterSandbox: () => void;
  onEnterGoogleAuth: () => void;
  onProviderRegister: () => void;
}

export default function LandingPage({ onEnterSandbox, onEnterGoogleAuth, onProviderRegister }: LandingPageProps) {
  const [activeFeature, setActiveFeature] = useState(0);

  const featuresList = [
    {
      icon: Wind,
      title: "Audio-Guided Box Breathing",
      tag: "PARASYMPATHETIC DOWN-REGULATION",
      color: "text-[#2d4a3e] bg-[#f2f6f4] border-[#d3e5db]",
      description: "Clinically synchronized box pacing loop (Inhale, Hold, Exhale, Suspend) configured to stimulate the vagus nerve and diminish active cortisol deposits.",
      benefit: "Slower HRV, lowered systemic anxiety, and calm cognitive balance in under 5 minutes."
    },
    {
      icon: Clock,
      title: "Chronotype Sleep Optimization",
      tag: "CIRCADIAN SCHEDULE BALANCING",
      color: "text-[#3b3c5e] bg-[#f2f2fa] border-[#e1e1f2]",
      description: "Diagnostics built directly around Lion, Wolf, Bear, and Dolphin neural types to synchronize sleep routines with biological daylight sequences.",
      benefit: "Enriched deep sleep indices, stable diurnal focus, and balanced sleep scheduling."
    },
    {
      icon: Droplets,
      title: "Endocrine Hormone Sync",
      tag: "BIOLOGICAL RHYTHM OVERLAYS",
      color: "text-[#8a3c25] bg-[#fbf1ee] border-[#efe0da]",
      description: "Interactive menstrual phase tracking and predictive physiological symptoms log overlays. Formulate wellness routines that align with hormonal chemistry.",
      benefit: "Insight into energy valleys and proactive mitigations for chronic PMDD stress triggers."
    },
    {
      icon: BookOpen,
      title: "Clinical Somatic Lexicon",
      tag: "MEDICAL DISCOVERY & ANATOMY",
      color: "text-[#7d561a] bg-[#faf6ed] border-[#f0e6d2]",
      description: "Investigate localized nervous system symptoms, understand stress-adrenaline pathways, and lookup strict clinical definition charts.",
      benefit: "Accelerated health literacy and direct mind-body clarity for complex physical indicators."
    }
  ];

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16 space-y-24 animate-fadeIn">
      
      {/* 1. HERO BRANDING & DIRECT VIEW ACTION */}
      <div className="relative rounded-3xl border border-[#eae6dc] bg-gradient-to-br from-[#faf8f4] to-white p-8 sm:p-12 md:p-16 overflow-hidden shadow-xs flex flex-col md:flex-row items-center justify-between gap-12">
        <div className="absolute top-0 right-0 h-64 w-64 bg-gradient-to-bl from-[#365942]/5 to-transparent rounded-bl-full pointer-events-none" />
        <div className="absolute bottom-0 left-0 h-48 w-48 bg-gradient-to-tr from-[#8a3c25]/3 to-transparent rounded-tr-full pointer-events-none" />

        <div className="space-y-6 max-w-3xl text-left">
          <div className="inline-flex items-center gap-1.5 p-1 px-4 bg-[#f2f6f4] border border-[#d3e5db] rounded-full text-[10px] font-mono font-bold text-[#2d4a3e] uppercase tracking-widest">
            <Sparkles size={11} className="text-[#365942]" /> Dynamic Somatic Integrity Engine
          </div>
          
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-serif italic font-extrabold tracking-tight text-[#14231b] leading-tight">
            Connecting Physiological <span className="text-[#365942]">Science</span> with Mindful <span className="text-[#a2533b]">Coherence</span>
          </h1>

          <p className="text-sm text-[#54645a] leading-relaxed max-w-xl font-medium">
            Bridging clinical biometric insights with automated proactive wellness pacing. Vitalis Wellness transitions your preventative routines from static, isolated tracking into a dynamic cycle-aligned nervous system hub.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <button
              onClick={onEnterGoogleAuth}
              className="rounded-xl bg-[#2d4a3e] hover:bg-[#1e3328] text-white px-7 py-3.5 font-mono text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-sm"
            >
              <LogIn size={14} /> Enter Hub with Google
            </button>
            <button
              onClick={onEnterSandbox}
              className="rounded-xl bg-white hover:bg-[#faf8f4] border border-[#eae6dc] text-[#54645a] hover:text-[#1c2e24] px-7 py-3.5 font-mono text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5"
            >
              Explore Sandbox Portal <ArrowRight size={14} />
            </button>
          </div>

          <div className="pt-6 border-t border-[#efece2] flex items-center gap-4 text-[10px] font-mono text-[#6e7d73] uppercase tracking-wider">
            <span className="flex items-center gap-1">
              <ShieldCheck size={12} className="text-emerald-700" /> Firebase Auth segregate
            </span>
            <span className="h-4 w-px bg-neutral-200" />
            <span className="flex items-center gap-1">
              <Activity size={12} className="text-emerald-700" /> Real-time Vagal Logs
            </span>
          </div>
        </div>

        {/* Brand Mockup representation (Pages 2, 3 ROI of PDF) */}
        <div className="w-full md:w-80 shrink-0 space-y-4">
          <div className="bg-white border border-[#eae6dc] p-6 rounded-2xl shadow-sm text-center space-y-4 relative">
            <div className="absolute top-1 right-1 shrink-0 p-1 bg-amber-50 rounded-full border border-amber-100">
              <Sparkles size={11} className="text-amber-600" />
            </div>
            
            <img 
              src="/src/assets/images/vitalis_logo_1780752343589.png" 
              alt="Vitalis logo" 
              className="h-16 w-16 mx-auto rounded-xl object-cover border border-[#efece2]" 
              referrerPolicy="no-referrer" 
            />
            
            <div className="space-y-1">
              <h3 className="text-lg font-serif italic text-[#14231b] font-bold">Vitalis Wellness</h3>
              <p className="text-[10px] font-mono text-[#6e7d73] tracking-widest uppercase font-semibold">Integrative Health Platform</p>
            </div>

            <div className="bg-[#faf8f4] border border-[#efece2] rounded-xl p-3 text-left space-y-1">
              <div className="flex justify-between items-center text-[8px] font-mono text-[#8a3c25] uppercase font-bold">
                <span>Diurnal Coherence</span>
                <span>Calculated</span>
              </div>
              <div className="text-xl font-bold font-serif text-[#1c2e24]">78% Dynamic</div>
              <div className="h-1 w-full bg-[#efebe4] rounded-full overflow-hidden">
                <div className="h-full bg-[#2d4a3e]" style={{ width: "78%" }} />
              </div>
            </div>

            <p className="text-[10.5px] text-[#54645a] leading-normal font-sans italic">
              "Moving from reactive symptoms lookup to persistent preventive parasympathetic alignment."
            </p>
          </div>
        </div>
      </div>

      {/* 2. CORE SYSTEM FEATURES - SPIN WITH AIR */}
      <div className="space-y-10">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <span className="text-[9px] font-mono font-bold text-[#2d4a3e] bg-[#f2f6f4] border border-[#d3e5db] uppercase  p-1 px-3.5 rounded-full tracking-widest">
            ENGINE CHARACTERISTICS
          </span>
          <h2 className="text-3xl font-serif italic text-[#14231b] font-semibold">
            Features Designed to Restore Systemic Balance
          </h2>
          <p className="text-xs text-[#54645a] leading-relaxed max-w-lg mx-auto">
            Everything is carefully segmented, avoiding cluttered layouts. Explore the cohesive biological features below.
          </p>
        </div>

        {/* Dynamic selector list */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {featuresList.map((feat, index) => {
            const Icon = feat.icon;
            const isSel = activeFeature === index;
            return (
              <button
                key={index}
                onClick={() => setActiveFeature(index)}
                className={`p-5 w-full rounded-2xl border text-left flex items-start gap-4 transition-all duration-300 ${
                  isSel 
                    ? "bg-white border-[#365942] shadow-sm ring-1 ring-[#365942]/10" 
                    : "bg-[#faf8f4]/60 hover:bg-[#faf8f4] border-[#eae6dc]"
                }`}
              >
                <div className={`p-2.5 rounded-xl border shrink-0 ${isSel ? feat.color : "bg-white border-[#eae6dc] text-[#54645a]"}`}>
                  <Icon size={16} />
                </div>
                <div className="space-y-1 min-w-0 flex-1">
                  <h4 className="text-xs font-mono uppercase tracking-wider font-extrabold text-[#112117]">
                    {feat.title.split(" ")[0]} {feat.title.split(" ")[1]}
                  </h4>
                  <p className="text-[11px] text-[#54645a] line-clamp-1 truncate font-sans">{feat.title}</p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Feature Detail Board with enormous Breathing Space */}
        <div className="bg-white border border-[#eae6dc] rounded-3xl p-8 md:p-12 shadow-xs transition-all duration-500">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-stretch">
            {/* Detail copy */}
            <div className="space-y-6 flex flex-col justify-between">
              <div className="space-y-4">
                <span className={`inline-block border text-[9px] uppercase font-mono font-bold p-1 px-3.5 rounded-full ${featuresList[activeFeature].color}`}>
                  {featuresList[activeFeature].tag}
                </span>

                <h3 className="text-2xl sm:text-3xl font-serif italic text-[#14231b] font-semibold leading-snug">
                  {featuresList[activeFeature].title}
                </h3>

                <p className="text-xs text-[#54645a] leading-relaxed max-w-md font-medium">
                  {featuresList[activeFeature].description}
                </p>
              </div>

              <div className="bg-[#faf8f4] border border-[#efece2] rounded-xl p-4.5 space-y-1">
                <span className="text-[8px] font-mono text-[#365942] uppercase font-bold tracking-wider block">CLINICAL THERAPEUTIC ADVANTAGE</span>
                <p className="text-xs text-[#1c2e24] font-serif italic font-semibold">
                  "{featuresList[activeFeature].benefit}"
                </p>
              </div>
            </div>

            {/* Micro Graphic Represent */}
            <div className="p-8 rounded-2xl bg-[#faf8f4] border border-[#efece2] flex flex-col items-center justify-center text-center space-y-4 min-h-[14rem]">
              <Wind className="text-[#365942] animate-pulse" size={40} />
              <div className="space-y-1">
                <span className="text-[9px] font-mono text-[#6e7d73] uppercase tracking-wider font-bold block">DYNAMIC DEMO IN THE HUB</span>
                <h4 className="text-sm font-sans font-bold text-[#14231b]">Ready for immediate clinical down-regulation pacing</h4>
                <p className="text-[11px] text-[#54645a] max-w-xs leading-relaxed mx-auto">
                  Sign in or explore our sandbox platform to access full high-fidelity auditory loops and speak guidelines.
                </p>
              </div>
              <button
                onClick={onEnterGoogleAuth}
                className="rounded-lg bg-[#2d4a3e] text-white p-2 px-4 text-[10px] font-mono font-bold uppercase tracking-wider hover:bg-[#1e3328] transition-all"
              >
                Authenticate & Begin Pacing
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 3. SHOWCASE PRE-REGISTERED SPECIALISTS DIRECTORY */}
      <div className="space-y-10">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <span className="text-[9px] font-mono font-bold text-[#8a3c25] bg-[#fbf1ee] border border-[#efe0da] uppercase  p-1 px-3.5 rounded-full tracking-widest">
            VITALIS NETWORK
          </span>
          <h2 className="text-3xl font-serif italic text-[#14231b] font-semibold">
            Clinical Guides Ready for Direct Collaboration
          </h2>
          <p className="text-xs text-[#54645a] leading-relaxed max-w-lg mx-auto">
            Review certified neuro-endocrinologists and somatic practitioners in our secure telemedicine database, accessible inside the portal.
          </p>
        </div>

        {/* 2x2 grid representing professionals with smooth spacers */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6">
          {REGISTERED_PROFESSIONALS.slice(0, 2).map((prof) => (
            <div
              key={prof.id}
              className="bg-white border border-[#eae6dc] rounded-2xl p-6 shadow-3xs flex flex-col sm:flex-row gap-5 items-start"
            >
              <img
                src={prof.avatar}
                alt={prof.name}
                className="h-16 w-16 sm:h-20 sm:w-20 rounded-xl object-cover border border-[#f3f0e8] shrink-0"
                referrerPolicy="no-referrer"
              />
              <div className="space-y-2 flex-1 text-left">
                <div className="space-y-0.5">
                  <h3 className="text-sm font-serif italic font-bold text-[#1c2e24]">{prof.name}</h3>
                  <p className="text-[10px] text-[#365942] font-mono leading-none">{prof.role}</p>
                </div>
                <p className="text-[11px] text-[#54645a] leading-relaxed linen-clamp-2 line-clamp-2">
                  {prof.bio}
                </p>
                <div className="flex flex-wrap gap-1">
                  {prof.specialty.slice(0, 2).map((s, i) => (
                    <span key={i} className="text-[8px] font-mono bg-neutral-50 px-2 py-0.5 rounded text-neutral-600 border border-neutral-100">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center space-y-4">
          <button
            onClick={onEnterGoogleAuth}
            className="rounded-xl border border-[#eae6dc] hover:border-[#2d4a3e] bg-white hover:bg-[#f2f6f4] text-[#54645a] hover:text-[#2d4a3e] px-6 py-3 font-mono text-[10px] font-bold uppercase tracking-wider transition-all inline-flex items-center gap-1.5 shadow-3xs"
          >
            Access Full Physician Directory & Send Requests <ChevronRight size={13} />
          </button>
          
          <div>
            <button
              onClick={onProviderRegister}
              className="rounded-xl bg-[#faf8f4] hover:bg-white border border-[#eae6dc] hover:border-[#8a3c25] text-[#8a3c25] hover:text-[#5f2716] px-6 py-3 font-mono text-[10px] font-bold uppercase tracking-wider transition-all inline-flex items-center gap-2 shadow-sm"
            >
              <Stethoscope size={13} /> Clinicians / Consultants: Apply to Network Profile
            </button>
          </div>
        </div>
      </div>

    </div>
  );
}
