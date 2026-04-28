"use client"

import * as React from "react"
import { cn } from "lib/utils";
import { motion } from "framer-motion";

export interface ImageGenerationProps {
  children: React.ReactNode;
  duration?: number;
}

export const ImageGeneration: React.FC<ImageGenerationProps> = ({ children, duration = 30000 }) => {
  const [progress, setProgress] = React.useState(0);
  const [loadingState, setLoadingState] = React.useState<
    "starting" | "generating" | "completed"
  >("starting");

  React.useEffect(() => {
    const startingTimeout = setTimeout(() => {
      setLoadingState("generating");

      const startTime = Date.now();

      const interval = setInterval(() => {
        const elapsedTime = Date.now() - startTime;
        const progressPercentage = Math.min(
          100,
          (elapsedTime / duration) * 100
        );

        setProgress(progressPercentage);

        if (progressPercentage >= 100) {
          clearInterval(interval);
          setLoadingState("completed");
        }
      }, 16);

      return () => clearInterval(interval);
    }, 3000);

    return () => clearTimeout(startingTimeout);
  }, [duration]);

  return (
    <>
      <motion.div
        className="absolute -top-8 left-0 right-0 z-10 px-2 py-6"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <motion.span
          className="bg-[linear-gradient(110deg,#6B7280,35%,#111827,50%,#6B7280,75%,#6B7280)] bg-[length:200%_100%] bg-clip-text text-transparent text-sm font-medium whitespace-nowrap"
          initial={{ backgroundPosition: "200% 0" }}
          animate={{
            backgroundPosition:
              loadingState === "completed" ? "0% 0" : "-200% 0",
          }}
          transition={{
            repeat: loadingState === "completed" ? 0 : Infinity,
            duration: 3,
            ease: "linear",
          }}
        >
          {loadingState === "starting" && "Getting started..."}
          {loadingState === "generating" && "Creating poster. May take a moment..."}
          {loadingState === "completed" && "Poster created!"}
        </motion.span>
      </motion.div>
      <div className="relative rounded-xl border bg-card w-full overflow-hidden">
          {children}
        <motion.div
          className="absolute w-full h-[125%] -top-[25%] pointer-events-none backdrop-blur-3xl"
          initial={false}
          animate={{
            clipPath: `polygon(0 ${progress}%, 100% ${progress}%, 100% 100%, 0 100%)`,
            opacity: loadingState === "completed" ? 0 : 1,
          }}
          style={{
            clipPath: `polygon(0 ${progress}%, 100% ${progress}%, 100% 100%, 0 100%)`,
            maskImage:
              progress === 0
                ? "linear-gradient(to bottom, black -5%, black 100%)"
                : `linear-gradient(to bottom, transparent ${progress - 5}%, transparent ${progress}%, black ${progress + 5}%)`,
            WebkitMaskImage:
              progress === 0
                ? "linear-gradient(to bottom, black -5%, black 100%)"
                : `linear-gradient(to bottom, transparent ${progress - 5}%, transparent ${progress}%, black ${progress + 5}%)`,
          }}
        />
      </div>
    </>
  );
};

ImageGeneration.displayName = "ImageGeneration";
