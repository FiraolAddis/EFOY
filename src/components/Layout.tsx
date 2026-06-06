import { ReactNode } from 'react';
import { NavLink } from 'react-router-dom';
import { motion } from 'motion/react';
import { Activity, Beaker, Brain, Home, Heart } from 'lucide-react';
import { cn } from '../lib/utils';

export function Layout({ children }: { children: ReactNode }) {
  return (
    <>
      <div className="bg-mesh" />
      <div className="flex h-screen overflow-hidden">
        {/* Sidebar Nav */}
        <nav className="w-24 flex-shrink-0 border-r border-[#E5EADD] bg-white/40 backdrop-blur-md flex flex-col items-center py-8 gap-8 z-10">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#5A7D6C] to-[#4A6B5C] flex items-center justify-center shadow-lg shadow-[#5A7D6C]/30">
            <Heart className="text-white w-6 h-6" />
          </div>
          <div className="flex flex-col gap-6 mt-8">
            <NavItem to="/dashboard" icon={<Home />} label="Dashboard" />
            <NavItem to="/exercises" icon={<Brain />} label="Exercises" />
            <NavItem to="/cycle" icon={<Activity />} label="Cycle" />
            <NavItem to="/medihub" icon={<Beaker />} label="MedI Hub" />
          </div>
        </nav>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden relative z-0 p-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="max-w-7xl mx-auto"
          >
            {children}
          </motion.div>
        </main>
      </div>
    </>
  );
}

function NavItem({ to, icon, label }: { to: string; icon: ReactNode; label: string }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        cn(
          "w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300 group relative",
          isActive
            ? "bg-[#5A7D6C] text-white shadow-[0_0_20px_rgba(90,125,108,0.1)]"
            : "text-[#6B7F75] hover:text-[#5A7D6C] hover:bg-white/80"
        )
      }
    >
      {icon}
      <span className="absolute left-full ml-4 px-3 py-1.5 bg-white text-[#2A3B33] border border-[#E5EADD] text-sm rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50">
        {label}
      </span>
    </NavLink>
  );
}
