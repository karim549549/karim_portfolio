"use client";

import React, { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring } from "motion/react";

type CursorVariant = "default" | "magnetic" | "terminal";

export function MagneticCursor() {
  const [cursorVariant, setCursorVariant] = useState<CursorVariant>("default");
  const [hoverRect, setHoverRect] = useState({ width: 0, height: 0, top: 0, left: 0, radius: 0 });

  const mouseX = useMotionValue(-100);
  const mouseY = useMotionValue(-100);

  const springConfig = cursorVariant === "magnetic" 
    ? { damping: 20, stiffness: 150, mass: 0.5 }
    : { damping: 25, stiffness: 400, mass: 0.2 };

  const cursorX = useSpring(mouseX, springConfig);
  const cursorY = useSpring(mouseY, springConfig);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      
      const terminalElement = target.closest('[data-cursor="terminal"]');
      const magneticElement = target.closest('[data-magnetic]');

      if (terminalElement) {
        setCursorVariant("terminal");
        mouseX.set(e.clientX);
        mouseY.set(e.clientY);
      } else if (magneticElement) {
        setCursorVariant("magnetic");
        const rect = magneticElement.getBoundingClientRect();
        
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        
        mouseX.set(centerX);
        mouseY.set(centerY);

        const computedStyle = window.getComputedStyle(magneticElement);
        let radius = parseInt(computedStyle.borderRadius);
        if (isNaN(radius)) radius = 12;

        setHoverRect({
          width: rect.width + 24,
          height: rect.height + 24,
          top: rect.top,
          left: rect.left,
          radius: radius + 4,
        });
      } else {
        setCursorVariant("default");
        mouseX.set(e.clientX);
        mouseY.set(e.clientY);
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, [mouseX, mouseY]);

  const variants = {
    default: {
      width: 16,
      height: 16,
      borderRadius: "50%",
      backgroundColor: "#ffffff",
      border: "0px solid transparent",
      mixBlendMode: "difference" as const,
    },
    magnetic: {
      width: hoverRect.width,
      height: hoverRect.height,
      borderRadius: hoverRect.radius,
      backgroundColor: "#ffffff",
      border: "0px solid transparent",
      mixBlendMode: "difference" as const,
    },
    terminal: {
      width: 32,
      height: 32,
      borderRadius: "4px",
      backgroundColor: "transparent",
      border: "2px solid rgba(34, 211, 238, 0.8)", // cyan-400
      mixBlendMode: "normal" as const,
    }
  };

  return (
    <motion.div
      className="fixed top-0 left-0 z-[9999] pointer-events-none flex items-center justify-center"
      initial="default"
      animate={cursorVariant}
      variants={variants}
      transition={{ type: "spring", damping: 20, stiffness: 150, mass: 0.5 }}
      style={{
        x: cursorX,
        y: cursorY,
        translateX: "-50%",
        translateY: "-50%",
      }}
    >
      {/* Add a tiny dot in the center for the terminal crosshair effect */}
      {cursorVariant === "terminal" && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="w-1 h-1 bg-cyan-400 rounded-full" 
        />
      )}
    </motion.div>
  );
}
