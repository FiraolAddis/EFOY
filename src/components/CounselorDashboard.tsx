import React, { useState } from "react";
import { Users, MessageSquare, Clock, Filter, Archive, Send, Stethoscope, ChevronRight } from "lucide-react";

export function CounselorDashboard() {
  const [activeChat, setActiveChat] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [chatHistories, setChatHistories] = useState<Record<string, any[]>>({
    patient1: [
      { sender: "patient", text: "I've been feeling extremely tight in my chest today, worried about my cortisol rising." }
    ],
    patient2: [
      { sender: "patient", text: "My PMDD symptoms are flaring up. I feel very tired." },
      { sender: "counselor", text: "I understand, Emily. Have you tried the synchronous breathing module today?" },
      { sender: "patient", text: "Yes, but I think I need to talk to someone." }
    ],
  });

  const patients = [
    { id: "patient1", name: "Sarah Jenkins", age: 29, lastActive: "10 mins ago", status: "High Stress", img: "https://i.pravatar.cc/150?u=a" },
    { id: "patient2", name: "Emily Thorne", age: 34, lastActive: "1 hour ago", status: "Needs Review", img: "https://i.pravatar.cc/150?u=b" },
    { id: "patient3", name: "Michael Chang", age: 41, lastActive: "Yesterday", status: "Stable", img: "https://i.pravatar.cc/150?u=c" },
  ];

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !activeChat) return;

    setChatHistories(prev => ({
      ...prev,
      [activeChat]: [
        ...(prev[activeChat] || []),
        { sender: "counselor", text: message }
      ]
    }));
    setMessage("");
  };

  const activePatientName = activeChat ? patients.find(p => p.id === activeChat)?.name : null;

  return (
    <div className="flex h-[calc(100vh-140px)] w-full max-w-6xl mx-auto rounded-3xl overflow-hidden bg-white border border-[#eae6dc] shadow-sm animate-fadeIn">
      
      {/* LEFT TIER: INBOX DIRECTORY */}
      <div className="w-1/3 border-r border-[#eae6dc] flex flex-col bg-[#faf8f4]">
        <div className="p-6 border-b border-[#eae6dc] space-y-4">
          <div>
            <h2 className="text-xl font-serif text-[#1c2e24]">Clinical Inbox</h2>
            <p className="text-xs text-[#54645a] font-sans">Counselor Directory Interface</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="bg-white border border-[#eae6dc] px-3 py-1 rounded-full text-[10px] font-mono tracking-wider font-bold text-[#1c2e24] shadow-sm flex items-center gap-1">
              <Users size={12}/> {patients.length} Active
            </span>
            <span className="bg-[#eef4f0] border border-[#c4dbcd] px-3 py-1 rounded-full text-[10px] font-mono tracking-wider font-bold text-[#2d4a3e] shadow-sm">
              Online
            </span>
          </div>
        </div>
        
        <div className="flex-1 px-4 py-4 space-y-2 overflow-y-auto">
          {patients.map(p => (
            <button 
              key={p.id}
              onClick={() => setActiveChat(p.id)}
              className={`w-full flex items-start gap-3 p-3 rounded-xl transition-all ${
                activeChat === p.id ? "bg-white border border-[#eae6dc] shadow-sm" : "hover:bg-[#f3f0e8] border border-transparent"
              }`}
            >
              <img src={p.img} alt={p.name} className="w-10 h-10 rounded-full object-cover shrink-0 bg-[#eae6dc]" />
              <div className="text-left flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-[#1c2e24] truncate">{p.name}</h4>
                  <span className="text-[9px] font-mono text-[#aebbb3]">{p.lastActive}</span>
                </div>
                <p className="text-[10px] text-[#54645a] mt-0.5">Age {p.age} • {p.status}</p>
                <div className="text-xs text-[#7d532a] mt-1 truncate">
                  {(chatHistories[p.id] && chatHistories[p.id].length > 0) 
                    ? chatHistories[p.id][chatHistories[p.id].length - 1].text 
                    : "No messages yet."}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* RIGHT TIER: CHAT VIEW */}
      <div className="w-2/3 flex flex-col bg-white">
        {activeChat ? (
          <>
            <div className="h-16 border-b border-[#eae6dc] px-6 flex items-center justify-between shrink-0 bg-white shadow-sm z-10">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#f4ece3] text-[#7d532a] flex items-center justify-center font-bold text-xs uppercase">
                  {activePatientName?.substring(0, 2)}
                </div>
                <h3 className="font-bold text-[#1c2e24]">{activePatientName}</h3>
              </div>
              <button className="text-[10px] font-mono tracking-wider font-bold text-[#54645a] hover:text-[#1c2e24] uppercase flex items-center gap-1">
                <Archive size={14} /> Close Case
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-white/50">
              {(chatHistories[activeChat] || []).map((msg, idx) => (
                <div key={idx} className={`flex ${msg.sender === "counselor" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[70%] text-sm p-4 rounded-2xl ${
                    msg.sender === "counselor" 
                      ? "bg-[#2d4a3e] text-white rounded-br-sm shadow-sm" 
                      : "bg-[#faf8f4] border border-[#eae6dc] text-[#1c2e24] rounded-bl-sm"
                  }`}>
                    {msg.text}
                  </div>
                </div>
              ))}
            </div>

            <div className="p-6 border-t border-[#eae6dc] bg-[#faf8f4]">
              <form onSubmit={handleSendMessage} className="relative">
                <input 
                  type="text" 
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type a clinical response..." 
                  className="w-full bg-white border border-[#eae6dc] rounded-2xl py-4 pl-4 pr-14 text-sm focus:outline-none focus:border-[#2d4a3e] transition-all shadow-sm"
                />
                <button 
                  type="submit"
                  disabled={!message.trim()}
                  className="absolute right-2 top-2 bottom-2 bg-[#2d4a3e] hover:bg-[#1e3328] text-white px-3 flex items-center justify-center rounded-xl transition-all disabled:opacity-50"
                >
                  <Send size={16} />
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-10">
            <div className="h-16 w-16 bg-[#faf8f4] text-[#aebbb3] border border-[#eae6dc] rounded-full flex items-center justify-center mb-4">
              <MessageSquare size={32} />
            </div>
            <h3 className="text-xl font-serif text-[#1c2e24] mb-2">Select a Patient</h3>
            <p className="text-sm text-[#54645a] max-w-sm">
              Choose a clinical inquiry from the inbox directory to review symptoms and open a secure consulting channel.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
