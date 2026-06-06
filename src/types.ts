export interface UserProfile {
  name: string;
  age: number;
  gender: string;
  lastPeriod?: string;
  nextPeriod?: string;
  periodIrregularity?: boolean;
  physiologicalConditions: string[];
  mentalState: {
    stressLevel: number;
    anxietyLevel: number;
    disorders: string[];
  };
  lifestyle: {
    location: string;
    bmi: string;
    vitaminDeficiencies: string[];
    dietaryRestrictions: string[];
  };
}

export interface CheckIn {
  date: string;
  stress: number;
  sleep: number;
  energy: number;
  notes?: string;
}

export interface WellnessScoreResult {
  score: number;
  status: 'optimal' | 'moderate' | 'warning' | 'red_zone';
  insights: string;
  recommendations: string[];
}
