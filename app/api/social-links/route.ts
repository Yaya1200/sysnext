import { NextResponse } from "next/server";
import { createAdminClient } from "../../../lib/supabase/admin";

export async function GET() {
  try {
    const supabase = createAdminClient();

    const { data, error } = await supabase
      .from("social_links")
      .select("*")
      .order("display_order", { ascending: true });

    if (error) {
      console.error("Social links GET error:", error);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(data || []);
  } catch (error) {
    console.error("Social links GET error:", error);

    return NextResponse.json(
      { error: "Failed to fetch social links." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const supabase = createAdminClient();

    const { data, error } = await supabase
      .from("social_links")
      .insert({
        platform: body.platform,
        url: body.url,
        icon: body.icon || null,
        display_order: Number(body.display_order) || 1,
        is_active: body.is_active ?? true,
      })
      .select()
      .single();

    if (error) {
      console.error("Social links POST error:", error);

      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error("Social links POST error:", error);

    return NextResponse.json(
      { error: "Failed to create social link." },
      { status: 500 }
    );
  }
}