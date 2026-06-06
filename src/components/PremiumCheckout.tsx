import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Check, Sparkles, Crown } from "lucide-react";

interface PremiumCheckoutProps {
  isPremium: boolean;
  onUpgradeComplete: () => void;
}

export default function PremiumCheckout({ isPremium, onUpgradeComplete }: PremiumCheckoutProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSimulateUpgrade = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setShowSuccess(true);
      setTimeout(() => {
        onUpgradeComplete();
        setShowSuccess(false);
      }, 2000);
    }, 1500);
  };

  const freemiumFeatures = [
    "Foundational box breath regulator visualization",
    "Essential menstrual cycle tracker calendar",
    "2 lifestyle-alignment custom habit routines",
    "Daily distress reflections & logging",
  ];

  const premiumFeatures = [
    "Dynamic multi-dimensional Wellness Coherence scores",
    "Full MedI search (Psychosomatic symptom cause analysis)",
    "Comprehensive pharmaceutical & cognitive health lookup",
    "Unlimited private consultation chats (AI guide channels)",
    "Custom structured preventive plans & urgent alarm triggers",
    "Personalized relaxing alpha beats entrainment sonic hums",
  ];

  if (isPremium) {
    return (
      <div id="premium_active_alert" className="rounded-2xl border border-[#d3e5db] bg-[#f2f6f4] p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-full bg-[#f2f6f4] text-[#2d4a3e] border border-[#d3e5db]">
            <Crown size={20} className="animate-pulse" />
          </div>
          <div>
            <span className="text-[10px] font-mono text-[#365942] uppercase tracking-widest font-bold">Premium Tier Active</span>
            <h4 className="text-sm font-semibold text-[#1c2e24] mt-0.5">Holistic Premium Support Fully Engaged</h4>
            <p className="text-xs text-[#54645a] mt-1">You have unrestricted access to clinical symptom analysis, complete lexicons, and secure guide counseling tunnels.</p>
          </div>
        </div>
        <div className="text-xs font-mono text-[#2d4a3e] font-semibold bg-[#eef5f1] p-2 border border-[#d3e5db] rounded select-none">
          UNRESTRICTED ACCESS GRANTED
        </div>
      </div>
    );
  }

  return (
    <div id="checkout_viewport" className="rounded-2xl border border-[#eae6dc] bg-white p-6 space-y-6 text-[#222d25]">
      <div className="border-b border-[#f3f0e8] pb-4">
        <h3 className="text-sm font-semibold font-mono text-[#1c2e24] uppercase tracking-wider flex items-center gap-2">
          <Sparkles className="text-[#365942]" size={18} /> Premium Tier Model
        </h3>
        <p className="text-[10px] text-[#6e7d73] font-mono mt-0.5">Choose your subscription tier: Freemium or full Premium</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative">
        
        {/* Freemium tier */}
        <div className="rounded-xl border border-[#eae6dc] bg-[#faf8f4] p-5 flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <span className="text-[10px] font-mono text-[#6e7d73] uppercase tracking-wider font-semibold">Freemium Tier</span>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-serif italic font-bold text-[#1c2e24]">$0</span>
              <span className="text-xs text-[#6e7d73] font-mono">/ Forever</span>
            </div>
            <p className="text-xs text-[#54645a] leading-relaxed pt-1.5 font-sans">
              Provides core local reflection logs, box breathing exercises, and cycle charting. Ideal for general biofeedback awareness.
            </p>
          </div>

          <div className="border-t border-[#f3eee3] pt-4 space-y-3 font-sans">
            {freemiumFeatures.map((feat, idx) => (
              <div key={idx} className="flex items-start gap-2 text-xs text-[#54645a]">
                <Check size={12} className="text-[#365942] mt-0.5 shrink-0" />
                <span>{feat}</span>
              </div>
            ))}
          </div>

          <button
            disabled
            className="w-full rounded-xl border border-[#eae6dc] p-2.5 text-xs font-mono font-bold text-[#6e7d73] bg-[#f8f5ee]"
          >
            ACTIVE BASE REGISTRATION
          </button>
        </div>

        {/* Premium tier */}
        <div className="rounded-xl border border-[#365942]/40 bg-[#f2f6f4] p-5 flex flex-col justify-between space-y-4 relative overflow-hidden ring-1 ring-[#365942]/10 shadow-sm">
          
          <div className="absolute top-3.5 right-3.5 bg-[#2d4a3e] text-white text-[9px] font-mono uppercase font-bold px-3 py-1 rounded-full shadow-none">
            Recommended
          </div>

          <div className="space-y-1">
            <span className="text-[10px] font-mono text-[#365942] uppercase tracking-wider font-bold flex items-center gap-1">
              Mindful Companion AI Premium
            </span>
            <div className="flex items-baseline gap-1 mt-1.5">
              <span className="text-3xl font-serif italic font-bold text-[#1c2e24]">350 ETB</span>
              <span className="text-xs text-[#54645a] font-mono font-medium">/ Month (~$6.00 USD)</span>
            </div>
            <p className="text-xs text-[#333e38] leading-relaxed pt-1.5 font-sans">
              Unlocks the complete catalog of medical indexes, AI-driven daily preventative advice, and unlimited counselor dialogue capabilities.
            </p>
          </div>

          <div className="border-t border-[#d3e5db] pt-4 space-y-3 font-sans">
            {premiumFeatures.map((feat, idx) => (
              <div key={idx} className="flex items-start gap-2 text-xs text-[#333e38]">
                <Check size={12} className="text-[#365942] mt-0.5 shrink-0" />
                <span>{feat}</span>
              </div>
            ))}
          </div>

          <button
            onClick={handleSimulateUpgrade}
            disabled={isProcessing || showSuccess}
            className="w-full rounded-xl bg-[#2d4a3e] hover:bg-[#1e3328] text-white p-3 text-xs font-mono font-bold transition-all flex items-center justify-center gap-2 shadow-sm"
          >
            <Crown size={12} />
            {isProcessing ? "Opening Secure Portal..." : "ACTIVATE PREMIUM ACCESS"}
          </button>
        </div>

        {/* Floating Success Overlay screen */}
        <AnimatePresence>
          {showSuccess && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-white/95 flex flex-col items-center justify-center rounded-xl p-6 text-center z-10"
            >
              <div className="p-3 bg-[#f2f6f4] text-[#2d4a3e] border border-[#d3e5db] rounded-full animate-bounce">
                <Crown size={24} />
              </div>
              <h4 className="text-base font-serif italic font-bold text-[#1c2e24] mt-4">Upgrade Unlocked!</h4>
              <p className="text-xs text-[#54645a] mt-1 max-w-xs font-sans">Calitratrating server-side medical channels and consulting rooms...</p>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
