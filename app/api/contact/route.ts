import { NextResponse } from "next/server";
import { createAdminClient } from "../../../lib/supabase/admin";
import { verifyCaptcha } from "../captcha/route";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");

    // Use admin client so the admin dashboard can read
    // contact messages even when RLS blocks public reads.
    const supabase = createAdminClient();

    let query = supabase
      .from("contact_messages")
      .select("*")
      .order("created_at", { ascending: false });

    if (email) {
      query = query.eq("email", email);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Contact messages GET error:", error.message);

      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(data ?? []);
  } catch (error) {
    console.error("Contact messages GET error:", error);

    return NextResponse.json(
      { error: "Failed to load contact messages." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const name =
      typeof body.name === "string" ? body.name.trim() : "";

    const email =
      typeof body.email === "string" ? body.email.trim() : "";

    const phone =
      typeof body.phone === "string" ? body.phone.trim() : null;

    const subject =
      typeof body.subject === "string" ? body.subject.trim() : "";

    const message =
      typeof body.message === "string"
        ? body.message.trim()
        : "";

    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        {
          error:
            "Name, email, subject, and message are required.",
        },
        { status: 400 }
      );
    }

    if (
      !verifyCaptcha(
        body.captchaToken,
        body.captchaAnswer
      )
    ) {
      return NextResponse.json(
        {
          error:
            "Incorrect CAPTCHA answer. Please try again.",
        },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    const { data, error } = await supabase
      .from("contact_messages")
      .insert({
        name,
        email,
        phone,
        subject,
        message,
        status: "new",
      })
      .select()
      .single();

    if (error) {
      console.error(
        "Contact message insert failed:",
        error
      );

      return NextResponse.json(
        {
          error:
            "Unable to save message right now.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      data,
    });
  } catch (error) {
    console.error(
      "Contact message POST error:",
      error
    );

    return NextResponse.json(
      {
        error: "Invalid request payload.",
      },
      { status: 400 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();

    const {
      id,
      status,
      admin_reply,
    } = body;

    if (!id) {
      return NextResponse.json(
        {
          error: "Message ID is required.",
        },
        { status: 400 }
      );
    }

    const updatePayload: Record<string, unknown> = {};

    if (status) {
      updatePayload.status = status;
    }

    if (admin_reply !== undefined) {
      updatePayload.admin_reply = admin_reply;
      updatePayload.replied_at =
        new Date().toISOString();

      if (!status) {
        updatePayload.status = "in_progress";
      }
    }

    const supabase = createAdminClient();

    const { data, error } = await supabase
      .from("contact_messages")
      .update(updatePayload)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error(
        "Contact message update failed:",
        error
      );

      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error(
      "Contact message PUT error:",
      error
    );

    return NextResponse.json(
      {
        error: "Invalid update request.",
      },
      { status: 400 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } =
      new URL(request.url);

    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        {
          error: "Message ID is required.",
        },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    const { error } = await supabase
      .from("contact_messages")
      .delete()
      .eq("id", id);

    if (error) {
      console.error(
        "Contact message delete failed:",
        error
      );

      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
    });
  } catch (error) {
    console.error(
      "Contact message DELETE error:",
      error
    );

    return NextResponse.json(
      {
        error: "Failed to delete message.",
      },
      { status: 500 }
    );
  }
}