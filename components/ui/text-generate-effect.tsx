"use client";
import { useEffect } from "react";
import { motion, stagger, useAnimate } from "motion/react";
import { cn } from "@/lib/utils";

export const TextGenerateEffect = ({
  words,
  className,
  filter = true,
  duration = 0.5,
}: {
  words: string;
  className?: string;
  filter?: boolean;
  duration?: number;
}) => {
  const [scope, animate] = useAnimate();
  const wordsArray = words.split(" ");
  useEffect(() => {
    animate(
      "span",
      {
        opacity: 1,
        filter: filter ? "blur(0px)" : "none",
        y: 0,
      },
      {
        duration: duration ? duration : 1,
        delay: stagger(0.2),
      },
    );
  }, [scope, animate, filter, duration]);

  const renderWords = () => {
    return (
      <motion.div
        ref={scope}
        className="flex flex-wrap items-center gap-4 md:gap-6"
      >
        {wordsArray.map((word, idx) => {
          const isStroked = idx > 0;
          return (
            <motion.span
              key={word + idx}
              initial={{ opacity: 0, y: 50 }}
              className={`inline-block drop-shadow-lg ${isStroked ? "" : "text-white"}`}
              style={{
                filter: filter ? "blur(10px)" : "none",
                color: isStroked ? "transparent" : undefined,
                WebkitTextStroke: isStroked
                  ? "2px rgba(255,255,255,0.8)"
                  : undefined,
              }}
            >
              {word}{" "}
            </motion.span>
          );
        })}
      </motion.div>
    );
  };

  return <div className={cn(className)}>{renderWords()}</div>;
};
