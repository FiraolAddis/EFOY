import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { UserProfile, Gender } from "../types";
import { Heart, Activity, Brain, Compass, Users, Sparkles } from "lucide-react";

interface RegistrationFormProps {
  onComplete: (profile: UserProfile) => void;
}

export default function RegistrationForm({ onComplete }: RegistrationFormProps) {
  const [step, setStep] = useState(1);
  const totalSteps = 5;

  // Initial onboarding structure
  const [formData, setFormData] = useState<UserProfile>({
    name: "",
    age: 26,
    gender: Gender.PREFER_NOT_TO_SAY,
    menstrual: null,
    physiological: {
      arrhythmia: false,
      liverConditions: false,
      intestinalPain: false,
      regularCramps: false,
      headaches: false,
      fatigue: false,
      registeredConditions: [],
    },
    mentalState: {
      anxietyLevel: 5,
      stressLevel: 5,
      registeredDisorders: [],
    },
    lifestyle: {
      location: "",
      bmi: 22,
      vitaminDeficiencies: [],
      incomeContext: "Medium",
      foodRestrictions: [],
    },
    isPremium: false,
    isOnboarded: false,
  });

  const [customCondition, setCustomCondition] = useState("");
  const [customDisorder, setCustomDisorder] = useState("");
  const [customDeficiency, setCustomDeficiency] = useState("");

  const handleGenderChange = (g: Gender) => {
    setFormData((prev) => ({
      ...prev,
      gender: g,
      menstrual: g === Gender.FEMALE ? {
        lastPeriodDate: new Date().toISOString().split("T")[0],
        cycleDays: 28,
        periodDays: 5,
        isIrregular: false,
        nextExpectedDate: "",
      } : null,
    }));
  };

  const handlePhysiologicalToggle = (key: keyof typeof formData.physiological) => {
    setFormData((prev) => ({
      ...prev,
      physiological: {
        ...prev.physiological,
        [key]: !prev.physiological[key] as any,
      },
    }));
  };

  const handleAddCustomCondition = () => {
    if (customCondition.trim()) {
      setFormData((prev) => ({
        ...prev,
        physiological: {
          ...prev.physiological,
          registeredConditions: [...prev.physiological.registeredConditions, customCondition.trim()],
        },
      }));
      setCustomCondition("");
    }
  };

  const handleAddCustomDisorder = () => {
    if (customDisorder.trim()) {
      setFormData((prev) => ({
        ...prev,
        mentalState: {
          ...prev.mentalState,
          registeredDisorders: [...prev.mentalState.registeredDisorders, customDisorder.trim()],
        },
      }));
      setCustomDisorder("");
    }
  };

  const handleAddCustomDeficiency = () => {
    if (customDeficiency.trim()) {
      setFormData((prev) => ({
        ...prev,
        lifestyle: {
          ...prev.lifestyle,
          vitaminDeficiencies: [...prev.lifestyle.vitaminDeficiencies, customDeficiency.trim()],
        },
      }));
      setCustomDeficiency("");
    }
  };

  const [validationError, setValidationError] = useState("");

  const nextStep = () => {
    setValidationError("");
    if (step === 1) {
      if (!formData.name.trim()) {
        setValidationError("Please enter your name to personalize your biometric pathways.");
        return;
      }
      if (formData.gender === Gender.PREFER_NOT_TO_SAY) {
        setValidationError("Please select your Gender Identity (Female, Male, or Non-binary) for accurate biological planning.");
        return;
      }
      if (!formData.age || formData.age < 12 || formData.age > 100) {
        setValidationError("Please enter a valid age (between 12 and 100) for somatic calibration.");
        return;
      }
    }
    if (step < totalSteps) setStep(step + 1);
  };

  const prevStep = () => {
    setValidationError("");
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError("");

    if (formData.gender === Gender.FEMALE && formData.menstrual) {
      if (!formData.menstrual.lastPeriodDate) {
        setValidationError("Please specify the start date of your last period.");
        return;
      }
      if (!formData.menstrual.cycleDays || formData.menstrual.cycleDays < 15 || formData.menstrual.cycleDays > 45) {
        setValidationError("Please specify a valid average cycle duration (between 15 and 45 days).");
        return;
      }
    }
    
    // Auto-calculate expected next period if female
    let updatedProfile = { ...formData, isOnboarded: true };
    if (updatedProfile.gender === Gender.FEMALE && updatedProfile.menstrual) {
      const last = new Date(updatedProfile.menstrual.lastPeriodDate);
      last.setDate(last.getDate() + updatedProfile.menstrual.cycleDays);
      updatedProfile.menstrual.nextExpectedDate = last.toISOString().split("T")[0];
    }

    onComplete(updatedProfile);
  };

  const progressPercentage = (step / totalSteps) * 100;

  return (
    <div id="registration_viewport" className="relative flex flex-col items-center justify-center p-2 sm:p-4 self-stretch text-[#222d25]">
      {/* Absolute progress indicator line */}
      <div className="absolute inset-x-0 top-0 h-1 bg-[#eae6dd]">
        <motion.div
          className="h-full bg-[#365942] rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${progressPercentage}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      <motion.div
        id="registration_card"
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-xl rounded-2xl border border-[#eae6dc] bg-white p-6 sm:p-8 shadow-sm"
      >
        <div className="mb-6 flex items-center justify-between border-b border-[#f3f0e8] pb-4">
          <div className="item-center flex gap-2">
            <span className="p-1 px-3.5 rounded-full bg-[#f3f1eb] text-[#365942] text-[11px] font-mono tracking-wider font-semibold uppercase">
              Phase {step} of 5
            </span>
          </div>
          <p className="text-xs text-[#6e7d73] font-mono">Personal Wellness Setup</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <AnimatePresence>
            {validationError && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 font-sans font-medium flex items-start gap-2 overflow-hidden shadow-xs"
              >
                <div className="h-1.5 w-1.5 rounded-full bg-red-500 mt-1.5 shrink-0" />
                <span>{validationError}</span>
              </motion.div>
            )}
          </AnimatePresence>
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step-1"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="space-y-6"
              >
                <div className="space-y-2">
                  <h2 className="text-3xl font-serif italic text-[#1c2e24] tracking-tight leading-tight flex items-center gap-2">
                    <Heart className="text-[#365942] shrink-0" size={24} /> Let's begin your journey
                  </h2>
                  <p className="text-sm text-[#54645a] leading-relaxed font-sans">
                    Every body operates on a unique energetic pulse. Restoring inner alignment starts with establishing a highly customized biological profile.
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-mono uppercase tracking-wider text-[#3d4f43] mb-1.5 font-semibold">Your Name</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                      placeholder="e.g. Elena Vance"
                      className="w-full rounded-xl border border-[#eae6dc] bg-[#faf8f4] p-3 text-sm text-[#1e2e24] placeholder-[#a6b1a9] focus:outline-none focus:ring-1 focus:ring-[#365942] focus:border-[#365942] transition-colors"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-mono uppercase tracking-wider text-[#3d4f43] mb-1.5 font-semibold">Age</label>
                      <input
                        type="number"
                        min="1"
                        max="120"
                        value={formData.age}
                        onChange={(e) => setFormData((prev) => ({ ...prev, age: parseInt(e.target.value) || 26 }))}
                        className="w-full rounded-xl border border-[#eae6dc] bg-[#faf8f4] p-3 text-sm text-[#1e2e24] focus:outline-none focus:ring-1 focus:ring-[#365942] focus:border-[#365942]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-mono uppercase tracking-wider text-[#3d4f43] mb-1.5 font-semibold">Gender Identity</label>
                      <select
                        value={formData.gender}
                        onChange={(e) => handleGenderChange(e.target.value as Gender)}
                        className="w-full rounded-xl border border-[#eae6dc] bg-[#faf8f4] p-3 text-sm text-[#1e2e24] focus:outline-none focus:ring-1 focus:ring-[#365942] focus:border-[#365942]"
                      >
                        <option value={Gender.PREFER_NOT_TO_SAY}>Select...</option>
                        <option value={Gender.FEMALE}>Female</option>
                        <option value={Gender.MALE}>Male</option>
                        <option value={Gender.NON_BINARY}>Non-binary</option>
                      </select>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step-2"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="space-y-6"
              >
                <div className="space-y-2">
                  <h2 className="text-3xl font-serif italic text-[#1c2e24] tracking-tight leading-tight flex items-center gap-2">
                    <Activity className="text-[#a2533b]" size={24} /> Physical & Somatic Signals
                  </h2>
                  <p className="text-sm text-[#54645a] leading-relaxed">
                    Sensory signals (tension, migraine, adrenal tiredness) represent the nervous system's active call for balance. Let's document yours.
                  </p>
                </div>

                <div className="space-y-4">
                  <span className="block text-xs font-mono uppercase text-[#3d4f43] border-b border-[#f3f0e8] pb-1.5 font-semibold">
                    Select any chronic or recurring signals:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {[
                      { key: "headaches", label: "Frequent Headaches" },
                      { key: "fatigue", label: "Chronic Fatigue" },
                      { key: "arrhythmia", label: "Heart Arrhythmia" },
                      { key: "intestinalPain", label: "Gastrointestinal Tension" },
                      { key: "regularCramps", label: "Somatic Cramps / Spasms" },
                      { key: "liverConditions", label: "Detoxification / Liver Load" }
                    ].map((item) => {
                      const typedKey = item.key as keyof typeof formData.physiological;
                      const active = formData.physiological[typedKey];
                      return (
                        <button
                          type="button"
                          key={item.key}
                          onClick={() => handlePhysiologicalToggle(typedKey)}
                          className={`flex items-center gap-3 rounded-xl border p-3 text-left text-xs transition-all ${
                            active
                              ? "border-[#365942] bg-[#f2f6f4] text-[#1c2e24] font-medium"
                              : "border-[#eae6dc] bg-[#faf8f4] text-[#54645a] hover:border-[#cbd0c9] hover:bg-[#f6f4ee]"
                          }`}
                        >
                          <div className={`h-2.5 w-2.5 rounded-full ${active ? "bg-[#365942]" : "bg-[#ded6c7]"}`} />
                          {item.label}
                        </button>
                      );
                    })}
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-mono uppercase tracking-wider text-[#3d4f43] font-semibold">Registered medical conditions</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={customCondition}
                        onChange={(e) => setCustomCondition(e.target.value)}
                        placeholder="e.g. IBS, Chronic Fatigue, Dysglycemia"
                        className="flex-1 rounded-xl border border-[#eae6dc] bg-[#faf8f4] p-3 text-xs text-[#1e2e24] focus:outline-none focus:ring-1 focus:ring-[#365942]"
                      />
                      <button
                        type="button"
                        onClick={handleAddCustomCondition}
                        className="rounded-xl bg-[#2d4a3e] px-4 text-xs font-mono text-white hover:bg-[#1e3328]"
                      >
                        Add
                      </button>
                    </div>
                    {formData.physiological.registeredConditions.length > 0 && (
                      <div className="mt-2 text-wrap flex flex-wrap gap-1.5">
                        {formData.physiological.registeredConditions.map((cond, i) => (
                          <span key={i} className="rounded-lg bg-[#f0ede6] border border-[#eae6dc] px-2.5 py-1 text-[10px] font-mono text-[#333e38]">
                            {cond}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step-3"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="space-y-6"
              >
                <div className="space-y-2">
                  <h2 className="text-3xl font-serif italic text-[#1c2e24] tracking-tight leading-tight flex items-center gap-2">
                    <Brain className="text-[#a2533b]" size={24} /> Psychological Blueprint
                  </h2>
                  <p className="text-sm text-[#54645a] leading-relaxed">
                    Cortisol spikes and emotional exhaustion impact deep rest, digestion, and neurochemical cycle health. Set your current baseline.
                  </p>
                </div>

                <div className="space-y-5">
                  <div className="p-4 bg-[#faf8f4] rounded-xl border border-[#eae6dc] space-y-4">
                    <div>
                      <div className="flex justify-between items-center mb-1.5">
                        <label className="text-xs font-mono uppercase text-[#3d4f43] font-semibold">Anxiety Level: {formData.mentalState.anxietyLevel}/10</label>
                        <span className="text-[10px] text-[#6e7d73]">1: Serene • 10: Persistent</span>
                      </div>
                      <input
                        type="range"
                        min="1"
                        max="10"
                        value={formData.mentalState.anxietyLevel}
                        onChange={(e) => setFormData((p) => ({ ...p, mentalState: { ...p.mentalState, anxietyLevel: parseInt(e.target.value) } }))}
                        className="w-full accent-[#365942] h-1 bg-[#eae6dc] rounded-lg cursor-pointer"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-1.5">
                        <label className="text-xs font-mono uppercase text-[#3d4f43] font-semibold">Stress Baseline: {formData.mentalState.stressLevel}/10</label>
                        <span className="text-[10px] text-[#6e7d73]">1: Calm • 10: Intense Burnout</span>
                      </div>
                      <input
                        type="range"
                        min="1"
                        max="10"
                        value={formData.mentalState.stressLevel}
                        onChange={(e) => setFormData((p) => ({ ...p, mentalState: { ...p.mentalState, stressLevel: parseInt(e.target.value) } }))}
                        className="w-full accent-[#365942] h-1 bg-[#eae6dc] rounded-lg cursor-pointer"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-mono uppercase tracking-wider text-[#3d4f43] mb-1.5 font-semibold">Registered mental health diagnoses (Optional)</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={customDisorder}
                        onChange={(e) => setCustomDisorder(e.target.value)}
                        placeholder="e.g. OCD, PMDD, GAD, ADHD"
                        className="flex-1 rounded-xl border border-[#eae6dc] bg-[#faf8f4] p-3 text-xs text-[#1e2e24] focus:outline-none focus:ring-1 focus:ring-[#365942]"
                      />
                      <button
                        type="button"
                        onClick={handleAddCustomDisorder}
                        className="rounded-xl bg-[#2d4a3e] px-4 text-xs font-mono text-white hover:bg-[#1e3328]"
                      >
                        Add
                      </button>
                    </div>
                    {formData.mentalState.registeredDisorders.length > 0 && (
                      <div className="mt-2.5 flex flex-wrap gap-1.5">
                        {formData.mentalState.registeredDisorders.map((dis, i) => (
                          <span key={i} className="rounded-lg bg-[#f0ede6] border border-[#eae6dc] px-2.5 py-1 text-[10px] font-mono text-[#333e38]">
                            {dis}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {step === 4 && (
              <motion.div
                key="step-4"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="space-y-6"
              >
                <div className="space-y-2">
                  <h2 className="text-3xl font-serif italic text-[#1c2e24] tracking-tight leading-tight flex items-center gap-2">
                    <Compass className="text-[#a2533b]" size={24} /> Lifestyle Context
                  </h2>
                  <p className="text-sm text-[#54645a] leading-relaxed">
                    Living variables—such as regional geography, nutrition restrictions, and essential minerals—heavily influence biochemical health.
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-mono uppercase tracking-wider text-[#3d4f43] mb-1.5 font-semibold">Location (City, Country)</label>
                      <input
                        type="text"
                        value={formData.lifestyle.location}
                        onChange={(e) => setFormData((p) => ({ ...p, lifestyle: { ...p.lifestyle, location: e.target.value } }))}
                        placeholder="e.g. Oslo, Norway"
                        className="w-full rounded-xl border border-[#eae6dc] bg-[#faf8f4] p-3 text-xs text-[#1e2e24] focus:outline-none focus:ring-1 focus:ring-[#365942]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-mono uppercase tracking-wider text-[#3d4f43] mb-1.5 font-semibold">Body Mass Index (BMI)</label>
                      <input
                        type="number"
                        step="0.1"
                        value={formData.lifestyle.bmi}
                        onChange={(e) => setFormData((p) => ({ ...p, lifestyle: { ...p.lifestyle, bmi: parseFloat(e.target.value) || 22 } }))}
                        className="w-full rounded-xl border border-[#eae6dc] bg-[#faf8f4] p-3 text-xs text-[#1e2e24] focus:outline-none focus:ring-1 focus:ring-[#365942]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-mono uppercase tracking-wider text-[#3d4f43] mb-1.5 font-semibold">Financial Security Cluster</label>
                      <select
                        value={formData.lifestyle.incomeContext}
                        onChange={(e) => setFormData((p) => ({ ...p, lifestyle: { ...p.lifestyle, incomeContext: e.target.value } }))}
                        className="w-full rounded-xl border border-[#eae6dc] bg-[#faf8f4] p-2.5 text-xs text-[#1e2e24] focus:outline-none"
                      >
                        <option value="Under-Resourced">Restricted (High Cortisol Vector)</option>
                        <option value="Medium font-sans">Stable Balanced Baseline</option>
                        <option value="High font-sans">Resource Secured Tier</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-mono uppercase tracking-wider text-[#3d4f43] mb-1.5 font-semibold font-semibold">Dietary Restrictions</label>
                      <input
                        type="text"
                        placeholder="e.g. Gluten-Free, Vegan, Dairy-Free"
                        className="w-full rounded-xl border border-[#eae6dc] bg-[#faf8f4] p-3 text-xs text-[#1e2e24] focus:outline-none focus:ring-1 focus:ring-[#365942]"
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            const val = e.currentTarget.value.trim();
                            if (val) {
                              setFormData((p) => ({
                                ...p,
                                lifestyle: { ...p.lifestyle, foodRestrictions: [...p.lifestyle.foodRestrictions, val] }
                              }));
                              e.currentTarget.value = "";
                            }
                          }
                        }}
                      />
                      <div className="mt-1 flex flex-wrap gap-1">
                        {formData.lifestyle.foodRestrictions.map((food, i) => (
                          <span key={i} className="text-[9px] rounded bg-[#eae6dd] px-2 py-0.5 font-mono text-[#333e38]">{food}</span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-mono uppercase tracking-wider text-[#3d4f43] mb-1.5 font-semibold">Vitamin & Mineral Deficiencies</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={customDeficiency}
                        onChange={(e) => setCustomDeficiency(e.target.value)}
                        placeholder="e.g. Vitamin D3, B12, Iron, Magnesium"
                        className="flex-1 rounded-xl border border-[#eae6dc] bg-[#faf8f4] p-2.5 text-xs text-[#1e2e24] focus:outline-none focus:ring-1 focus:ring-[#365942]"
                      />
                      <button
                        type="button"
                        onClick={handleAddCustomDeficiency}
                        className="rounded-xl bg-[#2d4a3e] px-4 text-xs font-mono text-white hover:bg-[#1e3328]"
                      >
                        Add
                      </button>
                    </div>
                    {formData.lifestyle.vitaminDeficiencies.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {formData.lifestyle.vitaminDeficiencies.map((dif, i) => (
                          <span key={i} className="rounded-lg bg-[#fbf1ee] border border-[#efe0da] text-[#8a3c25] px-2.5 py-1 text-[10px] font-mono">
                            {dif}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {step === 5 && (
              <motion.div
                key="step-5"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="space-y-6"
              >
                <div className="space-y-2">
                  <h2 className="text-3xl font-serif italic text-[#1c2e24] tracking-tight leading-tight flex items-center gap-2">
                    <Users className="text-[#365942]" size={24} /> Endocrine Bio-Rhythms
                  </h2>
                  <p className="text-sm text-[#54645a] leading-relaxed">
                    {formData.gender === Gender.FEMALE
                      ? "Biological rhythms govern regular shifts in emotional and metabolic energy. Synchronizing this cycle enables proactive anxiety and stress planning."
                      : "We align biological rhythms with restorative mindfulness habits. Click Onboarding Complete to start your personal profile dashboard!"}
                  </p>
                </div>

                {formData.gender === Gender.FEMALE && formData.menstrual ? (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-mono uppercase tracking-wider text-[#3d4f43] mb-1.5 font-semibold">Start date of last period</label>
                      <input
                        type="date"
                        required
                        value={formData.menstrual.lastPeriodDate}
                        onChange={(e) => {
                          const dateVal = e.target.value;
                          setFormData((p) => ({
                            ...p,
                            menstrual: p.menstrual ? { ...p.menstrual, lastPeriodDate: dateVal } : null
                          }));
                        }}
                        className="w-full rounded-xl border border-[#eae6dc] bg-[#faf8f4] p-3 text-xs text-[#1e2e24] focus:outline-none focus:ring-1 focus:ring-[#365942]"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-mono uppercase tracking-wider text-[#3d4f43] mb-1.5 font-semibold font-semibold">Average cycle duration (Days)</label>
                        <input
                          type="number"
                          value={formData.menstrual.cycleDays}
                          onChange={(e) => {
                            const val = parseInt(e.target.value) || 28;
                            setFormData((p) => ({
                              ...p,
                              menstrual: p.menstrual ? { ...p.menstrual, cycleDays: val } : null
                            }));
                          }}
                          className="w-full rounded-xl border border-[#eae6dc] bg-[#faf8f4] p-3 text-xs text-[#1e2e24] focus:outline-none focus:ring-1 focus:ring-[#365942]"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="block text-xs font-mono uppercase tracking-wider text-[#3d4f43] font-semibold">Hormonal Flow regularity</label>
                        <button
                          type="button"
                          onClick={() => {
                            setFormData((p) => ({
                              ...p,
                              menstrual: p.menstrual ? { ...p.menstrual, isIrregular: !p.menstrual.isIrregular } : null
                            }));
                          }}
                          className={`w-full rounded-xl border p-3 text-xs text-center font-mono transition-all ${
                            formData.menstrual.isIrregular
                              ? "border-[#a2533b] bg-[#fbf1ee] text-[#8a3c25] font-semibold"
                              : "border-[#eae6dc] bg-[#faf8f4] text-[#54645a] hover:border-[#1c2e24]"
                          }`}
                        >
                          {formData.menstrual.isIrregular ? "Irregular cycle detected" : "Regular steady cycle"}
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-xl border border-dashed border-[#eae6dc] bg-[#faf8f4] p-6 text-center">
                    <p className="text-xs font-mono text-[#6e7d73] leading-relaxed">
                      Somatic profiles are configured. Your dashboard is tailored to regulate cardiac pathways, mental triggers, and non-hormonal restful pacing.
                    </p>
                  </div>
                )}

                <div className="border-t border-[#f2eee3] pt-4 flex justify-between items-center bg-[#faf8f3]/30">
                  <span className="text-[10px] font-mono text-[#6e7d73] flex items-center gap-1.5">
                    <Sparkles size={12} className="text-[#365942]" /> Dynamic personalized algorithms loaded.
                  </span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Onboarding buttons */}
          <div className="flex justify-between items-center gap-4 pt-4 border-t border-[#f3f0e8]">
            {step > 1 ? (
              <button
                type="button"
                onClick={prevStep}
                className="rounded-xl border border-[#eae6dc] bg-white px-5 py-2.5 text-xs font-mono font-medium text-[#54645a] hover:bg-[#faf8f4] hover:text-[#1c2e24] transition-all"
              >
                Back
              </button>
            ) : (
              <div />
            )}

            {step < totalSteps ? (
              <button
                type="button"
                onClick={nextStep}
                className="rounded-xl bg-[#2d4a3e] text-white px-6 py-2.5 text-xs font-mono font-semibold hover:bg-[#1e3328] transition-all shadow-sm"
              >
                Next Step
              </button>
            ) : (
              <button
                type="submit"
                className="rounded-xl bg-[#2d4a3e] text-white px-6 py-2.5 text-xs font-mono font-semibold hover:bg-[#1e3328] transition-all shadow-md"
              >
                Complete Onboarding
              </button>
            )}
          </div>
        </form>
      </motion.div>
    </div>
  );
}
