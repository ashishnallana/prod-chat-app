export default function ChatLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-zinc-950 text-zinc-50 overflow-hidden">
      {/* Sidebar Placeholder */}
      <aside className="w-80 border-r border-zinc-800 bg-zinc-950/50 backdrop-blur-xl flex flex-col transition-all hidden md:flex">
        <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
          <h2 className="font-semibold tracking-tight">Messages</h2>
          <button className="p-2 hover:bg-zinc-800 rounded-full transition">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
          </button>
        </div>
        
        {/* Chat List Mock */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
          {[1,2,3,4,5].map((i) => (
            <div key={i} className={`p-3 rounded-xl flex items-center gap-3 cursor-pointer transition ${i === 1 ? 'bg-zinc-800/80 shadow-md' : 'hover:bg-zinc-900'}`}>
              <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-primary to-indigo-400 shrink-0 shadow-inner"></div>
              <div className="flex-1 overflow-hidden">
                <div className="flex justify-between items-baseline mb-0.5">
                  <h3 className="font-medium text-sm truncate">Alice Smith</h3>
                  <span className="text-xs text-zinc-500">12:30 PM</span>
                </div>
                <p className="text-xs text-zinc-400 truncate">Hey, are we still discussing the project later?</p>
              </div>
            </div>
          ))}
        </div>
        
        {/* User Profile Footer */}
        <div className="p-4 border-t border-zinc-800 flex items-center gap-3 self-end w-full">
           <div className="w-10 h-10 rounded-full bg-zinc-800 border border-zinc-700"></div>
           <div className="flex-1 overflow-hidden">
              <h4 className="font-medium text-sm">Me</h4>
              <p className="text-xs text-green-500 flex items-center gap-1"><span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span> Online</p>
           </div>
        </div>
      </aside>

      {/* Main Chat Area */}
      <main className="flex-1 flex flex-col relative bg-zinc-950/80">
         {/* Top Gradient Flare for aesthetic */}
         <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px] pointer-events-none"></div>
         {children}
      </main>
    </div>
  );
}
