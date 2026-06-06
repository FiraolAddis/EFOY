import { useState } from "react";
import { motion } from "motion/react";
import { Users, Building2, UserCheck, ShieldAlert } from "lucide-react";

export default function CorporateDashboard() {
  const [b2bTab, setB2bTab] = useState<"hr" | "clinic">("hr");

  // Mock department dataset
  const hrData = [
    { department: "Sales & Client Management", headCount: 42, avgStress: 7.8, riskCount: 14, adherence: 64 },
    { department: "Software Architecture", headCount: 68, avgStress: 8.2, riskCount: 22, adherence: 52 },
    { department: "Customer Operations", headCount: 35, avgStress: 9.1, riskCount: 16, adherence: 41 },
    { department: "Finance & Corporate Legal", headCount: 20, avgStress: 6.4, riskCount: 3, adherence: 78 },
    { department: "People Operations & HR", headCount: 12, avgStress: 5.5, riskCount: 1, adherence: 88 },
  ];

  // Mock clinical outpatient tracking
  const clinicalPatients = [
    { id: "PT-492", name: "Anonymized Participant A", diagnosis: "Vascular Migraine & Hormonal PMDD Spasms", habitCompliance: 84, alertLevel: "Coherence Stable", loggedDeficiencies: ["Vitamin D3"] },
    { id: "PT-328", name: "Anonymized Participant B", diagnosis: "Clinical Tension Traumas & Vagal Nerve Flutter", habitCompliance: 38, alertLevel: "High Burnout Risk", loggedDeficiencies: ["Magnesium", "Vitamin B12"] },
    { id: "PT-701", name: "Anonymized Participant C", diagnosis: "Chronic Exhaustive Burnout Recovery", habitCompliance: 92, alertLevel: "Optimal Pacing Cycle", loggedDeficiencies: [] },
  ];

  return (
    <div id="corporate_viewport" className="rounded-2xl border border-[#eae6dc] bg-white p-6 space-y-6 text-[#222d25]">
      
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#f3f0e8] pb-4">
        <div>
          <h3 className="text-sm font-semibold font-mono text-[#1c2e24] uppercase tracking-wider flex items-center gap-2">
            <Building2 className="text-[#365942]" size={18} /> Enterprise Wellness Channel
          </h3>
          <p className="text-[10px] text-[#6e7d73] font-mono mt-0.5">Corporate stress trends & provider adherence dashboard</p>
        </div>

        {/* Toggle selectors */}
        <div className="flex bg-[#faf8f4] p-1 rounded-xl border border-[#eae6dc] self-start sm:self-center">
          <button
            onClick={() => setB2bTab("hr")}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-[10px] font-mono tracking-wider transition-all uppercase ${
              b2bTab === "hr"
                ? "bg-white text-[#365942] border border-[#e1ddd3] shadow-sm font-bold"
                : "text-[#54645a] hover:text-[#1c2e24]"
            }`}
          >
            HR Anonymized Dashboard
          </button>
          <button
            onClick={() => setB2bTab("clinic")}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-[10px] font-mono tracking-wider transition-all uppercase ${
              b2bTab === "clinic"
                ? "bg-white text-[#365942] border border-[#e1ddd3] shadow-sm font-bold"
                : "text-[#54645a] hover:text-[#1c2e24]"
            }`}
          >
            Clinical Provider Portal
          </button>
        </div>
      </div>

      {b2bTab === "hr" ? (
        <div className="space-y-6 animate-fadeIn">
          {/* Top KPIs */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="rounded-xl border border-[#eae6dc] bg-[#faf8f4] p-4.5 space-y-1">
              <span className="text-[10px] font-mono uppercase text-[#6e7d73] font-semibold">Subscribed Employees</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-3xl font-serif italic font-bold text-[#1c2e24]">187</span>
                <span className="text-[10px] text-[#365942] font-mono font-semibold">Active Syncs</span>
              </div>
            </div>

            <div className="rounded-xl border border-[#eae6dc] bg-[#faf8f4] p-4.5 space-y-1">
              <span className="text-[10px] font-mono uppercase text-[#6e7d73] font-semibold">Average Burnout Risk</span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-3xl font-serif italic font-bold text-[#a2533b]">7.4 / 10</span>
                <span className="text-[10px] text-[#8a3c25] font-mono font-semibold">Strained</span>
              </div>
            </div>

            <div className="rounded-xl border border-[#eae6dc] bg-[#faf8f4] p-4.5 space-y-1">
              <span className="text-[10px] font-mono uppercase text-[#6e7d73] font-semibold">Daily Pause Completion</span>
              <div className="flex items-baseline gap-12 mt-1">
                <span className="text-3xl font-serif italic font-bold text-[#2d4a3e]">64.6%</span>
                <span className="text-[10px] text-[#6e7d73] font-mono">Rest patterns met</span>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-[#eae6dc] overflow-hidden bg-white">
            <div className="p-4 border-b border-[#f3f0e8] bg-[#faf8f4] flex justify-between items-center">
              <span className="text-[10px] font-mono uppercase text-[#3d4f43] tracking-wider font-bold">Departmental Stress & Burnout Distribution</span>
              <span className="text-[9px] text-[#6e7d73] font-mono flex items-center gap-1">
                <Users size={11} /> Recalculated 5 mins ago
              </span>
            </div>

            <div className="p-5 space-y-5">
              {hrData.map((dept, idx) => {
                const stressPercent = dept.avgStress * 10;
                let barColor = "bg-[#365942]";
                let textStyle = "text-[#365942]";
                if (dept.avgStress > 8.0) {
                  barColor = "bg-[#bb6045]";
                  textStyle = "text-[#8a3c25]";
                } else if (dept.avgStress > 7.0) {
                  barColor = "bg-[#cda250]";
                  textStyle = "text-[#7d561a]";
                }

                return (
                  <div key={idx} className="space-y-2">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-[#1c2e24]">{dept.department}</span>
                        <span className="text-[10px] font-mono text-[#6e7d73]">({dept.headCount} members)</span>
                      </div>
                      <div className="flex items-center gap-4 font-mono text-[10px] font-medium text-[#54645a]">
                        <span>Stress: <strong className="text-[#1c2e24]">{dept.avgStress}/10</strong></span>
                        <span>Burnout strain: <strong className={dept.riskCount > 10 ? "text-[#8a3c25]" : "text-[#54645a]"}>{dept.riskCount} flags</strong></span>
                        <span>Pause adherence: <strong className={textStyle}>{dept.adherence}%</strong></span>
                      </div>
                    </div>

                    <div className="h-1.5 w-full bg-[#f3eee3] rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${stressPercent}%` }}
                        className={`h-full rounded-full ${barColor}`}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6 animate-fadeIn">
          {/* Top clinics layout */}
          <div className="rounded-xl border border-[#eae6dc] bg-[#faf8f4] p-4.5 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <UserCheck className="text-[#365942]" size={18} />
              <div>
                <span className="text-[9px] font-mono uppercase text-[#6e7d73] block">Active Remote Channels</span>
                <span className="text-sm font-semibold text-[#1c2e24] block mt-0.5">3 Outpatient Synchronizations Unlocked</span>
              </div>
            </div>
            <p className="text-xs text-[#54645a] leading-relaxed font-sans max-w-sm">
              Enables external healthcare guides or corporate psychologists to securely audit participant habit compliance, physical fatigue metrics, or distress alarms.
            </p>
          </div>

          <div className="space-y-4">
            {clinicalPatients.map((patient, idx) => {
              const isHighAlert = patient.alertLevel === "High Burnout Risk";
              return (
                <div key={idx} className="rounded-xl border border-[#eae6dc] bg-white p-5 space-y-4 hover:border-[#cbd0c9] transition-colors">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#f3f0e8] pb-3">
                    <div className="flex items-center gap-2.5">
                      <div className={`h-2.5 w-2.5 rounded-full ${isHighAlert ? "bg-[#bb6045] animate-pulse" : "bg-[#365942]"}`} />
                      <div>
                        <span className="text-xs font-mono font-semibold uppercase text-[#6e7d73]">{patient.id}</span>
                        <h4 className="text-sm font-semibold text-[#1c2e24] mt-0.5">{patient.name}</h4>
                      </div>
                    </div>

                    <span className={`text-[10px] font-mono px-3 py-1 rounded-full font-bold uppercase border ${
                      isHighAlert 
                        ? "bg-[#fbf1ee] text-[#8a3c25] border-[#efe0da]" 
                        : "bg-[#f2f6f4] text-[#2d4a3e] border-[#d3e5db]"
                    }`}>
                      {patient.alertLevel}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <span className="text-[9px] font-mono uppercase text-[#6e7d73] font-semibold">Primary Diagnosis Matrix</span>
                      <p className="text-xs text-[#333e38] font-medium font-sans">{patient.diagnosis}</p>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[9px] font-mono uppercase text-[#6e7d73] font-semibold">Associated Deficiencies</span>
                      <p className="text-xs text-[#333e38]">
                        {patient.loggedDeficiencies.length > 0
                          ? patient.loggedDeficiencies.join(", ")
                          : "None currently logged"}
                      </p>
                    </div>

                    <div className="space-y-1 flex flex-col justify-between">
                      <div className="flex justify-between items-center text-[10px] font-mono font-medium mb-1">
                        <span className="text-[#6e7d73]">MITIGATION COMPLIANCE</span>
                        <span className="text-[#1c2e24] font-bold">{patient.habitCompliance}%</span>
                      </div>
                      <div className="h-1.5 w-full bg-[#f3eee3] rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${patient.habitCompliance}%` }}
                          className={`h-full rounded-full ${
                            patient.habitCompliance > 80 
                              ? "bg-[#365942]" 
                              : patient.habitCompliance > 50 
                                ? "bg-[#cda250]" 
                                : "bg-[#bb6045]"
                          }`}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
