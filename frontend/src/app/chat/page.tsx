"use client";

import { useEffect, useState, useRef } from "react";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { fetchHistory, addMessage, uploadFile, Message } from "../../store/slices/chatSlice";

export default function ChatPage() {
  const dispatch = useAppDispatch();
  const { activeChatUser, messages, loading, uploadingFile } = useAppSelector((state) => state.chat);
  const { token, email } = useAppSelector((state) => state.auth);
  
  const [messageInput, setMessageInput] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  
  const wsRef = useRef<WebSocket | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!messageInput.trim() && !selectedFile) || !activeChatUser || !wsRef.current || uploadingFile) return;
    
    let fileUrl = null;
    let msgType = "text";

    if (selectedFile) {
      try {
        const result = await dispatch(uploadFile(selectedFile)).unwrap();
        fileUrl = result.url;
        const isImage = selectedFile.type.startsWith("image/");
        msgType = isImage ? "image" : "file";
      } catch (err) {
        console.error("Upload failed", err);
        return;
      }
    }

    const payload = {
      receiver_id: activeChatUser.id,
      content: messageInput,
      type: msgType,
      file_url: fileUrl
    };

    wsRef.current.send(JSON.stringify(payload));
    setMessageInput("");
    setSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
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
                {msg.type === "image" && msg.file_url && (
                  <div className="mb-2 rounded-lg overflow-hidden border border-zinc-700/50 bg-black/20">
                    <img src={msg.file_url} alt="Attachment" className="max-w-full h-auto max-h-[300px] object-contain" />
                  </div>
                )}
                {msg.type === "file" && msg.file_url && (
                  <a href={msg.file_url} target="_blank" rel="noopener noreferrer" className="mb-2 flex items-center gap-2 text-blue-400 hover:text-blue-300 transition text-xs bg-black/20 p-2.5 rounded-lg border border-zinc-700/50 w-max">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                    Download Document
                  </a>
                )}
                {msg.content && <p className="text-sm leading-relaxed">{msg.content}</p>}
                <div className={`text-[10px] mt-1.5 opacity-60 flex items-center gap-1 ${isMine ? 'justify-end' : 'justify-start'}`}>
                  {new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Composer Input */}
      <div className="p-4 bg-zinc-950/80 backdrop-blur-xl border-t border-zinc-800 z-20 relative">
        {selectedFile && (
           <div className="absolute -top-12 left-4 bg-zinc-800 border border-zinc-700 px-3 py-1.5 rounded-lg shadow-xl flex items-center gap-2 text-xs text-zinc-300 z-30">
             <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
             <span className="truncate max-w-[200px]">{selectedFile.name}</span>
             <button type="button" onClick={() => { setSelectedFile(null); if (fileInputRef.current) fileInputRef.current.value = ""; }} className="ml-2 hover:text-red-400 bg-zinc-700/50 rounded-full w-5 h-5 flex items-center justify-center transition">&times;</button>
           </div>
        )}
        
        <div className="max-w-4xl mx-auto flex items-end gap-2 bg-zinc-900 rounded-2xl p-2 border border-zinc-800 shadow-inner focus-within:border-primary/50 focus-within:ring-1 focus-within:ring-primary/50 transition-all">
          <form className="flex-1 flex items-center" onSubmit={handleSend}>
             <input type="file" ref={fileInputRef} onChange={handleFileSelect} className="hidden" />
             <button type="button" onClick={() => fileInputRef.current?.click()} className="p-3 m-1 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 rounded-xl transition shrink-0" title="Attach file">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg>
             </button>
             
             <input 
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              placeholder={uploadingFile ? "Uploading securely to CDN..." : "Deploy message..."}
              disabled={uploadingFile}
              className="flex-1 bg-transparent px-2 py-3 min-h-[48px] focus:outline-none text-sm resize-none custom-scrollbar"
             />
             
             <button type="submit" disabled={(!messageInput.trim() && !selectedFile) || uploadingFile} className="p-3 m-1 bg-primary hover:bg-primary-hover disabled:bg-zinc-800 disabled:text-zinc-600 rounded-xl transition shadow-lg shrink-0 relative overflow-hidden group">
                {uploadingFile ? (
                   <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                ) : (
                   <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
                )}
             </button>
          </form>
        </div>
      </div>
    </div>
  );
}
