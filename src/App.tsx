import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Onboarding } from './pages/Onboarding';
import { Dashboard } from './pages/Dashboard';
import { MedIHub } from './pages/MedIHub';
import { Exercises } from './pages/Exercises';
import { CycleTracker } from './pages/CycleTracker';
import { useState, useEffect } from 'react';

export default function App() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/profile')
      .then(r => r.json())
      .then(data => {
        if (data && Object.keys(data).length > 0) {
          setProfile(data);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return null;

  return (
    <BrowserRouter>
      <Routes>
        <Route 
          path="/" 
          element={profile ? <Navigate to="/dashboard" replace /> : <Onboarding onComplete={setProfile} />} 
        />
        <Route element={<LayoutWrapper profile={profile} />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/exercises" element={<Exercises />} />
          <Route path="/cycle" element={<CycleTracker />} />
          <Route path="/medihub" element={<MedIHub />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

function LayoutWrapper({ profile }: { profile: any }) {
  if (!profile) return <Navigate to="/" replace />;
  return <Layout><Outlet /></Layout>;
}
