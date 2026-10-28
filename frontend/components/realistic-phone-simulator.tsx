'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Bot,
  CheckCheck,
  Phone,
  Video,
  MoreVertical,
  ArrowLeft,
  Smile,
  Paperclip,
  Mic,
  Send,
  Sparkles,
  Calendar,
  Mail,
  Brain,
  Zap,
  Play,
  Pause,
  RotateCcw,
  Clock,
  Wifi,
  BatteryMedium
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface Message {
  id: string;
  sender: 'user' | 'agent';
  text: string;
  time: string;
  toolPill?: {
    icon: React.ReactNode;
    label: string;
    color: string;
  };
}

const CONVERSATION_SCRIPT: {
  user: string;
  agent: string;
  toolPill: {
    type: 'calendar' | 'email' | 'reminder' | 'memory';
    label: string;
  };
  timeSaved: string;
}[] = [
  {
    user: "Good morning! Any clashes on my calendar today?",
    agent: "Good morning Alex ☀️\n\nYou had an overlap at 2:00 PM between Product Review and the Client Sync. I moved Product Review to 3:30 PM with Sarah's approval. Your day is all clear!",
    toolPill: {
      type: 'calendar',
      label: '🗓️ Google Calendar: Conflict resolved & Meet link updated'
    },
    timeSaved: "+15m saved"
  },
  {
    user: "Did the board send feedback on the Q3 budget deck?",
    agent: "Yes, Marcus emailed at 8:14 AM. 3 action items extracted:\n1. Update slide 8 OPEX forecast\n2. Attach finalized hiring plan\n3. Resend by 4:00 PM today\n\nI have prepared a draft reply with the changes. Shall I send it?",
    toolPill: {
      type: 'email',
      label: '✉️ Gmail: 3 action items extracted with 97% confidence'
    },
    timeSaved: "+25m saved"
  },
  {
    user: "Send the reply to Marcus and remind me 10 mins before Sarah's sync.",
    agent: "Done! 🚀\n\nEmail dispatched to marcus@company.com and a reminder is set for 3:20 PM.\n\nI've also attached Sarah's notes from your last standup for quick prep.",
    toolPill: {
      type: 'reminder',
      label: '⚡ Email sent via Composio • WhatsApp reminder set'
    },
    timeSaved: "+35m saved"
  },
  {
    user: "Remember that Marcus prefers executive summaries under 5 bullet points.",
    agent: "Noted and saved to long-term memory! 🧠\n\nI'll remember this preference whenever you correspond with Marcus or prepare budget briefings.",
    toolPill: {
      type: 'memory',
      label: '🧠 Vector Memory: User preference saved'
    },
    timeSaved: "+45m saved"
  }
];

