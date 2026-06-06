import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowRight, Activity, Brain, User, AlertCircle } from 'lucide-react';
import type { UserProfile } from '../types';

export function Onboarding({ onComplete }: { onComplete?: (data: any) => void }) {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<Partial<UserProfile>>({
    name: '',
    age: 25,
    gender: '',
    physiologicalConditions: [],
    mentalState: { stressLevel: 5, anxietyLevel: 5, disorders: [] },
    lifestyle: { location: '', bmi: '', vitaminDeficiencies: [], dietaryRestrictions: [] }
  });

  const nextStep = () => setStep((s) => s + 1);
  const prevStep = () => setStep((s) => s - 1);

  const handleSubmit = async () => {
    try {
      await fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (onComplete) onComplete(formData);
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
    }
  };

  const updateData = (data: any) => setFormData(prev => ({ ...prev, ...data }));

  return (
    <div className="min-h-screen flex items-center justify-center relative bg-[#FDFBF7] overflow-hidden">
      <div className="bg-mesh" />
      <motion.div
        layout
        className="glass-card w-full max-w-2xl p-10 relative z-10"
      >
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex flex-col gap-6">
              <div className="flex items-center justify-center w-16 h-16 rounded-full bg-[#E8F3ED] mb-4">
                <User className="text-[#5A7D6C] w-8 h-8" />
              </div>
              <h2 className="text-3xl font-display font-bold text-[#2A3B33]">Let's get to know you</h2>
              <p className="text-[#6B7F75] text-lg">Aura needs some basic info to personalize your journey.</p>
              
              <div className="space-y-4 mt-4">
                <div>
                  <label className="block text-sm text-[#5A7D6C] mb-2">What should we call you?</label>
                  <input type="text" className="glass-input text-lg" value={formData.name} onChange={e => updateData({ name: e.target.value })} placeholder="Your name" autoFocus />
                </div>
                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="block text-sm text-[#5A7D6C] mb-2">Age</label>
                    <input type="number" className="glass-input" value={formData.age || ''} onChange={e => updateData({ age: e.target.value ? parseInt(e.target.value) : '' })} />
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm text-[#5A7D6C] mb-2">Biological Sex</label>
                    <select className="glass-input appearance-none" value={formData.gender} onChange={e => updateData({ gender: e.target.value })}>
                      <option value="">Select</option>
                      <option value="female">Female</option>
                      <option value="male">Male</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="flex justify-end mt-8">
                <button onClick={nextStep} disabled={!formData.name} className="glass-button bg-white/60 text-[#5A7D6C] hover:bg-white flex items-center gap-2 border-[#E5EADD]">
                  Next <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex flex-col gap-6">
              <div className="flex items-center justify-center w-16 h-16 rounded-full bg-[#E8F3ED] mb-4">
                <Activity className="text-[#5A7D6C] w-8 h-8" />
              </div>
              <h2 className="text-3xl font-display font-bold text-[#2A3B33]">Physical & Menstrual Health</h2>
              <p className="text-[#6B7F75]">Understanding your body helps us predict shifts in your well-being.</p>
              
              {formData.gender === 'female' && (
                <div className="space-y-4 p-5 rounded-2xl bg-white/40 border border-[#E5EADD]">
                  <h3 className="font-medium text-[#2A3B33]">Menstrual Cycle</h3>
                  <label className="flex items-center gap-3">
                    <input type="checkbox" checked={formData.periodIrregularity || false} onChange={e => updateData({ periodIrregularity: e.target.checked })} className="w-5 h-5 rounded border-[#D9DED3] bg-white text-[#5A7D6C]" />
                    <span className="text-[#334139]">My periods are irregular</span>
                  </label>
                </div>
              )}

              <div className="space-y-4 mt-4">
                <label className="block text-sm text-[#5A7D6C] mb-0">Any chronic physical conditions? (comma separated)</label>
                <p className="text-xs text-[#94A69A] mb-2">E.g., Arrhythmia, Migraines, IBS, Endometriosis</p>
                <input type="text" className="glass-input" defaultValue={formData.physiologicalConditions?.join(', ')} onChange={e => updateData({ physiologicalConditions: e.target.value.split(',').map(s=>s.trim()).filter(Boolean) })} placeholder="Leave blank if none" />
              </div>

              <div className="flex justify-between mt-8">
                <button onClick={prevStep} className="glass-button bg-transparent border-transparent text-[#6B7F75] hover:bg-white/40">Back</button>
                <button onClick={nextStep} className="glass-button bg-white/60 text-[#5A7D6C] hover:bg-white flex items-center gap-2 border-[#E5EADD]">
                  Next <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex flex-col gap-6">
              <div className="flex items-center justify-center w-16 h-16 rounded-full bg-[#FAF3E0] mb-4">
                <Brain className="text-[#A68966] w-8 h-8" />
              </div>
              <h2 className="text-3xl font-display font-bold text-[#2A3B33]">Mental State Baseline</h2>
              <p className="text-[#6B7F75]">Set your current baseline so we can track improvements.</p>
              
              <div className="space-y-8 mt-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <label className="text-sm text-[#5A7D6C]">General Stress Level</label>
                    <span className="text-[#A68966] font-medium">{formData.mentalState?.stressLevel}/10</span>
                  </div>
                  <input type="range" min="1" max="10" value={formData.mentalState?.stressLevel} onChange={e => setFormData(prev => ({...prev, mentalState: {...prev.mentalState!, stressLevel: parseInt(e.target.value)}}))} className="w-full h-2 bg-white/60 rounded-lg appearance-none cursor-pointer accent-[#A68966]" />
                </div>
                
                <div>
                  <div className="flex justify-between mb-2">
                    <label className="text-sm text-[#5A7D6C]">General Anxiety Level</label>
                    <span className="text-[#A68966] font-medium">{formData.mentalState?.anxietyLevel}/10</span>
                  </div>
                  <input type="range" min="1" max="10" value={formData.mentalState?.anxietyLevel} onChange={e => setFormData(prev => ({...prev, mentalState: {...prev.mentalState!, anxietyLevel: parseInt(e.target.value)}}))} className="w-full h-2 bg-white/60 rounded-lg appearance-none cursor-pointer accent-[#A68966]" />
                </div>
              </div>

              <div className="flex justify-between mt-12 bg-[#FAF3E0] p-4 rounded-xl border border-[#E5EADD] items-center">
                <div className="flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 text-[#A68966]"/>
                  <span className="text-sm text-[#8A7B66]">Your data is heavily encrypted entirely private.</span>
                </div>
              </div>

              <div className="flex justify-between mt-4">
                <button onClick={prevStep} className="glass-button bg-transparent border-transparent text-[#6B7F75] hover:bg-white/40">Back</button>
                <button onClick={handleSubmit} className="glass-button flex items-center gap-2">
                  Complete Setup
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Step indicators */}
        <div className="flex gap-2 justify-center mt-10">
          {[1,2,3].map(i => (
            <div key={i} className={`w-2 h-2 rounded-full transition-all ${step === i ? 'bg-[#5A7D6C] w-6' : 'bg-[#D9DED3]'}`} />
          ))}
        </div>
      </motion.div>
    </div>
  );
}
