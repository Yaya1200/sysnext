import { NextResponse } from "next/server";
import { createClient } from "../../../lib/supabase/server";
import { createAdminClient } from "../../../lib/supabase/admin";
import { verifyCaptcha } from "../captcha/route";

export const dynamic = "force-dynamic";

/*
 * GET
 *
 * Normal authenticated users:
 *   → only receive their own messages.
 *
 * Admins:
 *   → receive all messages.
 */
export async function GET(request: Request) {
  try {
    const authClient = await createClient();

    const {
      data: { user },
      error: authError,
    } = await authClient.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized. Please log in." },
        { status: 401 }
      );
    }

    const supabase = createAdminClient();

    /*
     * Check whether this user is an administrator.
     */
    const { data: profile, error: profileError } =
      await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .maybeSingle();

    if (profileError) {
      console.error(
        "Contact profile lookup error:",
        profileError.message
      );

      return NextResponse.json(
        { error: "Could not verify user permissions." },
        { status: 500 }
      );
    }

    const isAdmin = profile?.role === "admin";

    /*
     * Build query.
     */
    let query = supabase
      .from("contact_messages")
      .select("*")
      .order("created_at", { ascending: false });

    /*
     * ADMIN:
     * Can see all messages.
     *
     * MEMBER:
     * Can ONLY see messages belonging to their user ID.
     */
    if (!isAdmin) {
      query = query.eq("user_id", user.id);
    }

    const { data, error } = await query;

    if (error) {
      console.error(
        "Contact messages GET error:",
        error.message
      );

      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(data ?? []);
  } catch (error) {
    console.error(
      "Contact messages GET error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Failed to load contact messages.",
      },
      { status: 500 }
    );
  }
}

/*
 * POST
 *
 * Creates a contact message.
 *
 * If the visitor is logged in:
 *   → save their Supabase user_id.
 *
 * If they are not logged in:
 *   → user_id remains null.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();

    const name =
      typeof body.name === "string"
        ? body.name.trim()
        : "";

    const email =
      typeof body.email === "string"
        ? body.email.trim()
        : "";

    const phone =
      typeof body.phone === "string"
        ? body.phone.trim()
        : null;

    const subject =
      typeof body.subject === "string"
        ? body.subject.trim()
        : "";

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

    /*
     * CAPTCHA validation.
     */
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

    /*
     * Try to identify the logged-in user.
     *
     * We do NOT trust body.user_id.
     */
    let userId: string | null = null;

    try {
      const authClient = await createClient();

      const {
        data: { user },
      } = await authClient.auth.getUser();

      userId = user?.id || null;
    } catch (error) {
      /*
       * Guest contact submissions are allowed.
       * Therefore failure to find an authenticated user
       * does not prevent the contact form from working.
       */
      console.log(
        "No authenticated user for contact submission."
      );
    }

    const supabase = createAdminClient();

    const { data, error } = await supabase
      .from("contact_messages")
      .insert({
        user_id: userId,
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

/*
 * PUT
 *
 * Only administrators can update contact messages.
 */
export async function PUT(request: Request) {
  try {
    const authClient = await createClient();

    const {
      data: { user },
      error: authError,
    } = await authClient.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized. Please log in." },
        { status: 401 }
      );
    }

    const supabase = createAdminClient();

    /*
     * Verify administrator role.
     */
    const { data: profile, error: profileError } =
      await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .maybeSingle();

    if (profileError) {
      return NextResponse.json(
        {
          error:
            "Could not verify user permissions.",
        },
        { status: 500 }
      );
    }

    if (profile?.role !== "admin") {
      return NextResponse.json(
        {
          error:
            "You do not have permission to update messages.",
        },
        { status: 403 }
      );
    }

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

    const updatePayload: Record<
      string,
      unknown
    > = {};

    if (status) {
      updatePayload.status = status;
    }

    if (admin_reply !== undefined) {
      updatePayload.admin_reply = admin_reply;
      updatePayload.replied_at =
        new Date().toISOString();

      if (!status) {
        updatePayload.status =
          "in_progress";
      }
    }

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

/*
 * DELETE
 *
 * Only administrators can delete contact messages.
 */
export async function DELETE(request: Request) {
  try {
    const authClient = await createClient();

    const {
      data: { user },
      error: authError,
    } = await authClient.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized. Please log in." },
        { status: 401 }
      );
    }

    const supabase = createAdminClient();

    /*
     * Verify administrator role.
     */
    const { data: profile, error: profileError } =
      await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .maybeSingle();

    if (profileError) {
      return NextResponse.json(
        {
          error:
            "Could not verify user permissions.",
        },
        { status: 500 }
      );
    }

    if (profile?.role !== "admin") {
      return NextResponse.json(
        {
          error:
            "You do not have permission to delete messages.",
        },
        { status: 403 }
      );
    }

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
        error:
          "Failed to delete message.",
      },
      { status: 500 }
    );
  }
}