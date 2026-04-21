"use client";

import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { setMessages, addMessage, ChatMessage } from "@/store/slices/chatSlice";

export default function ChatRoom() {
  const params = useParams();
  const receiverId = parseInt(params.id as string);
  
  const dispatch = useDispatch();
  const { token, userId } = useSelector((state: RootState) => state.auth);
  const { messages } = useSelector((state: RootState) => state.chat);
  
  const [input, setInput] = useState("");
  const wsRef = useRef<WebSocket | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";
  const wsUrl = process.env.NEXT_PUBLIC_WEBSOCKET_URL || "ws://localhost:8000/api/v1/chat/ws";

  // Auto-scroll on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Fetch History and Mount WebSocket
  useEffect(() => {
    if (!token || !receiverId) return;

    // 1. Fetch History
    fetch(`${apiUrl}/chat/history/${receiverId}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => res.json())
    .then(data => {
      // Assuming data is an array of messages
      if (Array.isArray(data)) {
        dispatch(setMessages(data));
      }
    })
    .catch(err => console.error("History fetch error:", err));

    // 2. Setup WebSocket
    const ws = new WebSocket(`${wsUrl}?token=${token}`);
    
    ws.onmessage = (event) => {
      const msg: ChatMessage = JSON.parse(event.data);
      // Only append if the message belongs to this conversation
      if (
        (msg.sender_id === receiverId && msg.receiver_id === userId) ||
        (msg.sender_id === userId && msg.receiver_id === receiverId)
      ) {
        dispatch(addMessage(msg));
      }
    };
    
    ws.onerror = (e) => console.error("WS Error:", e);
    
    wsRef.current = ws;

    return () => {
      ws.close();
    };
  }, [receiverId, token, userId, dispatch, apiUrl, wsUrl]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !wsRef.current) return;
    
    const payload = {
      receiver_id: receiverId,
      content: input,
      type: "text"
    };
    
    wsRef.current.send(JSON.stringify(payload));
    setInput("");
  };

  return (
    <>
      <header className="px-6 py-4 border-b border-zinc-800/80 bg-zinc-950/40 backdrop-blur-md flex justify-between items-center z-10 sticky top-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-zinc-700 to-zinc-600 shrink-0 flex items-center justify-center font-bold text-white shadow-inner">
             {/* Simple Avatar Placeholder */}
             U
          </div>
          <div>
            <h2 className="font-semibold text-zinc-100">User ID: {receiverId}</h2>
            <p className="text-xs text-zinc-400">Secure AES Connection</p>
          </div>
        </div>
      </header>
      
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-6 space-y-6 z-0 custom-scrollbar scroll-smooth"
      >
        {messages.map((msg, idx) => {
          const isMe = msg.sender_id === userId;
          return (
            <div key={msg.id || idx} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[70%] group flex flex-col ${isMe ? "items-end" : "items-start"}`}>
                <div 
                  className={`px-5 py-3 rounded-2xl shadow-sm ${
                    isMe 
                      ? "bg-primary text-white rounded-br-sm" 
                      : "bg-zinc-800 border border-zinc-700/50 text-zinc-100 rounded-bl-sm"
                  }`}
                >
                  {msg.content}
                </div>
                <span className="text-[10px] text-zinc-500 mt-1 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          );
        })}
        {messages.length === 0 && (
          <div className="flex items-center justify-center h-full opacity-50">
            <span className="text-sm">Start a conversation. This connection is live.</span>
          </div>
        )}
      </div>

      <div className="p-4 bg-zinc-950 z-10 w-full relative before:absolute before:inset-x-0 before:-top-6 before:h-6 before:bg-gradient-to-t before:from-zinc-950 before:to-transparent before:pointer-events-none">
        <form onSubmit={handleSend} className="relative flex items-center shadow-lg">
          <input 
            type="text" 
            placeholder="Type a secure message..." 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-800 rounded-full py-4 pl-6 pr-14 focus:outline-none focus:border-zinc-600 focus:ring-1 focus:ring-zinc-600 transition placeholder-zinc-500 text-zinc-100 shadow-inner"
          />
          <button 
            type="submit" 
            disabled={!input.trim()}
            className="absolute right-2 p-2.5 bg-primary hover:bg-primary-hover disabled:bg-zinc-800 disabled:text-zinc-600 text-white rounded-full transition disabled:cursor-not-allowed shadow-md"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
          </button>
        </form>
      </div>
    </>
  );
}
