"use client";

import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { setSearchQuery, setSearchResults } from "@/store/slices/chatSlice";
import { useRouter } from "next/navigation";
import { logout } from "@/store/slices/authSlice";
import Link from "next/link";

export default function ChatLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const dispatch = useDispatch();
  const { token, email, isAuthenticated } = useSelector((state: RootState) => state.auth);
  const { searchQuery, searchResults } = useSelector((state: RootState) => state.chat);
  
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/");
    }
  }, [isAuthenticated, router]);

  useEffect(() => {
    const fetchUsers = async () => {
      if (!searchQuery.trim()) {
        dispatch(setSearchResults([]));
        return;
      }
      try {
        const res = await fetch(`${apiUrl}/auth/search?email=${encodeURIComponent(searchQuery)}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          dispatch(setSearchResults(data));
        }
      } catch (err) {
        console.error("Search failed:", err);
      }
    };

    const delayDebounce = setTimeout(() => {
      fetchUsers();
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [searchQuery, token, dispatch, apiUrl]);

  if (!isAuthenticated) return null;

  return (
    <div className="flex h-screen bg-zinc-950 text-zinc-50 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-80 border-r border-zinc-800 bg-zinc-950/50 backdrop-blur-xl flex flex-col transition-all hidden md:flex z-10">
        <div className="p-4 border-b border-zinc-800 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold tracking-tight">Messages</h2>
            <button 
              onClick={() => dispatch(logout())}
              className="p-2 hover:bg-zinc-800 rounded-lg text-red-400 hover:text-red-300 transition text-xs font-medium"
            >
              Sign out
            </button>
          </div>
          <div className="relative">
            <input 
              type="text" 
              placeholder="Search users by email..."
              value={searchQuery}
              onChange={(e) => dispatch(setSearchQuery(e.target.value))}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg py-2 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary text-zinc-200 placeholder-zinc-500"
            />
          </div>
        </div>
        
        {/* Dynamic Chat List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
          {searchResults.length > 0 ? (
            searchResults.map((user) => (
              <Link href={`/chat/${user.id}`} key={user.id}>
                <div className="p-3 rounded-xl flex items-center gap-3 cursor-pointer hover:bg-zinc-900 transition">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary to-indigo-400 shrink-0 shadow-inner flex items-center justify-center text-sm font-semibold">
                    {user.email.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <h3 className="font-medium text-sm truncate">{user.email}</h3>
                  </div>
                </div>
              </Link>
            ))
          ) : searchQuery.trim() !== "" ? (
            <p className="text-center text-xs text-zinc-500 mt-4">No users found.</p>
          ) : (
            <p className="text-center text-xs text-zinc-500 mt-4 px-4 leading-relaxed">
              Use the search bar to find people by email and start a conversation.
            </p>
          )}
        </div>
        
        {/* User Profile Footer */}
        <div className="p-4 border-t border-zinc-800 flex items-center gap-3 self-end w-full bg-zinc-950">
           <div className="w-10 h-10 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center font-bold">
            {email ? email.charAt(0).toUpperCase() : "?"}
           </div>
           <div className="flex-1 overflow-hidden">
              <h4 className="font-medium text-sm truncate">{email}</h4>
              <p className="text-xs text-green-500 flex items-center gap-1"><span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span> Online</p>
           </div>
        </div>
      </aside>

      {/* Main Chat Area */}
      <main className="flex-1 flex flex-col relative bg-zinc-950">
         {/* Top Gradient Flare for aesthetic */}
         <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px] pointer-events-none"></div>
         {children}
      </main>
    </div>
  );
}
