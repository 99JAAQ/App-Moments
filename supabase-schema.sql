-- Ejecutar en Supabase SQL Editor para crear las tablas

CREATE TABLE IF NOT EXISTS cards (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL DEFAULT '',
  subtitle TEXT DEFAULT '',
  message TEXT DEFAULT '',
  unlocked BOOLEAN DEFAULT false,
  unlock_date TEXT DEFAULT '',
  type TEXT DEFAULT 'standard',
  emoji TEXT DEFAULT '💌',
  image TEXT DEFAULT ''
);

INSERT INTO cards (id, title, subtitle, message, unlocked, unlock_date, type, emoji, image) VALUES
('necklace', 'Tu Regalo', 'Toca para revelar',
  'Cuando vi este collar pensé que sería bonito que te acompañara incluso cuando yo no pueda hacerlo.\n\nNo es el valor del regalo lo que importa, sino el significado que quiero darle.\n\nGracias por cada detalle, por tu tiempo y por permitirme conocerte un poco más cada día.',
  TRUE, '', 'necklace', '💎', ''),
('memory-1', 'Un secreto...', '',
  'Todavía recuerdo las mariposas cuando te vi llegar. El mundo se detuvo y nada más importaba, solo tú.',
  FALSE, '', 'standard', '🌹', ''),
('memory-2', 'Algo nuestro', '',
  'Cada letra me recuerda a ti. Cada nota lleva un pedacito de nuestra historia de amor que solo nosotros entendemos.',
  FALSE, '', 'standard', '🎵', ''),
('memory-3', 'Palabras guardadas', '',
  'Tienes una forma de hacer que los momentos comunes se sientan mágicos. Nunca olvides lo extraordinaria que eres para mí.',
  FALSE, '', 'standard', '💌', ''),
('memory-4', 'Pronto lo sabrás', '',
  'No puedo esperar por todas las aventuras que nos esperan. Cada amanecer a tu lado es un regalo que nunca daré por sentado.',
  FALSE, '', 'standard', '✨', '')
ON CONFLICT (id) DO NOTHING;

CREATE TABLE IF NOT EXISTS surprise (
  id INTEGER PRIMARY KEY DEFAULT 1,
  active BOOLEAN DEFAULT false
);

INSERT INTO surprise (id, active) VALUES (1, false) ON CONFLICT (id) DO NOTHING;
