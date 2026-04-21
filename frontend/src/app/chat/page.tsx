"use client";

import { useSelector } from "react-redux";
import { RootState } from "@/store/store";

export default function ChatDashboardPage() {
  const { email } = useSelector((state: RootState) => state.auth);

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 text-center z-10">
      <div className="w-24 h-24 bg-zinc-900 rounded-full flex items-center justify-center mb-6 shadow-inner border border-zinc-800">
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-600">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
        </svg>
      </div>
      <h2 className="text-2xl font-bold tracking-tight text-zinc-100 mb-2">
        Welcome to Terminal, {email ? email.split('@')[0] : "Agent"}
      </h2>
      <p className="text-zinc-400 max-w-md mx-auto text-sm leading-relaxed">
        Your secure real-time messaging pipeline is active. Use the search bar on the left to securely discover users by their email address and initiate an encrypted WebSocket channel.
      </p>
    </div>
  );
}
