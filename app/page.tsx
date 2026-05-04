"use client";

import { useState, useEffect } from "react";
import { TextGenerateEffect } from "@/components/ui/text-generate-effect";
import { RandomCubeGrid } from "@/components/ui/random-cube-grid";
import { motion, useMotionValue, useSpring, useMotionTemplate } from "motion/react";

const texts = [
  { filled: "karim", stroked: "khaled" },
  { filled: "software", stroked: "engineer" },
  { filled: "creative", stroked: "developer" },
];

export default function Page() {
  const [displayIndex, setDisplayIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setDisplayIndex((prev) => (prev + 1) % texts.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const currentText = texts[displayIndex];

  // Mouse Tracking for the Flashlight Hole
  const mouseX = useMotionValue(-1000);
  const mouseY = useMotionValue(-1000);

  const springX = useSpring(mouseX, { damping: 30, stiffness: 200 });
  const springY = useSpring(mouseY, { damping: 30, stiffness: 200 });

  function handleMouseMove(event: React.MouseEvent<HTMLDivElement>) {
    const { currentTarget, clientX, clientY } = event;
    const { left, top } = currentTarget.getBoundingClientRect();
    mouseX.set(clientX - left);
    mouseY.set(clientY - top);
  }

  return (
    <main 
      onMouseMove={handleMouseMove}
      className="relative min-h-screen w-full bg-zinc-950 flex flex-col overflow-hidden"
    >
      {/* Layer 1: Base Background - Random Cube Grid */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-80">
        <RandomCubeGrid text="KARIM" />
      </div>

      {/* Layer 2: The Frosted Glass Panel with the 'Hole' */}
      <motion.div 
        className="absolute inset-0 z-10 pointer-events-none"
        initial={{ opacity: 0, y: 100 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1], delay: 1 }} // Premium glide-up curve
        style={{
          // Creates a hole where the cursor is, revealing the unblurred grid underneath
          WebkitMaskImage: useMotionTemplate`radial-gradient(450px circle at ${springX}px ${springY}px, transparent 0%, black 100%)`,
          maskImage: useMotionTemplate`radial-gradient(450px circle at ${springX}px ${springY}px, transparent 0%, black 100%)`,
        }}
      >
        <div className="absolute inset-4 md:inset-8 lg:inset-10 bg-zinc-950/90 backdrop-blur-[150px] rounded-[2.5rem] shadow-[0_0_80px_rgba(0,0,0,0.9)] border border-white/5" />
      </motion.div>

      {/* Layer 3: The Content Layer (Exactly matches the glass card bounds) */}
      <motion.div 
        className="absolute inset-4 md:inset-8 lg:inset-10 z-30 pointer-events-none p-8 md:p-12 flex flex-col justify-between"
        initial={{ opacity: 0, y: 100 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1], delay: 1 }} // Synchronized with glass card
      >
        
        {/* Top Content Area (Ready for future portfolio content like nav links) */}
        <div className="pointer-events-auto flex justify-end">
          {/* We can add nav links or a logo here later */}
        </div>

        {/* Bottom Content Area */}
        <div className="pointer-events-auto" style={{ perspective: "1000px" }}>
          <TextGenerateEffect
            key={displayIndex}
            words={`${currentText.filled} ${currentText.stroked}`}
            className="font-anton text-7xl md:text-9xl italic uppercase leading-none"
          />
        </div>

      </motion.div>
    </main>
  );
}
