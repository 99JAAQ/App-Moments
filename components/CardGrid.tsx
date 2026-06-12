"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import type { Card } from "@/data/cards";
import FlipCard from "@/components/FlipCard";

interface CardGridProps {
  onCardRevealed: (cardId: string) => void;
}

export default function CardGrid({ onCardRevealed }: CardGridProps) {
  const [cards, setCards] = useState<Card[]>([]);
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const selectedCard = cards.find((c) => c.id === selectedCardId) ?? null;

  useEffect(() => {
    const stored = localStorage.getItem("app-experiencia-cards");
    if (stored) {
      try { setCards(JSON.parse(stored)); return; } catch {}
    }
    fetch("/api/cards")
      .then((r) => r.json())
      .then(setCards)
      .catch(() => {});
  }, []);

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 40, scale: 0.95 },
    show: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { duration: 0.5, ease: [0.19, 1, 0.22, 1] as [number, number, number, number] },
    },
  };

  return (
    <>
      <motion.div
        className="grid grid-cols-2 gap-2.5 sm:gap-3 w-full max-w-md px-3 sm:px-4 pb-24 sm:pb-32"
        variants={container}
        initial="hidden"
        animate="show"
      >
        {cards.map((card) => (
          <motion.div
            key={card.id}
            variants={item}
            className={`relative rounded-2xl overflow-hidden cursor-pointer
              ${card.type === "necklace" ? "col-span-2" : "col-span-1"}
              ${card.unlocked ? "active-card" : "locked-card"}
            `}
            onClick={() => card.unlocked && setSelectedCardId(card.id)}
          >
            <div
              className={`
                relative flex flex-col items-center justify-center p-4 sm:p-5 text-center
                border border-amber-500/20 rounded-2xl h-full min-h-[140px] sm:min-h-[160px]
                ${card.type === "necklace" ? "min-h-[100px] sm:min-h-[120px]" : "min-h-[140px] sm:min-h-[160px]"}
                ${
                  card.unlocked
                    ? "bg-gradient-to-br from-amber-900/60 via-amber-900/40 to-zinc-900/90 backdrop-blur-sm hover:border-amber-400/40 transition-colors duration-300"
                    : "bg-zinc-900/60 backdrop-blur-sm"
                }
              `}
            >
              <span className="text-3xl mb-2 relative z-10">{card.emoji}</span>
              <h3
                className={`font-semibold text-sm relative z-10 ${
                  card.unlocked ? "text-amber-100 shimmer-text" : "text-zinc-500"
                }`}
              >
                {card.title}
              </h3>
              {card.unlocked && card.subtitle && (
                <p className="text-xs text-zinc-500 mt-1 relative z-10">{card.subtitle}</p>
              )}

              {!card.unlocked && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-2xl z-20">
                  <div className="flex flex-col items-center gap-1">
                    <svg
                      className="w-6 h-6 text-zinc-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={1.5}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"
                      />
                    </svg>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </motion.div>

      {selectedCard && (
        <FlipCard
          card={selectedCard}
          isOpen={true}
          onClose={() => setSelectedCardId(null)}
          onRevealed={() => onCardRevealed(selectedCard.id)}
        />
      )}
    </>
  );
}
