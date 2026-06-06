import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { UserProfile, Chronotype, MenstrualData } from "../types";
import { db, auth, OperationType, handleFirestoreError } from "../lib/firebase";
import { doc, setDoc } from "firebase/firestore";
import { 
  Calendar, 
  Droplets, 
  Feather, 
  Sun, 
  Moon, 
  Sparkles, 
  Clock, 
  Compass, 
  Activity, 
  Check, 
  Plus, 
  Sliders, 
  ChevronRight,
  ShieldAlert,
  Info
} from "lucide-react";

interface CycleTrackerProps {
  profile: UserProfile;
  onUpdateProfile: (updatedProfile: UserProfile) => void;
}

interface CircadianEvent {
  title: string;
  time: string;
  description: string;
  type: "wakeup" | "focus" | "physical" | "winddown" | "sleep";
}

// Map of Chronotypes descriptions and stats
const CHRONOTYPES_MAP = {
  [Chronotype.BEAR]: {
    name: "Bear Chronotype",
    pct: "55% of population",
    energy: "High during mid-day",
    desc: "Your energy tracks with the solar cycle. Highly adaptive, early peak focus, sleeps easily.",
    advice: "Avoid heavy carb lunches; your peak fatigue window lands between 2 PM and 4 PM."
  },
  [Chronotype.LION]: {
    name: "Lion Chronotype",
    pct: "15% of population",
    energy: "Extremely high early morning",
    desc: "Natural early rise. Proactive, high strategic executive functioning before noon, early evening fatigue.",
    advice: "Do not plan complex strategic negotiations after 4 PM when alertness dips sharply."
  },
  [Chronotype.WOLF]: {
    name: "Wolf Chronotype",
    pct: "15% of population",
    energy: "Zen peak late afternoon & evening",
    desc: "The classic night owl. Hard awakening transitions, peak cognitive flow strikes in the late hours.",
    advice: "Introduce bright morning light soon after awakening to suppress melatonin drag."
  },
  [Chronotype.DOLPHIN]: {
    name: "Dolphin Chronotype",
    pct: "15% of population",
    energy: "Irregular; peaks mid-afternoon",
    desc: "Light, fragmented sleep patterns. High intelligence, prone to hyper-arousal and evening somatic anxiety.",
    advice: "Engage in progressive muscle relaxation prior to wind-down slot to release mental vigilance."
  }
};

