"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import CardGrid from "@/components/CardGrid";
import FloatingHearts from "@/components/FloatingHearts";
import FinalSurprise from "@/components/FinalSurprise";

const STORAGE_KEY = "app-experiencia-revealed";

const welcomeLines = [
  "Bienvenida, mi amor",
  "Hay regalos que se compran.",
  "Y otros que se construyen.",
  "Este último es para ti.",
];

function generateParticleStyles() {
  return Array.from({ length: 20 }, () => ({
    left: `${Math.random() * 100}%`,
    delay: `${Math.random() * 8}s`,
    duration: `${6 + Math.random() * 8}s`,
  }));
}

function loadRevealedFromStorage(): Set<string> {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return new Set(JSON.parse(stored));
  } catch {}
  return new Set();
}

export default function Home() {
  const [currentLine, setCurrentLine] = useState(0);
  const [showButton, setShowButton] = useState(false);
  const [entered, setEntered] = useState(false);
  const [showSurprise, setShowSurprise] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [particleStyles, setParticleStyles] = useState<{ left: string; delay: string; duration: string }[]>([]);
  const surpriseCheckedRef = useRef(false);
  const lineDoneRef = useRef(false);
  const revealedRef = useRef<Set<string>>(loadRevealedFromStorage());

  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect */
    setMounted(true);
    setParticleStyles(generateParticleStyles());
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);

  const handleCardRevealed = useCallback((cardId: string) => {
    if (revealedRef.current.has(cardId)) return;
    const next = new Set(revealedRef.current);
    next.add(cardId);
    revealedRef.current = next;
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...next]));
  }, []);

  const handleLineComplete = useCallback(() => {
    if (lineDoneRef.current) return;
    lineDoneRef.current = true;
    if (currentLine < welcomeLines.length - 1) {
      setCurrentLine((c) => {
        lineDoneRef.current = false;
        return c + 1;
      });
    } else {
      setShowButton(true);
    }
  }, [currentLine]);

  function handleEnter() {
    if (!surpriseCheckedRef.current) {
      surpriseCheckedRef.current = true;
      fetch("/api/surprise")
        .then((r) => r.json())
        .then((data) => {
          if (data.active) setShowSurprise(true);
        })
        .catch(() => {});
    }
    setEntered(true);
  }

  return (
    <div className="relative min-h-[100dvh] flex flex-col items-center justify-center overflow-hidden bg-gradient-to-b from-[#0a0a0f] via-[#0d0d15] to-[#0a0a0f]">
      <div className="stars" />
      <div className="stars2" />
      <div className="stars3" />

      <div className="particles" aria-hidden="true">
        {mounted && particleStyles.map((p, i) => (
          <span
            key={i}
            className="particle"
            style={{
              left: p.left,
              animationDelay: p.delay,
              animationDuration: p.duration,
            }}
          />
        ))}
      </div>

      <FloatingHearts />

      <AnimatePresence mode="wait">
        {!entered ? (
          <motion.div
            key="welcome"
            className="flex flex-col items-center gap-6 sm:gap-8 z-10 px-4 sm:px-6"
            exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.4 } }}
          >
            <div className="flex flex-col items-center gap-3 sm:gap-4 min-h-[160px] sm:min-h-[180px]">
              {welcomeLines.map((line, i) => (
                <AnimatePresence key={line}>
                  {i <= currentLine && (
                    <motion.p
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{
                        duration: 0.6,
                        ease: [0.19, 1, 0.22, 1],
                      }}
                      onAnimationComplete={
                        i === currentLine ? handleLineComplete : undefined
                      }
                      className={`text-center ${
                        i === 0
                          ? "text-2xl sm:text-3xl font-semibold text-amber-200"
                          : i === 1
                            ? "text-base sm:text-lg text-amber-300/80"
                            : "text-sm sm:text-base text-amber-400/60"
                      }`}
                    >
                      {line}
                    </motion.p>
                  )}
                </AnimatePresence>
              ))}
            </div>

            <AnimatePresence>
              {showButton && (
                <motion.div className="flex flex-col items-center gap-3">
                  <div className="relative">
                    <motion.div
                      className="absolute inset-0 rounded-full bg-amber-400/20 blur-xl"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: [0, 1, 0], scale: [0.8, 1.5, 1.8] }}
                      transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                    />
                    <motion.button
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.4, ease: [0.19, 1, 0.22, 1] }}
                      whileHover={{ scale: 1.04 }}
                      whileTap={{ scale: 0.96 }}
                      onClick={handleEnter}
                      className="relative px-10 sm:px-12 py-3.5 sm:py-4 rounded-full bg-gradient-to-b from-amber-400 to-amber-600 text-zinc-900 font-bold text-base sm:text-lg tracking-wider shadow-[0_0_60px_rgba(251,191,36,0.2)] hover:shadow-[0_0_80px_rgba(251,191,36,0.35)] transition-shadow duration-500 overflow-hidden"
                    >
                      <span className="absolute inset-0 rounded-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-[shimmer-btn_2s_infinite]" />
                      <span className="relative flex items-center gap-2">
                        ✦ Entrar ✦
                      </span>
                    </motion.button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ) : (
          <motion.div
            key="cards"
            className="flex flex-col items-center w-full pt-12 sm:pt-16"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <motion.h2
              className="text-xs sm:text-sm font-medium text-amber-400/60 tracking-widest uppercase mb-4 sm:mb-6"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.4 }}
            >
              Tus Cartas
            </motion.h2>
            <CardGrid onCardRevealed={handleCardRevealed} />
          </motion.div>
        )}
      </AnimatePresence>

      <FinalSurprise
        show={showSurprise}
        onDismiss={() => setShowSurprise(false)}
      />
    </div>
  );
}
