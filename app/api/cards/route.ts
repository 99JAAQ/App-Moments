import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
import fs from "fs";
import path from "path";

export async function GET() {
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("cards")
      .select("*")
      .order("id", { ascending: true });

    if (error) throw error;

    const cards = (data ?? []).map((c) => ({
      id: c.id,
      title: c.title,
      subtitle: c.subtitle,
      message: c.message,
      unlocked: c.unlocked,
      unlockDate: c.unlock_date,
      type: c.type,
      emoji: c.emoji,
      image: c.image,
    }));

    return NextResponse.json(cards);
  } catch {
    try {
      const cardsPath = path.join(process.cwd(), "data", "cards.json");
      const raw = fs.readFileSync(cardsPath, "utf-8");
      return NextResponse.json(JSON.parse(raw));
    } catch {
      return NextResponse.json([], { status: 200 });
    }
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    if (!Array.isArray(body)) {
      return NextResponse.json({ error: "Expected an array of cards" }, { status: 400 });
    }

    const rows = body.map((c: Record<string, unknown>) => ({
      id: c.id,
      title: c.title,
      subtitle: c.subtitle,
      message: c.message,
      unlocked: c.unlocked,
      unlock_date: c.unlockDate,
      type: c.type,
      emoji: c.emoji,
      image: c.image,
    }));

    const supabase = getSupabase();
    const { error } = await supabase.from("cards").upsert(rows, { onConflict: "id" });
    if (error) throw error;

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Failed to save cards" }, { status: 500 });
  }
}
