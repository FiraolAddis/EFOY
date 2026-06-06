import { useState } from 'react';
import { ShieldAlert, Activity, Heart, Calendar } from 'lucide-react';
import { AreaChart, Area, XAxis, Tooltip, ResponsiveContainer } from 'recharts';

export function CycleTracker() {
  const [data] = useState([
    { day: 'Mon', hormones: 30, energy: 80, mood: 60 },
    { day: 'Tue', hormones: 40, energy: 75, mood: 50 },
    { day: 'Wed', hormones: 50, energy: 60, mood: 70 },
    { day: 'Thu', hormones: 70, energy: 50, mood: 40 },
    { day: 'Fri', hormones: 60, energy: 40, mood: 50 },
    { day: 'Sat', hormones: 40, energy: 80, mood: 80 },
    { day: 'Sun', hormones: 30, energy: 90, mood: 90 },
  ]);

  return (
    <div className="space-y-8 pb-20">
      <header className="max-w-3xl">
        <h1 className="text-4xl font-display font-bold text-[#2A3B33] mb-2">Biological Flow</h1>
        <p className="text-[#6B7F75] leading-relaxed max-w-2xl">
          Track hormonal shifts and understand how they impact your mental clarity, mood, and baseline energy.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Sync Status */}
        <div className="glass-card p-8 flex flex-col justify-between relative overflow-hidden group">
          <div className="absolute right-0 top-0 w-32 h-32 bg-[#E8F3ED] rounded-full blur-3xl group-hover:bg-[#FAF3E0] transition-colors" />
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-6">
              <Calendar className="w-5 h-5 text-[#5A7D6C]" />
              <span className="text-[#5A7D6C] font-semibold tracking-widest text-xs uppercase">CURRENT PHASE</span>
            </div>
            <div className="flex flex-col gap-2">
              <span className="text-5xl font-display font-bold text-[#2A3B33] tracking-tighter">
                Luteal
              </span>
              <span className="text-[#94A69A]">Day 21 / 28</span>
            </div>
          </div>
          <div className="mt-8 pt-6 border-t border-[#E5EADD] relative z-10">
            <p className="text-[#6B7F75] text-sm leading-relaxed">
              Energy might dip. Prioritize restorative rest and gentle cognitive tasks instead of high-stress focus.
            </p>
          </div>
        </div>

        {/* Hormonal Trends Vis Card */}
        <div className="glass-card p-8 lg:col-span-2">
           <div className="flex items-center justify-between mb-8">
             <div className="flex items-center gap-2">
               <Activity className="w-5 h-5 text-[#A68966]" />
               <span className="text-[#A68966] font-semibold tracking-widest text-xs uppercase">HORMONAL & MOOD CORRELATION</span>
             </div>
           </div>
           
           <div className="h-[200px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorHormones" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#D98C5F" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#D98C5F" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorMood" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#5A7D6C" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#5A7D6C" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <Tooltip 
                  contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(10px)', border: '1px solid #E5EADD', borderRadius: '1rem', color: '#2A3B33' }}
                  itemStyle={{ color: '#2A3B33' }}
                />
                <XAxis dataKey="day" stroke="#94A69A" tick={{fill: '#6B7F75', fontSize: 12}} tickLine={false} axisLine={false} />
                <Area type="monotone" dataKey="hormones" stroke="#D98C5F" strokeWidth={3} fillOpacity={1} fill="url(#colorHormones)" />
                <Area type="monotone" dataKey="mood" stroke="#5A7D6C" strokeWidth={3} fillOpacity={1} fill="url(#colorMood)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
