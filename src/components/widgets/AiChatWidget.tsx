import React, { useState, useEffect, useRef } from 'react';
import { Send, Sparkles, User, Bot } from 'lucide-react';
import { WidgetProps } from '../../types';
import { generateChatResponse } from '../../services/geminiService';

const AiChatWidget: React.FC<WidgetProps> = ({ widget, updateData }) => {
  const { messages = [] } = widget.data;
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => { 
    if(scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const send = async () => {
      if(!input.trim()) return;
      
      const userMsg = input;
      const newM = [...messages, {role: 'user' as const, text: userMsg}];
      updateData(widget.id, { messages: newM });
      
      setInput(""); 
      setLoading(true);
      
      const aiText = await generateChatResponse(userMsg);
      
      updateData(widget.id, { messages: [...newM, { role: 'model', text: aiText }]});
      setLoading(false);
  };

  return (
      <div className="flex flex-col h-full bg-white text-sm">
          <div className="p-3 bg-violet-600 text-white font-bold flex gap-2 items-center shadow-md z-10">
              <Sparkles size={18} className="text-yellow-300"/> 
              <span>HomeRoom Assistant</span>
          </div>
          
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50 custom-scrollbar">
              {messages.length === 0 && (
                  <div className="text-center text-gray-400 mt-10">
                      <Bot size={48} className="mx-auto mb-2 opacity-50"/>
                      <p>Ask me anything about the lesson!</p>
                  </div>
              )}
              {messages.map((m, i) => (
                  <div key={i} className={`flex gap-2 ${m.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${m.role === 'user' ? 'bg-gray-200' : 'bg-violet-100'}`}>
                          {m.role === 'user' ? <User size={14} className="text-gray-600"/> : <Bot size={14} className="text-violet-600"/>}
                      </div>
                      <div className={`p-3 rounded-2xl text-sm max-w-[80%] shadow-sm ${m.role === 'user' ? 'bg-white text-gray-800 rounded-tr-none' : 'bg-violet-600 text-white rounded-tl-none'}`}>
                          {m.text}
                      </div>
                  </div>
              ))}
              {loading && (
                  <div className="flex gap-2">
                       <div className="w-8 h-8 rounded-full bg-violet-100 flex items-center justify-center">
                          <Bot size={14} className="text-violet-600"/>
                       </div>
                       <div className="bg-white p-3 rounded-2xl rounded-tl-none text-gray-500 text-xs shadow-sm flex items-center gap-1">
                           <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></span>
                           <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{animationDelay:'0.1s'}}></span>
                           <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{animationDelay:'0.2s'}}></span>
                       </div>
                  </div>
              )}
          </div>
          
          <div className="p-3 bg-white border-t flex gap-2">
              <input 
                  className="flex-1 border border-gray-200 bg-gray-50 rounded-full px-4 py-2 focus:ring-2 focus:ring-violet-500 outline-none transition-all" 
                  value={input} 
                  onChange={e => setInput(e.target.value)} 
                  onKeyDown={e => e.key === 'Enter' && send()} 
                  placeholder="Type a message..."
                  disabled={loading}
              />
              <button 
                  onClick={send} 
                  disabled={!input.trim() || loading}
                  className="bg-violet-600 hover:bg-violet-700 disabled:bg-gray-300 text-white p-2.5 rounded-full transition-colors shadow-sm"
              >
                  <Send size={18}/>
              </button>
          </div>
      </div>
  );
};

export default AiChatWidget;