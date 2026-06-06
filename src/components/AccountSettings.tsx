import { useState, FormEvent } from "react";
import { UserProfile, Gender, Chronotype, MenstrualData } from "../types";
import { motion, AnimatePresence } from "motion/react";
import { User, ShieldAlert, Check, Calendar, Moon, Sparkles, Activity } from "lucide-react";

interface AccountSettingsProps {
  profile: UserProfile;
  onUpdateProfile: (updated: UserProfile) => Promise<void>;
}

export default function AccountSettings({ profile, onUpdateProfile }: AccountSettingsProps) {
  const [name, setName] = useState(profile.name);
  const [age, setAge] = useState(profile.age);
  const [gender, setGender] = useState(profile.gender);
  const [isPremium, setIsPremium] = useState(profile.isPremium);

  // Sleep schedule states
  const [wakeupTime, setWakeupTime] = useState(profile.sleepSchedule?.wakeupTime || "07:00");
  const [bedtime, setBedtime] = useState(profile.sleepSchedule?.bedtime || "23:00");
  const [chronotype, setChronotype] = useState<Chronotype>(profile.sleepSchedule?.chronotype || Chronotype.BEAR);

  // Physiological states
  const [intestinalPain, setIntestinalPain] = useState(profile.physiological.intestinalPain);
  const [headaches, setHeadaches] = useState(profile.physiological.headaches);
  const [fatigue, setFatigue] = useState(profile.physiological.fatigue);
  const [arrhythmia, setArrhythmia] = useState(profile.physiological.arrhythmia);
  const [regularCramps, setRegularCramps] = useState(profile.physiological.regularCramps);
  const [liverConditions, setLiverConditions] = useState(profile.physiological.liverConditions);

  // Menstrual cycle states
  const [hasMenstrualCycle, setHasMenstrualCycle] = useState(profile.menstrual !== null);
  const [lastPeriodDate, setLastPeriodDate] = useState(profile.menstrual?.lastPeriodDate || new Date().toISOString().split("T")[0]);
  const [cycleDays, setCycleDays] = useState(profile.menstrual?.cycleDays || 28);
  const [periodDays, setPeriodDays] = useState(profile.menstrual?.periodDays || 5);
  const [isIrregular, setIsIrregular] = useState(profile.menstrual?.isIrregular || false);

  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveSuccess(false);

    let menstrualData: MenstrualData | null = null;
    if (hasMenstrualCycle) {
      // Calculate a fast estimate of next period date based on cycleDays
      const lastDate = new Date(lastPeriodDate);
      lastDate.setDate(lastDate.getDate() + Number(cycleDays));
      const nextExpectedDate = lastDate.toISOString().split("T")[0];

      menstrualData = {
        lastPeriodDate,
        cycleDays: Number(cycleDays),
        periodDays: Number(periodDays),
        isIrregular,
        nextExpectedDate
      };
    }

    const updatedProfile: UserProfile = {
      ...profile,
      name,
      age: Number(age),
      gender,
      isPremium,
      sleepSchedule: {
        wakeupTime,
        bedtime,
        chronotype
      },
      physiological: {
        ...profile.physiological,
        intestinalPain,
        headaches,
        fatigue,
        arrhythmia,
        regularCramps,
        liverConditions
      },
      menstrual: menstrualData
    };

    try {
      await onUpdateProfile(updatedProfile);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div id="account_settings_viewport" className="rounded-3xl border border-[#eae6dc] bg-white p-6 sm:p-8 space-y-8 text-[#222d25] shadow-sm max-w-4xl mx-auto">
      
      {/* HEADER SECTION */}
      <div className="border-b border-[#f3f0e8] pb-6">
        <span className="inline-flex items-center gap-1.5 p-1 px-3.5 rounded-full bg-[#faf6ed] border border-[#f0e6d2] text-[10px] font-mono text-[#7d561a] font-bold uppercase tracking-wider mb-2">
          <User size={11} /> Identity & Clinical Context
        </span>
        <h2 id="settings_title" className="text-3xl font-serif italic text-[#14231b] font-bold tracking-tight">
          User Account Settings
        </h2>
        <p className="text-xs text-[#54645a] leading-relaxed mt-1 font-sans font-medium">
          Maintain your biochemical metrics, sleep parameters, and personal profile context here. These inputs configure clinical alignments of recommendations dynamically.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-8">
        
        {/* ROW 1: CORE BIOGRAPHICAL INDICATORS */}
        <div className="space-y-4">
          <h3 className="text-sm font-mono text-[#1c2e24] uppercase tracking-wider font-bold">1. Demographic Identifiers</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            <div className="space-y-1.5">
              <label className="text-[10px] font-mono text-[#6e7d73] uppercase font-bold">Display Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full rounded-xl border border-[#eae6dc] bg-[#faf8f4] p-3 text-xs text-[#1e2e24] focus:outline-none focus:ring-1 focus:ring-[#365942] font-semibold"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-mono text-[#6e7d73] uppercase font-bold">Biological Age</label>
              <input
                type="number"
                value={age}
                onChange={(e) => setAge(parseInt(e.target.value) || 0)}
                required
                min="1"
                className="w-full rounded-xl border border-[#eae6dc] bg-[#faf8f4] p-3 text-xs text-[#1e2e24] focus:outline-none focus:ring-1 focus:ring-[#365942] font-semibold"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-mono text-[#6e7d73] uppercase font-bold">Gender Marker</label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value as Gender)}
                className="w-full rounded-xl border border-[#eae6dc] bg-[#faf8f4] p-3 text-xs text-[#1e2e24] focus:outline-none focus:ring-1 focus:ring-[#365942] font-semibold"
              >
                <option value={Gender.FEMALE}>Female</option>
                <option value={Gender.MALE}>Male</option>
                <option value={Gender.NON_BINARY}>Non-Binary</option>
                <option value={Gender.PREFER_NOT_TO_SAY}>Prefer not to say</option>
              </select>
            </div>

          </div>
        </div>

        {/* ROW 2: PHYSIOLOGICAL PREDISPOSITIONS */}
        <div className="space-y-4 pt-4 border-t border-[#f3f0e8]">
          <h3 className="text-sm font-mono text-[#1c2e24] uppercase tracking-wider font-bold">2. Somato-Emotional Vulnerabilities</h3>
          <p className="text-[11px] text-[#54645a] leading-relaxed">
            Check the physical parameters below that align with your current somatic tendencies. These flags establish warning indexes across high stress waves.
          </p>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            
            <label className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all ${intestinalPain ? "border-[#365942] bg-[#f2f6f4]" : "border-[#eae6dc] bg-[#faf8f4]"}`}>
              <input
                type="checkbox"
                checked={intestinalPain}
                onChange={(e) => setIntestinalPain(e.target.checked)}
                className="mt-0.5 accent-[#365942]"
              />
              <div>
                <span className="text-xs font-bold text-[#1c2e24] block leading-none">Intestinal Distress</span>
                <span className="text-[9px] text-[#6e7d73] block mt-1 leading-normal">Frequent stress-induced pain</span>
              </div>
            </label>

            <label className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all ${headaches ? "border-[#365942] bg-[#f2f6f4]" : "border-[#eae6dc] bg-[#faf8f4]"}`}>
              <input
                type="checkbox"
                checked={headaches}
                onChange={(e) => setHeadaches(e.target.checked)}
                className="mt-0.5 accent-[#365942]"
              />
              <div>
                <span className="text-xs font-bold text-[#1c2e24] block leading-none">Vascular Headaches</span>
                <span className="text-[9px] text-[#6e7d73] block mt-1 leading-normal">Tension or cluster migraines</span>
              </div>
            </label>

            <label className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all ${fatigue ? "border-[#365942] bg-[#f2f6f4]" : "border-[#eae6dc] bg-[#faf8f4]"}`}>
              <input
                type="checkbox"
                checked={fatigue}
                onChange={(e) => setFatigue(e.target.checked)}
                className="mt-0.5 accent-[#365942]"
              />
              <div>
                <span className="text-xs font-bold text-[#1c2e24] block leading-none">Chronic Fatigue Range</span>
                <span className="text-[9px] text-[#6e7d73] block mt-1 leading-normal">Unrestored wakeful states</span>
              </div>
            </label>

            <label className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all ${arrhythmia ? "border-[#365942] bg-[#f2f6f4]" : "border-[#eae6dc] bg-[#faf8f4]"}`}>
              <input
                type="checkbox"
                checked={arrhythmia}
                onChange={(e) => setArrhythmia(e.target.checked)}
                className="mt-0.5 accent-[#365942]"
              />
              <div>
                <span className="text-xs font-bold text-[#1c2e24] block leading-none">Vagal Flutters</span>
                <span className="text-[9px] text-[#6e7d73] block mt-1 leading-normal">Sudden elevated rapid pulse</span>
              </div>
            </label>

            <label className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all ${regularCramps ? "border-[#365942] bg-[#f2f6f4]" : "border-[#eae6dc] bg-[#faf8f4]"}`}>
              <input
                type="checkbox"
                checked={regularCramps}
                onChange={(e) => setRegularCramps(e.target.checked)}
                className="mt-0.5 accent-[#365942]"
              />
              <div>
                <span className="text-xs font-bold text-[#1c2e24] block leading-none">Pelvic Cramping</span>
                <span className="text-[9px] text-[#6e7d73] block mt-1 leading-normal">Somatic pelvic/abdominal pain</span>
              </div>
            </label>

            <label className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all ${liverConditions ? "border-[#365942] bg-[#f2f6f4]" : "border-[#eae6dc] bg-[#faf8f4]"}`}>
              <input
                type="checkbox"
                checked={liverConditions}
                onChange={(e) => setLiverConditions(e.target.checked)}
                className="mt-0.5 accent-[#365942]"
              />
              <div>
                <span className="text-xs font-bold text-[#1c2e24] block leading-none">Hepatobiliary/Liver</span>
                <span className="text-[9px] text-[#6e7d73] block mt-1 leading-normal">Sensitivities to toxins or drugs</span>
              </div>
            </label>

          </div>
        </div>

        {/* ROW 3: CIRCADIAN SLEEP SCHEDULE & BIORHYTHM */}
        <div className="space-y-4 pt-4 border-t border-[#f3f0e8]">
          <h3 className="text-sm font-mono text-[#1c2e24] uppercase tracking-wider font-bold">3. Circadian Integration</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            <div className="space-y-1.5">
              <label className="text-[10px] font-mono text-[#6e7d73] uppercase font-bold">Wakeup Target Time</label>
              <input
                type="time"
                value={wakeupTime}
                onChange={(e) => setWakeupTime(e.target.value)}
                className="w-full rounded-xl border border-[#eae6dc] bg-[#faf8f4] p-3 text-xs text-[#1e2e24] focus:outline-none focus:ring-1 focus:ring-[#365942] font-semibold"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-mono text-[#6e7d73] uppercase font-bold">Retreat Bedtime</label>
              <input
                type="time"
                value={bedtime}
                onChange={(e) => setBedtime(e.target.value)}
                className="w-full rounded-xl border border-[#eae6dc] bg-[#faf8f4] p-3 text-xs text-[#1e2e24] focus:outline-none focus:ring-1 focus:ring-[#365942] font-semibold"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-mono text-[#6e7d73] uppercase font-bold">Chronotype Classification</label>
              <select
                value={chronotype}
                onChange={(e) => setChronotype(e.target.value as Chronotype)}
                className="w-full rounded-xl border border-[#eae6dc] bg-[#faf8f4] p-3 text-xs text-[#1e2e24] focus:outline-none focus:ring-1 focus:ring-[#365942] font-semibold"
              >
                <option value={Chronotype.BEAR}>Bear (Social diurnal cycles)</option>
                <option value={Chronotype.LION}>Lion (Early morning rising peaks)</option>
                <option value={Chronotype.WOLF}>Wolf (Late night creativity ranges)</option>
                <option value={Chronotype.DOLPHIN}>Dolphin (Light sleep sensitivity bands)</option>
              </select>
            </div>

          </div>
        </div>

        {/* ROW 4: ENDOCRINE / PERIOD METRICS */}
        <div className="space-y-4 pt-4 border-t border-[#f3f0e8]">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-mono text-[#1c2e24] uppercase tracking-wider font-bold flex items-center gap-2">
              <Calendar size={14} className="text-[#a2533b]" /> 4. Menstrual & Endocrine Configuration
            </h3>
            <label className="flex items-center gap-2 cursor-pointer">
              <span className="text-[10px] font-mono text-[#6e7d73] uppercase font-bold">Enable Tracker:</span>
              <input
                type="checkbox"
                checked={hasMenstrualCycle}
                onChange={(e) => setHasMenstrualCycle(e.target.checked)}
                className="accent-[#365942] h-4 w-4 rounded"
              />
            </label>
          </div>

          <AnimatePresence mode="wait">
            {hasMenstrualCycle ? (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="grid grid-cols-1 md:grid-cols-4 gap-6 p-5 rounded-2xl bg-[#faf8f4] border border-[#eae6dc]"
              >
                <div className="space-y-1.5 col-span-1 md:col-span-2">
                  <label className="text-[10px] font-mono text-[#8a3c25] uppercase font-bold">Last Period Starting Date</label>
                  <input
                    type="date"
                    value={lastPeriodDate}
                    onChange={(e) => setLastPeriodDate(e.target.value)}
                    className="w-full rounded-xl border border-[#eae6dc] bg-white p-3 text-xs text-[#1e2e24] focus:outline-none focus:ring-1 focus:ring-[#a2533b] font-semibold font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono text-[#6e7d73] uppercase font-bold">Average Cycle Length (Days)</label>
                  <input
                    type="number"
                    value={cycleDays}
                    onChange={(e) => setCycleDays(parseInt(e.target.value) || 28)}
                    min="15"
                    max="45"
                    className="w-full rounded-xl border border-[#eae6dc] bg-white p-3 text-xs text-[#1e2e24] focus:outline-none focus:ring-1 focus:ring-[#365942] font-semibold"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono text-[#6e7d73] uppercase font-bold">Period Flow Length (Days)</label>
                  <input
                    type="number"
                    value={periodDays}
                    onChange={(e) => setPeriodDays(parseInt(e.target.value) || 5)}
                    min="2"
                    max="10"
                    className="w-full rounded-xl border border-[#eae6dc] bg-white p-3 text-xs text-[#1e2e24] focus:outline-none focus:ring-1 focus:ring-[#365942] font-semibold"
                  />
                </div>

                <div className="col-span-1 md:col-span-4 flex items-center gap-3 bg-white p-3.5 rounded-xl border border-[#efece2]">
                  <input
                    type="checkbox"
                    id="is_irregular_input"
                    checked={isIrregular}
                    onChange={(e) => setIsIrregular(e.target.checked)}
                    className="accent-[#a2533b] h-3.5 w-3.5"
                  />
                  <label htmlFor="is_irregular_input" className="text-xs font-semibold text-[#54645a] cursor-pointer">
                    Identify cycle as irregular (We will adjust hormonal variance indices automatically and notify clinical parameters).
                  </label>
                </div>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="p-5 text-center border border-[#eae6dc] bg-[#faf8f4] rounded-2xl text-[#6e7d73] text-xs font-medium font-sans flex items-center justify-center gap-2"
              >
                <Moon size={13} />
                Menstrual/Endocrine cycle tracker is presently disabled for your account. Re-enable to toggle hormonal visualizations.
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* PREMIUM MEMBER TOGGLE FOR TESTING (OR PLAYGROUND INCENTIVE) */}
        <div className="space-y-4 pt-4 border-t border-[#f3f0e8]">
          <h3 className="text-sm font-mono text-[#1c2e24] uppercase tracking-wider font-bold">5. Subscription License</h3>
          <div className="p-5 rounded-2xl bg-[#faf6ed] border border-[#f0e6d2] flex md:flex-row flex-col items-center justify-between gap-4">
            <div className="space-y-1 text-center md:text-left">
              <span className="text-xs font-bold text-[#7d561a] uppercase font-mono tracking-wider flex items-center gap-1.5 md:justify-start justify-center">
                <Sparkles size={12} fill="currentColor" /> Premium Tier Account Mock / Status
              </span>
              <p className="text-[11px] text-[#54645a] leading-relaxed font-sans font-medium">
                Unlock higher-dimensional clinical symptom queries, neural binaural breathing configurations, B2B workspaces, and Pitchdeck boards instantly.
              </p>
            </div>
            
            <label className="flex items-center gap-3 cursor-pointer shrink-0 p-3 bg-white border border-[#f0e6d2] rounded-xl shadow-3xs hover:border-[#7d561a] transition-all">
              <span className="text-xs font-bold text-[#1c2e24] font-mono">Premium Active:</span>
              <input
                type="checkbox"
                checked={isPremium}
                onChange={(e) => setIsPremium(e.target.checked)}
                className="accent-[#7d561a] h-5 w-5"
              />
            </label>
          </div>
        </div>

        {/* FEEDBACK STATUS AND SUBMIT ACTION */}
        <div className="border-t border-[#f3f0e8] pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="h-6">
            {saveSuccess && (
              <motion.span
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="text-xs font-mono font-bold text-[#2d4a3e] bg-[#f2f6f4] border border-[#d3e5db] rounded-full px-4 py-1.5 inline-flex items-center gap-1.5"
              >
                <Check size={11} strokeWidth={3} /> Settings Synced To Database Successfully
              </motion.span>
            )}
          </div>

          <button
            type="submit"
            disabled={isSaving}
            className="w-full sm:w-auto rounded-xl bg-[#2d4a3e] hover:bg-[#1e3328] text-white font-mono font-bold text-xs tracking-wider uppercase px-8 py-3.5 transition-all shadow-sm flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isSaving ? "Saving Alignment..." : "Save Configuration"}
          </button>
        </div>

      </form>
    </div>
  );
}
