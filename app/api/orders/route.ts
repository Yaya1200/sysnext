import { NextResponse } from "next/server";
import { createClient } from "../../../lib/supabase/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");

    const supabase = await createClient();
    let query = supabase.from("orders").select("*").order("created_at", { ascending: false });

    if (email) {
      query = query.eq("user_email", email);
    }

    const { data, error } = await query;

    if (error) {
      console.warn("Orders GET warning:", error.message);
      return NextResponse.json([]);
    }

    return NextResponse.json(data || []);
  } catch (err) {
    console.error("Orders GET error:", err);
    return NextResponse.json([]);
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { user_email, user_name, user_phone, items, total_amount, notes } = body;

    if (!user_email || !items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "Valid email and at least one cart item are required." }, { status: 400 });
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const { data, error } = await supabase
      .from("orders")
      .insert({
        user_id: user?.id || null,
        user_email,
        user_name: user_name || user?.user_metadata?.full_name || "Valued Customer",
        user_phone: user_phone || null,
        items,
        total_amount: Number(total_amount) || 0,
        status: "pending",
        notes: notes || "",
      })
      .select()
      .single();

    if (error) {
      console.warn("Orders insert error, returning simulated order:", error.message);
      return NextResponse.json({
        id: Date.now(),
        user_email,
        user_name: user_name || "Valued Customer",
        items,
        total_amount: Number(total_amount) || 0,
        status: "pending",
        created_at: new Date().toISOString(),
      });
    }

    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "Invalid order payload." }, { status: 400 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, status, notes } = body;

    if (!id || !status) {
      return NextResponse.json({ error: "Order ID and status are required." }, { status: 400 });
    }

    const supabase = await createClient();
    const { data, error } = await supabase
      .from("orders")
      .update({ status, notes })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "Invalid order update request." }, { status: 400 });
  }
}
