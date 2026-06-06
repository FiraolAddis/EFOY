import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  UserProfile, 
  DailyCheckIn, 
  Habit, 
  WellnessScoreBreakdown,
  Gender,
  Chronotype,
  SleepSchedule,
  BreathingSession,
  ProfessionalContact
} from "./types";

// Import components
import RegistrationForm from "./components/RegistrationForm";
import BreathingExercise from "./components/BreathingExercise";
import CycleTracker from "./components/CycleTracker";
import MedIHub from "./components/MedIHub";
import CorporateDashboard from "./components/CorporateDashboard";
import PremiumCheckout from "./components/PremiumCheckout";
import HomeIndex from "./components/HomeIndex";
import AccountSettings from "./components/AccountSettings";
import SomaticMilestones from "./components/SomaticMilestones";
import LandingPage from "./components/LandingPage";
import ProfessionalsDirectory from "./components/ProfessionalsDirectory";
import { ProviderPortal } from "./components/ProviderPortal";
import { MedicalDictionary } from "./components/MedicalDictionary";
import { CounselorDashboard } from "./components/CounselorDashboard";

// Firebase services
import { 
  auth, 
  db, 
  loginWithGoogle, 
  logoutUser, 
  OperationType, 
  handleFirestoreError 
} from "./lib/firebase";
import { onAuthStateChanged, User as FirebaseUser } from "firebase/auth";
import { 
  doc, 
  getDoc, 
  setDoc, 
  getDocs, 
  collection 
} from "firebase/firestore";

// Icons
import { 
  Heart, 
  Activity, 
  Calendar, 
  Stethoscope, 
  Building2, 
  Crown, 
  Sparkles, 
  CheckCircle, 
  MessageSquare,
  ShieldAlert, 
  Zap, 
  LogOut, 
  Plus, 
  User, 
  Lock, 
  Sliders,
  ChevronRight,
  Send,
  Droplets,
  HeartPulse,
  Brain,
  Leaf,
  Feather,
  TrendingUp,
  LogIn,
  Menu,
  X,
  Wind,
  BookA,
  ShieldCheck,
  Settings,
  HelpCircle,
  PhoneCall
} from "lucide-react";