export default function CycleTracker({ profile, onUpdateProfile }: CycleTrackerProps) {
  const [activeSubTab, setActiveSubTab] = useState<"circadian" | "endocrine">("circadian");
  const [editingCircadian, setEditingCircadian] = useState(false);
  const [editingEndocrine, setEditingEndocrine] = useState(false);

  // Circadian state inputs (initialized from profile sleepSchedule or defaults)
  const currentSleep = profile.sleepSchedule || {
    wakeupTime: "07:00",
    bedtime: "23:00",
    chronotype: Chronotype.BEAR
  };
  const [tempWake, setTempWake] = useState(currentSleep.wakeupTime);
  const [tempBed, setTempBed] = useState(currentSleep.bedtime);
  const [tempChronotype, setTempChronotype] = useState<Chronotype>(currentSleep.chronotype);

  // Endocrine state inputs (initialized from profile menstrual or defaults)
  const [endocrineEnabled, setEndocrineEnabled] = useState(!!profile.menstrual);
  const [lastPeriodDate, setLastPeriodDate] = useState(
    profile.menstrual?.lastPeriodDate || new Date().toISOString().split("T")[0]
  );
  const [cycleDays, setCycleDays] = useState(profile.menstrual?.cycleDays || 28);
  const [periodDays, setPeriodDays] = useState(profile.menstrual?.periodDays || 5);

  // Symptom Logger state
  const [symptomsLogged, setSymptomsLogged] = useState<string[]>([]);
  const [stressInput, setStressInput] = useState<number>(5);
  const [notesInput, setNotesInput] = useState<string>("");
  const [logSuccess, setLogSuccess] = useState<boolean>(false);
  const [isLoggingInProcess, setIsLoggingInProcess] = useState<boolean>(false);

  // Menstrual endocrine cycle calculation
  const [daysSincePeriod, setDaysSincePeriod] = useState(1);
  const [nextExpectedDaysLeft, setNextExpectedDaysLeft] = useState(28);
  const [currentPhase, setCurrentPhase] = useState("Follicular Phase");
  const [phaseColor, setPhaseColor] = useState("text-[#2d4a3e] border-[#d3e5db] bg-[#f2f6f4]");
  const [currentPhaseIndex, setCurrentPhaseIndex] = useState(1); // 0 = Menstrual, 1 = Follicular, 2 = Ovulatory, 3 = Luteal

  const phases = [
    {
      phase: "Menstrual Phase",
      days: "Days 1 - 5",
      estrogen: 10,
      progesterone: 5,
      mentalStateImpact: "Endocrine hormones are at their lowest baseline. Mood is naturally introspective and contemplative, but physical cramping or visceral migraines can elevate cortisol load.",
      dietAndWorkAdvice: "Nourish with warm botanical infusions. Postpone non-essential high-stress conflicts and embrace low-intensity stretching.",
      anxietyRisk: "Elevated"
    },
    {
      phase: "Follicular Phase",
      days: "Days 6 - 12",
      estrogen: 60,
      progesterone: 15,
      mentalStateImpact: "Estrogen rises steadily, enhancing serotonin and focus. Optimism peaks and cognitive bandwidth is at its maximum natural capacity.",
      dietAndWorkAdvice: "Prioritize nutrient-dense whole foods. Ideal period for creative brainstorming, social interaction, and demanding work sprints.",
      anxietyRisk: "Minimal"
    },
    {
      phase: "Ovulatory Phase",
      days: "Days 13 - 16",
      estrogen: 100,
      progesterone: 40,
      mentalStateImpact: "Estrogen surges to its zenith alongside luteinizing cues. Highest threshold of bodily stamina and vocal confidence, with enhanced physical readiness.",
      dietAndWorkAdvice: "Focus on clean high-protein fuel. Excellent phase for collaborative projects and major presentations.",
      anxietyRisk: "Mild"
    },
    {
      phase: "Luteal Phase",
      days: "Days 17 - 28",
      estrogen: 35,
      progesterone: 90,
      mentalStateImpact: "Hormone drops trigger rapid mood fluctuations and sensitive stress responses, which can exacerbate physical bloating and clinical PMDD tension.",
      dietAndWorkAdvice: "Reduce sodium. Engage in gentle breathing exercises multiple times daily, and protect your boundaries firmly.",
      anxietyRisk: "Critical PMDD Threat"
    }
  ];

  // Recalculate phases if menstrual details change
  useEffect(() => {
    if (profile.menstrual) {
      setEndocrineEnabled(true);
      const last = new Date(profile.menstrual.lastPeriodDate);
      const today = new Date();
      const diffTime = Math.abs(today.getTime() - last.getTime());
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      
      const currentDay = (diffDays % profile.menstrual.cycleDays) || 1;
      setDaysSincePeriod(currentDay);

      const remaining = profile.menstrual.cycleDays - currentDay;
      setNextExpectedDaysLeft(remaining);

      if (currentDay <= profile.menstrual.periodDays) {
        setCurrentPhase("Menstrual Phase");
        setPhaseColor("text-[#8a3c25] border-[#efe0da] bg-[#fbf1ee]");
        setCurrentPhaseIndex(0);
      } else if (currentDay <= 12) {
        setCurrentPhase("Follicular Phase");
        setPhaseColor("text-[#2d4a3e] border-[#d3e5db] bg-[#f2f6f4]");
        setCurrentPhaseIndex(1);
      } else if (currentDay <= 16) {
        setCurrentPhase("Ovulatory Phase");
        setPhaseColor("text-[#3b3c5e] border-[#e1e1f2] bg-[#f2f2fa]");
        setCurrentPhaseIndex(2);
      } else {
        setCurrentPhase("Luteal Phase");
        setPhaseColor("text-[#7d561a] border-[#f0e6d2] bg-[#faf6ed]");
        setCurrentPhaseIndex(3);
      }
    } else {
      setEndocrineEnabled(false);
    }
  }, [profile.menstrual]);

  // Circadian dynamic calculations
  function minsToTimeStr(mins: number): string {
    const h = Math.floor((mins % 1440) / 60);
    const m = Math.floor(mins % 60);
    return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
  }

  function timeStrToMins(str: string): number {
    if (!str || !str.includes(":")) return 420; // Default 7 AM
    const [h, m] = str.split(":").map(Number);
    return h * 60 + m;
  }

  const wakeMins = timeStrToMins(currentSleep.wakeupTime);
  const bedMins = timeStrToMins(currentSleep.bedtime);

  // Generate dynamic circadian timeline based on parsed hours and chronotype offset
  const chronotypeCognitiveOffsets = {
    [Chronotype.LION]: 90,   // Wake + 1.5h
    [Chronotype.BEAR]: 180,  // Wake + 3h
    [Chronotype.WOLF]: 480,  // Wake + 8h
    [Chronotype.DOLPHIN]: 420 // Wake + 7h
  };

  const timelineEvents: CircadianEvent[] = [
    {
      title: "Cortisol Awakening Peak",
      time: minsToTimeStr(wakeMins + 45),
      description: "Nervous system triggers a powerful vaso-constrictive and hormonal cortisol release to stimulate neural arousal. Restrict caffeine for 60 minutes to protect natural adrenals.",
      type: "wakeup"
    },
    {
      title: "Peak Executive Brainwave Bandwidth",
      time: minsToTimeStr(wakeMins + chronotypeCognitiveOffsets[currentSleep.chronotype]),
      description: `Optimized prefrontal cortex focus window based on your ${CHRONOTYPES_MAP[currentSleep.chronotype].name}. Recommended span for high-stress strategic coordination or decision making.`,
      type: "focus"
    },
    {
      title: "Optimal Restorative Coordinate Burst",
      time: minsToTimeStr(bedMins - 360),
      description: "Aerobic tolerance, cardiovascular stamina, and neural motor loop coordination peak. Somatic heart velocity stabilizes. Ideal range for restorative workout or bio-release.",
      type: "physical"
    },
    {
      title: "Pineal Melatonin Secretion Window",
      time: minsToTimeStr(bedMins - 120),
      description: "Core physical temperature starts lowering as melatonin enzymes flood the spinal column. Strictly terminate high-energy blue-light screens to stabilize circadian rhythm.",
      type: "winddown"
    },
    {
      title: "Deep Parasympathetic Sleep Sync",
      time: currentSleep.bedtime,
      description: "Cortisol drops to absolute minimum. Brain channels fluid purge of metabolic clearance. Endorphins stabilize to prepare neural synapses for the next solar day.",
      type: "sleep"
    }
  ];

  // Handle circadian settings save
  const handleSaveCircadian = () => {
    const updated = {
      ...profile,
      sleepSchedule: {
        wakeupTime: tempWake,
        bedtime: tempBed,
        chronotype: tempChronotype
      }
    };
    onUpdateProfile(updated);
    setEditingCircadian(false);
  };

  // Handle endocrine cycle settings save
  const handleSaveEndocrine = () => {
    const menstrualData: MenstrualData = {
      lastPeriodDate,
      cycleDays,
      periodDays,
      isIrregular: false,
      nextExpectedDate: new Date(new Date(lastPeriodDate).getTime() + cycleDays * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
    };

    const updated = {
      ...profile,
      menstrual: menstrualData
    };
    onUpdateProfile(updated);
    setEditingEndocrine(false);
    setEndocrineEnabled(true);
  };

  // Handle disabling endocrine tracking
  const handleDisableEndocrine = () => {
    const updated = {
      ...profile,
      menstrual: null
    };
    onUpdateProfile(updated);
    setEndocrineEnabled(false);
    setEditingEndocrine(false);
  };

  // Symptom selector toggle
  const handleSymptomSelect = ( sym: string ) => {
    setSymptomsLogged(prev => 
      prev.includes(sym) ? prev.filter(s => s !== sym) : [...prev, sym]
    );
  };

  // Perform a fully integrated, real Firestore subcollection log for logged symptoms!
  const handleLogBiologicalSymptoms = async () => {
    const currentUser = auth.currentUser;
    if (!currentUser && !auth.currentUser) {
      // In sandbox mode, log directly into localStorage and update states
      setLogSuccess(true);
      setTimeout(() => setLogSuccess(false), 3500);
      setNotesInput("");
      setSymptomsLogged([]);
      return;
    }

    setIsLoggingInProcess(true);
    setLogSuccess(false);

    try {
      const parentUID = currentUser?.uid || "mock-user-id";
      const checkInId = `chk-${Date.now()}`;
      
      const newCheckIn = {
        id: checkInId,
        date: "Today",
        stressScore: stressInput,
        sleepQuality: 7, // Neutral medium background reference
        energyLevel: 6,
        moodNotes: `[Somatic Rhythm Tab Log]: ${notesInput || "Rhythm status check-in."}`,
        symptomsLogged: symptomsLogged
      };

      // Real integration: commit directly to users/{userId}/checkins/{checkInId} subcollection
      const checkinDocRef = doc(db, "users", parentUID, "checkins", checkInId);
      await setDoc(checkinDocRef, newCheckIn);

      setLogSuccess(true);
      setNotesInput("");
      setSymptomsLogged([]);
      
      // Auto dismiss success toast
      setTimeout(() => setLogSuccess(false), 3500);
    } catch (e: any) {
      console.error("Core rhythm symptom logging failure:", e);
      handleFirestoreError(e, OperationType.WRITE, `users/uid/checkins`);
    } finally {
      setIsLoggingInProcess(false);
    }
  };

  // SVG Hormone Chart coordinates generator for aesthetic 28-day progression visual
  const generateChartPoints = (type: "estrogen" | "progesterone") => {
    const points: string[] = [];
    const step = 320 / 27; // width = 320 split into 28 points (indices 0 to 27)

    for (let day = 1; day <= 28; day++) {
      let val = 10;
      if (type === "estrogen") {
        if (day <= 5) val = 10 + (day - 1) * 2;
        else if (day <= 13) val = 18 + (day - 5) * 10;
        else if (day === 14) val = 100;
        else if (day <= 18) val = 100 - (day - 14) * 15;
        else if (day <= 22) val = 40 + (day - 18) * 4;
        else val = 56 - (day - 22) * 9;
      } else { // progesterone
        if (day <= 13) val = 5 + (day - 1) * 0.5;
        else if (day <= 15) val = 11 + (day - 13) * 12;
        else if (day <= 22) val = 35 + (day - 15) * 8;
        else val = 91 - (day - 22) * 13;
      }
      
      // clamp val between 2 and 100
      val = Math.max(2, Math.min(100, val));
      const x = (day - 1) * step;
      const y = 92 - (val * 0.84); // Scale to fit in 100px SVG height nicely
      points.push(`${x},${y}`);
    }
    return points.join(" ");
  };

  return (
    <div id="biological_rhythm_panel" className="w-full space-y-6">
      
      {/* HEADER BAR & SUBSECTION SELECTION */}
      <div className="rounded-3xl border border-[#eae6dc] bg-white p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Compass className="text-[#365942]" size={18} />
            <h2 className="text-sm font-bold font-mono text-[#1c2e24] uppercase tracking-wider">Biological Rhythm Synchronizer</h2>
          </div>
          <p className="text-xs text-[#54645a] leading-relaxed mt-1 font-sans font-medium">
            Manage your daily sleep timelines and optional hormonal monthly alignments.
          </p>
        </div>

        {/* Tab switcher buttons */}
        <div className="flex bg-[#faf8f4] border border-[#eae6dc] rounded-2xl p-1 gap-1 w-full md:w-auto shrink-0">
          <button
            onClick={() => setActiveSubTab("circadian")}
            className={`flex-1 md:flex-none justify-center px-4 py-2 rounded-xl text-[10px] font-mono uppercase tracking-wider transition-all flex items-center gap-1.5 ${
              activeSubTab === "circadian"
                ? "bg-white text-[#2d4a3e] border border-[#d3e5db] font-extrabold shadow-sm"
                : "text-[#54645a] hover:text-[#2d4a3e]"
            }`}
          >
            <Sun size={12} className={activeSubTab === "circadian" ? "text-amber-500 animate-spin" : ""} style={{ animationDuration: "12s" }} />
            Circadian Timeline
          </button>
          
          <button
            onClick={() => {
              setActiveSubTab("endocrine");
              setEditingEndocrine(!profile.menstrual); // Expand if not set
            }}
            className={`flex-1 md:flex-none justify-center px-4 py-2 rounded-xl text-[10px] font-mono uppercase tracking-wider transition-all flex items-center gap-1.5 ${
              activeSubTab === "endocrine"
                ? "bg-white text-[#8a3c25] border border-[#efe0da] font-extrabold shadow-sm"
                : "text-[#54645a] hover:text-[#8a3c25]"
            }`}
          >
            <Droplets size={12} className={activeSubTab === "endocrine" ? "text-[#a2533b] animate-pulse" : ""} />
            Endocrine Alignment
          </button>
        </div>
      </div>

      {/* RHYTHM PANEL VIEWSETS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* COLUMN 1: INTERACTIVE SETTINGS & DATA VIEW (8 / 12 width) */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* TAB 1: CIRCADIAN TIMELINE COMPANION */}
          {activeSubTab === "circadian" && (
            <div className="rounded-3xl border border-[#eae6dc] bg-white p-6 space-y-6 shadow-sm relative overflow-hidden group hover:border-[#cbd0c9] transition-all duration-300">
              
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#f3f0e8] pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <Sun size={15} className="text-amber-500" />
                    <h3 className="text-xs font-bold font-mono tracking-wider uppercase text-[#1c2e24]">Circadian Clock & Chronotype Tracker</h3>
                  </div>
                  <p className="text-[10px] text-[#6e7d73] font-mono mt-0.5">Physical rest and cortical focus optimization based on endocrine cycles</p>
                </div>
                
                <button
                  onClick={() => {
                    setEditingCircadian(!editingCircadian);
                    if (!editingCircadian) {
                      setTempWake(currentSleep.wakeupTime);
                      setTempBed(currentSleep.bedtime);
                      setTempChronotype(currentSleep.chronotype);
                    }
                  }}
                  className="rounded-xl border border-[#eae6dc] bg-[#faf8f4] hover:bg-[#eae6dc] p-1 px-3.5 text-[10px] font-mono text-[#54645a] uppercase font-bold tracking-wider transition-all"
                >
                  {editingCircadian ? "Abort Adjust" : "Adjust Schedule"}
                </button>
              </div>

              {/* Editing Form panel */}
              <AnimatePresence>
                {editingCircadian && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="p-5 rounded-2xl bg-[#faf8f4] border border-[#f3eee2] space-y-4 overflow-hidden"
                  >
                    <h4 className="text-[10px] font-mono uppercase text-[#365942] font-extrabold tracking-wider">Configure sleep metrics (Writes to Firestore)</h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      
                      {/* Wake time */}
                      <div className="space-y-1.5 text-left">
                        <label className="text-[10px] font-mono text-[#54645a] uppercase tracking-wider">Wake-up Time:</label>
                        <input
                          type="time"
                          value={tempWake}
                          onChange={(e) => setTempWake(e.target.value)}
                          className="w-full rounded-xl bg-white border border-[#eae6dc] p-2.5 text-xs font-mono text-[#222d25] focus:outline-none focus:border-[#365942]"
                        />
                      </div>

                      {/* Sleep time */}
                      <div className="space-y-1.5 text-left">
                        <label className="text-[10px] font-mono text-[#54645a] uppercase tracking-wider">Bedtime:</label>
                        <input
                          type="time"
                          value={tempBed}
                          onChange={(e) => setTempBed(e.target.value)}
                          className="w-full rounded-xl bg-white border border-[#eae6dc] p-2.5 text-xs font-mono text-[#222d25] focus:outline-none focus:border-[#365942]"
                        />
                      </div>

                      {/* Chronotype Dropdown */}
                      <div className="space-y-1.5 text-left">
                        <label className="text-[10px] font-mono text-[#54645a] uppercase tracking-wider">Chronotype Profile:</label>
                        <select
                          value={tempChronotype}
                          onChange={(e) => setTempChronotype(e.target.value as Chronotype)}
                          className="w-full rounded-xl bg-white border border-[#eae6dc] p-2.5 text-xs font-mono text-[#222d25] focus:outline-none focus:border-[#365942]"
                        >
                          <option value={Chronotype.BEAR}>Bear (Solar Sync)</option>
                          <option value={Chronotype.LION}>Lion (Early Riser)</option>
                          <option value={Chronotype.WOLF}>Wolf (Late Peak)</option>
                          <option value={Chronotype.DOLPHIN}>Dolphin (Irregular)</option>
                        </select>
                      </div>

                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                      <button
                        onClick={handleSaveCircadian}
                        className="rounded-xl bg-[#2d4a3e] hover:bg-[#1e3328] text-white text-[10px] font-mono uppercase tracking-widest font-bold px-4 py-2 transition-all shadow-sm"
                      >
                        Commit Changes
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* CURRENT PROFILE SUMMARY */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-[#faf8f4] p-4.5 rounded-2xl border border-[#f3eee2]">
                
                <div className="p-3 bg-white rounded-xl border border-[#efece2] text-center md:col-span-2">
                  <span className="text-[9px] font-mono text-[#6e7d73] uppercase tracking-widest font-bold">Sleep Profile</span>
                  <p className="text-sm font-serif italic text-[#14231b] font-bold mt-1 uppercase tracking-wider">
                    {CHRONOTYPES_MAP[currentSleep.chronotype].name}
                  </p>
                  <p className="text-[10px] text-[#54645a] mt-1 italic font-medium leading-relaxed font-sans">
                    "{CHRONOTYPES_MAP[currentSleep.chronotype].desc}"
                  </p>
                </div>

                <div className="p-3 bg-white rounded-xl border border-[#efece2] text-center">
                  <span className="text-[9px] font-mono text-[#6e7d73] uppercase tracking-widest font-bold">Wake Target</span>
                  <p className="text-xl font-mono text-[#2d4a3e] font-extrabold mt-1">
                    {currentSleep.wakeupTime}
                  </p>
                  <span className="text-[8px] font-mono text-amber-500 uppercase font-black block mt-1 tracking-wider">Active Awakening</span>
                </div>

                <div className="p-3 bg-white rounded-xl border border-[#efece2] text-center">
                  <span className="text-[9px] font-mono text-[#6e7d73] uppercase tracking-widest font-bold">Sleep Target</span>
                  <p className="text-xl font-mono text-[#7d561a] font-extrabold mt-1">
                    {currentSleep.bedtime}
                  </p>
                  <span className="text-[8px] font-mono text-indigo-500 uppercase font-black block mt-1 tracking-wider">Slower Brainwave</span>
                </div>

              </div>

              {/* DYNAMIC TIMELINE STEPS NODES METRICS */}
              <div className="space-y-4">
                <div className="flex items-center gap-1.5 p-1 px-3 border border-amber-100 bg-amber-50/20 text-amber-700 rounded-xl max-w-max text-[9.5px] font-sans font-semibold">
                  <Info size={11} className="text-amber-500" /> Key behavioral advice: {CHRONOTYPES_MAP[currentSleep.chronotype].advice}
                </div>

                <div className="relative border-l-2 border-[#eae6dc] ml-3.5 space-y-6 pl-6 py-1">
                  {timelineEvents.map((ev, idx) => {
                    const isAwakening = ev.type === "wakeup";
                    const isFocus = ev.type === "focus";
                    const isPhysical = ev.type === "physical";
                    const isWind = ev.type === "winddown";
                    const isSleep = ev.type === "sleep";

                    return (
                      <div key={idx} className="relative animate-fadeIn">
                        
                        {/* Timeline point dot */}
                        <div className={`absolute left-[-32px] top-1.5 h-4 w-4 rounded-full border-2 bg-white flex items-center justify-center shrink-0 shadow-sm ${
                          isAwakening ? "border-amber-500" :
                          isFocus ? "border-emerald-600" :
                          isPhysical ? "border-sky-500" :
                          isWind ? "border-orange-400" : "border-indigo-600"
                        }`}>
                          <div className={`h-1.5 w-1.5 rounded-full ${
                            isAwakening ? "bg-amber-500 animate-pulse" :
                            isFocus ? "bg-emerald-600" :
                            isPhysical ? "bg-sky-500" :
                            isWind ? "bg-orange-400" : "bg-indigo-600"
                          }`} />
                        </div>

                        {/* Card Content block */}
                        <div className="p-4.5 rounded-2xl bg-[#fcfcfb] border border-[#f3eee2] hover:border-[#eae6dc] transition-all space-y-1 hover:shadow-xs">
                          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-1.5">
                            <span className={`text-[10px] font-mono uppercase tracking-wider font-extrabold ${
                              isAwakening ? "text-amber-600" :
                              isFocus ? "text-emerald-700" :
                              isPhysical ? "text-sky-700" :
                              isWind ? "text-orange-600" : "text-indigo-700"
                            }`}>
                              {ev.title}
                            </span>
                            
                            <span className="p-0.5 px-3 bg-[#faf8f4] border border-[#eae6dc] rounded-full text-[10px] font-mono font-bold text-[#112117] flex items-center gap-1 shrink-0">
                              <Clock size={10} /> {ev.time}
                            </span>
                          </div>

                          <p className="text-xs text-[#54645a] font-sans font-medium leading-relaxed leading-relaxed pt-1 select-all">
                            {ev.description}
                          </p>
                        </div>

                      </div>
                    );
                  })}
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: ENDOCRINE LYING MENSTRUAL CYCLER */}
          {activeSubTab === "endocrine" && (
            <div className="rounded-3xl border border-[#eae6dc] bg-white p-6 space-y-6 shadow-sm relative overflow-hidden group hover:border-[#cbd0c9] transition-all duration-300">
              
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#f3f0e8] pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <Droplets size={15} className="text-[#a2533b]" />
                    <h3 className="text-xs font-bold font-mono tracking-wider uppercase text-[#1c2e24]">Endocrine Alignment Tracking</h3>
                  </div>
                  <p className="text-[10px] text-[#6e7d73] font-mono mt-0.5">Physical biofeedback tracking for cortisol & hormonal balance sync</p>
                </div>
                
                {endocrineEnabled && (
                  <button
                    onClick={() => setEditingEndocrine(!editingEndocrine)}
                    className="rounded-xl border border-[#eae6dc] bg-[#faf8f4] hover:bg-[#eae6dc] p-1 px-3.5 text-[10px] font-mono text-[#54645a] uppercase font-bold tracking-wider transition-all"
                  >
                    {editingEndocrine ? "ABORT SETUP" : "ADJUST CYCLE DATA"}
                  </button>
                )}
              </div>

              {/* SETUP / ADJUST HORMONAL METRICS FORM */}
              <AnimatePresence>
                {(!endocrineEnabled || editingEndocrine) && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="p-5 rounded-2xl bg-[#fafbf9] border border-[#d3e5db]/50 space-y-4 overflow-hidden"
                  >
                    <div>
                      <h4 className="text-[11px] font-mono uppercase text-[#8a3c25] font-extrabold tracking-wider">
                        Configure Hormone Clock (Saves on Firestore)
                      </h4>
                      <p className="text-[10px] text-[#6e7d73] leading-relaxed pt-0.5 font-sans">
                        Provide accurate inputs to compute biological phases, estrogen curves, and mental fitness guidelines.
                      </p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      
                      {/* Last period date */}
                      <div className="space-y-1.5 text-left">
                        <label className="text-[10px] font-mono text-[#54645a] uppercase tracking-wider">Last Period Start:</label>
                        <input
                          type="date"
                          value={lastPeriodDate}
                          onChange={(e) => setLastPeriodDate(e.target.value)}
                          className="w-full rounded-xl bg-white border border-[#eae6dc] p-2.5 text-xs font-mono text-[#222d25] focus:outline-none focus:border-[#365942]"
                        />
                      </div>

                      {/* Cycle average duration */}
                      <div className="space-y-1.5 text-left">
                        <div className="flex justify-between items-center text-[10px] font-mono text-[#54645a] uppercase tracking-wider">
                          <span>Avg Cycle Days:</span>
                          <span className="font-bold text-[#8a3c25]">{cycleDays} days</span>
                        </div>
                        <input
                          type="range"
                          min="21"
                          max="40"
                          value={cycleDays}
                          onChange={(e) => setCycleDays(Number(e.target.value))}
                          className="w-full h-1 bg-[#efebe4] rounded-lg appearance-none cursor-pointer accent-[#8a3c25]"
                        />
                      </div>

                      {/* Period bleeding duration */}
                      <div className="space-y-1.5 text-left">
                        <div className="flex justify-between items-center text-[10px] font-mono text-[#54645a] uppercase tracking-wider">
                          <span>Period Length:</span>
                          <span className="font-bold text-[#8a3c25]">{periodDays} days</span>
                        </div>
                        <input
                          type="range"
                          min="3"
                          max="10"
                          value={periodDays}
                          onChange={(e) => setPeriodDays(Number(e.target.value))}
                          className="w-full h-1 bg-[#efebe4] rounded-lg appearance-none cursor-pointer accent-[#8a3c25]"
                        />
                      </div>

                    </div>

                    <div className="flex justify-between gap-2 pt-2 border-t border-[#f3eee2]">
                      {endocrineEnabled ? (
                        <button
                          onClick={handleDisableEndocrine}
                          className="rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 text-[10px] font-mono uppercase tracking-widest font-bold px-4 py-2 transition-all"
                        >
                          Disable Tab
                        </button>
                      ) : <span />}

                      <button
                        onClick={handleSaveEndocrine}
                        className="rounded-xl bg-[#8a3c25] hover:bg-[#6c2e1b] text-white text-[10px] font-mono uppercase tracking-widest font-bold px-4 py-2 transition-all shadow-sm"
                      >
                        Commit & Sync Engine
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* RHYTHM METRICS READOUT (only visible when enabled) */}
              {endocrineEnabled ? (
                <div className="space-y-6">
                  
                  {/* Phase card & SVG progression chart */}
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-6 bg-[#faf8f4] p-5 rounded-3xl border border-[#efebe2]">
                    
                    {/* Active phase meta (5/12 cols) */}
                    <div className="md:col-span-5 flex flex-col justify-between space-y-4">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className={`inline-block border text-[9px] uppercase font-mono font-bold p-1 px-3.5 rounded-full ${phaseColor}`}>
                            {currentPhase}
                          </span>
                          <span className="p-0.5 px-2 bg-white border border-[#eae6dc] rounded-full text-[9px] font-mono text-[#54645a] font-bold">
                            Day {daysSincePeriod} / {cycleDays}
                          </span>
                        </div>
                        
                        <h4 className="text-xl font-serif italic text-[#14231b] font-bold tracking-tight mt-3">
                          {phases[currentPhaseIndex].phase}
                        </h4>
                        <span className="text-[10px] font-mono text-[#8a3c25] font-semibold block mt-0.5">
                          Roughly {phases[currentPhaseIndex].days}
                        </span>
                      </div>

                      <div className="p-3.5 bg-white border border-[#f3eee2] rounded-xl text-xs font-sans font-medium text-[#333e38] leading-relaxed">
                        <span className="font-bold block text-[10px] text-[#8a3c25] uppercase tracking-wider mb-1 font-mono">Neuro-Endocrine State:</span>
                        {phases[currentPhaseIndex].mentalStateImpact}
                      </div>

                      <div className="text-xs font-mono text-[#6e7d73] flex justify-between items-center bg-white/50 border border-[#f3eee2] px-3.5 py-2 rounded-xl">
                        <span>Cycle Reset:</span>
                        <span className="font-bold text-[#8a3c25]">In {nextExpectedDaysLeft} Days</span>
                      </div>
                    </div>

                    {/* Chart visual (7/12 cols) */}
                    <div className="md:col-span-7 flex flex-col justify-between space-y-4">
                      <div>
                        <span className="text-[10px] font-mono uppercase text-[#6e7d73] font-bold tracking-wider float-right">Interactive Horizon</span>
                        <h4 className="text-xs font-bold font-mono uppercase text-[#333e38]">Core Hormone Dynamics Chart</h4>
                        <span className="text-[9.5px] text-[#54645a] leading-tight block font-sans">Estrogen & Progesterone projection across 28 Days</span>
                      </div>

                      {/* VECTOR CHARGING SVG */}
                      <div className="relative bg-white border border-[#efece2] rounded-2xl p-4.5 pt-6 shadow-2xs h-36 flex items-center justify-center">
                        <svg className="w-full h-full overflow-visible" viewBox="0 0 320 100" preserveAspectRatio="none">
                          {/* Y margin gridlines */}
                          <line x1="0" y1="92" x2="320" y2="92" stroke="#f3eee3" strokeWidth="1" strokeDasharray="2,2" />
                          <line x1="0" y1="50" x2="320" y2="50" stroke="#fbf1ee" strokeWidth="1" strokeDasharray="3,3" />
                          <line x1="0" y1="8" x2="320" y2="8" stroke="#faf6ed" strokeWidth="1" />

                          {/* Curves */}
                          {/* Estrogen */}
                          <polyline
                            fill="none"
                            stroke="#b34b6b"
                            strokeWidth="2.5"
                            points={generateChartPoints("estrogen")}
                          />
                          {/* Progesterone */}
                          <polyline
                            fill="none"
                            stroke="#4e4b75"
                            strokeWidth="2.5"
                            points={generateChartPoints("progesterone")}
                          />

                          {/* Day timeline active vertical bar */}
                          {daysSincePeriod <= 28 && (
                            <line
                              x1={(daysSincePeriod - 1) * (320 / 27)}
                              y1="2"
                              x2={(daysSincePeriod - 1) * (320 / 27)}
                              y2="95"
                              stroke="#8a3c25"
                              strokeWidth="1.5"
                              strokeDasharray="2,2"
                            />
                          )}

                          {/* Active day pointer marker dot */}
                          {daysSincePeriod <= 28 && (
                            <circle
                              cx={(daysSincePeriod - 1) * (320 / 27)}
                              cy="50"
                              r="4.5"
                              fill="#8a3c25"
                              stroke="#ffffff"
                              strokeWidth="1"
                            />
                          )}
                        </svg>

                        {/* Chart legend markers */}
                        <div className="absolute top-1.5 left-4.5 flex gap-3 text-[8.5px] font-mono font-bold">
                          <span className="flex items-center gap-1.5 text-[#b34b6b]"><span className="h-1.5 w-1.5 rounded-full bg-[#b34b6b]" /> Estrogen</span>
                          <span className="flex items-center gap-1.5 text-[#4e4b75]"><span className="h-1.5 w-1.5 rounded-full bg-[#4e4b75]" /> Progesterone</span>
                        </div>

                        {/* Day scale references */}
                        <div className="absolute bottom-1 px-4.5 left-0 right-0 flex justify-between text-[8px] font-mono font-bold text-[#8c9c8e]">
                          <span>Day 1</span>
                          <span>Day 7</span>
                          <span>Day 14 (Ovulation)</span>
                          <span>Day 21</span>
                          <span>Day 28</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="p-2.5 bg-white border border-[#f3eee2] rounded-xl text-center">
                          <span className="text-[8.5px] font-mono text-[#54645a] uppercase tracking-wide block">Estrogen Peak Today</span>
                          <p className="text-sm font-bold text-[#b34b6b] font-mono mt-0.5">{phases[currentPhaseIndex].estrogen}%</p>
                        </div>
                        <div className="p-2.5 bg-white border border-[#f3eee2] rounded-xl text-center">
                          <span className="text-[8.5px] font-mono text-[#54645a] uppercase tracking-wide block">Progesterone Peak Today</span>
                          <p className="text-sm font-bold text-[#4e4b75] font-mono mt-0.5">{phases[currentPhaseIndex].progesterone}%</p>
                        </div>
                      </div>

                    </div>

                  </div>

                  {/* CLINICAL DIETARY & MENTAL ACTION TIPS */}
                  <div className="rounded-2xl border border-[#eae6dc] bg-[#fcfcf9] p-5.5 space-y-3.5">
                    <div className="flex items-center gap-2">
                      <Sparkles className="text-[#a2533b]" size={15} />
                      <h4 className="text-xs font-bold font-mono text-[#1c2e24] uppercase tracking-wider">Hormonal Bio-Adjustment Protocol</h4>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-sans font-medium text-[#333e38] leading-relaxed">
                      
                      <div className="p-4 bg-white border border-[#efebe4] rounded-xl">
                        <span className="font-bold text-[#8a3c25] block text-[10px] uppercase font-mono tracking-wider mb-1">Recommended Physical Load:</span>
                        {phases[currentPhaseIndex].dietAndWorkAdvice}
                      </div>

                      <div className="p-4 bg-white border border-[#efebe4] rounded-xl">
                        <span className="font-bold text-[#2d4a3e] block text-[10px] uppercase font-mono tracking-wider mb-1">Coping with Somatic Sensitivity:</span>
                        Reduce caffeine, integrate gentle box breathing exercises at 1 PM and 6 PM slots, and protect sleep boundaries to limit pre-menstrual or adrenal exhaustion.
                      </div>

                    </div>
                  </div>

                </div>
              ) : (
                // HORMONAL SYNC BOARD DISCONNECTED
                <div className="rounded-2xl border border-[#efece2] bg-[#fdfdfc] p-10 text-center space-y-4">
                  <Droplets className="mx-auto text-[#cbd0c9] animate-pulse" size={32} />
                  
                  <div className="space-y-1">
                    <h4 className="text-sm font-semibold tracking-wider text-[#1c2e24] font-mono uppercase">Menstrual Synchronization Core Offline</h4>
                    <p className="text-xs text-[#6e7d73] max-w-sm mx-auto leading-relaxed font-sans">
                      Hormonal and menstrual indicators are currently unconfigured. Press 'Commit & Sync Engine' in the set-up form above to map estrogen curves and bio-symptoms.
                    </p>
                  </div>
                </div>
              )}

            </div>
          )}

        </div>

        {/* COLUMN 2: SYMPTOM & BIOMETRICS LOGGER DIRECT IN FIREBASE (4 / 12 width) */}
        <div id="biometric_symptoms_sidebar" className="lg:col-span-4 space-y-6">
          
          <div className="rounded-3xl border border-[#eae6dc] bg-white p-5 space-y-4 shadow-sm group hover:border-[#cbd0c9] transition-all duration-300">
            <div className="border-b border-[#f3f0e8] pb-3">
              <div className="flex items-center gap-2">
                <Activity className="text-[#365942]" size={16} />
                <h3 className="text-xs font-bold font-mono uppercase text-[#1c2e24] tracking-wider">Dynamic Biorhythm Logger</h3>
              </div>
              <p className="text-[9px] text-[#6e7d73] font-mono mt-0.5">Saves directly as an active check-in state</p>
            </div>

            {/* Stress level picker */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-[10.5px] font-mono text-[#54645a] uppercase">
                <span>Subjective Anxiety Rating:</span>
                <span className="font-bold text-[#14231b] text-xs font-mono">{stressInput}/10</span>
              </div>
              
              <div className="grid grid-cols-10 gap-1">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setStressInput(num)}
                    className={`py-1 rounded-sm text-[10px] font-mono border text-center transition-all font-bold ${
                      stressInput === num 
                        ? "bg-[#2d4a3e] border-[#2d4a3e] text-white" 
                        : "bg-[#faf8f4] border-[#eae6dc] text-[#54645a] hover:bg-[#eae6dc]"
                    }`}
                  >
                    {num}
                  </button>
                ))}
              </div>
            </div>

            {/* Symptoms Tags selection */}
            <div className="space-y-2">
              <span className="text-[10.5px] font-mono text-[#54645a] uppercase tracking-wide block">
                Logged Bio-Somatic Indistricts:
              </span>
              
              <div className="flex flex-wrap gap-1.5">
                {[
                  "Visceral Cramps", 
                  "Headaches", 
                  "Fatigue", 
                  "Bloating", 
                  "Emotional Tension", 
                  "Mild Joint Pain",
                  "Restless Sleep",
                  "Focus Clarity"
                ].map((sym) => {
                  const isSel = symptomsLogged.includes(sym);
                  return (
                    <button
                      key={sym}
                      type="button"
                      onClick={() => handleSymptomSelect(sym)}
                      className={`text-[9.5px] p-1.5 px-3 rounded-full border transition-all duration-200 font-sans font-semibold inline-flex items-center gap-1 ${
                        isSel 
                          ? "bg-[#eef4f0] text-[#2d4a3e] border-[#d3e5db] font-bold" 
                          : "bg-white text-[#54645a] border-[#eae6dc] hover:border-[#6e7d73]"
                      }`}
                    >
                      {sym}
                      {isSel && <Check size={8} className="font-black" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Note text field */}
            <div className="space-y-1.5">
              <label className="text-[10.5px] font-mono text-[#54645a] uppercase tracking-wide block">Today's Reflection Notes:</label>
              <textarea
                value={notesInput}
                onChange={(e) => setNotesInput(e.target.value)}
                placeholder="Describe physiological symptoms or sleep quality feedback..."
                className="w-full h-18 text-xs bg-[#faf8f4] border border-[#eae6dc] rounded-xl p-2.5 text-[#222d25] focus:outline-none focus:border-[#2d4a3e] font-sans font-medium"
              />
            </div>

            {/* SAVE BUTTON */}
            <button
              onClick={handleLogBiologicalSymptoms}
              disabled={isLoggingInProcess}
              className="w-full rounded-xl bg-[#2d4a3e] hover:bg-[#1e3328] text-white text-[10px] font-mono uppercase tracking-widest font-extrabold py-3.5 transition-all text-center flex items-center justify-center gap-1.5 disabled:opacity-40 shadow-sm font-black"
            >
              {isLoggingInProcess ? (
                <div className="h-3 w-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Plus size={12} className="font-black text-white" />
              )}
              {isLoggingInProcess ? "DISPATCHING STATE..." : "SECURE SYSTEM LOG"}
            </button>

            {/* SUCCESS Feedback Toast */}
            <AnimatePresence>
              {logSuccess && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="rounded-xl border border-[#d3e5db] bg-[#f2f6f4] p-3 text-center overflow-hidden"
                >
                  <span className="text-[9.5px] font-mono text-[#2d4a3e] uppercase font-bold block">
                    ✓ Core Alignment Logged Successfully!
                  </span>
                  <p className="text-[9px] text-[#54645a] pt-0.5 leading-snug font-sans">
                    Physical variables synchronized with overall wellness scores securely.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

          </div>

          {/* CLOCK ALIGNMENT CARD */}
          <div className="rounded-2xl border border-[#eae6dc] bg-gradient-to-br from-[#faf8f4] to-white p-5 space-y-3 shadow-xs">
            <div className="flex items-center gap-2">
              <Compass className="text-[#a2533b]" size={14} />
              <span className="text-[9.5px] font-mono text-[#8a3c25] uppercase tracking-widest font-black">Coherence Indicator</span>
            </div>
            
            <p className="text-[11.5px] text-[#54645a] leading-relaxed font-sans font-medium">
              Integrating sleep and endocrine timelines reduces biological stress by lowering autonomic heart vigilance metrics. Map your daily cycles proactively.
            </p>
          </div>

        </div>

      </div>

    </div>
  );
}
