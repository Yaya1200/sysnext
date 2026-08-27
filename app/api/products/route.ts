import { NextResponse } from "next/server";
import { createClient } from "../../../lib/supabase/server";

export async function GET() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select("id, name, price, image, category")
    .order("id");

  if (error) {
    console.error("Product query failed", error);
    return NextResponse.json({ error: "Unable to load products." }, { status: 500 });
  }

  return NextResponse.json(data);
}
