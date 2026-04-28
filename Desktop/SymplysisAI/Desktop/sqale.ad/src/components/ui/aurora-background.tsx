import React from "react";
import { cn } from "../../lib/utils";

export const AuroraBackground = ({
  className,
  children,
  showRadialGradient = true,
}: {
  className?: string;
  children: React.ReactNode;
  showRadialGradient?: boolean;
}) => {
  return (
    <>
      <style>{`
        @keyframes aurora {
          0% {
            background-position: 0% 50%, 50% 50%;
          }
          50% {
            background-position: 100% 50%, 50% 50%;
          }
          100% {
            background-position: 0% 50%, 50% 50%;
          }
        }
        .aurora-animate {
          animation: aurora 1s ease-in-out infinite;
        }
      `}</style>
      <div
        className={cn(
          "relative flex flex-col h-full w-full items-center justify-center bg-slate-50 dark:bg-slate-900 text-slate-950 transition-bg",
          className
        )}
      >
        <div className="absolute inset-0 overflow-hidden">
          <div
            className={cn(
              "pointer-events-none absolute -inset-[10px] opacity-50 will-change-transform filter blur-[10px] invert dark:invert-0",
              showRadialGradient &&
                "[mask-image:radial-gradient(ellipse_at_100%_0%,black_10%,transparent_70%)]"
            )}
            style={{
              backgroundImage: `
                repeating-linear-gradient(100deg, white 0%, white 7%, transparent 10%, transparent 12%, white 16%),
                repeating-linear-gradient(100deg, #3b82f6 10%, #818cf8 15%, #60a5fa 20%, #c4b5fd 25%, #60a5fa 30%)
              `,
              backgroundSize: '300%, 200%',
              backgroundPosition: '50% 50%, 50% 50%',
            }}
          >
            <div
              className="absolute inset-0 aurora-animate mix-blend-difference"
              style={{
                backgroundImage: `
                  repeating-linear-gradient(100deg, white 0%, white 7%, transparent 10%, transparent 12%, white 16%),
                  repeating-linear-gradient(100deg, #3b82f6 10%, #818cf8 15%, #60a5fa 20%, #c4b5fd 25%, #60a5fa 30%)
                `,
                backgroundSize: '200%, 100%',
                backgroundPosition: '100% 50%, 50% 50%',
              }}
            />
          </div>
        </div>
        {children}
      </div>
    </>
  );
};