export default function App() {
  // Firebase Authentication states
  const [fbUser, setFbUser] = useState<FirebaseUser | null>(null);
  const [authChecking, setAuthChecking] = useState<boolean>(true);
  const [isSandboxMode, setIsSandboxMode] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  // Session profile state
  const [profile, setProfile] = useState<UserProfile>({
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
    sleepSchedule: {
      wakeupTime: "07:00",
      bedtime: "23:00",
      chronotype: Chronotype.BEAR,
    },
  });

  // Current screen routing tab
  const [activeTab, setActiveTab] = useState<"home" | "wellness" | "cycle" | "medi" | "corporate" | "premium" | "settings" | "breathing" | "guides" | "dictionary" | "provider" | "counselor_dashboard">("home");

  // Routing toggle between descriptive landing / login
  const [hasSeenLandingPage, setHasSeenLandingPage] = useState<boolean>(false);
  const [showAuthScreen, setShowAuthScreen] = useState<boolean>(false);

  // New database collections states
  const [breathingSessions, setBreathingSessions] = useState<BreathingSession[]>([]);
  const [submittedContacts, setSubmittedContacts] = useState<ProfessionalContact[]>([]);

  // History lists
  const [checkInHistory, setCheckInHistory] = useState<DailyCheckIn[]>([]);
  const [habitsList, setHabitsList] = useState<Habit[]>([]);
  const [scoreReport, setScoreReport] = useState<WellnessScoreBreakdown | null>(null);
  const [isScoreReportLoading, setIsScoreReportLoading] = useState(false);

  // Red Zone & secure counseling states
  const [isRedZoneActive, setIsRedZoneActive] = useState(false);
  const [showConsultTerminal, setShowConsultTerminal] = useState(false);
  const [activeCounselor, setActiveCounselor] = useState({
    name: "Dr. Jordan Vance",
    role: "Clinical Endocrinologist & Vagal Guide",
    avatar: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=150"
  });
  const [counselMessages, setCounselMessages] = useState<{ sender: "user" | "counselor"; text: string }[]>([]);
  const [currentChatInput, setCurrentChatInput] = useState("");
  const [isChatLoading, setIsChatLoading] = useState(false);

  // Active logging state controllers
  const [showLoggingModal, setShowLoggingModal] = useState(false);
  const [stressInput, setStressInput] = useState(5);
  const [sleepInput, setSleepInput] = useState(6);
  const [energyInput, setEnergyInput] = useState(7);
  const [moodNotes, setMoodNotes] = useState("");
  const [loggedSymptoms, setLoggedSymptoms] = useState<string[]>([]);

  // Dynamic biological tracking states computed side by side
  const [daysSincePeriod, setDaysSincePeriod] = useState<number>(14);
  const [currentPhase, setCurrentPhase] = useState<string>("Ovulatory Phase");
  const [phaseColor, setPhaseColor] = useState<string>("text-[#2d4a3e] border-[#d3e5db] bg-[#f2f6f4]");
  const [isSynchronized, setIsSynchronized] = useState<boolean>(false);

  // Listen to Auth State Changes & Fetch user profile, checkins and habits from Firestore
  useEffect(() => {
    if (isSandboxMode) {
      // Load sandbox configurations
      const savedProfile = localStorage.getItem("sandbox-profile");
      if (savedProfile) {
        setProfile(JSON.parse(savedProfile));
      } else {
        setProfile({
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
          isPremium: true, // Let sandbox users explore all premium parts (guides, etc!)
          isOnboarded: false, // Forces sandbox users to complete onboarding perfectly too!
        });
      }

      const savedCheckins = localStorage.getItem("sandbox-checkins");
      if (savedCheckins) {
        setCheckInHistory(JSON.parse(savedCheckins));
      } else {
        setCheckInHistory([]);
        localStorage.setItem("sandbox-checkins", JSON.stringify([]));
      }

      const savedHabits = localStorage.getItem("sandbox-habits");
      if (savedHabits) {
        setHabitsList(JSON.parse(savedHabits));
      } else {
        setHabitsList([]);
        localStorage.setItem("sandbox-habits", JSON.stringify([]));
      }

      const savedSessions = localStorage.getItem("sandbox-sessions");
      if (savedSessions) {
        setBreathingSessions(JSON.parse(savedSessions));
      } else {
        setBreathingSessions([]);
        localStorage.setItem("sandbox-sessions", JSON.stringify([]));
      }

      const savedContacts = localStorage.getItem("sandbox-contacts");
      if (savedContacts) {
        setSubmittedContacts(JSON.parse(savedContacts));
      } else {
        setSubmittedContacts([]);
        localStorage.setItem("sandbox-contacts", JSON.stringify([]));
      }
      
      // Let's create an elegant fake user
      setFbUser({
        uid: "sandbox-uid",
        displayName: "Guest Officer",
        email: "guest@vitaliswellness.com",
        emailVerified: true
      } as any);
      setAuthChecking(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (isSandboxMode) return;
      setFbUser(user);
      if (user) {
        setIsScoreReportLoading(true);
        try {
          const userDocRef = doc(db, "users", user.uid);
          const userSnap = await getDoc(userDocRef);
          
          if (userSnap.exists()) {
            const fetchedProfile = userSnap.data() as UserProfile;
            setProfile(fetchedProfile);

            // Fetch checkins subcollection
            const checkinsColRef = collection(db, "users", user.uid, "checkins");
            const checkinsSnap = await getDocs(checkinsColRef);
            const checkins = checkinsSnap.docs.map(doc => doc.data() as DailyCheckIn);
            // Sort in-memory stable
            checkins.sort((a, b) => b.id.localeCompare(a.id));
            setCheckInHistory(checkins);

            // Fetch habits subcollection
            const habitsColRef = collection(db, "users", user.uid, "habits");
            const habitsSnap = await getDocs(habitsColRef);
            setHabitsList(habitsSnap.docs.map(doc => doc.data() as Habit));

            // Fetch breathing sessions subcollection
            const sessionsColRef = collection(db, "users", user.uid, "breathingsessions");
            const sessionsSnap = await getDocs(sessionsColRef);
            const sessions = sessionsSnap.docs.map(doc => doc.data() as BreathingSession);
            sessions.sort((a, b) => b.timestamp - a.timestamp);
            setBreathingSessions(sessions);

            // Fetch professional contact logs subcollection
            const contactsColRef = collection(db, "users", user.uid, "contacts");
            const contactsSnap = await getDocs(contactsColRef);
            const contacts = contactsSnap.docs.map(doc => doc.data() as ProfessionalContact);
            contacts.sort((a, b) => b.timestamp - a.timestamp);
            setSubmittedContacts(contacts);
          } else {
            // Logged in but profile not onboarded yet
            setProfile(prev => ({
              ...prev,
              name: user.displayName || "",
              isOnboarded: false
            }));
          }
        } catch (error) {
          console.error("Error during profile load on specific step:", error);
          if (error instanceof Error && error.stack) {
             console.error(error.stack);
          }
          handleFirestoreError(error, OperationType.GET, `users/${user.uid}/initial_load`);
        } finally {
          setIsScoreReportLoading(false);
        }
      } else {
        // Logged out: fallback state
        setProfile({
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
        setCheckInHistory([]);
        setHabitsList([]);
        setScoreReport(null);
      }
      setAuthChecking(false);
    });

    return () => unsubscribe();
  }, [isSandboxMode]);

  // Compute endocrine menstrual phase side-by-side
  useEffect(() => {
    if (profile.menstrual) {
      const last = new Date(profile.menstrual.lastPeriodDate);
      const today = new Date();
      const diffTime = Math.abs(today.getTime() - last.getTime());
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      
      const currentDay = (diffDays % profile.menstrual.cycleDays) || 1;
      setDaysSincePeriod(currentDay);
      setIsSynchronized(true);

      if (currentDay <= profile.menstrual.periodDays) {
        setCurrentPhase("Menstrual Phase");
        setPhaseColor("text-[#8a3c25] border-[#efe0da] bg-[#fbf1ee]");
      } else if (currentDay <= 12) {
        setCurrentPhase("Follicular Phase");
        setPhaseColor("text-[#2d4a3e] border-[#d3e5db] bg-[#f2f6f4]");
      } else if (currentDay <= 16) {
        setCurrentPhase("Ovulatory Phase");
        setPhaseColor("text-[#3b3c5e] border-[#e1e1f2] bg-[#f2f2fa]");
      } else {
        setCurrentPhase("Luteal Phase");
        setPhaseColor("text-[#7d561a] border-[#f0e6d2] bg-[#faf6ed]");
      }
    } else {
      setIsSynchronized(false);
      setCurrentPhase("Autonomic Rhythm");
      setPhaseColor("text-[#2d4a3e] border-[#d3e5db] bg-[#f2f6f4]");
      setDaysSincePeriod(0);
    }
  }, [profile.menstrual]);

  // Handle Sign In with Google popup flow
  const handleGoogleSignIn = async () => {
    try {
      setAuthError(null);
      setAuthChecking(true);
      await loginWithGoogle();
    } catch (e: any) {
      console.error("Login popup failed:", e);
      setAuthError(e?.message || String(e));
      setAuthChecking(false);
    }
  };

  // Handle Logout
  const handleSignOut = async () => {
    if (isSandboxMode) {
      setIsSandboxMode(false);
      setFbUser(null);
      setActiveTab("wellness");
      return;
    }

    try {
      setAuthChecking(true);
      await logoutUser();
      setActiveTab("wellness");
    } catch (e) {
      console.error("Logout failure:", e);
      setAuthChecking(false);
    }
  };

  const toggleSymptomLog = (sym: string) => {
    setLoggedSymptoms(prev => 
      prev.includes(sym) ? prev.filter(s => s !== sym) : [...prev, sym]
    );
  };

  // Seed baseline checkins and habits upon completing registration
  const handleOnboardingComplete = async (finalProfile: UserProfile) => {
    if (isSandboxMode) {
      const updatedProfile = { ...finalProfile, isOnboarded: true };
      setProfile(updatedProfile);
      localStorage.setItem("sandbox-profile", JSON.stringify(updatedProfile));

      setCheckInHistory([]);
      localStorage.setItem("sandbox-checkins", JSON.stringify([]));

      // Trigger dynamic habits and save to localStorage
      try {
        const res = await fetch("/api/ai/dynamic-habits", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ profile: updatedProfile }),
        });
        const data = await res.json();
        if (data.habits) {
          setHabitsList(data.habits);
          localStorage.setItem("sandbox-habits", JSON.stringify(data.habits));
        }
      } catch (e) {
        console.error("Habits generator failure:", e);
      }
      return;
    }

    if (!fbUser) return;
    setIsScoreReportLoading(true);
    try {
      // Save profile to root document
      const userDocRef = doc(db, "users", fbUser.uid);
      await setDoc(userDocRef, finalProfile);
      setProfile(finalProfile);

      setCheckInHistory([]);
      
      // Trigger dynamic habits and seed to subcollection
      try {
        const res = await fetch("/api/ai/dynamic-habits", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ profile: finalProfile }),
        });
        const data = await res.json();
        if (data.habits) {
          for (const habit of data.habits) {
            const habitDocRef = doc(db, "users", fbUser.uid, "habits", habit.id);
            await setDoc(habitDocRef, habit);
          }
          setHabitsList(data.habits);
        }
      } catch (e) {
        console.error("Habits generator failure:", e);
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `users/${fbUser.uid}`);
    } finally {
      setIsScoreReportLoading(false);
    }
  };

  // Dynamically trigger Server Wellness Score calculations
  const calculateScoreAndReport = async (historic: DailyCheckIn[]) => {
    setIsScoreReportLoading(true);
    try {
      const res = await fetch("/api/ai/wellness-score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profile, checkInHistory: historic }),
      });
      const data = await res.json();
      setScoreReport(data);

      // Check if user has entered "Red Zone"
      if (data.score < 45 || (historic[0] && historic[0].stressScore >= 8)) {
        setIsRedZoneActive(true);
      } else {
        setIsRedZoneActive(false);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsScoreReportLoading(false);
    }
  };

  // Auto trigger score indexing whenever checks update
  useEffect(() => {
    if (fbUser && profile.isOnboarded && checkInHistory.length > 0) {
      calculateScoreAndReport(checkInHistory);
    }
  }, [checkInHistory, profile.isOnboarded, fbUser]);

  // Handle new check-in addition
  const handleSubmitCheckIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSandboxMode) {
      const checkInId = `chk-${Date.now()}`;
      const newCheckIn: DailyCheckIn = {
        id: checkInId,
        date: "Today",
        stressScore: stressInput,
        sleepQuality: sleepInput,
        energyLevel: energyInput,
        moodNotes,
        symptomsLogged: loggedSymptoms
      };

      const updated = [newCheckIn, ...checkInHistory.map(c => c.date === "Today" ? { ...c, date: "Yesterday" } : c)];
      setCheckInHistory(updated);
      localStorage.setItem("sandbox-checkins", JSON.stringify(updated));

      // Clear inputs
      setMoodNotes("");
      setLoggedSymptoms([]);
      setShowLoggingModal(false);
      return;
    }

    if (!fbUser) return;

    const checkInId = `chk-${Date.now()}`;
    const newCheckIn: DailyCheckIn = {
      id: checkInId,
      date: "Today",
      stressScore: stressInput,
      sleepQuality: sleepInput,
      energyLevel: energyInput,
      moodNotes,
      symptomsLogged: loggedSymptoms
    };

    try {
      const checkinDocRef = doc(db, "users", fbUser.uid, "checkins", checkInId);
      await setDoc(checkinDocRef, newCheckIn);

      const updated = [newCheckIn, ...checkInHistory.map(c => c.date === "Today" ? { ...c, date: "Yesterday" } : c)];
      setCheckInHistory(updated);
      
      // Clear inputs
      setMoodNotes("");
      setLoggedSymptoms([]);
      setShowLoggingModal(false);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `users/${fbUser.uid}/checkins/${checkInId}`);
    }
  };

  // Dynamic habit kompletability on toggle
  const toggleHabitComplete = async (id: string) => {
    if (isSandboxMode) {
      const targetHabit = habitsList.find(h => h.id === id);
      if (!targetHabit) return;

      const completed = !targetHabit.isCompletedToday;
      const updatedHabit: Habit = {
        ...targetHabit,
        isCompletedToday: completed,
        streakCount: completed ? targetHabit.streakCount + 1 : Math.max(0, targetHabit.streakCount - 1),
        lastCompletedDate: completed ? new Date().toISOString() : null
      };

      const updatedList = habitsList.map(h => h.id === id ? updatedHabit : h);
      setHabitsList(updatedList);
      localStorage.setItem("sandbox-habits", JSON.stringify(updatedList));
      return;
    }

    if (!fbUser) return;
    const targetHabit = habitsList.find(h => h.id === id);
    if (!targetHabit) return;

    const completed = !targetHabit.isCompletedToday;
    const updatedHabit: Habit = {
      ...targetHabit,
      isCompletedToday: completed,
      streakCount: completed ? targetHabit.streakCount + 1 : Math.max(0, targetHabit.streakCount - 1),
      lastCompletedDate: completed ? new Date().toISOString() : null
    };

    try {
      const habitDocRef = doc(db, "users", fbUser.uid, "habits", id);
      await setDoc(habitDocRef, updatedHabit);

      setHabitsList(prev => prev.map(h => h.id === id ? updatedHabit : h));
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `users/${fbUser.uid}/habits/${id}`);
    }
  };

  // Simulate consult chatbot responses
  const handleSendChat = async () => {
    if (!currentChatInput.trim()) return;

    const userMsg = { sender: "user" as const, text: currentChatInput };
    const updatedMsgs = [...counselMessages, userMsg];
    setCounselMessages(updatedMsgs);
    setCurrentChatInput("");
    setIsChatLoading(true);

    try {
      const res = await fetch("/api/ai/consult", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          messages: updatedMsgs, 
          counselorRole: activeCounselor.role, 
          profile 
        }),
      });
      const data = await res.json();
      setCounselMessages(prev => [...prev, { sender: "counselor", text: data.text }]);
    } catch (e) {
      console.error("Consult proxy fail:", e);
    } finally {
      setIsChatLoading(false);
    }
  };

  const openCounselingTerminal = (counselor: typeof activeCounselor) => {
    setActiveCounselor(counselor);
    setCounselMessages([
      { 
        sender: "counselor", 
        text: `Hello ${profile.name || "friend"}. I am joining our secure mindfulness consulting channel. Our records show heightened physical or emotional stress markers. Let's trace your symptoms and seek restorative alignment together.` 
      }
    ]);
    setShowConsultTerminal(true);
  };

  // Commit Premium updates to Firestore
  const handleUpgradeComplete = async () => {
    if (isSandboxMode) {
      const updatedProfile = { ...profile, isPremium: true };
      setProfile(updatedProfile);
      localStorage.setItem("sandbox-profile", JSON.stringify(updatedProfile));
      return;
    }

    if (!fbUser) return;
    try {
      const userDocRef = doc(db, "users", fbUser.uid);
      const updatedProfile = { ...profile, isPremium: true };
      await setDoc(userDocRef, updatedProfile);
      setProfile(updatedProfile);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `users/${fbUser.uid}`);
    }
  };

  // Commit profile adjustments directly to Firestore or localStorage
  const handleUpdateProfile = async (updatedProfile: UserProfile) => {
    setProfile(updatedProfile);
    if (isSandboxMode) {
      localStorage.setItem("sandbox-profile", JSON.stringify(updatedProfile));
      return;
    }

    if (!fbUser) return;
    try {
      const userDocRef = doc(db, "users", fbUser.uid);
      await setDoc(userDocRef, updatedProfile);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `users/${fbUser.uid}`);
    }
  };

  const handleSaveBreathingSession = async (roundsCompleted: number, durationSeconds: number) => {
    const todayStr = new Date().toISOString().split("T")[0];
    const newSession: BreathingSession = {
      id: `session_${Date.now()}`,
      date: todayStr,
      timestamp: Date.now(),
      roundsCompleted,
      durationSeconds
    };

    if (isSandboxMode) {
      const updated = [newSession, ...breathingSessions];
      setBreathingSessions(updated);
      localStorage.setItem("sandbox-sessions", JSON.stringify(updated));
      return;
    }

    if (!fbUser) return;
    try {
      const docRef = doc(db, "users", fbUser.uid, "breathingsessions", newSession.id);
      await setDoc(docRef, newSession);
      setBreathingSessions(prev => [newSession, ...prev]);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `users/${fbUser.uid}/breathingsessions/${newSession.id}`);
    }
  };

  const handleSendProfessionalContact = async (contactDraft: Omit<ProfessionalContact, "id" | "date" | "timestamp">) => {
    const todayStr = new Date().toISOString().split("T")[0];
    const newContact: ProfessionalContact = {
      ...contactDraft,
      id: `contact_${Date.now()}`,
      date: todayStr,
      timestamp: Date.now()
    };

    if (isSandboxMode) {
      const updated = [newContact, ...submittedContacts];
      setSubmittedContacts(updated);
      localStorage.setItem("sandbox-contacts", JSON.stringify(updated));
      return;
    }

    if (!fbUser) return;
    try {
      const docRef = doc(db, "users", fbUser.uid, "contacts", newContact.id);
      await setDoc(docRef, newContact);
      setSubmittedContacts(prev => [newContact, ...prev]);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `users/${fbUser.uid}/contacts/${newContact.id}`);
    }
  };

  // Global Loader during initialization checks
  if (authChecking) {
    return (
      <div className="min-h-screen bg-[#fcfaf6] text-[#2d4a3e] flex flex-col items-center justify-center font-sans p-4">
        <div className="h-10 w-10 border-2 border-[#2d4a3e] border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-xs font-mono uppercase tracking-widest animate-pulse font-bold">Synchronizing Vitalis Wellness...</p>
      </div>
    );
  }

  // 0. LANDING PAGE (Always seen first)
  if (!hasSeenLandingPage) {
    return (
      <div className="min-h-screen bg-[#fcfaf6] text-[#222d25] flex flex-col font-sans p-4 relative overflow-hidden">
        {/* Header layout */}
        <header className="max-w-7xl w-full mx-auto flex items-center justify-between py-6 px-4 z-20">
          <div className="flex items-center gap-3">
            <img src="/src/assets/images/vitalis_logo_1780752343589.png" alt="logo" className="h-9 w-9 rounded-xl object-cover" referrerPolicy="no-referrer" />
            <h1 className="text-lg font-serif italic font-bold tracking-[0.1em] text-[#14231b]">Vitalis Wellness</h1>
          </div>
          
          <button
            onClick={() => {
              setHasSeenLandingPage(true);
              if (!fbUser) setShowAuthScreen(true);
            }}
            className="rounded-xl border border-[#eae6dc] bg-white text-[#2d4a3e] p-2.5 px-5 font-mono text-[10px] font-bold uppercase tracking-wider hover:border-[#2d4a3e] transition-all"
          >
            {fbUser ? "Enter Dashboard" : "Sign In / Portal Access"}
          </button>
        </header>

        <LandingPage
          onEnterSandbox={() => {
            setIsSandboxMode(true);
            setHasSeenLandingPage(true);
          }}
          onEnterGoogleAuth={() => {
            if (fbUser) {
              setHasSeenLandingPage(true);
            } else {
              handleGoogleSignIn();
              setHasSeenLandingPage(true);
            }
          }}
          onProviderRegister={() => {
             setHasSeenLandingPage(true);
             setActiveTab("provider");
          }}
        />
      </div>
    );
  }

  // 1. WELCOME & Google Registration Gate (Fallback when user tries to enter portal without being authenticated)
  if (!fbUser && !isSandboxMode && activeTab !== "provider") {
    return (
      <div className="min-h-screen bg-[#fcfaf6] text-[#222d25] flex flex-col font-sans p-4 relative overflow-hidden items-center justify-center">
        {/* Soft, beautiful organic light arches */}
        <div className="absolute top-[-10%] left-[-15%] h-[600px] w-[600px] rounded-full bg-[#f2eede]/30 blur-[130px] pointer-events-none" />
        <div className="absolute bottom-[-15%] right-[-15%] h-[600px] w-[600px] rounded-full bg-[#eef4f0]/50 blur-[130px] pointer-events-none" />

        <div className="w-full max-w-4xl z-10 flex justify-start mb-4">
          <button
            onClick={() => {
              setShowAuthScreen(false);
              setHasSeenLandingPage(false);
            }}
            className="rounded-xl bg-white border border-[#eae6dc] hover:border-neutral-400 text-[#54645a] hover:text-[#1c2e24] px-4 py-2 font-mono text-[9px] font-bold uppercase tracking-wider transition-all"
          >
            ← Back to Features Landing
          </button>
        </div>

        <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-2 gap-12 items-center py-8 z-10">
          
          {/* LEFT: Premium Pitch Deck Context & Slide details from PDF */}
          <div className="space-y-6 text-left">
            <span className="inline-flex items-center gap-1.5 p-1 px-4 rounded-full bg-[#eef4f0] border border-[#d3e5db] text-[10px] font-mono text-[#2d4a3e] font-bold uppercase tracking-widest">
              <Sparkles size={11} className="text-[#365942]" /> AI-POWERED PERSONALIZED WELLBEING
            </span>
            <h1 className="text-5xl font-serif italic text-[#14231b] font-semibold leading-tight uppercase tracking-wider flex items-center gap-3">
              <img src="/src/assets/images/vitalis_logo_1780752343589.png" alt="Vitalis Well Logo" className="h-12 w-12 rounded-xl object-cover shrink-0" referrerPolicy="no-referrer" />
              Vitalis Wellness
            </h1>
            <p className="text-base text-[#54645a] leading-relaxed">
              Moving from reactive healthcare to a preventive culture of physiological and somatic resilience. Bridging high-fidelity biometric check-ins with automated proactive wellness pacing.
            </p>

            {/* Critical Pitch deck metrics widget (Pages 2, 3, 11 of PDF) */}
            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="p-3.5 bg-white border border-[#eae6dc] rounded-2xl">
                <span className="text-[10px] font-mono text-[#8a3c25] uppercase tracking-wider font-bold block">
                  $10 Trillion
                </span>
                <span className="text-[11px] text-[#54645a] leading-relaxed h-10 block mt-1">
                  Annual lost productivity cost globally.
                </span>
              </div>
              <div className="p-3.5 bg-white border border-[#eae6dc] rounded-2xl">
                <span className="text-[10px] font-mono text-[#2d4a3e] uppercase tracking-wider font-bold block">
                  $4 : $1 ROI Ratio
                </span>
                <span className="text-[11px] text-[#54645a] leading-relaxed h-10 block mt-1">
                  Verified returns on wellness investments.
                </span>
              </div>
              <div className="p-3.5 bg-white border border-[#eae6dc] rounded-2xl">
                <span className="text-[10px] font-mono text-[#2d4a3e] uppercase tracking-wider font-bold block">
                  -40% Turnover
                </span>
                <span className="text-[11px] text-[#54645a] leading-relaxed h-10 block mt-1">
                  Reduction in burnout-related employee turnover.
                </span>
              </div>
              <div className="p-3.5 bg-white border border-[#eae6dc] rounded-2xl">
                <span className="text-[10px] font-mono text-[#2d4a3e] uppercase tracking-wider font-bold block">
                  +15% Output
                </span>
                <span className="text-[11px] text-[#54645a] leading-relaxed h-10 block mt-1">
                  Increase in overall team efficiency.
                </span>
              </div>
            </div>

            <div className="text-[11px] text-[#6e7d73] font-mono uppercase tracking-wider block">
              "Healthy Minds. Strong Teams. Better Business."
            </div>
          </div>

          {/* RIGHT: Login Action Card */}
          <div className="bg-white border border-[#eae6dc] rounded-3xl p-8 shadow-sm flex flex-col justify-center text-center space-y-6">
            <div className="space-y-3">
              <img src="/src/assets/images/vitalis_logo_1780752343589.png" alt="Vitalis Well Brand" className="h-14 w-14 rounded-2xl mx-auto object-cover border border-[#eef4f0]" referrerPolicy="no-referrer" />
              <h2 className="text-2xl font-serif italic text-[#14231b] font-semibold">Join Vitalis Wellness</h2>
              <p className="text-xs text-[#54645a] max-w-sm mx-auto">
                Securely authenticate via Google Firebase to keep your health logs, biological schedules, and somatic histories private and synchronized.
              </p>
            </div>

            {authError && (
              <div className="p-3 bg-[#fbf1ee] border border-[#efe0da] rounded-xl text-left text-[11px] text-[#8a3c25] leading-normal font-sans font-medium">
                <p className="font-bold uppercase tracking-wider font-mono text-[9px] mb-1">Google Login Notice:</p>
                Popup was blocked or delayed by your settings. Perfect for previewing immediately: Use <strong>Sandbox Mode</strong> below, or open in a <strong>New Tab</strong> where popups work freely.
              </div>
            )}

            <div className="flex flex-col gap-2.5">
              <button
                onClick={handleGoogleSignIn}
                className="w-full flex items-center justify-center gap-2.5 rounded-xl bg-[#2d4a3e] hover:bg-[#1e3328] text-white p-3.5 text-xs font-mono font-bold tracking-widest uppercase transition-all shadow-sm"
              >
                <LogIn size={15} /> Authenticate with Google
              </button>

              <div className="relative flex py-1 items-center">
                <div className="flex-grow border-t border-[#f3f0e8]"></div>
                <span className="flex-shrink mx-3 text-[9px] font-mono font-bold text-[#6e7d73] uppercase tracking-wider">Iframe Fallbacks</span>
                <div className="flex-grow border-t border-[#f3f0e8]"></div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <a
                  href={window.location.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-1 bg-[#faf8f4] hover:bg-[#f3eee2] border border-[#eae6dc] rounded-xl text-[10px] font-mono text-[#54645a] p-2.5 hover:text-[#1c2e24] transition-all font-bold uppercase tracking-wider text-center"
                >
                  New Tab
                </a>
                <button
                  type="button"
                  onClick={() => setIsSandboxMode(true)}
                  className="flex items-center justify-center gap-1 bg-[#faf8f4] hover:bg-[#f3eee2] border border-[#eae6dc] rounded-xl text-[10px] font-mono text-[#54645a] p-2.5 hover:text-[#1c2e24] transition-all font-bold uppercase tracking-wider"
                >
                  Sandbox Mode
                </button>
              </div>
            </div>

            <div className="border-t border-[#f3f0e8] pt-4 text-left">
              <span className="text-[9px] font-mono uppercase tracking-widest text-[#6e7d73] font-bold block mb-1">
                Security Assurance (ABAC Zero-Trust)
              </span>
              <p className="text-[10px] text-[#6e7d73] leading-relaxed">
                Biographical logs, PMDD cycles, and medication indexes are protected natively via custom Google Firestore Security Rules. All datasets are strictly segregated.
              </p>
            </div>
          </div>

        </div>
      </div>
    );
  }

  // 2. ONBOARDING SEQUENCE WIZARD
  if (!profile.isOnboarded && activeTab !== "provider") {
    return (
      <div className="min-h-screen bg-[#fcfaf6] text-[#222d25] flex flex-col items-center justify-center font-sans p-4 relative overflow-hidden">
        {/* Organic soft ambient elements */}
        <div className="absolute top-[-10%] left-[-10%] h-[600px] w-[600px] rounded-full bg-[#f2eede]/40 blur-[140px] pointer-events-none" />
        <div className="absolute bottom-[-15%] right-[-10%] h-[600px] w-[600px] rounded-full bg-[#eef4f0]/60 blur-[140px] pointer-events-none" />

        <div className="w-full max-w-xl flex flex-col justify-center py-12 z-10">
          <div className="text-center mb-10">
            <span className="inline-flex items-center gap-1.5 p-1 px-4 rounded-full bg-[#eef4f0] border border-[#d3e5db] text-[10px] font-mono text-[#2d4a3e] font-bold uppercase tracking-widest mb-4">
              <Sparkles size={11} className="text-[#365942]" /> SOMATIC INTEGRATION FLOW
            </span>
            <h1 className="text-5xl font-serif italic text-[#14231b] tracking-wider font-semibold uppercase leading-tight flex items-center justify-center gap-3">
              <img src="/src/assets/images/vitalis_logo_1780752343589.png" alt="Vitalis Logo" className="h-10 w-10 rounded-lg object-cover" referrerPolicy="no-referrer" />
              Vitalis Wellness
            </h1>
            <p className="text-xs text-[#54645a] mt-3 leading-relaxed max-w-sm mx-auto font-medium">
              We govern personalized clinical-grade alignments of the nervous system, stress indexes, cycles, and lifestyle contexts. Welcome {fbUser.displayName || 'friend'}.
            </p>
          </div>

          <div className="p-1 rounded-3xl bg-white border border-[#eae6dc] shadow-sm">
            <RegistrationForm onComplete={handleOnboardingComplete} />
          </div>
        </div>
      </div>
    );
  }

  // 3. MAIN DASHBOARD RENDERED FOR ONBOARDED USERS
  return (
    <div className="min-h-screen bg-[#fcfaf6] text-[#222d25] flex flex-col font-sans relative overflow-x-hidden pb-12">
      
      {/* Soft warm light organic backing elements */}
      <div className="absolute top-10 left-10 h-[500px] w-[500px] bg-[#eef4f0]/40 rounded-full blur-[130px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 h-[500px] w-[500px] bg-[#fbf1ee]/30 rounded-full blur-[130px] pointer-events-none" />
      
      {/* SOPHISTICATED HEADER */}
      {activeTab !== "provider" && (
        <nav id="hud_floating_navbar" className="fixed top-0 left-0 right-0 w-full border-b border-[#f0ece2] bg-white/95 backdrop-blur-md flex items-center justify-between px-6 sm:px-10 py-5 z-40 shadow-sm transition-all">
          <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl overflow-hidden bg-white border border-[#eae6dc] flex items-center justify-center shadow-none">
            <img src="/src/assets/images/vitalis_logo_1780752343589.png" alt="Vitalis logo tiny" className="h-full w-full object-cover" referrerPolicy="no-referrer" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-serif italic font-bold tracking-[0.1em] text-[#14231b] leading-none uppercase">Vitalis Wellness</h2>
              <span className="h-1.5 w-1.5 rounded-full bg-[#365942]" />
            </div>
            <span className="text-[9px] font-mono text-[#6e7d73] uppercase tracking-wider block mt-1">Holistic Coherence Hub</span>
          </div>
        </div>

        {/* Tab Selection (Desktop) */}
        <div className="hidden lg:flex items-center bg-[#faf8f4] border border-[#eae6dc] rounded-xl p-1.5 gap-2 mx-4">
          {[
            { id: "home", label: "Home", color: "text-[#2d4a3e]" },
            { id: "wellness", label: "Dashboard", color: "text-[#365942]" },
            { id: "breathing", label: "Breathe", color: "text-[#2d4a3e]" },
            { id: "guides", label: "Network", color: "text-[#365942]" },
            { id: "dictionary", label: "Dictionary", color: "text-[#54645a]" },
            ...(profile.gender === Gender.FEMALE ? [{ id: "cycle", label: "Rhythm", color: "text-[#8a3c25]" }] : []),
            ...(profile.role === "counselor" ? [{ id: "counselor_dashboard", label: "Hub", color: "text-[#1c2e24]" }] : []),
            { id: "settings", label: <Settings size={18} />, color: "text-[#54645a]" },
          ].map((tab) => {
            const isSel = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                type="button"
                className={`px-5 py-2 rounded-lg text-xs font-mono uppercase tracking-wider transition-all duration-300 ${
                  isSel 
                    ? "bg-white text-[#1c2e24] border border-[#e1ddd3] font-bold shadow-sm" 
                    : "text-[#54645a] hover:text-[#1c2e24] hover:bg-neutral-50/50"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Profile components and Mobile Toggle */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="text-right hidden md:block">
            <p className="text-xs font-bold text-[#14231b] font-sans leading-tight">{profile.name}</p>
            <span className="text-[9px] font-mono text-[#54645a] uppercase tracking-wide block mt-0.5">
              Age {profile.age} • {profile.gender}
            </span>
          </div>
          <div className="hidden md:flex h-9 w-9 rounded-full bg-[#f2eede] text-[#7d532a] border border-[#e1ddd3] font-bold text-xs items-center justify-center shadow-inner">
            {profile.name?.substring(0, 2).toUpperCase() || "VW"}
          </div>

          <button
            onClick={handleSignOut}
            title="Log out from system"
            className="p-2 rounded-xl bg-white hover:bg-[#fbf1ee] border border-[#eae6dc] hover:border-[#efe0da] text-[#54645a] hover:text-[#8a3c25] transition-all shrink-0"
          >
            <LogOut size={13} />
          </button>

          {/* Mobile Hamburger Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 lg:hidden rounded-xl bg-white hover:bg-[#faf9f6] border border-[#eae6dc] text-[#54645a] hover:text-[#1c2e24] transition-all shrink-0 flex items-center justify-center"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X size={13} /> : <Menu size={13} />}
          </button>
        </div>

        {/* Slide-Down Mobile Navigation Drawer */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="absolute top-full left-0 right-0 bg-white/98 backdrop-blur-xl border-b border-[#f0ece2] shadow-lg p-5 flex flex-col gap-2 z-30 lg:hidden overflow-hidden"
            >
              {[
                { id: "home", label: "Home" },
                { id: "wellness", label: "Dashboard" },
                { id: "breathing", label: "Breathe" },
                { id: "guides", label: "Network" },
                { id: "dictionary", label: "Dictionary" },
                ...(profile.gender === Gender.FEMALE ? [{ id: "cycle", label: "Rhythm" }] : []),
                ...(profile.role === "counselor" ? [{ id: "counselor_dashboard", label: "Hub" }] : []),
                { id: "provider", label: "Portal" },
                { id: "settings", label: "Settings" },
              ].map((tab) => {
                const isSel = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveTab(tab.id as any);
                      setMobileMenuOpen(false);
                    }}
                    type="button"
                    className={`w-full text-left px-4 py-3 rounded-xl text-xs font-mono uppercase tracking-wider transition-all ${
                      isSel 
                        ? "bg-[#eef4f0] text-[#1c2e24] border border-[#d3e5db] font-bold" 
                        : "text-[#54645a] hover:bg-[#faf9f6]"
                    }`}
                  >
                    {tab.id === "settings" ? <div className="flex items-center gap-2"><Settings size={16}/> Settings</div> : tab.label}
                  </button>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
      )}

      {/* FLOATING ACTION SIDEBAR (Desktop only) */}
      {activeTab !== "provider" && (
        <div className="hidden lg:flex fixed right-6 top-1/2 -translate-y-1/2 flex-col gap-3 z-30">
          <button 
            onClick={() => setActiveTab("breathing")}
            className="group relative p-3 rounded-full bg-white border border-[#eae6dc] text-[#54645a] hover:text-[#2d4a3e] hover:bg-[#faf8f4] hover:scale-105 transition-all shadow-sm flex items-center justify-center cursor-pointer"
          >
            <Wind size={20} />
            <span className="absolute right-12 bg-[#2d4a3e] text-white text-[10px] uppercase font-mono tracking-wider py-1 px-3 rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-md">
              Breathe Session
            </span>
          </button>
          
          <button 
            onClick={() => setShowLoggingModal(!showLoggingModal)}
            className="group relative p-3 rounded-full bg-white border border-[#eae6dc] text-[#54645a] hover:text-[#8a3c25] hover:bg-[#faf8f4] hover:scale-105 transition-all shadow-sm flex items-center justify-center cursor-pointer"
          >
            <Plus size={20} />
            <span className="absolute right-12 bg-[#8a3c25] text-white text-[10px] uppercase font-mono tracking-wider py-1 px-3 rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-md">
              Check-In Look
            </span>
          </button>

          <button 
            onClick={() => setActiveTab("guides")}
            className="group relative p-3 rounded-full bg-white border border-[#eae6dc] text-[#54645a] hover:text-[#365942] hover:bg-[#faf8f4] hover:scale-105 transition-all shadow-sm flex items-center justify-center cursor-pointer"
          >
            <HelpCircle size={20} />
            <span className="absolute right-12 bg-[#365942] text-white text-[10px] uppercase font-mono tracking-wider py-1 px-3 rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-md">
              Telehealth Support
            </span>
          </button>
        </div>
      )}

      {/* CORE FRAME CONTAINER (Offset to accommodate the fixed navbar) */}
      <main className={`flex-1 flex flex-col p-4 sm:p-6 lg:p-10 max-w-7xl w-full mx-auto space-y-8 ${activeTab !== 'provider' ? 'mt-24 lg:mt-32' : 'mt-4'}`}>
        
        {/* Soft terracotta distress alert triggers on heightened stress */}
        {isRedZoneActive && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-2xl border border-[#efe0da] bg-[#fbf1ee] p-5 flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm"
          >
            <div className="flex items-center gap-4">
              <div className="p-2.5 rounded-xl bg-white text-[#8a3c25] border border-[#efe0da] shrink-0">
                <ShieldAlert size={20} className="animate-bounce" />
              </div>
              <div className="space-y-0.5">
                <h4 className="text-xs font-bold text-[#8a3c25] tracking-wider uppercase font-mono">Autonomic Stress Indicators Elevated</h4>
                <p className="text-xs text-[#54645a] leading-relaxed max-w-2xl font-medium font-sans">
                  We have noted heightened cortisol projections, restless sleep indices, or medical PMDD warning factors. We recommend prioritizing calming breathing pacing and resting physical boundaries today.
                </p>
              </div>
            </div>

            <button
              onClick={() => openCounselingTerminal({
                name: "Dr. Sarah Sterling",
                role: "Neuro-Endocrinologist & Somatic Guide",
                avatar: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=150"
              })}
              className="w-full md:w-auto rounded-xl bg-[#2d4a3e] hover:bg-[#1e3328] text-white font-mono font-bold text-xs tracking-wider px-5 py-3 transition-all shadow-sm shrink-0"
            >
              Consult On-Call Counselor
            </button>
          </motion.div>
        )}

        {/* CORE Tab Routing Router */}
        <div className="flex-1">

          {activeTab === "home" && (
            <div className="space-y-6 animate-fadeIn">
              <HomeIndex
                profile={profile}
                checkInHistory={checkInHistory}
                scoreReport={scoreReport}
                onNavigate={(target) => setActiveTab(target)}
                onOpenCheckIn={() => setShowLoggingModal(true)}
              />
            </div>
          )}

          {activeTab === "settings" && (
            <div className="space-y-6 animate-fadeIn">
              <AccountSettings
                profile={profile}
                onUpdateProfile={handleUpdateProfile}
              />
            </div>
          )}

          {activeTab === "breathing" && (
            <div className="space-y-6 animate-fadeIn">
              <BreathingExercise onSaveSession={handleSaveBreathingSession} sessions={breathingSessions} />
            </div>
          )}

          {activeTab === "guides" && (
            <div className="space-y-6 animate-fadeIn">
              <ProfessionalsDirectory
                isAuthenticated={!!fbUser || isSandboxMode}
                onSendContact={handleSendProfessionalContact}
                submittedContacts={submittedContacts}
              />
            </div>
          )}

          {activeTab === "wellness" && (
            <div className="space-y-6 animate-fadeIn">
              
              {/* SIX-SECTOR BENTO GRID */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                
                {/* COLUMN 1: LEFT SIDE (4 / 12 width) */}
                <div className="lg:col-span-4 space-y-6">
                  
                  {/* ENDOCRINE CALENDAR INDEX */}
                  <div className="rounded-2xl border border-[#eae6dc] bg-white p-5 flex flex-col justify-between space-y-4 relative overflow-hidden group hover:border-[#cbd0c9] transition-all duration-300 shadow-sm">
                    <div className="absolute top-0 right-0 h-28 w-28 bg-gradient-to-bl from-[#a2533b]/5 to-transparent rounded-bl-full pointer-events-none" />
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <Droplets className="text-[#a2533b]" size={16} />
                        <span className="text-[10px] font-mono text-[#8a3c25] uppercase tracking-widest font-bold">Endocrine Rhythm</span>
                      </div>
                      {isSynchronized ? (
                        <span className="text-[9px] bg-[#fbf1ee] border border-[#efe0da] text-[#8a3c25] font-mono font-bold uppercase p-0.5 px-2.5 rounded-full">
                          Synchronized
                        </span>
                      ) : (
                        <span className="text-[9px] bg-[#f2f6f4] border border-[#d3e5db] text-[#2d4a3e] font-mono font-bold uppercase p-0.5 px-2.5 rounded-full">
                          Baseline flow
                        </span>
                      )}
                    </div>

                    <div className="py-2.5">
                      <div className="flex items-baseline gap-1.5">
                        {isSynchronized ? (
                          <>
                            <span className="text-4xl font-serif italic font-extrabold text-[#112117] tracking-tight">Day {daysSincePeriod}</span>
                            <span className="text-xs font-mono text-[#6e7d73]">/ {profile.menstrual?.cycleDays || 28}</span>
                          </>
                        ) : (
                          <span className="text-2xl font-serif italic font-extrabold text-[#112117]">Continuous Flow</span>
                        )}
                      </div>
                      
                      <div className="mt-2.5">
                        <span className={`inline-block border text-[10px] uppercase font-mono font-bold p-1 px-3.5 rounded-full ${phaseColor}`}>
                          {currentPhase}
                        </span>
                        <p className="text-xs text-[#54645a] leading-relaxed mt-2.5 font-sans font-medium">
                          {isSynchronized 
                            ? "Core focus and emotional baseline optimal. Recommended period for organizing active, high-priority creative tasks." 
                            : "Cardiac nerve markers stable in synchronized rest pattern. Cortisol integration is functioning balanced."
                          }
                        </p>
                      </div>
                    </div>

                    <div className="border-t border-[#f3f0e8] pt-3 flex items-center justify-between">
                      <button 
                        onClick={() => setActiveTab("cycle")}
                        className="text-[10px] font-mono text-[#8a3c25] hover:text-[#1c2e24] uppercase tracking-wider flex items-center gap-1 transition-all"
                      >
                        Explore hormonal guidelines <ChevronRight size={11} />
                      </button>
                    </div>
                  </div>

                  {/* PARASYMPATHETIC GROUNDING ACTION CARD */}
                  <div className="rounded-2xl border border-[#eae6dc] bg-white p-5 space-y-4 group hover:border-[#cbd0c9] transition-all duration-300 shadow-sm flex flex-col justify-between">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Feather className="text-[#365942]" size={16} />
                          <span className="text-[10px] font-mono text-[#2d4a3e] uppercase tracking-widest font-bold">Vagal Nerve Regulation</span>
                        </div>
                        <span className="h-1.5 w-1.5 rounded-full bg-[#365942]" />
                      </div>

                      <div className="space-y-1">
                        <h4 className="text-xs font-semibold text-[#1c2e24]">Audiotherapeutic Breath Coach</h4>
                        <p className="text-[11px] text-[#54645a] leading-relaxed">
                          Stimulate your vagus nerve and balance active physiological cortisol with voice guidance (Text-to-Speech) and complete historic milestone sync.
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => setActiveTab("breathing")}
                      className="w-full rounded-xl bg-[#2d4a3e] hover:bg-[#1e3328] text-white p-2.5 px-4 text-[10px] font-mono font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 mt-2"
                    >
                      <Wind size={12} /> Launch Breathing Coach
                    </button>
                  </div>

                  {/* DYNAMIC TREATMENT BUILDER (HABITS LIST) */}
                  <div className="rounded-2xl border border-[#eae6dc] bg-white p-5 space-y-4 shadow-sm group hover:border-[#cbd0c9] transition-all duration-300">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Sliders className="text-[#3b3c5e]" size={16} />
                        <span className="text-[10px] font-mono text-[#3b3c5e] uppercase tracking-widest font-bold">Health Habit Regimen</span>
                      </div>
                      <span className="text-[10px] font-mono text-[#6e7d73]">AI Formulated</span>
                    </div>

                    <div className="space-y-3 max-h-[280px] overflow-y-auto pr-1">
                      {habitsList.length > 0 ? habitsList.map((habit) => (
                        <div
                          key={habit.id}
                          className={`p-3 border rounded-xl flex items-center justify-between gap-3 transition-all ${
                            habit.isCompletedToday
                              ? "border-[#d3e5db] bg-[#f2f6f4] text-[#2d4a3e]"
                              : "border-[#f3f0e8] bg-[#faf8f4] hover:bg-[#f6f3ea]"
                          }`}
                        >
                          <div className="space-y-0.5 flex-1 min-w-0">
                            <span className="text-[8px] font-mono uppercase bg-[#efebe4] px-1.5 py-0.5 border border-[#eae6dc] rounded text-[#54645a] font-bold inline-block">
                              {habit.targetCondition}
                            </span>
                            <h4 className={`text-xs font-semibold truncate ${habit.isCompletedToday ? "line-through text-[#6e7d73]" : "text-[#1c2e24]"}`}>
                              {habit.title}
                            </h4>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <span className="text-[9px] font-mono font-bold text-[#6e7d73]">
                              {habit.streakCount}d
                            </span>
                            <button
                              onClick={() => toggleHabitComplete(habit.id)}
                              className={`p-1.5 h-6 w-6 rounded-lg border flex items-center justify-center transition-all ${
                                habit.isCompletedToday
                                  ? "border-[#365942] bg-[#365942] text-white"
                                  : "border-[#eae6dc] bg-white text-[#6e7d73] hover:text-[#1c2e24]"
                              }`}
                            >
                              <CheckCircle size={12} />
                            </button>
                          </div>
                        </div>
                      )) : (
                        <div className="text-center py-6">
                          <p className="text-xs text-[#6e7d73]">Formulating personalized B2B habit support routines...</p>
                        </div>
                      )}
                    </div>
                  </div>

                </div>

                {/* COLUMN 2: CENTER (5 / 12 width) */}
                <div className="lg:col-span-5 space-y-6">
                  
                  {/* COMPLETION MILESTONES */}
                  <SomaticMilestones 
                    checkInHistory={checkInHistory}
                    habitsList={habitsList}
                    counselMessagesCount={counselMessages.length}
                  />
                  
                  {/* COGNITIVE HEALTH COHERENCE SCORE */}
                  <div className="rounded-3xl border border-[#eae6dc] bg-white p-7 flex flex-col items-center justify-center text-[#222d25] relative overflow-hidden shadow-sm group hover:border-[#cbd0c9] transition-all duration-300">
                    <span className="text-[10px] font-mono text-[#54645a] uppercase tracking-[0.2em] font-bold">
                      COGNITIVE HEALTH COHERENCE SCORE
                    </span>

                    {isScoreReportLoading ? (
                      <div className="space-y-4 py-16">
                        <div className="h-9 w-9 border-2 border-[#2d4a3e] border-t-transparent rounded-full animate-spin mx-auto" />
                        <p className="text-xs font-mono text-[#2d4a3e] uppercase tracking-wider animate-pulse font-bold">Integrating biofeedback metrics...</p>
                      </div>
                    ) : scoreReport ? (
                      <div className="space-y-6 w-full mt-4">
                        
                        {/* Elegant Concentric Circle Orb Layout */}
                        <div className="relative flex items-center justify-center h-40 w-40 mx-auto animate-fadeIn">
                          <div className="absolute inset-0 rounded-full bg-[#f2f6f4] blur-md pointer-events-none opacity-60" />
                          <div className="absolute inset-0 rounded-full border border-[#f3eee3]" />
                          <div className="absolute inset-2.5 rounded-full border border-dashed border-[#eae6dc]" />
                          <div className="absolute inset-5 rounded-full border border-[#cbd0c9]" />
                          <div className="absolute inset-6 rounded-full bg-[#faf8f4] flex flex-col items-center justify-center z-10 shadow-inner border border-[#fefeeb]/20">
                            <span className="text-[9px] font-mono text-[#6e7d73] uppercase tracking-[0.14em] font-bold">COHERENCE</span>
                            <span className="text-4xl font-serif italic font-bold text-[#14231b] mt-0.5">
                              {scoreReport.score}%
                            </span>
                            <span className="text-[8px] font-mono text-[#365942] uppercase tracking-widest font-semibold mt-1">Live Alignment</span>
                          </div>
                        </div>

                        <div className="space-y-2 max-w-sm mx-auto text-center">
                          <span className={`inline-flex px-4 py-1 text-xs font-mono font-bold rounded-full border ${
                            scoreReport.status === "Red Zone" 
                              ? "bg-[#fbf1ee] border-[#efe0da] text-[#8a3c25]" 
                              : scoreReport.status === "Strained" 
                                ? "bg-[#faf6ed] border-[#f0e6d2] text-[#7d561a]" 
                                : "bg-[#f2f6f4] border-[#d3e5db] text-[#2d4a3e]"
                          }`}>
                            Autonomic rest index: {scoreReport.status}
                          </span>
                          <p className="text-xs text-[#54645a] leading-relaxed px-2 font-sans font-medium">
                            {scoreReport.description}
                          </p>
                        </div>

                        {/* Coherence gauges */}
                        <div className="border-t border-[#f3f0e8] pt-4 grid grid-cols-3 gap-2 text-left font-sans">
                          
                          <div className="p-2.5 rounded-xl bg-[#faf8f4] border border-[#f3eee2]">
                            <div className="flex items-center gap-1 text-[9px] font-mono text-[#54645a] uppercase font-bold">
                              <Brain size={11} className="text-[#365942]" /> Mental
                            </div>
                            <p className="text-base font-bold text-[#14231b] font-mono mt-0.5">{scoreReport.mentalScore}%</p>
                            <div className="h-1 w-full bg-[#efebe4] rounded-full mt-1 overflow-hidden">
                              <div className="h-full bg-[#365942] rounded-full" style={{ width: `${scoreReport.mentalScore}%` }} />
                            </div>
                          </div>

                          <div className="p-2.5 rounded-xl bg-[#faf8f4] border border-[#f3eee2]">
                            <div className="flex items-center gap-1 text-[9px] font-mono text-[#54645a] uppercase font-bold">
                              <HeartPulse size={11} className="text-[#a2533b]" /> Physical
                            </div>
                            <p className="text-base font-bold text-[#14231b] font-mono mt-0.5">{scoreReport.physicalScore}%</p>
                            <div className="h-1 w-full bg-[#efebe4] rounded-full mt-1 overflow-hidden">
                              <div className="h-full bg-[#a2533b] rounded-full" style={{ width: `${scoreReport.physicalScore}%` }} />
                            </div>
                          </div>

                          <div className="p-2.5 rounded-xl bg-[#faf8f4] border border-[#f3eee2]">
                            <div className="flex items-center gap-1 text-[9px] font-mono text-[#54645a] uppercase font-bold">
                              <Leaf size={11} className="text-[#7d561a]" /> Lifestyle
                            </div>
                            <p className="text-base font-bold text-[#14231b] font-mono mt-0.5">{scoreReport.lifestyleScore}%</p>
                            <div className="h-1 w-full bg-[#efebe4] rounded-full mt-1 overflow-hidden">
                              <div className="h-full bg-[#7d561a] rounded-full" style={{ width: `${scoreReport.lifestyleScore}%` }} />
                            </div>
                          </div>

                        </div>

                        {/* Coherence Rank box */}
                        <div className="rounded-xl bg-[#faf8f4] border border-[#eae6dc] p-3 flex items-center justify-between text-xs font-sans font-medium">
                          <div className="flex items-center gap-2">
                            <Zap size={13} className="text-[#7d561a]" />
                            <span className="text-[#54645a]">Vagal Nerve Sync Indicator:</span>
                          </div>
                          <span className="text-[10px] uppercase font-mono font-bold text-[#2d4a3e] bg-[#f2f6f4] px-2.5 py-1 rounded-full border border-[#d3e5db]">
                            {scoreReport.coherenceRank}
                          </span>
                        </div>

                      </div>
                    ) : (
                      <div className="py-16 space-y-2">
                        <Feather className="text-[#cbd0c9] mx-auto animate-pulse" size={32} />
                        <p className="text-xs text-[#6e7d73] font-medium font-sans">No reflections entered today. Begin a check-in below.</p>
                      </div>
                    )}
                  </div>

                  {/* CLINICAL PREVENTION PLAN */}
                  <div className="rounded-2xl border border-[#eae6dc] bg-white p-5.5 space-y-4 group hover:border-[#cbd0c9] transition-all duration-300 shadow-sm">
                    <div className="flex items-center gap-2">
                      <Sparkles className="text-[#365942]" size={15} />
                      <h3 className="text-xs font-bold font-mono text-[#1c2e24] uppercase tracking-wider">Mindful Recovery Plan</h3>
                    </div>

                    <div className="space-y-3 font-sans">
                      {scoreReport?.recommendations ? scoreReport.recommendations.map((rec, i) => (
                        <div key={i} className="flex gap-3 text-xs bg-[#faf8f4] p-3.5 border border-[#f3eee3] rounded-xl leading-relaxed font-sans font-medium text-[#333e38]">
                          <span className="h-5.5 w-5.5 rounded-lg bg-[#efebe4] border border-[#eae6dc] text-[#1c2e24] flex items-center justify-center font-mono font-bold shrink-0 text-[10px]">0{i + 1}</span>
                          <span className="select-all">{rec}</span>
                        </div>
                      )) : (
                        <p className="text-xs text-[#54645a] py-4 text-center">Log biometric checks to formulate clinical recommendations.</p>
                      )}
                    </div>
                  </div>

                </div>

                {/* COLUMN 3: RIGHT PANEL (3 / 12 width) */}
                <div className="lg:col-span-3 space-y-6">
                  
                  {/* LOG EVENT DISPATCH TRIGGER */}
                  <div className="rounded-2xl border border-[#eae6dc] bg-[#eef4f0] p-5 space-y-3.5 shadow-sm text-center relative overflow-hidden group hover:border-[#365942]/30 transition-all duration-300">
                    <div className="absolute top-0 right-0 h-16 w-16 bg-[#365942]/5 rounded-bl-full pointer-events-none" />
                    
                    <h4 className="text-xs font-bold font-mono text-[#2d4a3e] tracking-widest uppercase">DAILY REFLECTION</h4>
                    <p className="text-xs text-[#54645a] font-medium font-sans px-1">
                      Log daily stress gradients, head pressure, or fatigue signals into your alignment cycle.
                    </p>
                    
                    <button
                      type="button"
                      onClick={() => setShowLoggingModal(true)}
                      className="w-full rounded-xl bg-[#2d4a3e] hover:bg-[#1e3328] text-white font-bold font-mono text-xs py-3 tracking-widest uppercase transition-all duration-300 shadow-sm flex items-center justify-center gap-1.5"
                    >
                      <Plus size={14} className="text-white font-black" /> NEW REFLECTION
                    </button>
                  </div>

                  {/* PRIVATE GUIDE CHANNEL */}
                  <div className="rounded-2xl border border-[#eae6dc] bg-white p-4 flex flex-col h-[320px] justify-between shadow-sm group hover:border-[#cbd0c9] transition-all duration-300">
                    <div className="flex items-center justify-between border-b border-[#f3f0e8] pb-2">
                      <div className="flex items-center gap-2">
                        <MessageSquare size={13} className="text-[#a2533b]" />
                        <span className="text-[10px] font-mono text-[#8a3c25] uppercase tracking-widest font-bold">Secure Guide Channel</span>
                      </div>
                      <span className="text-[9px] font-mono text-[#6e7d73]">Mindful Consult</span>
                    </div>

                    {/* Chat Messages Stream */}
                    <div className="flex-1 overflow-y-auto my-3 space-y-2.5 pr-1 text-[11px] font-sans">
                      {counselMessages.length > 0 ? (
                        counselMessages.map((msg, i) => (
                          <div key={i} className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
                            <div className={`p-2.5 rounded-xl max-w-[85%] leading-relaxed ${
                              msg.sender === "user" 
                                ? "bg-[#faf8f4] border border-[#eae6dc] text-[#1c2e24] font-medium" 
                                : "bg-[#f2f6f4] border border-[#d3e5db] text-[#2d4a3e]"
                            }`}>
                              {msg.text}
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-10 space-y-2">
                          <User size={20} className="text-[#cbd0c9] mx-auto" />
                          <p className="text-[#6e7d73] font-medium font-sans px-2">Initiate a dialogue with an AI therapist guide to address symptoms.</p>
                          <button
                            type="button"
                            onClick={() => openCounselingTerminal({
                              name: "Dr. Jordan Vance",
                              role: "Clinical Endocrinologist & Vagal Guide",
                              avatar: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=150"
                            })}
                            className="text-[10px] font-mono text-[#365942] border border-[#d3e5db] bg-[#f2f6f4] hover:bg-white rounded-lg p-1.5 px-3 font-bold"
                          >
                            Consult Dr. Vance
                          </button>
                        </div>
                      )}
                      {isChatLoading && (
                        <div className="text-[9px] font-mono text-[#365942] animate-pulse">
                          Receiving counseling feedback...
                        </div>
                      )}
                    </div>

                    {/* Quick Text input */}
                    <div className="flex gap-2 pt-2 border-t border-[#f3f0e8]">
                      <input
                        type="text"
                        value={currentChatInput}
                        onChange={(e) => setCurrentChatInput(e.target.value)}
                        placeholder="Empathy reflection..."
                        disabled={counselMessages.length === 0}
                        onKeyDown={(e) => e.key === "Enter" && handleSendChat()}
                        className="flex-1 text-[11px] bg-[#faf8f4] rounded-lg border border-[#eae6dc] p-2 text-[#1e2e24] focus:outline-none focus:border-[#365942]"
                      />
                      <button
                        onClick={handleSendChat}
                        disabled={counselMessages.length === 0}
                        className="p-2 rounded-lg bg-[#2d4a3e] hover:bg-[#1e3328] text-white flex items-center justify-center transition-all disabled:opacity-40"
                      >
                        <Send size={11} />
                      </button>
                    </div>
                  </div>

                  {/* REFLECTIONS DIARY */}
                  <div className="rounded-2xl border border-[#eae6dc] bg-white p-4 space-y-3 shadow-sm group hover:border-[#cbd0c9] transition-all duration-300">
                    <div className="flex items-center gap-2">
                      <Calendar size={13} className="text-[#365942]" />
                      <span className="text-[10px] font-mono text-[#2d4a3e] uppercase tracking-widest font-bold">Reflections Diary</span>
                    </div>

                    <div className="space-y-2.5 font-sans">
                      {checkInHistory.length > 0 ? checkInHistory.map((chk, idx) => (
                        <div key={chk.id || idx} className="text-xs bg-[#faf8f4] p-2.5 rounded-xl border border-[#f3f0e8] flex justify-between items-center animate-fadeIn">
                          <div>
                            <p className="font-bold text-[#1c2e24] font-mono text-[10px]">{chk.date}</p>
                            <span className="text-[9.5px] text-[#54645a] line-clamp-1 truncate block max-w-[120px]">{chk.moodNotes || "No notes"}</span>
                          </div>
                          
                          <div className="flex gap-1.5 shrink-0 text-[9px] font-mono font-bold">
                            <span className="p-0.5 px-2 bg-[#fbf1ee] text-[#8a3c25] border border-[#efe0da] rounded-full">S: {chk.stressScore}</span>
                            <span className="p-0.5 px-2 bg-[#f2f2fa] text-[#3b3c5e] border border-[#e1e1f2] rounded-full">Sl: {chk.sleepQuality}</span>
                          </div>
                        </div>
                      )) : (
                        <p className="text-[11.5px] text-[#6e7d73] py-2 text-center">Empty reflection history.</p>
                      )}
                    </div>
                  </div>

                </div>

              </div>

            </div>
          )}

          {activeTab === "cycle" && (
            <div className="space-y-6 animate-fadeIn">
              <CycleTracker profile={profile} onUpdateProfile={handleUpdateProfile} />
            </div>
          )}

          {activeTab === "dictionary" && (
            <div className="space-y-6 animate-fadeIn">
              <MedicalDictionary />
            </div>
          )}

          {activeTab === "provider" && (
            <div className="space-y-6 animate-fadeIn">
              <ProviderPortal 
                onBack={() => setActiveTab("home")} 
                onLoginAsCounselor={(name) => {
                   setIsSandboxMode(true);
                   handleUpdateProfile({ ...profile, name: name || "Dr. Counselor", role: "counselor", isOnboarded: true });
                   setActiveTab("counselor_dashboard");
                }}
              />
            </div>
          )}

          {activeTab === "counselor_dashboard" && (
            <div className="space-y-6 animate-fadeIn">
              <CounselorDashboard />
            </div>
          )}

        </div>
      </main>

      {/* CONTEMPORARY FLOATING MOBILE TABS MENU */}
      {activeTab !== "provider" && (
        <div id="hud_floating_pill_menu" className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-white/95 backdrop-blur-xl border border-[#eae6dc] rounded-2xl p-1.5 shadow-lg flex items-center gap-1 max-w-[95vw] lg:hidden overflow-x-auto">
          {[
            { id: "home", label: "Home", icon: Heart },
            { id: "wellness", label: "Dashboard", icon: Activity },
            { id: "breathing", label: "Breathe", icon: Wind },
            { id: "dictionary", label: "Dictionary", icon: BookA },
            { id: "guides", label: "Network", icon: Stethoscope },
          ].map((item) => {
            const isSel = activeTab === item.id;
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as any)}
                type="button"
                className={`p-2 px-3 rounded-xl transition-all flex items-center gap-1.5 shrink-0 ${
                  isSel
                    ? "bg-[#eef4f0] text-[#2d4a3e] font-bold border border-[#d3e5db]"
                    : "text-[#54645a] hover:text-[#1c2e24]"
                }`}
              >
                <Icon size={14} />
                {isSel && <span className="text-[10px] font-mono tracking-wider uppercase font-bold">{item.label}</span>}
              </button>
            );
          })}
        </div>
      )}

      {/* MODALS & POPUPS */}
      
      {/* MINDFUL CHECK-IN POPUP DIALOG */}
      <AnimatePresence>
        {showLoggingModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-neutral-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto"
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              className="w-full max-w-md rounded-2xl border border-[#eae6dc] bg-white p-6 space-y-5 shadow-lg relative"
            >
              <div className="border-b border-[#f3f0e8] pb-3 flex justify-between items-center">
                <div>
                  <h3 className="text-sm font-bold font-mono text-[#1c2e24] uppercase tracking-wider">Log Dynamic Bio-rhythms</h3>
                  <p className="text-[10px] text-[#6e7d73] font-mono mt-0.5">Track current visceral tension and emotional alignment gradients</p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowLoggingModal(false)}
                  className="p-1 px-2 border border-[#f3eee3] rounded-lg text-[#6e7d73] hover:text-[#1c2e24] font-mono text-[10px] bg-[#faf8f4] font-medium"
                >
                  Close
                </button>
              </div>

              <form onSubmit={handleSubmitCheckIn} className="space-y-4 font-sans font-medium text-xs text-[#222d25]">
                
                {/* Score slider gauges */}
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="text-[10px] font-mono text-[#365942] uppercase font-bold">Stress Score: {stressInput}/10</label>
                      <span className="text-[9px] text-[#6e7d73] font-mono p-0.5 px-2 bg-[#faf8f4] border border-[#f3eee2] rounded">1: Zen • 10: Exhaustion</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={stressInput}
                      onChange={(e) => setStressInput(parseInt(e.target.value))}
                      className="w-full accent-[#365942] h-1 bg-[#eae6dc] rounded-lg cursor-pointer"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label className="text-[10px] font-mono text-[#6e7d73] uppercase font-bold">Sleep Rank: {sleepInput}/10</label>
                      </div>
                      <input
                        type="range"
                        min="1"
                        max="10"
                        value={sleepInput}
                        onChange={(e) => setSleepInput(parseInt(e.target.value))}
                        className="w-full accent-[#365942] h-1 bg-[#eae6dc] rounded-lg cursor-pointer"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label className="text-[10px] font-mono text-[#6e7d73] uppercase font-bold">Energy Rate: {energyInput}/10</label>
                      </div>
                      <input
                        type="range"
                        min="1"
                        max="10"
                        value={energyInput}
                        onChange={(e) => setEnergyInput(parseInt(e.target.value))}
                        className="w-full accent-[#365942] h-1 bg-[#eae6dc] rounded-lg cursor-pointer"
                      />
                    </div>
                  </div>
                </div>

                {/* Specific physical check indicators */}
                <div className="space-y-2 pt-2 border-t border-[#f3f0e8]">
                  <span className="block text-[9px] font-mono text-[#6e7d73] uppercase font-semibold text-wrap">Associated Physical Symptoms Felt Today:</span>
                  <div className="flex flex-wrap gap-2">
                    {[
                      "Headaches",
                      "Fatigue",
                      "Intestinal pain",
                      "Heart Fluttering",
                      "Visceral Cramps",
                    ].map((sym) => {
                      const isActive = loggedSymptoms.includes(sym);
                      return (
                        <button
                          type="button"
                          key={sym}
                          onClick={() => toggleSymptomLog(sym)}
                          className={`text-[9px] font-mono rounded-lg px-3 py-1.5 transition-all uppercase border ${
                            isActive 
                              ? "bg-[#fbf1ee] text-[#8a3c25] border-[#efe0da] font-bold" 
                              : "bg-[#faf8f4] border-[#eae6dc] text-[#54645a] hover:text-[#1c2e24] hover:border-[#cbd0c9]"
                          }`}
                        >
                          {sym}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Mood notes text area */}
                <div className="space-y-1">
                  <label className="block text-[10px] font-mono text-[#6e7d73] uppercase font-bold">Contextual Reflection Notes (Optional)</label>
                  <textarea
                    value={moodNotes}
                    onChange={(e) => setMoodNotes(e.target.value)}
                    placeholder="e.g., Felt stomach sensitivity during focus sprint hours. Practiced grounding breathing pacer..."
                    className="w-full h-18 rounded-xl border border-[#eae6dc] bg-[#faf8f4] p-3 text-xs text-[#1e2e24] placeholder-[#a6b1a9] focus:outline-none focus:border-[#365942]"
                  />
                </div>

                <div className="flex gap-2.5 justify-end pt-3">
                  <button
                    type="button"
                    onClick={() => setShowLoggingModal(false)}
                    className="rounded-xl bg-[#faf8f4] hover:bg-[#efebe4] border border-[#eae6dc] px-4 py-2 font-mono text-xs text-[#54645a] font-bold transition-all"
                  >
                    Discard
                  </button>
                  <button
                    type="submit"
                    className="rounded-xl bg-[#2d4a3e] hover:bg-[#1e3328] text-white font-extrabold px-5 py-2 font-mono text-xs transition-colors shadow-sm"
                  >
                    Track Reflection
                  </button>
                </div>

              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* SECURE POPUP CONSULTATION */}
      <AnimatePresence>
        {showConsultTerminal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-neutral-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn"
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="w-full max-w-lg h-[80vh] rounded-2xl border border-[#eae6dc] bg-white flex flex-col overflow-hidden shadow-xl relative text-[#222d25]"
            >
              
              {/* Terminal header */}
              <div className="p-4 border-b border-[#f3f0e8] bg-[#faf8f4] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img src={activeCounselor.avatar} alt="DoctorAvatar" className="h-10 w-10 rounded-full object-cover border border-[#cbd0c9]" />
                  <div>
                    <span className="text-[9px] font-mono font-bold text-[#365942] uppercase tracking-wider flex items-center gap-1 leading-none">
                      <Zap size={9} className="animate-pulse text-[#365942]" /> Private Practitioner Channel
                    </span>
                    <h3 className="text-xs font-bold text-[#14231b] mt-1">{activeCounselor.name}</h3>
                    <p className="text-[9px] text-[#6e7d73] font-mono font-semibold">{activeCounselor.role}</p>
                  </div>
                </div>

                <button
                  onClick={() => setShowConsultTerminal(false)}
                  className="text-[#6e7d73] hover:text-[#1c2e24] font-mono text-[10px] p-1.5 px-3 bg-white border border-[#eae6dc] rounded-xl font-medium"
                >
                  Close Secure Room
                </button>
              </div>

              {/* Message scroll container */}
              <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-white/50 backdrop-blur-sm">
                {counselMessages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl p-3.5 text-xs leading-relaxed ${
                        msg.sender === "user"
                          ? "bg-[#faf8f4] text-[#1c2e24] border border-[#eae6dc] font-sans font-medium"
                          : "bg-[#f2f6f4] border border-[#d3e5db] text-[#2d4a3e] font-sans"
                      }`}
                    >
                      {msg.text}
                    </div>
                  </div>
                ))}
                {isChatLoading && (
                  <div className="flex justify-start animate-pulse">
                    <div className="bg-[#faf8f4] border border-[#eae6dc] rounded-xl p-3 text-[10px] text-[#6e7d73] font-mono flex items-center gap-2">
                      <div className="h-1.5 w-1.5 bg-[#365942] rounded-full" />
                      Receiving clinical translation stream...
                    </div>
                  </div>
                )}
              </div>

              {/* Input text send field */}
              <div className="p-4 border-t border-[#f3f0e8] bg-[#faf8f4] flex gap-2">
                <input
                  type="text"
                  value={currentChatInput}
                  onChange={(e) => setCurrentChatInput(e.target.value)}
                  placeholder="Ask private practitioner here..."
                  className="flex-1 rounded-xl border border-[#eae6dc] bg-white p-3 text-xs text-[#1e2e24] placeholder-[#a6b1a9] focus:outline-none focus:border-[#365942]"
                  onKeyDown={(e) => e.key === "Enter" && handleSendChat()}
                  disabled={isChatLoading}
                />
                <button
                  onClick={handleSendChat}
                  disabled={isChatLoading}
                  className="rounded-xl bg-[#2d4a3e] hover:bg-[#1e3328] text-white font-semibold font-mono text-xs px-5 transition-colors flex items-center justify-center shadow-sm"
                >
                  Send
                </button>
              </div>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