export function RealisticPhoneSimulator() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [turnIndex, setTurnIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [cumulativeSaved, setCumulativeSaved] = useState<number>(15);
  const chatScrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll inside phone chat
  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  useEffect(() => {
    if (!isPlaying) return;

    let timeoutId: NodeJS.Timeout;

    const currentScript = CONVERSATION_SCRIPT[turnIndex % CONVERSATION_SCRIPT.length];
    const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // Step 1: User message arrives
    timeoutId = setTimeout(() => {
      const userMsgId = `user-${Date.now()}`;
      setMessages((prev) => [
        ...prev,
        {
          id: userMsgId,
          sender: 'user',
          text: currentScript.user,
          time: currentTime
        }
      ]);

      // Step 2: Agent starts typing
      timeoutId = setTimeout(() => {
        setIsTyping(true);

        // Step 3: Agent delivers response
        timeoutId = setTimeout(() => {
          setIsTyping(false);
          const agentMsgId = `agent-${Date.now()}`;
          
          let icon = <Calendar className="size-3 text-blue-400" />;
          let color = "bg-blue-500/10 text-blue-300 border-blue-500/30";
          if (currentScript.toolPill.type === 'email') {
            icon = <Mail className="size-3 text-red-400" />;
            color = "bg-red-500/10 text-red-300 border-red-500/30";
          } else if (currentScript.toolPill.type === 'reminder') {
            icon = <Zap className="size-3 text-amber-400" />;
            color = "bg-amber-500/10 text-amber-300 border-amber-500/30";
          } else if (currentScript.toolPill.type === 'memory') {
            icon = <Brain className="size-3 text-purple-400" />;
            color = "bg-purple-500/10 text-purple-300 border-purple-500/30";
          }

          setMessages((prev) => [
            ...prev,
            {
              id: agentMsgId,
              sender: 'agent',
              text: currentScript.agent,
              time: currentTime,
              toolPill: {
                icon,
                label: currentScript.toolPill.label,
                color
              }
            }
          ]);

          setCumulativeSaved((prev) => Math.min(prev + 10, 45));

          // Step 4: Advance to next turn after pause
          timeoutId = setTimeout(() => {
            if (turnIndex + 1 >= CONVERSATION_SCRIPT.length) {
              // loop back cleanly after a pause
              setTimeout(() => {
                setMessages([]);
                setTurnIndex(0);
                setCumulativeSaved(15);
              }, 4000);
            } else {
              setTurnIndex((prev) => prev + 1);
            }
          }, 3500);

        }, 1800); // typing duration
      }, 700); // pause before typing
    }, 1200); // pause before user speaks

    return () => clearTimeout(timeoutId);
  }, [turnIndex, isPlaying]);

  const resetSimulation = () => {
    setMessages([]);
    setTurnIndex(0);
    setCumulativeSaved(15);
    setIsPlaying(true);
  };

  return (
    <div className="flex flex-col items-center">
      {/* Simulation Controls Header */}
      <div className="w-full flex items-center justify-between mb-3 px-2">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-[11px] border-emerald-500/40 text-emerald-400 bg-emerald-500/10">
            <span className="size-1.5 rounded-full bg-emerald-500 mr-1.5 animate-pulse" />
            Live WhatsApp Agent Simulation
          </Badge>
        </div>

        <div className="flex items-center gap-1.5">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsPlaying(!isPlaying)}
            className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
            title={isPlaying ? "Pause simulation" : "Resume simulation"}
          >
            {isPlaying ? <Pause className="size-3 mr-1" /> : <Play className="size-3 mr-1" />}
            <span>{isPlaying ? "Pause" : "Play"}</span>
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={resetSimulation}
            className="h-7 w-7 text-muted-foreground hover:text-foreground"
            title="Restart conversation"
          >
            <RotateCcw className="size-3" />
          </Button>
        </div>
      </div>

      {/* Realistic Phone Hardware Chassis */}
      <div className="relative w-full max-w-[370px] aspect-[9/18.5] bg-zinc-950 rounded-[48px] p-3 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8),0_0_0_1px_rgba(255,255,255,0.1),0_0_30px_rgba(99,102,241,0.15)] ring-1 ring-zinc-800 transition-all select-none">
        
        {/* Subtle Outer Hardware Edge Buttons */}
        <div className="absolute -left-[3px] top-[110px] w-[3px] h-[30px] bg-zinc-700/80 rounded-l" />
        <div className="absolute -left-[3px] top-[150px] w-[3px] h-[45px] bg-zinc-700/80 rounded-l" />
        <div className="absolute -left-[3px] top-[205px] w-[3px] h-[45px] bg-zinc-700/80 rounded-l" />
        <div className="absolute -right-[3px] top-[140px] w-[3px] h-[65px] bg-zinc-700/80 rounded-r" />

        {/* Inner Screen Display */}
        <div className="w-full h-full bg-[#0b141a] rounded-[38px] overflow-hidden flex flex-col relative border border-zinc-800/90 shadow-inner">
          
          {/* Top Notch / Dynamic Island & Status Bar */}
          <div className="h-10 bg-[#1f2c34] px-6 flex items-center justify-between text-zinc-300 text-[11px] shrink-0 font-medium z-20">
            <span>9:41</span>
            
            {/* Dynamic Island pill */}
            <div className="w-24 h-4 bg-black rounded-full flex items-center justify-end px-2 gap-1.5 shadow-sm">
              <span className="size-2 rounded-full bg-indigo-500/80 animate-pulse" />
              <div className="size-1.5 rounded-full bg-zinc-800" />
            </div>

            <div className="flex items-center gap-1.5 text-zinc-400">
              <Wifi className="size-3" />
              <BatteryMedium className="size-3.5" />
            </div>
          </div>

          {/* WhatsApp Brand Header */}
          <div className="bg-[#1f2c34] px-3 py-2.5 flex items-center justify-between border-b border-[#2a3942] z-10 shadow-md">
            <div className="flex items-center gap-2">
              <ArrowLeft className="size-4 text-zinc-300 cursor-pointer" />
              <div className="relative">
                <div className="size-9 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-white font-bold shadow">
                  <Bot className="size-4 text-white" />
                </div>
                <span className="absolute bottom-0 right-0 size-2.5 rounded-full bg-emerald-500 ring-2 ring-[#1f2c34]" />
              </div>
              <div className="leading-tight">
                <div className="flex items-center gap-1.5">
                  <h4 className="text-xs font-semibold text-zinc-100">CPAA Agent</h4>
                  <span className="text-[9px] bg-emerald-500/20 text-emerald-400 px-1 py-0.2 rounded font-medium">Verified AI</span>
                </div>
                <p className="text-[10px] text-zinc-400 transition-all">
                  {isTyping ? (
                    <span className="text-emerald-400 font-medium animate-pulse">typing...</span>
                  ) : (
                    "online • 2.1s response"
                  )}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 text-zinc-300">
              <Video className="size-4 opacity-75" />
              <Phone className="size-4 opacity-75" />
              <MoreVertical className="size-4 opacity-75" />
            </div>
          </div>

          {/* Chat Messages Body (WhatsApp Wallpaper Texture) */}
          <div
            ref={chatScrollRef}
            className="flex-1 p-3.5 overflow-y-auto space-y-3 bg-[#0b141a] bg-grid-pattern relative text-[11px]"
          >
            {/* Encryption Pill */}
            <div className="flex justify-center my-1">
              <span className="text-[9px] text-[#ffd279] bg-[#182229] px-2.5 py-1 rounded-md text-center max-w-[260px] leading-tight border border-[#222d34]">
                🔒 Messages are end-to-end encrypted with AES-256 AWS KMS.
              </span>
            </div>

            {/* Date Pill */}
            <div className="flex justify-center">
              <span className="text-[10px] bg-[#182229] text-zinc-400 px-2 py-0.5 rounded-md font-medium uppercase tracking-wider">
                Today
              </span>
            </div>

            {messages.map((msg) => {
              const isUser = msg.sender === 'user';
              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} transition-all duration-300 animate-in fade-in slide-in-from-bottom-2`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-3.5 py-2 shadow-sm relative ${
                      isUser
                        ? 'bg-[#005c4b] text-[#e9edef] rounded-tr-none'
                        : 'bg-[#202c33] text-[#e9edef] rounded-tl-none border border-[#2a3942]'
                    }`}
                  >
                    {!isUser && (
                      <div className="flex items-center gap-1 text-[10px] text-indigo-400 font-semibold mb-1">
                        <Sparkles className="size-2.5" />
                        <span>Autonomous Assistant</span>
                      </div>
                    )}

                    <p className="leading-relaxed whitespace-pre-line text-xs font-sans">
                      {msg.text}
                    </p>

                    <div className="flex items-center justify-end gap-1 mt-1 text-[9px] text-zinc-400">
                      <span>{msg.time}</span>
                      {isUser && <CheckCheck className="size-3 text-[#53bdeb]" />}
                    </div>
                  </div>

                  {/* Tool Action Pill attached underneath agent message */}
                  {!isUser && msg.toolPill && (
                    <div className="mt-1 ml-1 flex items-center gap-1.5 px-2 py-1 rounded-lg bg-zinc-900/90 border border-zinc-800 text-[10px] font-mono text-zinc-300 shadow-sm animate-in fade-in">
                      <span className="shrink-0">{msg.toolPill.icon}</span>
                      <span className="truncate max-w-[240px]">{msg.toolPill.label}</span>
                    </div>
                  )}
                </div>
              );
            })}

            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex justify-start animate-in fade-in">
                <div className="bg-[#202c33] text-zinc-400 rounded-2xl rounded-tl-none px-3.5 py-2 flex items-center gap-1 border border-[#2a3942] shadow-sm">
                  <span className="text-[10px] mr-1 text-emerald-400 font-medium">CPAA is typing</span>
                  <span className="size-1.5 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="size-1.5 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="size-1.5 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            )}
          </div>

          {/* Bottom Chat Bar */}
          <div className="bg-[#1f2c34] p-2 flex items-center gap-2 border-t border-[#2a3942] shrink-0">
            <div className="flex items-center gap-2 text-zinc-400 pl-1">
              <Smile className="size-4" />
              <Paperclip className="size-4" />
            </div>

            <div className="flex-1 bg-[#2a3942] rounded-full px-3 py-1.5 text-xs text-zinc-400 flex items-center justify-between">
              <span className="truncate text-[11px]">Message CPAA...</span>
            </div>

            <div className="size-8 rounded-full bg-[#00a884] flex items-center justify-center text-white shadow-sm shrink-0">
              <Mic className="size-4" />
            </div>
          </div>

          {/* Home Bar Indicator */}
          <div className="h-3 bg-[#1f2c34] flex justify-center items-center shrink-0">
            <div className="w-28 h-1 bg-zinc-600 rounded-full" />
          </div>
        </div>
      </div>

      {/* Floating Productivity Meter Pill underneath */}
      <div className="mt-3 flex items-center gap-2 px-3 py-1.5 rounded-full bg-card/80 border border-border shadow-sm text-xs">
        <span className="size-2 rounded-full bg-emerald-500 animate-ping" />
        <span className="text-muted-foreground">Productivity Gained Today:</span>
        <span className="font-bold text-emerald-400 font-mono">+{cumulativeSaved} mins</span>
      </div>
    </div>
  );
}
