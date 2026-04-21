"use client";

import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { searchUsers, fetchRecentChats, setActiveChatUser, User } from "../../store/slices/chatSlice";
import { logout } from "../../store/slices/authSlice";
import { useRouter } from "next/navigation";

export default function ChatLayout({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();
  const router = useRouter();
  
  const { token, email } = useAppSelector((state) => state.auth);
  const { searchResults, recentChats, activeChatUser } = useAppSelector((state) => state.chat);
  
  const [query, setQuery] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !token) {
      router.push("/");
    }
  }, [mounted, token, router]);

  useEffect(() => {
    if (token) {
      dispatch(fetchRecentChats());
    }
  }, [token, dispatch]);

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (query.trim()) {
        dispatch(searchUsers(query));
      }
    }, 500);
    return () => clearTimeout(delayDebounce);
  }, [query, dispatch]);

  const handleSelectUser = (user: User) => {
    dispatch(setActiveChatUser(user));
  };

  const handleLogout = () => {
    dispatch(logout());
  };

  if (!mounted) return null;
  if (!token) return null;

  const displayList = query.trim() ? searchResults : recentChats;

  return (
    <div className="flex h-screen bg-zinc-950 text-zinc-50 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-80 border-r border-zinc-800 bg-zinc-950/50 backdrop-blur-xl flex flex-col transition-all hidden md:flex">
        <div className="p-4 border-b border-zinc-800 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold tracking-tight">Messages</h2>
            <button onClick={handleLogout} className="p-2 hover:bg-red-900/50 text-zinc-400 hover:text-red-400 rounded-full transition" title="Logout">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
            </button>
          </div>
          
          {/* Universal Search Input */}
          <input 
            type="text" 
            placeholder="Search users by email..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary transition placeholder-zinc-600"
          />
        </div>
        
        {/* Dynamic Chat List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
          {displayList.length === 0 && query.length > 0 ? (
             <div className="text-center text-zinc-500 text-xs mt-4">No users found.</div>
          ) : displayList.map((user) => (
            <div 
              key={user.id} 
              onClick={() => handleSelectUser(user)}
              className={`p-3 rounded-xl flex items-center gap-3 cursor-pointer transition ${activeChatUser?.id === user.id ? 'bg-zinc-800/80 shadow-md' : 'hover:bg-zinc-900'}`}
            >
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary to-indigo-400 shrink-0 shadow-inner flex items-center justify-center font-bold text-white uppercase">
                {user.email[0]}
              </div>
              <div className="flex-1 overflow-hidden">
                <div className="flex justify-between items-baseline mb-0.5">
                  <h3 className="font-medium text-sm truncate">{user.email.split("@")[0]}</h3>
                </div>
                <p className="text-xs text-zinc-400 truncate">{user.email}</p>
              </div>
            </div>
          ))}
          {displayList.length === 0 && query.length === 0 && (
             <div className="text-center text-zinc-600 text-xs mt-4">Search to begin a chat.</div>
          )}
        </div>
        
        {/* User Profile Footer */}
        <div className="p-4 border-t border-zinc-800 flex items-center gap-3 self-end w-full bg-zinc-900/20">
           <div className="flex-1 overflow-hidden">
              <h4 className="font-medium text-sm truncate">{email || "Me"}</h4>
              <p className="text-xs text-green-500 flex items-center gap-1"><span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span> Online</p>
           </div>
        </div>
      </aside>

      {/* Main Chat Area */}
      <main className="flex-1 flex flex-col relative bg-zinc-950/80 overflow-hidden">
         {/* Top Gradient Flare for aesthetic */}
         <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px] pointer-events-none"></div>
         {children}
      </main>
    </div>
  );
}
