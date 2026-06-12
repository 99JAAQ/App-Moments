"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useRef, useEffect } from "react";
import type { Card } from "@/data/cards";
import Image from "next/image";

interface FlipCardProps {
  card: Card;
  isOpen: boolean;
  onClose: () => void;
  onRevealed: () => void;
}

export default function FlipCard({ card, isOpen, onClose, onRevealed }: FlipCardProps) {
  const [flipped, setFlipped] = useState(false);
  const revealedRef = useRef(false);

  useEffect(() => {
    if (flipped && !revealedRef.current) {
      revealedRef.current = true;
      onRevealed();
    }
  }, [flipped, onRevealed]);

  function handleClose() {
    setFlipped(false);
    onClose();
  }

  const isPhoto = card.type === "photo" && card.image;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          onClick={handleClose}
        >
          <motion.div
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          <div
            className="relative w-full max-w-sm max-h-[85vh] aspect-[3/4] cursor-pointer perspective-1000"
            onClick={(e) => {
              e.stopPropagation();
              setFlipped(!flipped);
            }}
          >
            <motion.div
              className="relative w-full h-full preserve-3d"
              animate={{ rotateY: flipped ? 180 : 0 }}
              transition={{ duration: 0.6, ease: [0.19, 1, 0.22, 1] }}
              style={{ transformStyle: "preserve-3d" }}
            >
              <div className="absolute inset-0 backface-hidden rounded-2xl bg-gradient-to-br from-amber-900/90 via-amber-800/80 to-amber-950/90 border border-amber-500/30 shadow-2xl shadow-amber-900/20 flex flex-col items-center justify-center p-8 text-center overflow-hidden">
                {isPhoto ? (
                  <Image
                    src={card.image}
                    alt={card.title}
                    fill
                    className="object-cover rounded-2xl"
                    sizes="(max-width: 640px) 90vw, 384px"
                  />
                ) : (
                  <span className="text-5xl mb-4">{card.emoji}</span>
                )}
                <h2 className={`text-2xl font-semibold text-amber-100 mb-2 relative z-10 ${isPhoto ? "drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]" : "shimmer-text"}`}>
                  {card.title}
                </h2>
                <p className="text-amber-300/80 text-sm relative z-10">{card.subtitle}</p>
                <p className="text-amber-400/50 text-xs mt-6 relative z-10">Toca para voltear</p>
              </div>

              <div
                className="absolute inset-0 backface-hidden rounded-2xl bg-gradient-to-br from-amber-100 via-amber-50 to-amber-100 border border-amber-300/50 shadow-2xl shadow-amber-500/10 flex flex-col items-center justify-center p-8 text-center"
                style={{ transform: "rotateY(180deg)" }}
              >
                <span className="text-4xl mb-3">❤️</span>
                <p className="text-amber-950 leading-relaxed text-sm italic font-serif whitespace-pre-line max-h-[60%] overflow-y-auto px-2">
                  {card.message}
                </p>
                <p className="text-amber-700/50 text-xs mt-8">Toca para regresar</p>
              </div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
