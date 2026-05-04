"use client";

import React, { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring } from "motion/react";

export function MagneticCursor() {
  // Custom cursor states
  const [isHovering, setIsHovering] = useState(false);
  const [hoverRect, setHoverRect] = useState({ width: 0, height: 0, top: 0, left: 0, radius: 0 });

  // Motion values for precise tracking
  const mouseX = useMotionValue(-100);
  const mouseY = useMotionValue(-100);

  // Smooth springs for the cursor follow
  // We use a tight spring for the default dot so it feels precise
  const springConfig = isHovering 
    ? { damping: 20, stiffness: 150, mass: 0.5 } // Softer spring when snapping
    : { damping: 25, stiffness: 400, mass: 0.2 }; // Snappy spring for free movement

  const cursorX = useSpring(mouseX, springConfig);
  const cursorY = useSpring(mouseY, springConfig);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      // Find if we are hovering over a magnetic element
      const target = e.target as HTMLElement;
      const magneticElement = target.closest('[data-magnetic]') as HTMLElement | null;

      if (magneticElement) {
        setIsHovering(true);
        const rect = magneticElement.getBoundingClientRect();
        
        // Calculate the center of the magnetic element
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        
        // Update motion values to snap to the center
        mouseX.set(centerX);
        mouseY.set(centerY);

        // Try to get computed border radius, otherwise default to a pill/rounded shape
        const computedStyle = window.getComputedStyle(magneticElement);
        let radius = parseInt(computedStyle.borderRadius);
        if (isNaN(radius)) radius = 12; // default radius

        setHoverRect({
          width: rect.width + 24, // add padding
          height: rect.height + 24, // add padding
          top: rect.top,
          left: rect.left,
          radius: radius + 4,
        });
      } else {
        setIsHovering(false);
        mouseX.set(e.clientX);
        mouseY.set(e.clientY);
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, [mouseX, mouseY]);

  // Default cursor size
  const defaultSize = 16;

  return (
    <motion.div
      className="fixed top-0 left-0 z-[9999] pointer-events-none mix-blend-difference bg-white"
      initial={{ opacity: 0 }}
      animate={{ 
        opacity: 1,
        width: isHovering ? hoverRect.width : defaultSize,
        height: isHovering ? hoverRect.height : defaultSize,
        borderRadius: isHovering ? hoverRect.radius : "50%",
      }}
      transition={{ type: "spring", damping: 20, stiffness: 150, mass: 0.5 }}
      style={{
        x: cursorX,
        y: cursorY,
        translateX: "-50%",
        translateY: "-50%",
      }}
    />
  );
}
