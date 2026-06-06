import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Play, Square, Volume2, VolumeX, Sparkles, Wind, Volume1, Trophy, Calendar, Check } from "lucide-react";
import { BreathingSession } from "../types";

type BreathPhase = "Inhale" | "Hold Full" | "Exhale" | "Hold Empty";

interface BreathingExerciseProps {
  onSaveSession: (roundsCompleted: number, durationSeconds: number) => Promise<void>;
  sessions: BreathingSession[];
}

export default function BreathingExercise({ onSaveSession, sessions }: BreathingExerciseProps) {
  const [isActive, setIsActive] = useState(false);
  const [phase, setPhase] = useState<BreathPhase>("Inhale");
  const [secondsLeft, setSecondsLeft] = useState(4);
  const [isSoundOn, setIsSoundOn] = useState(false);
  const [isVoiceOn, setIsVoiceOn] = useState(true);
  const [sessionCompleted, setSessionCompleted] = useState(0);
  const [isSaving, setIsSaving] = useState(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
  // HTML5 Synthesizer refs for Zen alpha wave audio play
  const audioCtxRef = useRef<AudioContext | null>(null);
  const oscRef1 = useRef<OscillatorNode | null>(null);
  const oscRef2 = useRef<OscillatorNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);

  // Cycle times config (standard box breathing is 4-4-4-4)
  const countThreshold = 4;

  const startAudio = () => {
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      
      const ctx = audioCtxRef.current;
      if (ctx.state === "suspended") {
        ctx.resume();
      }

      // Binaural alpha waves setup (136Hz and 146Hz produces soothing beat)
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc1.type = "sine";
      osc1.frequency.setValueAtTime(136.1, ctx.currentTime); 
      
      osc2.type = "sine";
      osc2.frequency.setValueAtTime(144.1, ctx.currentTime); 

      gain.gain.setValueAtTime(0.0, ctx.currentTime); // Start quiet

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);

      osc1.start();
      osc2.start();

      oscRef1.current = osc1;
      oscRef2.current = osc2;
      gainNodeRef.current = gain;

    } catch (e) {
      console.warn("Web audio failure:", e);
    }
  };

  const stopAudio = () => {
    if (oscRef1.current) {
      try { oscRef1.current.stop(); } catch(e){}
      oscRef1.current = null;
    }
    if (oscRef2.current) {
      try { oscRef2.current.stop(); } catch(e){}
      oscRef2.current = null;
    }
    if (gainNodeRef.current) {
      gainNodeRef.current = null;
    }
  };

  // Web Speech Synthesis / voice announcer
  const speakPhase = (phaseName: BreathPhase) => {
    if (!("speechSynthesis" in window)) return;
    try {
      window.speechSynthesis.cancel(); // Clears any queued speech
      let statement = "";
      switch (phaseName) {
        case "Inhale":
          statement = "Breathe in deeply";
          break;
        case "Hold Full":
          statement = "Hold your breath";
          break;
        case "Exhale":
          statement = "Breathe out completely";
          break;
        case "Hold Empty":
          statement = "And rest in stillness";
          break;
      }
      const utterance = new SpeechSynthesisUtterance(statement);
      utterance.rate = 0.85; // Relaxed pacing
      utterance.pitch = 1.0; // Warm natural pitch
      window.speechSynthesis.speak(utterance);
    } catch (err) {
      console.warn("TTS Speech Synthesis failed:", err);
    }
  };

  // Announce phase transitions when voice guidance is enabled
  useEffect(() => {
    if (isActive && isVoiceOn) {
      speakPhase(phase);
    }
  }, [phase, isActive, isVoiceOn]);

  // Adjust synthesizer gain based on breath phase
  useEffect(() => {
    if (!isSoundOn || !gainNodeRef.current || !audioCtxRef.current) return;
    const ctx = audioCtxRef.current;
    const gain = gainNodeRef.current;

    if (phase === "Inhale") {
      gain.gain.linearRampToValueAtTime(0.03, ctx.currentTime + 3.9);
    } else if (phase === "Hold Full") {
      gain.gain.setValueAtTime(0.03, ctx.currentTime);
    } else if (phase === "Exhale") {
      gain.gain.linearRampToValueAtTime(0.005, ctx.currentTime + 3.9);
    } else {
      gain.gain.setValueAtTime(0.0, ctx.currentTime);
    }
  }, [phase, isSoundOn]);

  useEffect(() => {
    if (isActive) {
      if (isSoundOn) {
        startAudio();
      }
      
      timerRef.current = setInterval(() => {
        setSecondsLeft((prev) => {
          if (prev <= 1) {
            // Transition phase
            setPhase((currPhase) => {
              switch (currPhase) {
                case "Inhale":
                  return "Hold Full";
                case "Hold Full":
                  return "Exhale";
                case "Exhale":
                  return "Hold Empty";
                case "Hold Empty":
                  setSessionCompleted((c) => c + 1);
                  return "Inhale";
                default:
                  return "Inhale";
              }
            });
            return countThreshold;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
      stopAudio();
      setPhase("Inhale");
      setSecondsLeft(countThreshold);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      stopAudio();
    };
  }, [isActive, isSoundOn]);

  const handleToggleSound = () => {
    if (!isSoundOn) {
      setIsSoundOn(true);
      if (isActive) startAudio();
    } else {
      setIsSoundOn(false);
      stopAudio();
    }
  };

  // Handles completing or stopping session & saving record
  const handleStopSession = async () => {
    setIsActive(false);
    if (sessionCompleted > 0) {
      setIsSaving(true);
      try {
        const durationSec = sessionCompleted * 16; // 16 seconds per completed round of box breathing
        await onSaveSession(sessionCompleted, durationSec);
      } catch (err) {
        console.error("Error saving breathing feedback telemetry:", err);
      } finally {
        setIsSaving(false);
        setSessionCompleted(0);
      }
    }
  };

  // Calculate daily progress indicators
  const todayStr = new Date().toISOString().split("T")[0];
  const roundsCompletedToday = sessions
    .filter((s) => s.date === todayStr)
    .reduce((sum, s) => sum + s.roundsCompleted, 0);

  const dailyGoalRounds = 5;
  const todayProgressPercent = Math.min(100, Math.round((roundsCompletedToday / dailyGoalRounds) * 100));

  // Compute last 7 days of breathing performance for the milestone charts
  const getLast7DaysData = () => {
    const data = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split("T")[0];
      const dayName = d.toLocaleDateString("en-US", { weekday: "short" });
      const rounds = sessions
        .filter((s) => s.date === dateStr)
        .reduce((sum, s) => sum + s.roundsCompleted, 0);
      data.push({ dateStr, dayName, rounds });
    }
    return data;
  };

  const last7Days = getLast7DaysData();

  // Breathing graphics configuration mapping
  const getPhaseConfig = () => {
    switch (phase) {
      case "Inhale":
        return {
          scale: 1.35,
          bgColor: "bg-[#2d4a3e] border-[#365942] text-[#fbfbf9]",
          guide: "Inhale slowly and steadily...",
          sub: "Filling visceral lungs with purifying oxygen molecules",
          ringEffect: "scale-110 border-[#365942]/20",
        };
      case "Hold Full":
        return {
          scale: 1.35,
          bgColor: "bg-[#725f44] border-[#8a7558] text-[#fbfbf9]",
          guide: "Suspend your breath...",
          sub: "Letting neural cardiovascular pressure quiet and harmonize",
          ringEffect: "scale-120 border-[#725f44]/30 animate-pulse",
        };
      case "Exhale":
        return {
          scale: 0.95,
          bgColor: "bg-[#a2533b] border-[#bb6045] text-[#fbfbf9]",
          guide: "Release completely...",
          sub: "Shedding physical muscle tension and cortisol reserves",
          ringEffect: "scale-95 border-[#a2533b]/15",
        };
      case "Hold Empty":
        return {
          scale: 0.8,
          bgColor: "bg-[#efebe4] border-[#cbd0c9] text-[#1c2e24]",
          guide: "Rest in perfect stillness...",
          sub: "Enjoying the profound tranquil space of somatic vacancy",
          ringEffect: "scale-75 border-neutral-300",
        };
    }
  };

  const { scale, bgColor, guide, sub, ringEffect } = getPhaseConfig();

  // SVG Circular progress radius formula
  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (todayProgressPercent / 100) * circumference;

  return (
    <div className="space-y-8">
      {/* Descriptive Title with ample breathing room */}
      <div className="space-y-2">
        <h2 className="text-xl font-serif italic text-[#14231b] font-semibold flex items-center gap-2">
          <Wind className="text-[#365942]" size={20} />
          Restorative Somatic Box Breathing
        </h2>
        <p className="text-xs text-[#54645a] leading-relaxed max-w-2xl font-medium">
          Box breathing is clinically proven to down-regulate the sympathetic nervous system and invoke the vagal nerve system. Experience high-fidelity audiovisual guides synchronized instantly with your cloud biological logs.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LEFT COLUMN: ACTIVE BREATHING CLIENT (7/12 Width) */}
        <div id="breathing_container" className="lg:col-span-7 flex flex-col items-center justify-center p-8 bg-white border border-[#eae6dc] rounded-2xl shadow-xs relative overflow-hidden space-y-6">
          <div className="w-full flex items-center justify-between border-b border-[#f3f0e8] pb-4">
            <div className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping" />
              <span className="text-[10px] font-semibold text-[#1c2e24] font-mono uppercase tracking-wider">Live Metronome</span>
            </div>

            <div className="flex items-center gap-2.5">
              {/* Sonic Binaural Hum Toggle */}
              <button
                onClick={handleToggleSound}
                className={`p-1.5 px-3 rounded-lg border text-xs flex items-center gap-1.5 transition-all font-mono leading-none ${
                  isSoundOn 
                    ? "border-[#365942]/30 bg-[#f2f6f4] text-[#365942] font-semibold" 
                    : "border-[#eae6dc] bg-[#faf8f4] text-[#54645a] hover:text-[#1c2e24]"
                }`}
                title="Binaural Alpha-wave relaxation sound"
              >
                {isSoundOn ? <Volume2 size={12} /> : <VolumeX size={12} />}
                <span className="text-[9px] uppercase font-bold tracking-wider">Sonic Hum</span>
              </button>

              {/* Voice Speech synthesis Guidance Toggle */}
              <button
                onClick={() => setIsVoiceOn(!isVoiceOn)}
                className={`p-1.5 px-3 rounded-lg border text-xs flex items-center gap-1.5 transition-all font-mono leading-none ${
                  isVoiceOn 
                    ? "border-[#365942]/30 bg-[#f2f6f4] text-[#365942] font-semibold" 
                    : "border-[#eae6dc] bg-[#faf8f4] text-[#54645a] hover:text-[#1c2e24]"
                }`}
                title="Toggle Voice announcements for each breath phase"
              >
                <Volume1 size={12} />
                <span className="text-[9px] uppercase font-bold tracking-wider">Voice: {isVoiceOn ? "ON" : "OFF"}</span>
              </button>
            </div>
          </div>

          {/* Interactive Core breathing Stage with better negative space */}
          <div className="relative h-64 w-full flex items-center justify-center bg-[#faf8f4] rounded-3xl overflow-hidden border border-[#f3f1eb] p-10">
            <AnimatePresence>
              {isActive && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className={`absolute border rounded-full h-48 w-48 transition-all duration-1000 ${ringEffect}`}
                />
              )}
            </AnimatePresence>

            {/* The Central Interactive Breathing Ring */}
            <motion.div
              animate={{ scale: isActive ? scale : 1.0 }}
              transition={{ duration: 4.0, ease: "easeInOut" }}
              className={`relative h-32 w-32 rounded-full border flex flex-col items-center justify-center transition-all duration-1000 select-none shadow-sm ${bgColor}`}
            >
              <span className="text-4xl font-serif italic font-extrabold leading-none">{secondsLeft}s</span>
              <span className="text-[9px] font-bold font-mono tracking-widest uppercase mt-2">
                {isActive ? phase : "BEGIN"}
              </span>
            </motion.div>
          </div>

          <div className="text-center h-16 max-w-md px-4 flex flex-col justify-center">
            <h4 className="text-base font-serif italic font-semibold text-[#1c2e24] transition-all">
              {isActive ? guide : "Regulated Autonomous Coach"}
            </h4>
            <p className="text-xs text-[#54645a] mt-1 leading-relaxed">
              {isActive ? sub : "Align your vagus indicators with certified box timing intervals."}
            </p>
          </div>

          {/* Controls & Pacing dashboard */}
          <div className="w-full flex flex-col sm:flex-row items-center gap-4 border-t border-[#f3f0e8] pt-5">
            <div className="flex-1 flex gap-2.5 w-full">
              {!isActive ? (
                <button
                  type="button"
                  onClick={() => setIsActive(true)}
                  className="flex-1 rounded-xl bg-[#2d4a3e] text-white py-3 px-4 text-xs font-mono font-bold tracking-wider uppercase flex items-center justify-center gap-2 shadow-sm hover:bg-[#1e3328] transition-all"
                >
                  <Play size={13} fill="currentColor" /> Start Breathing Loop
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleStopSession}
                  disabled={isSaving}
                  className="flex-1 rounded-xl bg-white border border-[#eae6dc] text-[#a2533b] hover:border-[#a2533b]/30 py-3 px-4 text-xs font-mono font-bold tracking-wider uppercase flex items-center justify-center gap-2 hover:bg-[#fbf1ee]/40 transition-all disabled:opacity-50"
                >
                  {isSaving ? (
                    <span className="h-3 w-3 border-2 border-[#a2533b] border-t-transparent animate-spin rounded-full" />
                  ) : (
                    <Square size={12} fill="currentColor" />
                  )}
                  {sessionCompleted > 0 ? "Complete & Save" : "Pause / Stop"}
                </button>
              )}
            </div>

            {/* Rounds tracker count display */}
            <div className="flex items-center gap-2.5 text-[11px] font-mono text-[#54645a] p-2 px-4 bg-[#f5f2eb] rounded-xl border border-[#eae6dc] shrink-0">
              <Sparkles size={11} className={`text-[#365942] ${isActive ? 'animate-spin' : ''}`} style={{ animationDuration: '6s' }} />
              <span>Completed: <strong className="text-[#1c2e24] font-extrabold text-xs">{sessionCompleted}</strong> / 5 rounds</span>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: DAILY PERCENTAGE CIRCLES & WEEKLY PROGRESS (5/12 Width) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Daily Goal card centering the stroke circle */}
          <div className="rounded-2xl border border-[#eae6dc] bg-white p-6 shadow-xs flex flex-row items-center gap-6">
            <div className="relative h-24 w-24 flex items-center justify-center shrink-0">
              {/* SVG Circular Ring */}
              <svg className="absolute transform -rotate-90" width="88" height="88" viewBox="0 0 88 88">
                {/* Back static track circle */}
                <circle
                  className="text-[#f7f5ed]"
                  strokeWidth="6"
                  stroke="currentColor"
                  fill="transparent"
                  r={radius}
                  cx="44"
                  cy="44"
                />
                {/* Active progress circle */}
                <motion.circle
                  className="text-[#365942]"
                  strokeWidth="6"
                  strokeDasharray={circumference}
                  animate={{ strokeDashoffset }}
                  transition={{ duration: 1.2, ease: "easeOut" }}
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="transparent"
                  r={radius}
                  cx="44"
                  cy="44"
                />
              </svg>
              <span className="text-base font-serif italic font-black text-[#14231b]">{todayProgressPercent}%</span>
            </div>

            <div className="space-y-1">
              <span className="font-mono text-[9px] uppercase text-[#6e7d73] tracking-wider font-bold block">DAILY COHERENCE TARGET</span>
              <h3 className="text-sm font-sans font-bold text-[#1c2e24]">
                {roundsCompletedToday} / {dailyGoalRounds} Rounds Logged
              </h3>
              <p className="text-xs text-[#54645a] leading-relaxed">
                {todayProgressPercent >= 100 
                  ? "Somatic health goals unlocked! Your nervous system is fully harmonized today."
                  : "Complete 5 rounds of Box breathing to fulfill parasympathetic alignment milestones."
                }
              </p>
            </div>
          </div>

          {/* 7-Day Completion milestones charts */}
          <div className="rounded-2xl border border-[#eae6dc] bg-white p-6 shadow-xs space-y-5">
            <div className="flex items-center gap-2 border-b border-[#f3f0e8] pb-3">
              <Calendar size={14} className="text-[#365942]" />
              <h3 className="text-xs font-mono font-bold text-[#1c2e24] uppercase tracking-wider">Weekly Calibrations</h3>
            </div>

            {/* Custom high-fidelity bar milestones */}
            <div className="grid grid-cols-7 gap-1.5 pt-2 items-end h-28">
              {last7Days.map((day) => {
                const ratio = Math.min(1.0, day.rounds / dailyGoalRounds);
                const barHeight = `${ratio * 100}%`;
                const isToday = day.dateStr === todayStr;

                return (
                  <div key={day.dateStr} className="flex flex-col items-center gap-2 h-full justify-end group cursor-pointer relative">
                    {/* Tooltip on hover */}
                    <div className="absolute bottom-[115%] bg-[#1c2e24] text-white text-[8px] font-mono p-1 px-1.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 pointer-events-none">
                      {day.rounds} rounds
                    </div>

                    {/* Active Bar indicator */}
                    <div className="w-full bg-[#faf8f4] border border-[#eef0eb] rounded-lg h-16 relative overflow-hidden flex items-end">
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: barHeight }}
                        className={`w-full rounded-b-md ${
                          isToday 
                            ? "bg-[#365942]" 
                            : day.rounds >= dailyGoalRounds 
                              ? "bg-[#4a6b56]" 
                              : day.rounds > 0 
                                ? "bg-[#8a7558]" 
                                : "bg-transparent"
                        }`}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                      />
                    </div>

                    <div className="flex flex-col items-center">
                      <span className={`text-[9px] font-mono font-bold leading-none ${isToday ? "text-[#1c2e24] font-black underline" : "text-[#54645a]"}`}>
                        {day.dayName}
                      </span>
                      {day.rounds >= dailyGoalRounds && (
                        <Check size={8} className="text-emerald-600 mt-1" />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="border-t border-[#f3f0e8] pt-3 text-[10px] text-[#6e7d73] flex items-center justify-between font-mono font-medium">
              <span className="flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-[#365942]" /> Goal Unlocked
              </span>
              <span className="flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-[#8a7558]" /> Under Target
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
