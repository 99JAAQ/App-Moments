"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Heart {
  id: number;
  x: number;
  y: number;
  emoji: string;
  drift: number;
  scale: number;
  endY: number;
}

const hearts = ["❤️", "💕", "💗", "💖", "✨", "💛"];

let heartId = 0;

export default function FloatingHearts() {
  const [spawned, setSpawned] = useState<Heart[]>([]);

  const spawnHearts = useCallback((clientX: number, clientY: number) => {
    const newHearts: Heart[] = Array.from({ length: 4 }, () => ({
      id: ++heartId,
      x: clientX,
      y: clientY,
      emoji: hearts[Math.floor(Math.random() * hearts.length)],
      drift: (Math.random() - 0.5) * 80,
      scale: 0.6 + Math.random() * 0.8,
      endY: -120 - Math.random() * 80,
    }));
    setSpawned((prev) => [...prev, ...newHearts]);
  }, []);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      spawnHearts(e.clientX, e.clientY);
    }
    function handleTouch(e: TouchEvent) {
      const touch = e.changedTouches[0];
      if (touch) spawnHearts(touch.clientX, touch.clientY);
    }
    window.addEventListener("click", handleClick);
    window.addEventListener("touchend", handleTouch);
    return () => {
      window.removeEventListener("click", handleClick);
      window.removeEventListener("touchend", handleTouch);
    };
  }, [spawnHearts]);

  return (
    <div className="fixed inset-0 pointer-events-none z-[100]" aria-hidden="true">
      <AnimatePresence>
        {spawned.map((h) => (
          <motion.span
            key={h.id}
            initial={{ opacity: 1, x: 0, y: 0, scale: 0 }}
            animate={{
              opacity: [1, 1, 0],
              x: h.drift,
              y: h.endY,
              scale: h.scale,
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            onAnimationComplete={() =>
              setSpawned((prev) => prev.filter((p) => p.id !== h.id))
            }
            className="absolute text-xl pointer-events-none select-none"
            style={{ left: h.x, top: h.y }}
          >
            {h.emoji}
          </motion.span>
        ))}
      </AnimatePresence>
    </div>
  );
}
