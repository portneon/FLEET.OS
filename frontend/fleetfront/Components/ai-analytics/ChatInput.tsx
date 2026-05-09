import React, { useRef, useEffect, useState } from 'react';
import { Send, Sparkles } from 'lucide-react';

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

export function ChatInput({ onSend, disabled, placeholder = 'Ask about revenue, fleet performance, driver stats…' }: ChatInputProps) {
  const [input, setInput] = useState('');
  const ref = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (ref.current) {
      ref.current.style.height = 'auto';
      ref.current.style.height = `${Math.min(ref.current.scrollHeight, 140)}px`;
    }
  }, [input]);

  const handleSend = () => {
    const msg = input.trim();
    if (!msg || disabled) return;
    onSend(msg);
    setInput('');
  };

  return (
    <div className={`flex items-end gap-2 bg-white border ${disabled ? 'border-[#E5E3DD]' : 'border-[#1A1A1A]'} rounded-2xl p-2 shadow-lg transition-colors`}>
      <Sparkles className="w-5 h-5 text-[#8C877D] mb-2.5 ml-2 shrink-0" />
      <textarea
        ref={ref}
        value={input}
        onChange={e => setInput(e.target.value)}
        onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
        placeholder={placeholder}
        disabled={disabled}
        rows={1}
        className="flex-1 min-h-[44px] max-h-[140px] bg-transparent resize-none outline-none py-2.5 px-2 text-sm text-[#1A1A1A] placeholder:text-[#AEABA5] leading-relaxed"
      />
      <button
        onClick={handleSend}
        disabled={!input.trim() || disabled}
        className="mb-1 shrink-0 w-9 h-9 rounded-xl bg-[#1A1A1A] text-white flex items-center justify-center hover:bg-black disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 hover:scale-105 active:scale-95"
      >
        <Send className="w-4 h-4" />
      </button>
    </div>
  );
}
