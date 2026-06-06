import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ShieldAlert, Sparkles, Activity, HeartPulse, Moon, Zap, ArrowRight, PhoneCall } from 'lucide-react';
import { AreaChart, Area, XAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Link } from 'react-router-dom';
import { cn } from '../lib/utils';
import type { WellnessScoreResult, CheckIn } from '../types';

export function Dashboard() {
  const [profile, setProfile] = useState<any>(null);
  const [wellnessResult, setWellnessResult] = useState<WellnessScoreResult | null>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [showCheckIn, setShowCheckIn] = useState(false);

  useEffect(() => {
    fetch('/api/profile').then(r => r.json()).then(setProfile);
    fetch('/api/wellness').then(r => r.json()).then(setWellnessResult);
    fetch('/api/check-ins').then(r => r.json()).then(setHistory);
  }, []);

  const handleCheckIn = async (data: any) => {
    const res = await fetch('/api/check-in', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    const result = await res.json();
    setWellnessResult(result);
    setShowCheckIn(false);
    fetch('/api/check-ins').then(r => r.json()).then(setHistory);
  };

  const chartData = history.map((h, i) => ({
    name: `Day ${i+1}`,
    stress: h.stress,
    energy: h.energy
  }));

  if (!profile?.name) return <div className="text-[#5A7D6C] p-10 animate-pulse">Loading Profile...</div>;

  return (
    <div className="space-y-8 pb-20">
      {/* Header */}
      <header className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-4xl font-display font-bold text-[#2A3B33] mb-2">
            Good morning, <span className="text-[#5A7D6C]">{profile.name}</span>
          </h1>
          <p className="text-[#6B7F75]">Here is your daily wellness synthesis.</p>
        </div>
        <button onClick={() => setShowCheckIn(true)} className="glass-button bg-white border-[#E5EADD] hover:bg-[#F9FAF8] !text-[#5A7D6C] flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[#A68966]" /> Daily Check-in
        </button>
      </header>

      {/* Top Banner Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass-card p-4 border-white/60 bg-white/40 shadow-sm flex flex-col justify-center">
          <p className="text-[10px] uppercase tracking-widest text-[#94A69A] font-bold">Anxiety Baseline</p>
          <p className="text-xl font-semibold text-[#2A3B33]">{profile?.mentalState?.anxietyLevel || '--'}/10</p>
        </div>
        <div className="glass-card p-4 border-white/60 bg-white/40 shadow-sm flex flex-col justify-center">
          <p className="text-[10px] uppercase tracking-widest text-[#94A69A] font-bold">Stress Baseline</p>
          <p className="text-xl font-semibold text-[#2A3B33]">{profile?.mentalState?.stressLevel || '--'}/10</p>
        </div>
        {profile?.gender === 'female' ? (
          <div className="glass-card p-4 border-white/60 bg-white/40 shadow-sm flex flex-col justify-center">
            <p className="text-[10px] uppercase tracking-widest text-[#94A69A] font-bold">Cycle Status</p>
            <p className="text-xl font-semibold text-[#5A7D6C]">Active Sync</p>
          </div>
        ) : (
          <div className="glass-card p-4 border-white/60 bg-white/40 shadow-sm flex flex-col justify-center">
            <p className="text-[10px] uppercase tracking-widest text-[#94A69A] font-bold">Daily Focus</p>
            <p className="text-xl font-semibold text-[#5A7D6C]">Grounding</p>
          </div>
        )}
        <Link to="/exercises" className="glass-card p-4 border-white/60 bg-[#5A7D6C] text-white flex items-center justify-between group cursor-pointer shadow-lg shadow-[#5A7D6C]/20 hover:bg-[#4A6B5C] transition-colors">
          <div className="flex flex-col justify-center">
            <p className="text-[10px] uppercase tracking-widest text-[#E8F3ED] font-bold">Quick Action</p>
            <p className="text-lg font-semibold">Start Exercise</p>
          </div>
          <ArrowRight className="w-5 h-5 text-[#E8F3ED] group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      {/* Red Zone Alert */}
      {wellnessResult?.status === 'red_zone' && (
        <motion.div initial={{ opacity: 0, y: -20, height: 0 }} animate={{ opacity: 1, y: 0, height: 'auto' }} className="glass-card bg-[#F9EAEA] border-[#F2D7D7] p-6 flex flex-col sm:flex-row items-center gap-6 justify-between overflow-hidden relative">
          <div className="absolute inset-0 bg-[#E74C3C]/5 animate-pulse" />
          <div className="flex items-center gap-4 relative z-10">
            <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center flex-shrink-0">
              <ShieldAlert className="w-6 h-6 text-[#E74C3C]" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-[#C0392B]">Critical Stress Detected</h3>
              <p className="text-[#D98282] text-sm">Your recent vitals suggest extreme cognitive load.</p>
            </div>
          </div>
          <button className="glass-button bg-[#E74C3C] hover:bg-[#C0392B] text-white flex items-center gap-2 relative z-10 whitespace-nowrap shadow-[0_0_20px_rgba(231,76,60,0.4)]">
            <PhoneCall className="w-4 h-4" /> Talk to a Professional Now
          </button>
        </motion.div>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Score Card */}
        <div className="glass-card p-8 flex flex-col justify-between relative overflow-hidden group border-white/80 bg-white/60 shadow-xl shadow-[#5A7D6C]/5">
          <div className="absolute -right-10 -top-10 w-40 h-40 bg-[#E8F3ED] rounded-full blur-3xl group-hover:bg-[#FAF3E0] transition-all duration-700" />
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-6">
              <Activity className="w-5 h-5 text-[#5A7D6C]" />
              <span className="text-[#5A7D6C] font-semibold tracking-widest text-xs uppercase">AI WELLNESS SCORE</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-7xl font-serif italic text-[#2A3B33] tracking-tighter">
                {wellnessResult?.score || '--'}
              </span>
              <span className="text-[#94A69A] text-xl">/100</span>
            </div>
          </div>
          <div className="mt-8 pt-6 border-t border-[#E5EADD] relative z-10">
            <p className="text-[#5A7D6C] text-sm leading-relaxed">
              {wellnessResult?.insights || "Complete your first check-in to generate insights."}
            </p>
          </div>
        </div>

        {/* Data Vis Card */}
        <div className="glass-card p-8 lg:col-span-2">
          <div className="flex items-center gap-2 mb-8">
            <Activity className="w-5 h-5 text-[#A68966]" />
            <span className="text-[#A68966] font-semibold tracking-widest text-xs uppercase">PHYSIOLOGICAL TRENDS</span>
          </div>
          <div className="h-[200px] w-full">
            {history.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorStress" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#A68966" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#A68966" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorEnergy" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#5A7D6C" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#5A7D6C" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(10px)', border: '1px solid #E5EADD', borderRadius: '1rem', color: '#2A3B33' }}
                    itemStyle={{ color: '#2A3B33' }}
                  />
                  <XAxis dataKey="name" stroke="#94A69A" tick={{fill: '#6B7F75', fontSize: 12}} tickLine={false} axisLine={false} />
                  <Area type="monotone" dataKey="stress" stroke="#A68966" strokeWidth={3} fillOpacity={1} fill="url(#colorStress)" />
                  <Area type="monotone" dataKey="energy" stroke="#5A7D6C" strokeWidth={3} fillOpacity={1} fill="url(#colorEnergy)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
                <div className="flex h-full items-center justify-center text-[#94A69A] border border-dashed border-[#E5EADD] rounded-2xl bg-white/30">
                  Not enough data for visualization yet.
                </div>
            )}
          </div>
        </div>

      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
        <div className="glass-card bg-[#FAF3E0]/60 p-5 rounded-3xl border border-white/60 flex items-center gap-4 shadow-sm">
          <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm">
            <svg className="w-6 h-6 text-[#A68966]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-[#2A3B33]">Morning Sunlight</h4>
            <p className="text-xs text-[#8A7B66]">15 min exposure recommended</p>
          </div>
        </div>
        <Link to="/exercises" className="glass-card bg-[#E8F3ED]/60 p-5 rounded-3xl border border-white/60 flex items-center gap-4 hover:bg-[#D9DED3]/60 transition-colors shadow-sm">
          <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm">
             <svg className="w-6 h-6 text-[#5A7D6C]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-[#2A3B33]">4-7-8 Breathwork</h4>
            <p className="text-xs text-[#5A7D6C]">3 mins to lower cortisol</p>
          </div>
        </Link>
      </div>

      {/* Recommendations */}
      {wellnessResult?.recommendations && (
        <div className="mt-8">
          <h3 className="text-lg font-medium text-[#2A3B33] mb-4">Strategic Recovery Micro-Interventions</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {wellnessResult.recommendations.map((rec, i) => (
              <div key={i} className="glass-card p-6 border-white/60 hover:border-[#5A7D6C]/30 bg-[#FAF3E0]/60 group transition-all">
                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center mb-4 text-[#A68966] group-hover:scale-110 transition-transform shadow-sm">
                  <ArrowRight className="w-5 h-5 -rotate-45" />
                </div>
                <p className="text-[#334139] text-sm leading-relaxed">{rec}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Check In Modal */}
      {showCheckIn && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-[#2A3B33]/40 backdrop-blur-md" onClick={() => setShowCheckIn(false)} />
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="glass-card bg-[#FDFBF7] w-full max-w-lg p-8 relative z-10 border-[#E5EADD]">
            <h2 className="text-2xl font-display font-bold text-[#2A3B33] mb-6">Daily Calibration</h2>
            <CheckInForm onSubmit={handleCheckIn} onClose={() => setShowCheckIn(false)} />
          </motion.div>
        </div>
      )}

    </div>
  );
}

function CheckInForm({ onSubmit, onClose }: { onSubmit: (data: any) => void, onClose: () => void }) {
  const [stress, setStress] = useState(5);
  const [energy, setEnergy] = useState(5);
  const [sleep, setSleep] = useState(7);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = () => {
    setSubmitting(true);
    onSubmit({ stress, energy, sleep });
  };

  return (
    <div className="space-y-6 flex flex-col">
      <div className="grid grid-cols-[auto_1fr_auto] gap-4 items-center">
        <HeartPulse className="w-5 h-5 text-[#E74C3C]" />
        <input type="range" min="1" max="10" value={stress} onChange={e => setStress(Number(e.target.value))} className="w-full accent-[#E74C3C]" />
        <span className="w-8 text-right font-mono text-sm text-[#C0392B]">{stress}</span>
      </div>
      <div className="grid grid-cols-[auto_1fr_auto] gap-4 items-center">
        <Zap className="w-5 h-5 text-[#A68966]" />
        <input type="range" min="1" max="10" value={energy} onChange={e => setEnergy(Number(e.target.value))} className="w-full accent-[#A68966]" />
        <span className="w-8 text-right font-mono text-sm text-[#8A7B66]">{energy}</span>
      </div>
      <div className="grid grid-cols-[auto_1fr_auto] gap-4 items-center">
        <Moon className="w-5 h-5 text-[#5A7D6C]" />
        <input type="range" min="1" max="12" value={sleep} step="0.5" onChange={e => setSleep(Number(e.target.value))} className="w-full accent-[#5A7D6C]" />
        <span className="w-8 text-right font-mono text-sm text-[#4A6B5C]">{sleep}h</span>
      </div>

      <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-[#E5EADD]">
        <button onClick={onClose} className="glass-button border-transparent bg-transparent hover:bg-white/60 text-[#6B7F75] px-4 py-2 text-sm !shadow-none">Cancel</button>
        <button onClick={handleSubmit} disabled={submitting} className="glass-button px-6 py-2 text-sm">
          {submitting ? 'Analyzing...' : 'Submit Reading'}
        </button>
      </div>
    </div>
  );
}
