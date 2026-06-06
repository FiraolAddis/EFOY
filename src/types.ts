export enum StressLevel {
  LOW = "LOW",
  MEDIUM = "MEDIUM",
  HIGH = "HIGH",
  REZONE = "REZONE"
}

export enum Gender {
  MALE = "MALE",
  FEMALE = "FEMALE",
  NON_BINARY = "NON_BINARY",
  PREFER_NOT_TO_SAY = "PREFER_NOT_TO_SAY"
}

export interface MenstrualData {
  lastPeriodDate: string; // YYYY-MM-DD
  cycleDays: number; // Avg duration (e.g. 28)
  periodDays: number; // Sync duration (e.g. 5)
  isIrregular: boolean;
  nextExpectedDate: string; // Calculated predictive date
}

export interface PhysiologicalData {
  arrhythmia: boolean;
  liverConditions: boolean;
  intestinalPain: boolean;
  regularCramps: boolean;
  headaches: boolean;
  fatigue: boolean;
  registeredConditions: string[]; // text custom input
}

export interface MentalStateData {
  anxietyLevel: number; // 1-10
  stressLevel: number; // 1-10
  registeredDisorders: string[]; // OCD, ODD, PTSD, Depressive, etc.
}

export interface LifestyleData {
  location: string;
  bmi: number;
  vitaminDeficiencies: string[];
  incomeContext: string; // low, medium, high (used for financial wellness hints)
  foodRestrictions: string[];
}

export enum Chronotype {
  BEAR = "BEAR",
  LION = "LION",
  WOLF = "WOLF",
  DOLPHIN = "DOLPHIN"
}

export interface SleepSchedule {
  wakeupTime: string; // e.g. "07:00"
  bedtime: string; // e.g. "23:00"
  chronotype: Chronotype;
}

export interface UserProfile {
  name: string;
  age: number;
  gender: Gender;
  menstrual: MenstrualData | null;
  physiological: PhysiologicalData;
  mentalState: MentalStateData;
  lifestyle: LifestyleData;
  isPremium: boolean;
  isOnboarded: boolean;
  sleepSchedule?: SleepSchedule;
  role?: "patient" | "counselor";
}

export interface DailyCheckIn {
  id: string;
  date: string; // YYYY-MM-DD
  stressScore: number; // 1-10
  sleepQuality: number; // 1-10
  energyLevel: number; // 1-10
  moodNotes: string;
  symptomsLogged: string[];
}

export interface Habit {
  id: string;
  title: string;
  description: string;
  category: "Physiological" | "Mental" | "Mind-Body" | "Nutritional" | "Recovery";
  targetCondition: string;
  isCompletedToday: boolean;
  streakCount: number;
  lastCompletedDate: string | null;
}

export interface WellnessScoreBreakdown {
  score: number; // 0 - 100
  color: string;
  status: "Optimized" | "Healthy" | "Strained" | "Red Zone";
  description: string;
  coherenceRank: "High" | "Fair" | "Low";
  mentalScore: number;
  physicalScore: number;
  lifestyleScore: number;
  recommendations: string[];
}

export interface SymptomAnalysis {
  symptom: string;
  potentialCauses: string;
  mindBodyConnection: string;
  preventiveTips: string;
  isUrgent: boolean;
  recommendedPhysicians: string[];
}

export interface DictionaryItem {
  term: string;
  definition: string;
  category: "Pharmaceutical" | "Mental Health" | "Physiology";
  clinicalUsage?: string;
  cautionStatement?: string;
}

export interface CorporateStats {
  department: string;
  employeeCount: number;
  averageStress: number;
  burnoutRiskCount: number;
  adherenceRate: number; // Habit completion avg
}

export interface BreathingSession {
  id: string;
  date: string; // YYYY-MM-DD
  timestamp: number;
  roundsCompleted: number;
  durationSeconds: number;
}

export interface ProfessionalContact {
  id: string;
  date: string; // YYYY-MM-DD
  timestamp: number;
  professionalId: string;
  professionalName: string;
  subject: string;
  message: string;
}

