import { NextResponse } from "next/server";
import { createAdminClient } from "../../../../lib/supabase/admin";

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

export async function PUT(
  request: Request,
  context: RouteContext
) {
  try {
    const { id } = await context.params;
    const body = await request.json();

    const supabase = createAdminClient();

    const { data, error } = await supabase
      .from("social_links")
      .update({
        platform: body.platform,
        url: body.url,
        icon: body.icon || null,
        display_order: Number(body.display_order) || 1,
        is_active: body.is_active ?? true,
      })
      .eq("id", Number(id))
      .select()
      .single();

    if (error) {
      console.error("Social links PUT error:", error);

      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Social links PUT error:", error);

    return NextResponse.json(
      { error: "Failed to update social link." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  context: RouteContext
) {
  try {
    const { id } = await context.params;

    const supabase = createAdminClient();

    const { error } = await supabase
      .from("social_links")
      .delete()
      .eq("id", Number(id));

    if (error) {
      console.error("Social links DELETE error:", error);

      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error("Social links DELETE error:", error);

    return NextResponse.json(
      { error: "Failed to delete social link." },
      { status: 500 }
    );
  }
}