"use client";

import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";

interface RandomPixelGridProps {
  className?: string;
}

export function RandomPixelGrid({ className }: RandomPixelGridProps) {
  const [pixels] = useState<number[]>(() => Array.from({ length: 600 }, (_, i) => i));

  return (
    <div className={cn("w-full h-full grid grid-cols-[repeat(auto-fill,minmax(50px,1fr))] auto-rows-[50px] gap-1 p-1", className)}>
      {pixels.map((i) => (
        <Pixel key={i} />
      ))}
    </div>
  );
}

function Pixel() {
  const [state, setState] = useState({ active: false, opacity: 0.02 });

  useEffect(() => {
    const triggerRandomly = () => {
      // Small chance to randomly light up
      if (Math.random() < 0.1) {
        setState({ active: true, opacity: Math.random() * 0.4 + 0.1 });
        // Turn off after a random duration between 2s and 4s
        setTimeout(() => setState((prev) => ({ ...prev, active: false })), 2000 + Math.random() * 2000);
      }
    };

    // Initially check once
    triggerRandomly();

    // Check periodically
    const interval = setInterval(triggerRandomly, 1500 + Math.random() * 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      animate={{
        opacity: state.active ? state.opacity : 0.02,
        backgroundColor: state.active ? "#ffffff" : "#4f4f4f",
      }}
      transition={{ duration: 1.5, ease: "easeInOut" }}
      className="w-full h-full rounded-sm"
    />
  );
}
