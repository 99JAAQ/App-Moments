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

const starData = Array.from({ length: 30 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  delay: Math.random() * 1.5,
  size: 4 + Math.random() * 8,
  drift: (Math.random() - 0.5) * 120,
  duration: 1.5 + Math.random() * 2,
}));

function StarRain({ show }: { show: boolean }) {
  return (
    <AnimatePresence>
      {show && (
        <div className="w-full h-full pointer-events-none overflow-hidden" aria-hidden="true">
          {starData.map((s) => (
            <motion.div
              key={s.id}
              className="absolute rounded-full"
              style={{
                left: `${s.x}%`,
                width: s.size,
                height: s.size,
                background: "radial-gradient(circle, #fbbf24, #f59e0b 40%, transparent 70%)",
              }}
              initial={{ y: -20, opacity: 1, x: 0 }}
              animate={{
                y: "105%",
                opacity: [1, 1, 0],
                x: s.drift,
              }}
              exit={{ opacity: 0 }}
              transition={{
                duration: s.duration,
                delay: s.delay,
                ease: "easeIn",
              }}
            />
          ))}
        </div>
      )}
    </AnimatePresence>
  );
}

function Typewriter({ text, onDone }: { text: string; onDone?: () => void }) {
  const [displayed, setDisplayed] = useState("");
  const [done, setDone] = useState(false);
  const [cursor, setCursor] = useState(true);
  const indexRef = useRef(0);

  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect */
    setDisplayed("");
    setDone(false);
    /* eslint-enable react-hooks/set-state-in-effect */
    indexRef.current = 0;
  }, [text]);

  useEffect(() => {
    const interval = setInterval(() => {
      indexRef.current += 1;
      setDisplayed(text.slice(0, indexRef.current));
      if (indexRef.current >= text.length) {
        clearInterval(interval);
        setDone(true);
        onDone?.();
      }
    }, 30);
    return () => clearInterval(interval);
  }, [text, onDone]);

  useEffect(() => {
    const blink = setInterval(() => setCursor((c) => !c), 530);
    return () => clearInterval(blink);
  }, []);

  return (
    <span className="whitespace-pre-line">
      {displayed}
      {!done && (
        <span
          className="inline-block w-0.5 h-4 bg-amber-800 ml-0.5 align-middle transition-opacity"
          style={{ opacity: cursor ? 1 : 0 }}
        />
      )}
    </span>
  );
}

export default function FlipCard({ card, isOpen, onClose, onRevealed }: FlipCardProps) {
  const [flipped, setFlipped] = useState(false);
  const [typingDone, setTypingDone] = useState(false);
  const revealedRef = useRef(false);

  useEffect(() => {
    if (flipped && !revealedRef.current) {
      revealedRef.current = true;
      onRevealed();
    }
  }, [flipped, onRevealed]);

  function handleClose() {
    setFlipped(false);
    setTypingDone(false);
    onClose();
  }

  const isPhoto = card.type === "photo" && card.image;
  const isSpecial = card.type === "necklace";

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

          {isSpecial && flipped && (
            <div className="absolute inset-0 pointer-events-none overflow-hidden z-30">
              <StarRain show={flipped} />
            </div>
          )}

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
              style={{ transformStyle: "preserve-3d", WebkitTransformStyle: "preserve-3d" }}
            >
              <div
                className="absolute inset-0 rounded-2xl bg-gradient-to-br from-amber-900/90 via-amber-800/80 to-amber-950/90 border border-amber-500/30 shadow-2xl shadow-amber-900/20 flex flex-col items-center justify-center p-8 text-center"
                style={{ backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden" }}
              >
                <span className="text-5xl mb-4">{card.emoji}</span>
                <h2 className="text-2xl font-semibold text-amber-100 mb-2 shimmer-text">
                  {card.title}
                </h2>
                <p className="text-amber-300/80 text-sm">{card.subtitle}</p>
                <p className="text-amber-400/50 text-xs mt-6">Toca para voltear</p>
              </div>

              <div
                className="absolute inset-0 rounded-2xl bg-gradient-to-br from-amber-100 via-amber-50 to-amber-100 border border-amber-300/50 shadow-2xl shadow-amber-500/10 flex flex-col items-center p-6 sm:p-8 text-center overflow-hidden"
                style={{ backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
              >
                {isPhoto ? (
                  <Image
                    src={card.image}
                    alt={card.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 90vw, 384px"
                  />
                ) : (
                  <>
                    <span className="text-4xl mb-3 shrink-0">❤️</span>
                    <div
                      className="flex-1 min-h-0 w-full overflow-y-auto px-2"
                      style={{ overscrollBehavior: "contain", WebkitOverflowScrolling: "touch" }}
                    >
                      <p className="text-amber-950 leading-relaxed text-sm italic font-serif whitespace-pre-line pb-2">
                        {flipped ? (
                          <Typewriter text={card.message} onDone={() => setTypingDone(true)} />
                        ) : null}
                      </p>
                    </div>
                    {typingDone && (
                      <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-amber-700/50 text-xs mt-3 shrink-0"
                      >
                        Toca para regresar
                      </motion.p>
                    )}
                  </>
                )}
              </div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
