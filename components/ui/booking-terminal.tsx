"use client";

import { motion, AnimatePresence } from "motion/react";
import { useState, useTransition } from "react";
import { cn } from "@/lib/utils";
import { bookMeeting } from "@/actions/book-meeting";

interface BookingTerminalProps {
  onClose: () => void;
  className?: string;
}

const DAYS = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
const TIME_SLOTS = [
  "9:00am", "9:30am", "10:00am", "10:30am",
  "11:00am", "11:30am", "12:00pm", "12:30pm",
  "1:00pm", "1:30pm", "2:00pm", "2:30pm",
];

const MONTH_START_DAY = 4; // May 2026 starts on Friday (index 4 = FRI)
const TOTAL_DAYS = 31;

type View = "calendar" | "form" | "success";

export function BookingTerminal({ onClose, className }: BookingTerminalProps) {
  const [selectedDate, setSelectedDate] = useState<number | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [view, setView] = useState<View>("calendar");
  const [isPending, startTransition] = useTransition();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Form fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [topic, setTopic] = useState("");

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
    setView("form");
  };

  const handleConfirm = () => {
    setErrorMsg(null);
    startTransition(async () => {
      const result = await bookMeeting({
        name,
        email,
        topic,
        date: `May ${selectedDate}, 2026`,
        time: selectedTime!,
      });
      if (result.success) {
        setView("success");
      } else {
        setErrorMsg(result.error ?? "Something went wrong.");
      }
    });
  };

  const resetBooking = () => {
    setSelectedDate(null);
    setSelectedTime(null);
    setName(""); setEmail(""); setTopic("");
    setErrorMsg(null);
    setView("calendar");
  };

  const inputClass = "w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-cyan-400/60 transition-colors";

  return (
    <motion.div
      drag
      dragMomentum={false}
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className={cn(
        "pointer-events-auto absolute z-50 w-[95vw] max-w-4xl overflow-hidden rounded-xl border border-white/10 bg-[#111]/95 shadow-2xl backdrop-blur-xl cursor-grab active:cursor-grabbing",
        className
      )}
      data-cursor="terminal"
    >
      {/* Header */}
      <div className="flex items-center gap-2 border-b border-white/5 bg-white/5 px-4 py-3 relative">
        <div className="group relative flex items-center">
          <button
            onClick={onClose}
            className="flex h-3 w-3 items-center justify-center rounded-full bg-red-500/80 shadow-[0_0_10px_rgba(239,68,68,0.5)] hover:bg-red-500 transition-colors"
            aria-label="Close"
          >
            <span className="opacity-0 group-hover:opacity-100 text-[8px] font-bold text-black leading-none">✕</span>
          </button>
          <div className="pointer-events-none absolute left-0 top-6 z-50 w-max opacity-0 group-hover:opacity-100 transition-opacity bg-zinc-800 text-xs text-white px-2 py-1 rounded shadow-lg">
            Close Terminal
          </div>
        </div>
        <div className="h-3 w-3 rounded-full bg-yellow-500/30" />
        <div className="h-3 w-3 rounded-full bg-green-500/30" />
        <div className="absolute left-1/2 -translate-x-1/2 text-xs text-white/40 font-mono tracking-wider">
          book-a-meeting.sh
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-col md:flex-row min-h-[520px]">

        {/* Column 1: Info */}
        <div className="w-full md:w-64 shrink-0 border-r border-white/5 p-6 flex flex-col font-sans">
          <div className="h-12 w-12 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center mb-4 text-white font-bold text-lg">
            K
          </div>
          <p className="text-white/50 text-sm mb-0.5">Karim Khaled</p>
          <h2 className="text-xl font-semibold text-white mb-5">30 min meeting</h2>
          <div className="flex flex-col gap-3.5 text-white/50 text-sm">
            <div className="flex items-center gap-3">⏱ <span>30 minutes</span></div>
            <div className="flex items-center gap-3">🎥 <span>Google Meet</span></div>
            <div className="flex items-center gap-3">🌍 <span>Africa/Cairo</span></div>
          </div>

          {/* Selected state recap */}
          {selectedDate && (
            <div className="mt-auto pt-6 border-t border-white/5 text-xs font-mono text-cyan-400/80">
              <p>📅 May {selectedDate}, 2026</p>
              {selectedTime && <p className="mt-1">⏰ {selectedTime}</p>}
            </div>
          )}
        </div>

        {/* Main Area */}
        <div className="flex-1 overflow-hidden">
          <AnimatePresence mode="wait">

            {/* ── VIEW: Calendar + Time Slots ── */}
            {view === "calendar" && (
              <motion.div
                key="calendar"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="flex flex-col md:flex-row h-full"
              >
                {/* Calendar */}
                <div className="flex-1 border-r border-white/5 p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-white font-medium text-base">May <span className="text-white/40">2026</span></h3>
                    <div className="flex gap-4 text-white/40 text-sm">
                      <button className="hover:text-white transition-colors">&lt;</button>
                      <button className="hover:text-white transition-colors">&gt;</button>
                    </div>
                  </div>
                  <div className="grid grid-cols-7 gap-y-2 text-center">
                    {DAYS.map(d => (
                      <div key={d} className="text-[10px] font-bold text-white/30 tracking-widest pb-2">{d}</div>
                    ))}
                    {/* empty offset cells */}
                    {Array.from({ length: MONTH_START_DAY }).map((_, i) => <div key={`empty-${i}`} />)}
                    {/* day cells */}
                    {Array.from({ length: TOTAL_DAYS }, (_, i) => i + 1).map(date => {
                      const available = date >= 5 && date <= 30;
                      const isSelected = date === selectedDate;
                      return (
                        <div key={date} className="flex justify-center items-center py-1">
                          <button
                            disabled={!available}
                            onClick={() => setSelectedDate(date)}
                            className={cn(
                              "w-9 h-9 rounded-lg text-sm font-medium transition-all",
                              isSelected
                                ? "bg-cyan-500/90 text-zinc-950 shadow-[0_0_12px_rgba(34,211,238,0.4)]"
                                : available
                                  ? "hover:bg-white/10 text-white"
                                  : "text-white/15 cursor-default"
                            )}
                          >
                            {date}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Time Slots — only shows after date selected */}
                <div className="w-full md:w-48 p-6 flex flex-col">
                  <AnimatePresence>
                    {selectedDate ? (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex flex-col gap-2 overflow-y-auto max-h-[400px] pr-1"
                      >
                        <p className="text-xs text-white/40 font-mono mb-2">Available slots</p>
                        {TIME_SLOTS.map(time => (
                          <button
                            key={time}
                            onClick={() => handleTimeSelect(time)}
                            className="w-full py-2.5 rounded-lg border border-white/10 bg-transparent hover:border-cyan-400/60 hover:bg-cyan-400/5 text-white text-sm transition-all text-center"
                          >
                            {time}
                          </button>
                        ))}
                      </motion.div>
                    ) : (
                      <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-xs text-white/30 font-mono mt-4"
                      >
                        ← Select a date first
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            )}

            {/* ── VIEW: Confirmation Form ── */}
            {view === "form" && (
              <motion.div
                key="form"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="p-8 flex flex-col gap-5 font-sans"
              >
                <div>
                  <button onClick={resetBooking} className="text-xs text-white/30 hover:text-white/60 font-mono mb-4 transition-colors">
                    ← back
                  </button>
                  <h3 className="text-white font-semibold text-lg">Confirm your booking</h3>
                  <p className="text-white/40 text-sm mt-1 font-mono">
                    May {selectedDate}, 2026 · {selectedTime}
                  </p>
                </div>

                <input
                  className={inputClass}
                  placeholder="Your full name"
                  value={name}
                  onChange={e => setName(e.target.value)}
                />
                <input
                  className={inputClass}
                  type="email"
                  placeholder="Your email address"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                />
                <textarea
                  className={cn(inputClass, "resize-none h-28")}
                  placeholder="What would you like to discuss?"
                  value={topic}
                  onChange={e => setTopic(e.target.value)}
                />

                {errorMsg && (
                  <p className="text-red-400 text-xs font-mono">{errorMsg}</p>
                )}

                <button
                  onClick={handleConfirm}
                  disabled={isPending || !name || !email || !topic}
                  className={cn(
                    "py-3 rounded-lg font-semibold text-sm transition-all",
                    isPending || !name || !email || !topic
                      ? "bg-white/10 text-white/30 cursor-not-allowed"
                      : "bg-cyan-500 hover:bg-cyan-400 text-zinc-950 shadow-[0_0_20px_rgba(34,211,238,0.3)]"
                  )}
                >
                  {isPending ? "Sending request..." : "Confirm Booking →"}
                </button>
              </motion.div>
            )}

            {/* ── VIEW: Success ── */}
            {view === "success" && (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center h-full gap-5 p-12 text-center font-sans"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", delay: 0.1 }}
                  className="w-16 h-16 rounded-full bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-2xl"
                >
                  ✓
                </motion.div>
                <h3 className="text-white font-semibold text-xl">Booking Request Sent!</h3>
                <p className="text-white/50 text-sm max-w-xs">
                  Karim will get back to you at <span className="text-cyan-400">{email}</span> to confirm your slot.
                </p>
                <p className="text-white/25 font-mono text-xs">
                  May {selectedDate}, 2026 · {selectedTime}
                </p>
                <button
                  onClick={() => { resetBooking(); onClose(); }}
                  className="mt-2 text-xs text-white/30 hover:text-white/60 transition-colors font-mono"
                >
                  close terminal
                </button>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}
