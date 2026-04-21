"use client";

import { useEffect, useState, useRef } from "react";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { fetchHistory, addMessage, Message } from "../../store/slices/chatSlice";

export default function ChatPage() {
  const dispatch = useAppDispatch();
  const { activeChatUser, messages, loading } = useAppSelector((state) => state.chat);
  const { token, email } = useAppSelector((state) => state.auth);
  
  const [messageInput, setMessageInput] = useState("");
  const wsRef = useRef<WebSocket | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  // Parse JWT manually to determine our own User ID to style left/right chat bubbles
  const [myUserId, setMyUserId] = useState<number | null>(null);

  useEffect(() => {
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        setMyUserId(parseInt(payload.sub));
      } catch (e) { console.error("Could not parse JWT", e); }
    }
  }, [token]);

  // Connect WebSocket & fetch history
  useEffect(() => {
    if (!token) return;

    // Connect WS globally for this user session
    const WS_URL = process.env.NEXT_PUBLIC_WEBSOCKET_URL || "ws://localhost:8000/api/v1/chat/ws";
    const ws = new WebSocket(`${WS_URL}?token=${token}`);
    
    ws.onmessage = (event) => {
      const incMessage: Message = JSON.parse(event.data);
      dispatch(addMessage(incMessage));
    };
    
    ws.onclose = () => console.log("WS Closed");
    wsRef.current = ws;

    return () => {
      ws.close();
    };
  }, [token, dispatch]);

  useEffect(() => {
    if (activeChatUser) {
      dispatch(fetchHistory(activeChatUser.id));
    }
  }, [activeChatUser, dispatch]);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim() || !activeChatUser || !wsRef.current) return;
    
    const payload = {
      receiver_id: activeChatUser.id,
      content: messageInput,
      type: "text",
      file_url: null
    };

    // Note: The WebSocket natively routes messages, but we rely on the Server 
    // broadcasting it back to 'sender' to populate Redux state cleanly as per standard.
    // However, the backend code currently attempts to deliver to receiver, 
    // but doesn't necessarily echo back to sender's WS. We can optimistically add it.
    
    wsRef.current.send(JSON.stringify(payload));
    setMessageInput("");
  };

  if (!activeChatUser) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center p-8 bg-zinc-900/30 rounded-2xl border border-zinc-800/50 backdrop-blur-md">
          <h2 className="text-xl font-medium mb-2">No Active Chat</h2>
          <p className="text-sm text-zinc-500">Select or search a user from the sidebar to start secure messaging.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full relative z-10">
      {/* Header */}
      <header className="px-6 py-4 border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-xl flex justify-between items-center z-20">
        <div>
          <h2 className="font-semibold text-lg">{activeChatUser.email.split("@")[0]}</h2>
          <p className="text-xs text-green-500">Connected</p>
        </div>
      </header>

      {/* Messages Feed */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar scroll-smooth">
        {loading && <div className="text-center text-zinc-500 text-xs">Syncing logs...</div>}
        
        {messages.map((msg) => {
          const isMine = msg.sender_id === myUserId;
          return (
            <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[70%] rounded-2xl px-5 py-3 shadow-lg ${isMine ? 'bg-primary text-white rounded-br-none' : 'bg-zinc-800 text-zinc-100 border border-zinc-700/50 rounded-bl-none'}`}>
                <p className="text-sm leading-relaxed">{msg.content}</p>
                <div className={`text-[10px] mt-1.5 opacity-60 flex items-center gap-1 ${isMine ? 'justify-end' : 'justify-start'}`}>
                  {new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Composer Input */}
      <div className="p-4 bg-zinc-950/80 backdrop-blur-xl border-t border-zinc-800 z-20">
        <div className="max-w-4xl mx-auto flex items-end gap-2 bg-zinc-900 rounded-2xl p-2 border border-zinc-800 shadow-inner focus-within:border-primary/50 focus-within:ring-1 focus-within:ring-primary/50 transition-all">
          <form className="flex-1 flex" onSubmit={handleSend}>
             <input 
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              placeholder="Deploy message..." 
              className="flex-1 bg-transparent px-4 py-3 min-h-[48px] focus:outline-none text-sm resize-none custom-scrollbar"
             />
             <button type="submit" disabled={!messageInput.trim()} className="p-3 m-1 bg-primary hover:bg-primary-hover disabled:bg-zinc-800 disabled:text-zinc-600 rounded-xl transition shadow-lg shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
             </button>
          </form>
        </div>
      </div>
    </div>
  );
}
