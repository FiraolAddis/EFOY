import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Play, Square, Volume2, VolumeX, Sparkles, Wind } from "lucide-react";

type BreathPhase = "Inhale" | "Hold Full" | "Exhale" | "Hold Empty";

export default function BreathingExercise() {
  const [isActive, setIsActive] = useState(false);
  const [phase, setPhase] = useState<BreathPhase>("Inhale");
  const [secondsLeft, setSecondsLeft] = useState(4);
  const [isSoundOn, setIsSoundOn] = useState(false);
  const [sessionCompleted, setSessionCompleted] = useState(0);

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

  // Breathing graphics configuration mapping
  const getPhaseConfig = () => {
    switch (phase) {
      case "Inhale":
        return {
          scale: 1.35,
          bgColor: "bg-[#2d4a3e] border-[#365942] text-[#fbfbf9]",
          guide: "Inhale gently...",
          sub: "Filling visceral lungs with vital oxygen flow",
          ringEffect: "scale-110 border-[#365942]/20",
        };
      case "Hold Full":
        return {
          scale: 1.35,
          bgColor: "bg-[#725f44] border-[#8a7558] text-[#fbfbf9]",
          guide: "Suspend Breath...",
          sub: "Letting cardiac neural pressure quiet and settle",
          ringEffect: "scale-120 border-[#725f44]/30 animate-pulse",
        };
      case "Exhale":
        return {
          scale: 0.95,
          bgColor: "bg-[#a2533b] border-[#bb6045] text-[#fbfbf9]",
          guide: "Release completely...",
          sub: "Letting go of muscular tension and systemic worries",
          ringEffect: "scale-95 border-[#a2533b]/15",
        };
      case "Hold Empty":
        return {
          scale: 0.8,
          bgColor: "bg-[#efebe4] border-[#cbd0c9] text-[#1c2e24]",
          guide: "Rest in stillness...",
          sub: "Enjoying the tranquil space of inner emptiness",
          ringEffect: "scale-75 border-neutral-300",
        };
    }
  };

  const { scale, bgColor, guide, sub, ringEffect } = getPhaseConfig();

  return (
    <div id="breathing_container" className="flex flex-col items-center justify-center p-5 bg-white border border-[#eae6dc] rounded-2xl w-full">
      <div className="w-full flex items-center justify-between mb-5 border-b border-[#f3f0e8] pb-3">
        <div className="flex items-center gap-2">
          <Wind className="text-[#365942]" size={16} />
          <h3 className="text-xs font-semibold text-[#1c2e24] font-mono uppercase tracking-wider">Restorative Box Breathe</h3>
        </div>
        <button
          onClick={handleToggleSound}
          className={`p-1.5 px-3 rounded-lg border text-xs flex items-center gap-1.5 transition-all font-mono leading-none ${
            isSoundOn 
              ? "border-[#365942]/30 bg-[#f2f6f4] text-[#365942] font-semibold" 
              : "border-[#eae6dc] bg-[#faf8f4] text-[#54645a] hover:text-[#1c2e24]"
          }`}
          title="Toggle binaural relaxation hum"
        >
          {isSoundOn ? <Volume2 size={12} /> : <VolumeX size={12} />}
          <span className="text-[10px]">Sonic Hum</span>
        </button>
      </div>

      <div className="relative h-48 w-full flex items-center justify-center bg-[#faf8f4] rounded-xl overflow-hidden mb-5 border border-[#f3f1eb]">
        <AnimatePresence>
          {isActive && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className={`absolute border rounded-full h-36 w-36 transition-all duration-1000 ${ringEffect}`}
            />
          )}
        </AnimatePresence>

        {/* The Central Breathing Ring */}
        <motion.div
          animate={{ scale: isActive ? scale : 1.0 }}
          transition={{ duration: 4.0, ease: "easeInOut" }}
          className={`relative h-24 w-24 rounded-full border flex flex-col items-center justify-center transition-all duration-1000 select-none shadow-sm ${bgColor}`}
        >
          <span className="text-2xl font-mono font-bold leading-none">{secondsLeft}s</span>
          <span className="text-[8px] font-semibold font-mono tracking-wider uppercase mt-1">
            {isActive ? phase : "Focus"}
          </span>
        </motion.div>
      </div>

      <div className="text-center h-14 max-w-sm px-2 mb-4">
        <h4 className="text-sm font-serif italic font-semibold text-[#1c2e24]">
          {isActive ? guide : "Regulated Breathing Coach"}
        </h4>
        <p className="text-[11px] text-[#54645a] mt-0.5 leading-relaxed">
          {isActive ? sub : "Align with ancestral biological rhythms using somatic breathing balance."}
        </p>
      </div>

      {/* Control row */}
      <div className="w-full flex flex-col sm:flex-row items-center gap-3 border-t border-[#f3f0e8] pt-4">
        <div className="flex-1 flex gap-2 w-full">
          {!isActive ? (
            <button
              onClick={() => setIsActive(true)}
              className="flex-1 rounded-xl bg-[#2d4a3e] text-white py-2 px-3 text-xs font-mono font-semibold flex items-center justify-center gap-1.5 shadow-sm hover:bg-[#1e3328] transition-all"
            >
              <Play size={12} fill="currentColor" /> Begin Pacing
            </button>
          ) : (
            <button
              onClick={() => setIsActive(false)}
              className="flex-1 rounded-xl bg-white border border-[#eae6dc] text-[#a2533b] py-2 px-3 text-xs font-mono font-semibold flex items-center justify-center gap-1.5 hover:bg-[#faf8f4] transition-all"
            >
              <Square size={12} fill="currentColor" /> Rest
            </button>
          )}
        </div>

        {isActive && (
          <div className="flex items-center gap-1.5 text-[10px] font-mono text-[#54645a] p-1 px-2.5 bg-[#f5f2eb] rounded-lg border border-[#eae6dc]">
            <Sparkles size={11} className="text-[#365942] animate-spin" style={{ animationDuration: '6s' }} />
            <span>Rounds: <strong className="text-[#1c2e24]">{sessionCompleted}</strong></span>
          </div>
        )}
      </div>
    </div>
  );
}
