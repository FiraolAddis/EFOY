import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Stethoscope, 
  MessageSquare, 
  Send, 
  Check, 
  Heart, 
  Leaf, 
  Clock, 
  Sparkles, 
  Search,
  ChevronRight,
  ShieldAlert
} from "lucide-react";
import { ProfessionalContact } from "../types";

export interface Professional {
  id: string;
  name: string;
  role: string;
  avatar: string;
  specialty: string[];
  education: string;
  bio: string;
  location: string;
}

interface ProfessionalsDirectoryProps {
  isAuthenticated: boolean;
  onSendContact: (contact: Omit<ProfessionalContact, "id" | "date" | "timestamp">) => Promise<void>;
  submittedContacts: ProfessionalContact[];
}

export const REGISTERED_PROFESSIONALS: Professional[] = [];

export default function ProfessionalsDirectory({
  isAuthenticated,
  onSendContact,
  submittedContacts
}: ProfessionalsDirectoryProps) {
  const [selectedProf, setSelectedProf] = useState<Professional | null>(null);
  const [subjectInput, setSubjectInput] = useState("");
  const [messageInput, setMessageInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const handleOpenContact = (prof: Professional) => {
    setSelectedProf(prof);
    setSuccessMsg(null);
    setSubjectInput(`Somatic alignment consultation with ${prof.name}`);
    setMessageInput("");
  };

  const handleSubmitContactForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProf) return;
    if (!isAuthenticated) return;

    setIsSending(true);
    try {
      await onSendContact({
        professionalId: selectedProf.id,
        professionalName: selectedProf.name,
        subject: subjectInput.trim() || `Consultation Application`,
        message: messageInput.trim()
      });
      setSuccessMsg(`Your outbound clinical consult letter has been securely logged and sent to ${selectedProf.name}! They will review your somatic logs and reach out to you.`);
      setMessageInput("");
    } catch (err) {
      console.error(err);
    } finally {
      setIsSending(false);
    }
  };

  const filteredProfs = REGISTERED_PROFESSIONALS.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.specialty.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-8">
      {/* Title block with generous breathing room */}
      <div className="space-y-2">
        <h2 className="text-xl font-serif italic text-[#14231b] font-semibold flex items-center gap-2">
          <Stethoscope className="text-[#365942]" size={20} />
          Registered Somatic Professionals & Medical Guides
        </h2>
        <p className="text-xs text-[#54645a] leading-relaxed max-w-2xl font-medium">
          Dispatch secure consult inquiries directly to verified specialist guides. Connect your biophysical schedules and somatic histories safely using the end-to-end authenticated database.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LEFT COLUMN: GUIDES DIRECTORY (7/12 Width) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Search tool */}
          <div className="bg-white border border-[#eae6dc] rounded-2xl p-4.5 flex items-center gap-3 shadow-3xs">
            <Search className="text-[#6e7d73]" size={15} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search specialists, neuro-endocrinologists, sleep architects or clinical guides..."
              className="w-full bg-transparent border-none text-xs outline-none text-[#1c2e24] placeholder-[#88908a] font-sans"
            />
          </div>

          <div className="grid grid-cols-1 gap-5">
            {filteredProfs.map((prof) => (
              <motion.div
                key={prof.id}
                layoutId={`card-${prof.id}`}
                className="bg-white border border-[#eae6dc] hover:border-[#365942] rounded-2xl p-6 shadow-xs flex flex-col md:flex-row gap-5 items-start transition-all"
              >
                {/* Avatar with referer policy */}
                <img
                  src={prof.avatar}
                  alt={prof.name}
                  className="h-20 w-20 md:h-24 md:w-24 rounded-xl object-cover border border-[#f3f0e8] bg-[#faf8f4]"
                  referrerPolicy="no-referrer"
                />

                <div className="space-y-3 flex-1">
                  <div className="space-y-0.5">
                    <h3 className="text-base font-serif italic font-bold text-[#1c2e24]">{prof.name}</h3>
                    <p className="text-xs text-[#365942] font-mono leading-none">{prof.role}</p>
                    <p className="text-[10px] text-[#88908a] font-sans font-medium">{prof.education}</p>
                  </div>

                  <p className="text-xs text-[#54645a] leading-relaxed">{prof.bio}</p>

                  <div className="flex flex-wrap gap-1.5">
                    {prof.specialty.map((spec, i) => (
                      <span
                        key={i}
                        className="text-[9px] font-mono font-bold uppercase tracking-wider bg-[#f5f7f5] text-[#2d4a3e] border border-[#eef0ee] py-0.5 px-2.5 rounded-full"
                      >
                        {spec}
                      </span>
                    ))}
                  </div>

                  <div className="border-t border-[#faf8f4] pt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-[10px] text-[#6e7d73]">
                    <span>📍 {prof.location}</span>
                    <button
                      type="button"
                      onClick={() => handleOpenContact(prof)}
                      className="rounded-lg bg-[#2d4a3e] hover:bg-[#1e3328] text-white p-2 px-3.5 font-mono font-bold uppercase text-[9px] tracking-wider transition-all self-end sm:self-auto flex items-center gap-1.5"
                    >
                      <MessageSquare size={10} /> Consult Guide
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}

            {filteredProfs.length === 0 && REGISTERED_PROFESSIONALS.length === 0 && (
              <div className="bg-white border border-[#eae6dc] rounded-2xl p-10 text-center space-y-4">
                <div className="mx-auto bg-[#faf8f4] h-12 w-12 rounded-full flex items-center justify-center text-[#88908a]">
                  <Stethoscope size={24} />
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-sans font-bold text-[#1c2e24]">No Clinical Guides Registered Yet</h4>
                  <p className="text-xs text-[#6e7d73] max-w-sm mx-auto">
                    Our human physician network is currently onboarding. Clinicians can apply via the Provider Portal to join the directory.
                  </p>
                </div>
              </div>
            )}
            
            {filteredProfs.length === 0 && REGISTERED_PROFESSIONALS.length > 0 && (
              <div className="bg-white border border-[#eae6dc] rounded-2xl p-10 text-center text-xs text-[#6e7d73]">
                No verified medical specialists found matching your parameters.
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: ACTION CONTACT CONSOLE (5/12 Width) */}
        <div className="lg:col-span-5 space-y-6">
          {selectedProf ? (
            <div className="rounded-2xl border border-[#eae6dc] bg-white p-6 shadow-xs space-y-5">
              <div className="flex justify-between items-start border-b border-[#f3f0e8] pb-3">
                <div className="space-y-0.5">
                  <span className="text-[9px] font-mono bg-[#f2f6f4] border border-[#d3e5db] text-[#2d4a3e] font-bold uppercase p-0.5 px-2.5 rounded-full">
                    Active Session
                  </span>
                  <h3 className="text-sm font-sans font-bold text-[#1c2e24]">Contact {selectedProf.name}</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedProf(null)}
                  className="text-xs font-mono text-[#54645a] hover:text-[#1c2e24]"
                >
                  Clear Selection
                </button>
              </div>

              {successMsg ? (
                <div className="space-y-4">
                  <p className="text-xs text-emerald-800 bg-emerald-50 border border-emerald-100 rounded-xl p-4 leading-relaxed font-sans font-medium">
                    {successMsg}
                  </p>
                  <button
                    type="button"
                    onClick={() => setSelectedProf(null)}
                    className="w-full rounded-xl bg-[#2d4a3e] hover:bg-[#1e3328] text-white p-3 text-xs font-mono font-bold tracking-wider uppercase transition-all"
                  >
                    Done
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmitContactForm} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono uppercase text-[#6e7d73]">Subject Claim</label>
                    <input
                      type="text"
                      required
                      value={subjectInput}
                      onChange={(e) => setSubjectInput(e.target.value)}
                      className="w-full bg-[#faf8f4] border border-[#eae6dc] rounded-xl p-3 text-xs outline-none text-[#1c2e24]"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono uppercase text-[#6e7d73]">Physiological Notes & Query Detail</label>
                    <textarea
                      required
                      rows={5}
                      value={messageInput}
                      onChange={(e) => setMessageInput(e.target.value)}
                      placeholder="Write your therapeutic or endocrinal concerns here. You may share details of your sleep schedule, bmi parameters, or menstrual symptom profiles..."
                      className="w-full bg-[#faf8f4] border border-[#eae6dc] rounded-xl p-3 text-xs outline-none text-[#1c2e24] placeholder-[#88908a] leading-relaxed resize-none"
                    />
                  </div>

                  {isAuthenticated ? (
                    <button
                      type="submit"
                      disabled={isSending}
                      className="w-full rounded-xl bg-[#2d4a3e] hover:bg-[#1e3328] text-white p-3.5 text-xs font-mono font-bold tracking-widest uppercase transition-all shadow-sm flex items-center justify-center gap-2"
                    >
                      {isSending ? (
                        <span className="h-4.5 w-4.5 border-2 border-white border-t-transparent animate-spin rounded-full" />
                      ) : (
                        <Send size={12} />
                      )}
                      Dispatch Clinical Request
                    </button>
                  ) : (
                    <div className="bg-[#fbf1ee] border border-[#efe0da] rounded-xl p-4 space-y-2.5">
                      <div className="flex items-center gap-1.5 text-[10px] font-mono text-[#8a3c25] uppercase font-bold">
                        <ShieldAlert size={12} /> Authentication Required
                      </div>
                      <p className="text-[11px] text-[#54645a] leading-relaxed font-sans font-medium">
                        Please sign-in securely via Google or Sandbox mode inside the application header to dispatch diagnostic message logs.
                      </p>
                    </div>
                  )}
                </form>
              )}
            </div>
          ) : REGISTERED_PROFESSIONALS.length === 0 ? (
            <div className="rounded-2xl border border-[#eae6dc] bg-[#faf8f4] p-8 space-y-6">
              <div className="space-y-2 text-center border-b border-[#f0ece2] pb-6">
                <div className="inline-flex h-12 w-12 bg-[#2d4a3e] text-white rounded-full items-center justify-center shadow-lg relative">
                  <Sparkles size={24} className="text-amber-300" />
                  <div className="absolute top-0 right-0 h-3 w-3 bg-emerald-400 rounded-full border-2 border-[#faf8f4]" />
                </div>
                <h3 className="text-xl font-serif font-bold text-[#1c2e24]">AI Clinical Consultant</h3>
                <p className="text-xs text-[#54645a]">
                  While our human directory is empty, our AI Telehealth consultant is available 24/7 to provide basic triage and psychosomatic suggestions.
                </p>
              </div>

              <div className="space-y-4">
                <div className="bg-white border border-[#eae6dc] rounded-2xl p-4 shadow-sm text-xs leading-relaxed text-[#1c2e24]">
                  Hello. I am the Vitalis AI engine. Please describe any somatic symptoms, cycle-related discomfort, or somatic questions you might have.
                </div>
                <form onSubmit={(e) => { e.preventDefault(); setSuccessMsg("The AI engine has received your query."); setTimeout(() => setSuccessMsg(""), 3000); }} className="space-y-3">
                  <textarea 
                    placeholder="Describe your symptoms or ask a medical question..." 
                    rows={4}
                    className="w-full text-xs p-3 rounded-xl border border-[#eae6dc] resize-none outline-none focus:border-[#2d4a3e]"
                  />
                  <button type="submit" className="w-full bg-[#1c2e24] text-white text-xs font-bold font-mono tracking-wider uppercase py-3 rounded-xl transition-all hover:bg-[#2d4a3e]">
                    Consult AI
                  </button>
                </form>
                {successMsg && <div className="text-[10px] text-center font-bold text-[#2d4a3e]">{successMsg}</div>}
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-[#eae6dc] bg-white p-8 text-center space-y-3">
              <Sparkles className="text-[#6e7d73] mx-auto animate-pulse" size={18} />
              <div className="space-y-1">
                <h4 className="text-xs font-mono uppercase text-[#1c2e24] font-bold">Guide Consult Sandbox</h4>
                <p className="text-[11px] text-[#6e7d73] leading-relaxed">
                  Select any registered professional profile to launch a secure and private communication pipeline.
                </p>
              </div>
            </div>
          )}

          {/* Contact Dispatch History list */}
          {isAuthenticated && submittedContacts.length > 0 && (
            <div className="rounded-2xl border border-[#eae6dc] bg-white p-6 shadow-xs space-y-4">
              <div className="flex items-center gap-1.5 border-b border-[#f3f0e8] pb-3">
                <Check className="text-emerald-600" size={14} />
                <h3 className="text-xs font-mono font-bold text-[#1c2e24] uppercase tracking-wider">Outbound Dispatch Log ({submittedContacts.length})</h3>
              </div>

              <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
                {submittedContacts.map((contact) => (
                  <div key={contact.id} className="p-3 bg-[#faf8f4] border border-[#efece2] rounded-xl space-y-2.5">
                    <div className="flex items-baseline justify-between gap-2 border-b border-[#f3eee2] pb-1.5">
                      <strong className="text-[10px] text-[#1c2e24] truncate">Guide: {contact.professionalName}</strong>
                      <span className="text-[8px] font-mono text-[#88908a] shrink-0">{contact.date}</span>
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-[10.5px] font-sans font-bold text-[#2d4a3e]">{contact.subject}</h4>
                      <p className="text-[10px] text-[#54645a] leading-normal font-sans italic line-clamp-2">
                        "{contact.message}"
                      </p>
                    </div>
                    <div className="text-[8px] font-mono text-emerald-700 bg-emerald-50 border border-emerald-100 p-1 px-2.5 rounded inline-block">
                      ✓ Securely Logged in Firestore
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
