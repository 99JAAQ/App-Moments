"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

interface AdminCard {
  id: string;
  title: string;
  subtitle: string;
  message: string;
  unlocked: boolean;
  unlockDate: string;
  type: "necklace" | "standard" | "photo";
  emoji: string;
  image: string;
}

const COMMON_EMOJIS = ["💎", "🌹", "🎵", "💌", "✨", "💖", "🌙", "🦋", "🎀", "🕯️", "🌟", "💫", "🎁", "🧸", "📸"];

const emptyCard = (): AdminCard => ({
  id: String(Date.now()),
  title: "",
  subtitle: "",
  message: "",
  unlocked: false,
  unlockDate: "",
  type: "standard",
  emoji: "💌",
  image: "",
});

function MiniPreview({ card }: { card: AdminCard }) {
  const isPhoto = card.type === "photo" && card.image;
  return (
    <div className={`relative w-28 h-36 rounded-xl overflow-hidden border shrink-0 ${card.unlocked ? "border-amber-500/40 bg-gradient-to-br from-amber-900/60 via-amber-900/30 to-zinc-900" : "border-zinc-700 bg-zinc-900/60"}`}>
      {isPhoto ? (
        <Image src={card.image} alt="" fill className="object-cover opacity-50" sizes="112px" />
      ) : null}
      <div className="absolute inset-0 flex flex-col items-center justify-center p-2 text-center gap-1">
        <span className="text-lg">{card.emoji || "💌"}</span>
        <span className={`text-[10px] font-medium leading-tight ${card.unlocked ? "text-amber-200" : "text-zinc-500"}`}>
          {card.title || "Sin título"}
        </span>
      </div>
      {!card.unlocked && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/30">
          <svg className="w-4 h-4 text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
          </svg>
        </div>
      )}
    </div>
  );
}

