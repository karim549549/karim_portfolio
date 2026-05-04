"use client";

import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

const systemSh = `#!/bin/bash
echo "Initializing System..."
sleep 1
echo "Role: Software Engineer & Creative Developer"
echo "Location: Global"
echo "Status: Open to opportunities"
./start_portfolio.sh`;

const skillsJson = `{
  "frontend": ["React", "Next.js", "TypeScript", "Tailwind CSS"],
  "creative": ["Three.js", "Framer Motion", "WebGL", "Canvas API"],
  "backend": ["Node.js", "PostgreSQL", "Prisma", "REST APIs"],
  "tools": ["Git", "Docker", "Figma", "Cursor"]
}`;

const contactTs = `import { sendEmail } from '@/lib/mail';

export async function reachOut() {
  const contact = {
    email: 'hello@karim.dev',
    github: 'github.com/karim549549',
    availability: 'Open to new projects'
  };
  
  return await sendEmail(contact);
}`;

const tabs = [
  { id: "system", label: "system.sh", content: systemSh, color: "text-green-400" },
  { id: "skills", label: "skills.json", content: skillsJson, color: "text-yellow-300" },
  { id: "contact", label: "contact.ts", content: contactTs, color: "text-blue-400" },
];

function useTypewriter(text: string, speed: number = 10) {
  const [displayedText, setDisplayedText] = useState("");

  useEffect(() => {
    let i = 0;
    let accumulated = "";
    const timer = setInterval(() => {
      if (i < text.length) {
        accumulated += text.charAt(i);
        setDisplayedText(accumulated);
        i++;
      } else {
        clearInterval(timer);
      }
    }, speed);

    return () => {
      clearInterval(timer);
      setDisplayedText(""); // reset on cleanup — this is legitimate inside cleanup
    };
  }, [text, speed]);

  return displayedText;
}

export function SciFiTerminal({ className, onOpenBooking }: { className?: string, onOpenBooking?: () => void }) {
  const [activeTab, setActiveTab] = useState(tabs[0]);
  const displayedText = useTypewriter(activeTab.content, 15);

  return (
    <motion.div
      drag
      dragMomentum={false}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className={cn(
        "pointer-events-auto absolute z-40 w-[90vw] max-w-5xl overflow-hidden rounded-xl border border-white/20 bg-black/60 shadow-2xl backdrop-blur-xl cursor-grab active:cursor-grabbing font-mono",
        className
      )}
      data-cursor="terminal"
    >
      {/* Terminal Header & Window Controls */}
      <div className="flex flex-col border-b border-white/10 bg-white/5">
        <div className="flex items-center gap-2 px-4 py-3">
          <div className="h-3 w-3 rounded-full bg-red-500/80 shadow-[0_0_10px_rgba(239,68,68,0.5)]" />
          <div className="h-3 w-3 rounded-full bg-yellow-500/80 shadow-[0_0_10px_rgba(234,179,8,0.5)]" />
          <div className="h-3 w-3 rounded-full bg-cyan-500/80 shadow-[0_0_10px_rgba(6,182,212,0.5)]" />
          <div className="ml-2 flex-1 text-center text-xs text-white/40">karim-khaled — zsh — 80x24</div>
        </div>
        
        {/* Tabs */}
        <div className="flex px-2 pb-0 pt-1 overflow-x-auto no-scrollbar">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab);
                if (tab.id === "contact" && onOpenBooking) {
                  onOpenBooking();
                }
              }}
              className={cn(
                "px-4 py-2 text-xs md:text-sm border-b-2 transition-colors",
                activeTab.id === tab.id
                  ? "border-cyan-400 text-cyan-50 bg-white/10 rounded-t-md"
                  : "border-transparent text-white/50 hover:text-white/80 hover:bg-white/5 rounded-t-md"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Terminal Body */}
      <div className="flex flex-col p-6 min-h-[40vh] md:min-h-[50vh] text-base md:text-lg bg-zinc-950/50">
        <pre className={cn("whitespace-pre-wrap font-mono leading-relaxed", activeTab.color)}>
          {displayedText}
          <motion.span
            animate={{ opacity: [1, 0] }}
            transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }}
            className="inline-block h-4 w-2 ml-1 bg-white/80 align-middle"
          />
        </pre>
      </div>
    </motion.div>
  );
}
