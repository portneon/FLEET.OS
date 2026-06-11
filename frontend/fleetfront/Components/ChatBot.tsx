"use client";

import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Loader2, Maximize2, Minimize2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { chatAPI } from "@/lib/api";

interface Message {
  role: "user" | "bot";
  content: string;
}

export function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "bot",
      content:
        "Welcome to FleetOS. How may I assist you today?",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = input.trim();
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await chatAPI.query(userMessage);

      if (!response.ok) throw new Error("Failed to fetch response");

      const data = await response.json();
      setMessages((prev) => [...prev, { role: "bot", content: data.answer }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "bot",
          content:
            "I'm unable to connect to the server at this moment. Please try again shortly.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* Floating Trigger Button */}
      {!isOpen && (
        <button
          id="chatbot-trigger"
          onClick={() => setIsOpen(true)}
          className="fixed bottom-8 right-8 z-50 flex items-center gap-3 bg-[#1A1A1A] text-[#F9F8F4] px-5 py-3 border border-[#1A1A1A] hover:bg-[#333333] transition-all duration-300 group"
          aria-label="Open FleetOS assistant"
        >
          <MessageCircle size={16} strokeWidth={1.5} />
          <span className="text-[10px] uppercase tracking-[0.2em] font-semibold">
            Assistant
          </span>
        </button>
      )}

      {/* Backdrop — only shown in expanded/floating-page mode */}
      {isOpen && isExpanded && (
        <div
          className="fixed inset-0 bg-black/10 backdrop-blur-sm z-40 transition-opacity"
          onClick={() => {
            setIsExpanded(false);
          }}
        />
      )}

      {/* Chat Panel */}
      {isOpen && (
        <div
          style={{
            background: isExpanded
              ? "linear-gradient(to bottom, #FBFBF9 0%, #F9F8F4 100%)"
              : undefined,
          }}
          className={`fixed z-50 border border-[#DCD7CB] flex flex-col shadow-[0_32px_120px_rgba(0,0,0,0.16)] transition-all duration-300 overflow-hidden ${isExpanded
              // Expanded: centered floating page
              ? "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[65vw] h-[75vh] rounded-xl"
              // Default: bottom-right corner panel
              : "bottom-8 right-8 w-[90vw] sm:w-[380px] h-[520px] max-h-[85vh] bg-[#F9F8F4] rounded-none translate-x-0 translate-y-0"
            }`}
        >
          {/* Header */}
          <div
            className={`flex items-center justify-between border-b border-[#DCD7CB] bg-[#FBFBF9] transition-all duration-300 ${isExpanded ? "px-8 py-5" : "px-6 py-4"
              }`}
          >
            <div>
              <h3 className="text-sm font-['Playfair_Display',serif] tracking-tight text-[#1A1A1A]">
                Fleet<span className="italic font-light">OS</span> Assistant
              </h3>
              <p className="text-[9px] uppercase tracking-[0.2em] font-semibold text-[#8C877D] mt-0.5">
                Knowledge Base
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="text-[#8C877D] hover:text-[#1A1A1A] transition-colors p-1"
                aria-label={isExpanded ? "Minimize assistant" : "Maximize assistant"}
              >
                {isExpanded ? <Minimize2 size={14} strokeWidth={1.5} /> : <Maximize2 size={14} strokeWidth={1.5} />}
              </button>
              <button
                onClick={() => {
                  setIsOpen(false);
                  setIsExpanded(false);
                }}
                className="text-[#8C877D] hover:text-[#1A1A1A] transition-colors p-1"
                aria-label="Close assistant"
              >
                <X size={16} strokeWidth={1.5} />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div
            className={`flex-1 overflow-y-auto flex flex-col transition-all duration-300 ${isExpanded
                ? "px-10 py-8 gap-6"
                : "px-5 py-4 gap-4"
              }`}
          >
            <div
              className={`w-full ${isExpanded ? "max-w-4xl mx-auto" : ""
                }`}
            >
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`${isExpanded ? "max-w-[70%]" : "max-w-[85%]"
                    } ${msg.role === "user" ? "self-end" : "self-start"
                    }`}
                >
                  {msg.role === "bot" && (
                    <span className="text-[9px] uppercase tracking-[0.15em] font-semibold text-[#8C877D] mb-1 block">
                      FleetOS
                    </span>
                  )}
                  <div
                    className={`leading-relaxed transition-all duration-300 ${isExpanded
                        ? "text-[14px] px-5 py-4"
                        : "text-[13px] px-4 py-3"
                      } ${msg.role === "user"
                        ? "bg-[#1A1A1A] text-[#F9F8F4]"
                        : "bg-[#EBE6DD] text-[#1A1A1A]"
                      }`}
                  >
                    {msg.role === "bot" ? (
                      <ReactMarkdown
                        components={{
                          p: ({ node, ...props }) => <p className="mb-3 last:mb-0" {...props} />,
                          ul: ({ node, ...props }) => <ul className="list-disc pl-5 mb-3 space-y-1" {...props} />,
                          ol: ({ node, ...props }) => <ol className="list-decimal pl-5 mb-3 space-y-1" {...props} />,
                          li: ({ node, ...props }) => <li className="pl-1" {...props} />,
                          strong: ({ node, ...props }) => <strong className="font-semibold text-[#1A1A1A]" {...props} />,
                          h3: ({ node, ...props }) => <h3 className="font-bold text-sm mt-3 mb-2" {...props} />,
                          h4: ({ node, ...props }) => <h4 className="font-semibold mt-2 mb-1" {...props} />
                        }}
                      >
                        {msg.content}
                      </ReactMarkdown>
                    ) : (
                      msg.content
                    )}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="self-start max-w-[85%]">
                  <span className="text-[9px] uppercase tracking-[0.15em] font-semibold text-[#8C877D] mb-1 block">
                    FleetOS
                  </span>
                  <div className="bg-[#EBE6DD] text-[#8C877D] px-4 py-3 flex items-center gap-2 text-[13px]">
                    <Loader2
                      size={14}
                      className="animate-spin"
                      strokeWidth={1.5}
                    />
                    <span className="italic">Processing…</span>
                  </div>
                </div>
              )}
            </div>
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div
            className={`border-t border-[#DCD7CB] bg-[#FBFBF9] transition-all duration-300 ${isExpanded ? "px-8 py-6" : "px-5 py-4"
              }`}
          >
            <div
              className={`w-full flex gap-3 items-end ${isExpanded ? "max-w-4xl mx-auto" : ""
                }`}
            >
              <textarea
                id="chatbot-input"
                className="flex-1 resize-none bg-transparent text-[13px] text-[#1A1A1A] placeholder-[#8C877D] focus:outline-none leading-relaxed min-h-[20px] max-h-24"
                placeholder="Ask a question…"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                rows={1}
              />
              <button
                id="chatbot-send"
                onClick={handleSend}
                disabled={isLoading || !input.trim()}
                className="text-[#1A1A1A] hover:text-[#8C877D] transition-colors disabled:opacity-30 disabled:cursor-not-allowed p-1"
                aria-label="Send message"
              >
                <Send size={16} strokeWidth={1.5} />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}