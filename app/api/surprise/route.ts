import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";

export async function GET() {
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("surprise")
      .select("active")
      .eq("id", 1)
      .single();

    if (error && error.code !== "PGRST116") throw error;

    return NextResponse.json({ active: data?.active ?? false });
  } catch {
    return NextResponse.json({ active: false });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const active = Boolean(body.active);

    const supabase = getSupabase();
    const { error } = await supabase
      .from("surprise")
      .upsert({ id: 1, active }, { onConflict: "id" });

    if (error) throw error;

    return NextResponse.json({ ok: true, active });
  } catch {
    return NextResponse.json({ error: "Failed to update surprise" }, { status: 500 });
  }
}