export default function AdminPage() {
  const [cards, setCards] = useState<AdminCard[]>([]);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState("");
  const [surpriseActive, setSurpriseActive] = useState(false);
  const [uploading, setUploading] = useState<string | null>(null);
  const [expandedCard, setExpandedCard] = useState<string | null>(null);
  const fileInputRefs = useRef<Map<string, HTMLInputElement>>(new Map());

  useEffect(() => {
    fetch("/api/cards")
      .then((r) => r.json())
      .then(setCards)
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetch("/api/surprise")
      .then((r) => r.json())
      .then((d: { active: boolean }) => setSurpriseActive(d.active))
      .catch(() => {});
  }, []);

  async function handleFileUpload(cardId: string, e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(cardId);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      if (res.ok) {
        const data = await res.json();
        updateCard(cardId, "image", data.path);
        setStatus("✓ Foto subida");
      } else {
        setStatus("✗ Error al subir");
      }
    } catch {
      setStatus("✗ Error al subir");
    }
    setUploading(null);
    setTimeout(() => setStatus(""), 3000);
    e.target.value = "";
  }

  async function toggleSurprise() {
    setSaving(true);
    const newVal = !surpriseActive;
    const res = await fetch("/api/surprise", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: newVal }),
    });
    if (res.ok) {
      setSurpriseActive(newVal);
      setStatus(newVal ? "✓ Sorpresa activada" : "✓ Sorpresa desactivada");
    } else {
      setStatus("✗ Error");
    }
    setSaving(false);
    setTimeout(() => setStatus(""), 3000);
  }

  async function save(allCards: AdminCard[]) {
    setSaving(true);
    setStatus("Guardando...");
    const res = await fetch("/api/cards", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(allCards),
    });
    if (res.ok) {
      setStatus("✓ Guardado");
      setCards(allCards);
    } else {
      setStatus("✗ Error al guardar");
    }
    setSaving(false);
    setTimeout(() => setStatus(""), 3000);
  }

  function updateCard(id: string, field: keyof AdminCard, value: string | boolean) {
    setCards((prev) => prev.map((c) => (c.id === id ? { ...c, [field]: value } : c)));
  }

  function addCard() {
    setCards((prev) => [...prev, emptyCard()]);
  }

  function deleteCard(id: string) {
    save(cards.filter((c) => c.id !== id));
  }

  const unlockedCount = cards.filter((c) => c.unlocked).length;

  return (
    <div className="min-h-[100dvh] bg-gradient-to-b from-zinc-950 via-zinc-950 to-zinc-900 font-sans">
      <AnimatePresence>
        {status && (
          <motion.div
            initial={{ opacity: 0, y: -40, x: "-50%" }}
            animate={{ opacity: 1, y: 0, x: "-50%" }}
            exit={{ opacity: 0, y: -20, x: "-50%" }}
            className={`fixed top-4 sm:top-6 left-1/2 z-50 px-5 sm:px-6 py-2.5 sm:py-3 rounded-full text-xs sm:text-sm font-medium shadow-lg backdrop-blur-md border ${
              status.startsWith("✓")
                ? "bg-emerald-900/60 text-emerald-300 border-emerald-500/30"
                : status.startsWith("✗")
                  ? "bg-red-900/60 text-red-300 border-red-500/30"
                  : "bg-zinc-800/80 text-zinc-300 border-zinc-700/50"
            }`}
          >
            {status}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 sm:mb-10">
          <div>
            <p className="text-[10px] sm:text-xs text-amber-500/60 tracking-[0.2em] uppercase mb-2">
              Panel de administración
            </p>
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Tus Cartas
              <span className="ml-3 text-sm font-normal text-zinc-500">
                {cards.length} {cards.length === 1 ? "carta" : "cartas"}
                <span className="mx-1.5 text-zinc-700">·</span>
                {unlockedCount} desbloqueada{unlockedCount !== 1 ? "s" : ""}
              </span>
            </h1>
          </div>
          <div className="flex items-center gap-2 sm:gap-2.5">
            <button
              onClick={toggleSurprise}
              disabled={saving}
              className={`relative px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl font-semibold text-xs sm:text-sm transition-all duration-300 disabled:opacity-50 ${
                surpriseActive
                  ? "bg-pink-600/90 text-white shadow-lg shadow-pink-500/20 hover:bg-pink-500"
                  : "bg-white/5 text-zinc-400 border border-white/10 hover:border-white/20 hover:text-zinc-200"
              }`}
            >
              {surpriseActive ? (
                <span className="flex items-center gap-1.5 sm:gap-2">💖 Sorpresa activa</span>
              ) : (
                <span className="flex items-center gap-1.5 sm:gap-2">✨ Activar sorpresa</span>
              )}
            </button>
            <button
              onClick={addCard}
              className="px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl bg-amber-500 text-zinc-900 font-semibold text-xs sm:text-sm hover:bg-amber-400 active:scale-[0.97] transition-all duration-200 shadow-lg shadow-amber-500/20"
            >
              + Nueva
            </button>
          </div>
        </div>

        {cards.length === 0 && (
          <div className="text-center py-24 text-zinc-600">
            <p className="text-5xl mb-4">💌</p>
            <p className="text-lg font-medium text-zinc-500">No hay cartas aún</p>
            <p className="text-sm mt-1 text-zinc-700">Crea la primera con el botón de arriba</p>
          </div>
        )}

        <div className="space-y-3 sm:space-y-4">
          {cards.map((card, index) => {
            const isExpanded = expandedCard === card.id;
            const isPhoto = card.type === "photo";

            return (
              <motion.div
                key={card.id}
                layout
                className={`rounded-xl sm:rounded-2xl border transition-colors duration-300 ${
                  card.unlocked
                    ? "border-amber-500/20 bg-gradient-to-br from-amber-500/5 via-transparent to-transparent hover:border-amber-500/30"
                    : "border-zinc-800 bg-zinc-900/40 hover:border-zinc-700"
                }`}
              >
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => setExpandedCard(isExpanded ? null : card.id)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setExpandedCard(isExpanded ? null : card.id);
                    }
                  }}
                  className="w-full flex items-center gap-3 sm:gap-4 p-4 sm:p-5 text-left cursor-pointer"
                >
                  <span className="text-[10px] sm:text-xs text-zinc-600 font-mono w-5 sm:w-6 shrink-0">
                    #{index + 1}
                  </span>

                  <MiniPreview card={card} />

                  <div className="flex-1 min-w-0">
                    <h3 className={`text-sm sm:text-base font-semibold truncate ${card.unlocked ? "text-zinc-100" : "text-zinc-500"}`}>
                      {card.title || "Sin título"}
                    </h3>
                    <p className="text-[10px] sm:text-xs text-zinc-600 mt-0.5 flex items-center gap-1.5 sm:gap-2 flex-wrap">
                      <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-medium ${
                        card.type === "photo" ? "bg-purple-500/10 text-purple-400" :
                        card.type === "necklace" ? "bg-amber-500/10 text-amber-400" :
                        "bg-zinc-800 text-zinc-500"
                      }`}>
                        {card.type === "photo" ? "📸 Momento" : card.type === "necklace" ? "💎 Especial" : "📝 Carta"}
                      </span>
                      {card.unlocked ? (
                        <span className="text-emerald-600">Desbloqueada</span>
                      ) : (
                        <span className="text-zinc-600">Bloqueada</span>
                      )}
                    </p>
                  </div>

                  <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => save(cards.map((c) => c.id === card.id ? { ...c, unlocked: !c.unlocked } : c))}
                      className={`p-1.5 sm:p-2 rounded-lg text-xs font-medium transition-colors ${
                        card.unlocked
                          ? "bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20"
                          : "bg-zinc-800 text-zinc-600 hover:bg-zinc-700 hover:text-zinc-400"
                      }`}
                    >
                      {card.unlocked ? "🔓" : "🔒"}
                    </button>
                    <button
                      onClick={() => deleteCard(card.id)}
                      className="p-1.5 sm:p-2 rounded-lg bg-transparent text-zinc-700 hover:bg-red-500/10 hover:text-red-400 transition-colors"
                    >
                      <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                    <motion.svg
                      animate={{ rotate: isExpanded ? 180 : 0 }}
                      className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-zinc-600 ml-0.5 sm:ml-1"
                      fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </motion.svg>
                  </div>
                </div>

                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: [0.19, 1, 0.22, 1] }}
                      className="overflow-hidden"
                    >
                      <div className="px-4 sm:px-5 pb-4 sm:pb-5 border-t border-zinc-800/50">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
                          <div>
                            <label className="block text-[10px] sm:text-[11px] font-medium text-zinc-500 uppercase tracking-wider mb-1.5">
                              Tipo de carta
                            </label>
                            <select
                              className="w-full bg-zinc-800/60 border border-zinc-700 rounded-xl px-3 sm:px-3.5 py-2 sm:py-2.5 text-sm text-zinc-200 focus:border-amber-400/50 focus:ring-1 focus:ring-amber-400/20 outline-none transition-all appearance-none"
                              value={card.type}
                              onChange={(e) => updateCard(card.id, "type", e.target.value)}
                            >
                              <option value="standard">📝 Carta estándar</option>
                              <option value="necklace">💎 Carta especial</option>
                              <option value="photo">📸 Momento (con foto)</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-[10px] sm:text-[11px] font-medium text-zinc-500 uppercase tracking-wider mb-1.5">
                              Emoji
                            </label>
                            <div className="flex gap-2 items-center flex-wrap">
                              <input
                                className="w-14 sm:w-16 text-center bg-zinc-800/60 border border-zinc-700 rounded-xl px-2 py-2 sm:py-2.5 text-base sm:text-lg focus:border-amber-400/50 outline-none transition-all"
                                value={card.emoji}
                                onChange={(e) => updateCard(card.id, "emoji", e.target.value)}
                                maxLength={4}
                              />
                              <div className="flex gap-1 flex-wrap">
                                {COMMON_EMOJIS.map((e) => (
                                  <button
                                    key={e}
                                    onClick={() => updateCard(card.id, "emoji", e)}
                                    className={`p-1.5 rounded-lg text-sm transition-colors ${
                                      card.emoji === e ? "bg-amber-500/20 ring-1 ring-amber-400/30" : "bg-zinc-800/40 hover:bg-zinc-700/50"
                                    }`}
                                  >
                                    {e}
                                  </button>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                          <div>
                            <label className="block text-[10px] sm:text-[11px] font-medium text-zinc-500 uppercase tracking-wider mb-1.5">
                              Título
                            </label>
                            <input
                              className="w-full bg-zinc-800/60 border border-zinc-700 rounded-xl px-3 sm:px-3.5 py-2 sm:py-2.5 text-sm text-zinc-200 placeholder:text-zinc-600 focus:border-amber-400/50 focus:ring-1 focus:ring-amber-400/20 outline-none transition-all"
                              value={card.title}
                              onChange={(e) => updateCard(card.id, "title", e.target.value)}
                              placeholder="Título de la carta"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] sm:text-[11px] font-medium text-zinc-500 uppercase tracking-wider mb-1.5">
                              Subtítulo
                            </label>
                            <input
                              className="w-full bg-zinc-800/60 border border-zinc-700 rounded-xl px-3 sm:px-3.5 py-2 sm:py-2.5 text-sm text-zinc-200 placeholder:text-zinc-600 focus:border-amber-400/50 focus:ring-1 focus:ring-amber-400/20 outline-none transition-all"
                              value={card.subtitle}
                              onChange={(e) => updateCard(card.id, "subtitle", e.target.value)}
                              placeholder="Texto secundario"
                            />
                          </div>
                        </div>

                        {isPhoto && (
                          <div className="mt-3">
                            <label className="block text-[10px] sm:text-[11px] font-medium text-zinc-500 uppercase tracking-wider mb-1.5">
                              Foto
                            </label>
                            <div className="flex items-center gap-2">
                              <input
                                className="flex-1 bg-zinc-800/60 border border-zinc-700 rounded-xl px-3 sm:px-3.5 py-2 sm:py-2.5 text-sm text-zinc-200 placeholder:text-zinc-600 focus:border-amber-400/50 outline-none transition-all"
                                value={card.image}
                                onChange={(e) => updateCard(card.id, "image", e.target.value)}
                                placeholder="/fotos/mi-foto.jpg"
                              />
                              <input
                                ref={(el) => {
                                  if (el) fileInputRefs.current.set(card.id, el);
                                  else fileInputRefs.current.delete(card.id);
                                }}
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => handleFileUpload(card.id, e)}
                              />
                              <button
                                onClick={() => fileInputRefs.current.get(card.id)?.click()}
                                disabled={uploading === card.id}
                                className="shrink-0 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-zinc-800 border border-zinc-700 text-xs sm:text-sm text-zinc-400 hover:border-zinc-500 hover:text-zinc-200 disabled:opacity-50 transition-all flex items-center gap-1.5"
                              >
                                {uploading === card.id ? (
                                  <>⏳ Subiendo...</>
                                ) : (
                                  <>📁 Elegir</>
                                )}
                              </button>
                            </div>
                          </div>
                        )}

                        <div className="mt-3">
                          <label className="block text-[10px] sm:text-[11px] font-medium text-zinc-500 uppercase tracking-wider mb-1.5">
                            Mensaje (aparece al voltear)
                          </label>
                          <textarea
                            className="w-full bg-zinc-800/60 border border-zinc-700 rounded-xl px-3 sm:px-3.5 py-2.5 sm:py-3 text-sm text-zinc-200 placeholder:text-zinc-600 focus:border-amber-400/50 focus:ring-1 focus:ring-amber-400/20 outline-none transition-all resize-none"
                            rows={4}
                            value={card.message}
                            onChange={(e) => updateCard(card.id, "message", e.target.value)}
                            placeholder="Escribe el mensaje romántico..."
                          />
                          <p className="text-[10px] text-zinc-600 mt-1 text-right">
                            Usa Enter para separar párrafos
                          </p>
                        </div>

                        <div className="flex items-center justify-between mt-4 pt-4 border-t border-zinc-800/50">
                          <button
                            onClick={() => setExpandedCard(null)}
                            className="text-xs text-zinc-600 hover:text-zinc-400 transition-colors"
                          >
                            Cerrar
                          </button>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => deleteCard(card.id)}
                              className="px-3 sm:px-4 py-2 rounded-xl text-xs text-red-400 hover:bg-red-500/10 transition-colors"
                            >
                              Eliminar
                            </button>
                            <button
                              onClick={() => save(cards)}
                              disabled={saving}
                              className="px-5 sm:px-6 py-2 rounded-xl bg-amber-500 text-zinc-900 font-semibold text-xs sm:text-sm hover:bg-amber-400 active:scale-[0.97] disabled:opacity-50 transition-all shadow-lg shadow-amber-500/10"
                            >
                              {saving ? "Guardando..." : "Guardar"}
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>

        {cards.length > 0 && (
          <div className="flex justify-center mt-8 pb-12">
            <button
              onClick={() => save(cards)}
              disabled={saving}
              className="px-8 sm:px-10 py-3 rounded-full bg-amber-500 text-zinc-900 font-bold text-sm sm:text-base hover:bg-amber-400 active:scale-[0.97] disabled:opacity-50 transition-all shadow-xl shadow-amber-500/20 flex items-center gap-2"
            >
              {saving ? (
                <>⏳ Guardando cambios...</>
              ) : (
                <>💾 Guardar todos los cambios</>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
