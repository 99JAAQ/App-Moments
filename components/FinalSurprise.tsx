"use client";

import { useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface FinalSurpriseProps {
  show: boolean;
  onDismiss: () => void;
}

const confettiColors = [
  "#fbbf24", "#f59e0b", "#d97706", "#fcd34d", "#fde68a",
  "#ec4899", "#f472b6", "#a78bfa", "#34d399", "#f87171",
];

function generatePieces() {
  return Array.from({ length: 60 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    color: confettiColors[Math.floor(Math.random() * confettiColors.length)],
    delay: Math.random() * 1.5,
    drift: (Math.random() - 0.5) * 200,
    rotation: Math.random() * 720 - 360,
    duration: 2.5 + Math.random() * 2,
  }));
}

export default function FinalSurprise({ show, onDismiss }: FinalSurpriseProps) {
  const pieces = useMemo(() => (show ? generatePieces() : []), [show]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 z-[200] flex items-center justify-center overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6 }}
          onClick={onDismiss}
        >
          <motion.div
            className="absolute inset-0 bg-black/90 backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {pieces.map((p) => (
            <motion.div
              key={p.id}
              className="absolute top-0 w-2 h-2 rounded-full"
              style={{ left: `${p.x}%`, background: p.color }}
              initial={{ y: -20, opacity: 1, x: 0, rotate: 0 }}
              animate={{
                y: "100vh",
                opacity: [1, 1, 0],
                x: p.drift,
                rotate: p.rotation,
              }}
              transition={{
                duration: p.duration,
                delay: p.delay,
                ease: "easeIn",
              }}
            />
          ))}

          <motion.div
            className="relative z-10 text-center px-6"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.8, ease: [0.19, 1, 0.22, 1] }}
          >
            <motion.div
              className="absolute inset-0 rounded-full bg-amber-400/10 blur-3xl"
              animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.5, 0.3] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            />

            <motion.p
              className="text-6xl mb-6"
              animate={{ scale: [1, 1.15, 1] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            >
              💖
            </motion.p>

            <h2 className="text-3xl font-bold text-amber-200 mb-4 shimmer-text">
              Gracias por todo
            </h2>

            <p className="text-amber-300/80 text-base leading-relaxed max-w-sm mx-auto whitespace-pre-line">
              Has descubierto cada rincón de este pequeño universo.
              {"\n\n"}
              Todo esto fue construido con el mismo cariño con el que pienso en ti.
              {"\n\n"}
              Eres mi persona favorita.
            </p>

            <motion.p
              className="text-amber-500/40 text-xs mt-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 2, duration: 0.8 }}
            >
              Toca para continuar
            </motion.p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
