export interface Card {
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
