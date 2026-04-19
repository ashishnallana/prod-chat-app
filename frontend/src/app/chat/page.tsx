"use client";

import { useState } from "react";

export default function ChatPage() {
  const [messages, setMessages] = useState([
    { id: 1, text: "Hello! How can I help you today?", sender: "them", time: "12:30 PM" },
    { id: 2, text: "Hey! I was wondering if we could talk about the new app architecture?", sender: "me", time: "12:31 PM" },
    { id: 3, text: "Absolutely. Let's start with the microservices breakdown.", sender: "them", time: "12:32 PM" }
  ]);
  const [input, setInput] = useState("");

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    
    setMessages([
      ...messages,
      { id: Date.now(), text: input, sender: "me", time: "Now" }
    ]);
    setInput("");
  };

  return (
    <>
      <header className="px-6 py-4 border-b border-zinc-800/80 bg-zinc-950/40 backdrop-blur-md flex justify-between items-center z-10 sticky top-0">
        <div className="flex items-center gap-3">
          <div className="md:hidden p-2 -ml-2 rounded-full hover:bg-zinc-800 cursor-pointer">
             {/* Hamburger Mock for mobile */}
             <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 6h16M4 12h16M4 18h16"/></svg>
          </div>
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary to-indigo-400 shrink-0"></div>
          <div>
            <h2 className="font-semibold text-zinc-100">Alice Smith</h2>
            <p className="text-xs text-zinc-400">Typing...</p>
          </div>
        </div>
        <div className="flex gap-2">
            <button className="p-2 hover:bg-zinc-800 rounded-full text-zinc-400 hover:text-zinc-100 transition"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg></button>
            <button className="p-2 hover:bg-zinc-800 rounded-full text-zinc-400 hover:text-zinc-100 transition"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg></button>
        </div>
      </header>
      
      <div className="flex-1 overflow-y-auto p-6 space-y-6 z-0">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.sender === "me" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[70%] group flex flex-col ${msg.sender === "me" ? "items-end" : "items-start"}`}>
              <div 
                className={`px-5 py-3 rounded-2xl shadow-sm ${
                  msg.sender === "me" 
                    ? "bg-primary text-white rounded-br-sm" 
                    : "bg-zinc-800 border border-zinc-700/50 text-zinc-100 rounded-bl-sm"
                }`}
              >
                {msg.text}
              </div>
              <span className="text-[10px] text-zinc-500 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">{msg.time}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="p-4 bg-zinc-950 z-10 w-full relative before:absolute before:inset-x-0 before:-top-6 before:h-6 before:bg-gradient-to-t before:from-zinc-950 before:to-transparent before:pointer-events-none">
        <form onSubmit={handleSend} className="relative flex items-center">
          <div className="absolute left-2 flex gap-1">
            <button type="button" className="p-2 text-zinc-400 hover:text-zinc-200 transition"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg></button>
          </div>
          <input 
            type="text" 
            placeholder="Type a message..." 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-800 rounded-full py-3.5 pl-12 pr-14 focus:outline-none focus:border-zinc-700 focus:ring-1 focus:ring-zinc-700 transition placeholder-zinc-500 text-zinc-100 shadow-inner"
          />
          <button 
            type="submit" 
            disabled={!input.trim()}
            className="absolute right-2 p-2 bg-primary hover:bg-primary-hover disabled:bg-zinc-800 disabled:text-zinc-600 text-white rounded-full transition disabled:cursor-not-allowed shadow-md"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
          </button>
        </form>
      </div>
    </>
  );
}
