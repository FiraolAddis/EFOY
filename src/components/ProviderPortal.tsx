import React, { useState, useEffect } from "react";
import { Stethoscope, ShieldCheck, FileText, Upload, CheckCircle, ArrowLeft, Loader2, KeyRound } from "lucide-react";

export function ProviderPortal({ 
  onBack, 
  onLoginAsCounselor 
}: { 
  onBack?: () => void;
  onLoginAsCounselor?: (name: string) => void;
}) {
  const [formState, setFormState] = useState({
    fullName: "",
    specialty: "",
    licenseNumber: "",
    email: "",
  });
  const [submissionState, setSubmissionState] = useState<"idle" | "submitting" | "reviewing" | "approved">("idle");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmissionState("submitting");
    
    // Simulate upload step
    setTimeout(() => {
      setSubmissionState("reviewing");
      
      // Simulate credential evaluation step
      setTimeout(() => {
        setSubmissionState("approved");
      }, 3500);
    }, 1500);
  };

  if (submissionState === "reviewing") {
    return (
      <div className="max-w-2xl mx-auto mt-10 p-12 bg-white border border-[#eae6dc] rounded-3xl shadow-sm text-center relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#f4ece3] rounded-full blur-[50px] opacity-50" />
        <Loader2 className="animate-spin text-[#7d532a] mx-auto h-12 w-12 mb-6" />
        <h2 className="text-2xl font-serif text-[#1c2e24] mb-3">Evaluating Credentials</h2>
        <p className="text-[#54645a] font-sans leading-relaxed text-sm max-w-sm mx-auto">
          Our automated AI compliance system is actively verifying your NPI and state medical board registry details. Please wait.
        </p>
      </div>
    );
  }

  if (submissionState === "approved") {
    return (
      <div className="max-w-2xl mx-auto mt-10 p-10 bg-white border border-[#eae6dc] rounded-3xl shadow-sm text-center relative overflow-hidden animate-fadeIn">
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#eef4f0] rounded-full blur-[50px] opacity-60" />
        
        <div className="h-16 w-16 bg-[#ebf4f0] text-[#2d4a3e] rounded-full mx-auto flex items-center justify-center mb-6 relative z-10 shadow-sm border border-[#c4dbcd]">
          <CheckCircle size={32} />
        </div>
        
        <h2 className="text-3xl font-serif text-[#1c2e24] mb-3 relative z-10">Application Approved</h2>
        <p className="text-[#54645a] font-sans leading-relaxed mb-8 relative z-10">
          Welcome to the Vitalis Provider Network, <span className="font-bold">{formState.fullName || "Doctor"}</span>.
          Your credentials have been successfully verified. We have automatically provisioned your secure telehealth counselor account.
        </p>
        
        <div className="bg-[#faf8f4] border border-[#eae6dc] rounded-2xl p-6 text-left max-w-md mx-auto mb-8 relative z-10 shadow-sm">
          <h4 className="text-[10px] uppercase font-mono tracking-widest font-bold text-[#aebbb3] mb-4 flex items-center gap-1.5 border-b border-[#eae6dc] pb-2">
            <KeyRound size={12} /> Provisioned Credentials
          </h4>
          <div className="space-y-3">
             <div>
               <label className="text-[10px] text-[#54645a] uppercase font-mono font-bold tracking-wider">Role</label>
               <div className="text-sm font-bold text-[#1c2e24] font-mono mt-0.5">Clinical Counselor</div>
             </div>
             <div>
               <label className="text-[10px] text-[#54645a] uppercase font-mono font-bold tracking-wider">System ID</label>
               <div className="text-sm font-mono text-[#7d532a] mt-0.5">PRV-{Math.floor(Math.random() * 90000) + 10000}</div>
             </div>
          </div>
        </div>

        <button 
          onClick={() => onLoginAsCounselor && onLoginAsCounselor(formState.fullName)}
          className="bg-[#1c2e24] hover:bg-[#2d4a3e] text-white px-8 py-3.5 rounded-xl font-mono text-xs tracking-wider uppercase font-bold transition-all shadow-md relative z-10"
        >
          Access Counselor Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fadeIn pt-6">
      {onBack && (
        <button 
          onClick={onBack}
          className="rounded-xl border border-[#eae6dc] bg-white hover:bg-[#faf8f4] text-[#54645a] hover:text-[#1c2e24] px-4 py-2 font-mono text-[10px] font-bold uppercase tracking-wider transition-all inline-flex items-center gap-2 shadow-sm"
        >
          <ArrowLeft size={16} /> Back to Home
        </button>
      )}
      
      <div className="text-center space-y-3">
        <h2 className="text-3xl font-serif text-[#1c2e24]">Provider Portal</h2>
        <p className="text-[#54645a] font-sans max-w-xl mx-auto">
          Join our clinical network to provide somatic guides, prescriptions, and telehealth consultations to our highly engaged user base.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="col-span-1 space-y-6">
          <div className="bg-[#faf8f4] border border-[#eae6dc] p-6 rounded-2xl flex items-start gap-4 shadow-sm">
             <div className="p-2.5 bg-white shadow-sm border border-[#eae6dc] rounded-xl text-[#365942] shrink-0">
               <ShieldCheck size={20} />
             </div>
             <div>
               <h4 className="text-sm font-bold font-mono tracking-wider text-[#1c2e24] mb-1">Strict Vetting</h4>
               <p className="text-xs text-[#54645a]">All providers undergo rigorous NPI and state medical board credentialing verification.</p>
             </div>
          </div>
          <div className="bg-[#faf8f4] border border-[#eae6dc] p-6 rounded-2xl flex items-start gap-4 shadow-sm">
             <div className="p-2.5 bg-white shadow-sm border border-[#eae6dc] rounded-xl text-[#365942] shrink-0">
               <Stethoscope size={20} />
             </div>
             <div>
               <h4 className="text-sm font-bold font-mono tracking-wider text-[#1c2e24] mb-1">Clinical Tools</h4>
               <p className="text-xs text-[#54645a]">Connect with patients directly through our secure HIPAA-compliant infrastructure.</p>
             </div>
          </div>
        </div>

        <div className="col-span-1 md:col-span-2">
          <form onSubmit={handleSubmit} className="bg-white border border-[#eae6dc] p-8 rounded-2xl shadow-sm space-y-6">
            <h3 className="text-lg font-bold font-sans text-[#1c2e24] border-b border-[#f0ece2] pb-4">New Provider Registration</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1.5 flex flex-col">
                <label className="text-[10px] font-mono uppercase tracking-wider text-[#54645a] font-bold">Legal Full Name</label>
                <input 
                  type="text" required 
                  className="bg-[#faf8f4] border border-[#eae6dc] text-sm p-3 rounded-xl outline-none focus:border-[#2d4a3e] focus:bg-white transition-all text-[#1c2e24]"
                  placeholder="Dr. Jane Doe"
                  onChange={e => setFormState({...formState, fullName: e.target.value})}
                />
              </div>

              <div className="space-y-1.5 flex flex-col">
                <label className="text-[10px] font-mono uppercase tracking-wider text-[#54645a] font-bold">Medical Specialty</label>
                <select required className="bg-[#faf8f4] border border-[#eae6dc] text-sm p-3 rounded-xl outline-none focus:border-[#2d4a3e] focus:bg-white transition-all text-[#1c2e24] w-full self-stretch min-h-[46px]">
                  <option value="">Select Primary Specialty</option>
                  <option value="Psychiatry">Psychiatry</option>
                  <option value="General Practice">General Practice (MD/DO)</option>
                  <option value="ObGyn">Obstetrics & Gynecology</option>
                  <option value="Holistic">Holistic / Functional Medicine</option>
                  <option value="Therapy">Clinical Psychology / Therapy</option>
                </select>
              </div>

              <div className="space-y-1.5 flex flex-col">
                <label className="text-[10px] font-mono uppercase tracking-wider text-[#54645a] font-bold">State Medical License Number / NPI</label>
                <input 
                  type="text" required 
                  className="bg-[#faf8f4] border border-[#eae6dc] text-sm p-3 rounded-xl outline-none focus:border-[#2d4a3e] focus:bg-white transition-all text-[#1c2e24]"
                  placeholder="e.g. 1234567890"
                  onChange={e => setFormState({...formState, licenseNumber: e.target.value})}
                />
              </div>

              <div className="space-y-1.5 flex flex-col">
                <label className="text-[10px] font-mono uppercase tracking-wider text-[#54645a] font-bold">Professional Email</label>
                <input 
                  type="email" required 
                  className="bg-[#faf8f4] border border-[#eae6dc] text-sm p-3 rounded-xl outline-none focus:border-[#2d4a3e] focus:bg-white transition-all text-[#1c2e24]"
                  placeholder="dr.doe@hospital.org"
                  onChange={e => setFormState({...formState, email: e.target.value})}
                />
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <label className="text-[10px] font-mono uppercase tracking-wider text-[#54645a] font-bold block mb-1">Proof of Credentials (PDF/JPG)</label>
              <div className="border-2 border-dashed border-[#eae6dc] rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-[#faf8f4] hover:border-[#2d4a3e] transition-all">
                <Upload className="text-[#aebbb3] mb-3" size={24} />
                <span className="text-sm font-bold text-[#1c2e24]">Upload License & IDs</span>
                <span className="text-xs text-[#7e8c84] mt-1">Maximum file size 10MB</span>
              </div>
            </div>

            <div className="pt-4 border-t border-[#f0ece2]">
              <button 
                type="submit" 
                disabled={submissionState !== "idle"}
                className="w-full bg-[#2d4a3e] hover:bg-[#1e3328] text-white p-4 justify-center flex rounded-xl font-mono text-xs tracking-wider uppercase font-bold transition-all disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {submissionState === "submitting" ? "Transmitting..." : "Submit Registration Request"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
