import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play, Pause, RotateCcw } from 'lucide-react';

export function Exercises() {
  const [isActive, setIsActive] = useState(false);
  const [phase, setPhase] = useState<'Inhale' | 'Hold' | 'Exhale'>('Inhale');

  useEffect(() => {
    if (!isActive) return;

    const cycle = async () => {
      while (isActive) {
        setPhase('Inhale');
        await new Promise(r => setTimeout(r, 4000));
        if (!isActive) break;
        
        setPhase('Hold');
        await new Promise(r => setTimeout(r, 4000));
        if (!isActive) break;

        setPhase('Exhale');
        await new Promise(r => setTimeout(r, 8000));
      }
    };

    cycle();
  }, [isActive]);

  const scale = phase === 'Inhale' || phase === 'Hold' ? 1.5 : 1;
  const opacity = phase === 'Hold' ? 0.8 : 0.4;
  const color = phase === 'Inhale' ? '#FAF3E0' : phase === 'Hold' ? '#E8F3ED' : '#5A7D6C';

  return (
    <div className="space-y-8 pb-20">
      <header className="max-w-3xl">
        <h1 className="text-4xl font-display font-bold text-[#2A3B33] mb-2">Cognitive Synchronization</h1>
        <p className="text-[#6B7F75] leading-relaxed max-w-2xl">
          Use these somatic tools to bring your nervous system back to baseline.
        </p>
      </header>

      <div className="glass-card min-h-[500px] flex flex-col items-center justify-center relative overflow-hidden">
        {/* Animated Background blobs */}
        <motion.div 
          animate={{ scale, backgroundColor: color, opacity }}
          transition={{ duration: phase === 'Exhale' ? 8 : 4, ease: "easeInOut" }}
          className="absolute w-[30vh] h-[30vh] rounded-full blur-3xl z-0"
        />

        <div className="z-10 flex flex-col items-center">
          <AnimatePresence mode="wait">
            <motion.div
               key={phase}
               initial={{ opacity: 0, y: 10 }}
               animate={{ opacity: 1, y: 0 }}
               exit={{ opacity: 0, y: -10 }}
               className="text-4xl font-display font-bold text-[#2A3B33] mb-12 uppercase tracking-widest"
            >
              {isActive ? phase : "Ready"}
            </motion.div>
          </AnimatePresence>

          <div className="relative w-48 h-48 flex items-center justify-center">
            {/* The main breathing circle */}
            <motion.div 
              animate={{ scale }}
              transition={{ duration: phase === 'Exhale' ? 8 : 4, ease: "easeInOut" }}
              className="absolute inset-0 rounded-full border-2 border-white/60 bg-white/40 backdrop-blur-md"
            />
             {/* Center play control */}
            <button 
              onClick={() => setIsActive(!isActive)}
              className="w-16 h-16 rounded-full bg-white/60 hover:bg-white border border-white/60 flex items-center justify-center transition-all group z-20 backdrop-blur-xl"
            >
              {isActive ? <Pause className="w-6 h-6 text-[#5A7D6C]" /> : <Play className="w-6 h-6 text-[#5A7D6C] ml-1" />}
            </button>
          </div>
        </div>
      </div>
      
    </div>
  );
}
