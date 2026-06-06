import { motion } from "motion/react";
import { Award, Trophy, Compass, Flame, Smile, CheckCircle, Activity, Sparkles } from "lucide-react";
import { DailyCheckIn, Habit } from "../types";

interface SomaticMilestonesProps {
  checkInHistory: DailyCheckIn[];
  habitsList: Habit[];
  counselMessagesCount: number;
}

export default function SomaticMilestones({
  checkInHistory,
  habitsList,
  counselMessagesCount
}: SomaticMilestonesProps) {
  
  // Real statistical checks – no mock placeholders
  const achievements = [
    {
      id: "profile_sync",
      title: "First Sync Node",
      description: "Successfully authorized credentials and generated initial somatic profile.",
      icon: Compass,
      color: "text-[#2d4a3e] border-[#d3e5db] bg-[#f2f6f4]",
      isUnlocked: true, // If they are on this screen, they are onboarded
    },
    {
      id: "reflection_log",
      title: "Mindful Pacing",
      description: "Logged at least 1 complete daily physiological reflection in the diary.",
      icon: Activity,
      color: "text-[#8a3c25] border-[#efe0da] bg-[#fbf1ee]",
      isUnlocked: checkInHistory.length >= 1,
    },
    {
      id: "habit_complete",
      title: "Vagal Alignment",
      description: "Successfully integrated at least 1 AI-formulated wellness regimen habit today.",
      icon: Flame,
      color: "text-[#7d561a] border-[#f0e6d2] bg-[#faf6ed]",
      isUnlocked: habitsList.some(h => h.isCompletedToday),
    },
    {
      id: "secure_consult",
      title: "Clinical Safe-Channel",
      description: "Initiated a secure chat session with an on-call clinical guide practitioner.",
      icon: Smile,
      color: "text-[#3b3c5e] border-[#e1e1f2] bg-[#f2f2fa]",
      isUnlocked: counselMessagesCount > 1,
    }
  ];

  const unlockedCount = achievements.filter(a => a.isUnlocked).length;
  const progressPercent = Math.round((unlockedCount / achievements.length) * 100);

  return (
    <div className="rounded-2xl border border-[#eae6dc] bg-white p-5.5 space-y-4 shadow-xs">
      <div className="flex items-center justify-between border-b border-[#f3f0e8] pb-3">
        <div className="flex items-center gap-2">
          <Trophy size={16} className="text-[#365942]" />
          <h3 className="text-xs font-mono font-bold text-[#1c2e24] uppercase tracking-wider">Completion Milestones</h3>
        </div>
        <span className="text-[10px] font-mono text-[#54645a] font-bold">
          {unlockedCount} / {achievements.length} ACTIVE
        </span>
      </div>

      {/* Progress Bar & Feedback */}
      <div className="space-y-2">
        <div className="flex justify-between items-center text-[10px] font-mono font-bold uppercase text-[#6e7d73]">
          <span>Coherence Sync Level</span>
          <span>{progressPercent}%</span>
        </div>
        <div className="h-2 w-full bg-[#faf8f4] border border-[#eae6dc] rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-[#2d4a3e] to-[#365942] transition-all duration-500 rounded-full"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        {progressPercent === 100 ? (
          <p className="text-[11px] text-[#2d4a3e] bg-[#f2f6f4] border border-[#d3e5db] rounded-lg p-2.5 font-medium leading-relaxed flex items-center gap-2">
            <Sparkles size={11} className="shrink-0" /> Dynamic autonomic alignment milestones completed! Your bio-nervous pathways are fully calibrated.
          </p>
        ) : (
          <p className="text-[11px] text-[#54645a] leading-relaxed font-sans font-medium">
            Active behaviors reset cortisol buildup. Synchronize further milestones today to optimize physical resilience.
          </p>
        )}
      </div>

      {/* Achievements Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
        {achievements.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.id}
              className={`p-3 border.5 rounded-xl flex items-start gap-3 transition-all duration-300 relative overflow-hidden ${
                item.isUnlocked
                  ? "border-[#efece2] bg-[#faf8f4]"
                  : "border-[#f3f0e8] bg-white opacity-60"
              }`}
            >
              <div className={`p-2 rounded-lg border shrink-0 mt-0.5 ${item.isUnlocked ? item.color : "bg-gray-50 border-gray-100 text-gray-300"}`}>
                <Icon size={14} />
              </div>

              <div className="space-y-0.5 min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2.5">
                  <h4 className={`text-xs font-semibold truncate ${item.isUnlocked ? "text-[#1c2e24]" : "text-[#88908a]"}`}>
                    {item.title}
                  </h4>
                  {item.isUnlocked && (
                    <span className="p-0.5 px-2 bg-[#f2f6f4] text-[#2d4a3e] border border-[#d1e1d7] font-mono text-[8px] font-extrabold uppercase rounded-full shrink-0">
                      Sync'd
                    </span>
                  )}
                </div>
                <p className="text-[10px] text-[#54645a] leading-normal font-sans font-medium line-clamp-2">
                  {item.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
