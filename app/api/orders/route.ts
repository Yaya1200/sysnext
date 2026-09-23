import { NextResponse } from "next/server";
import { createClient } from "../../../lib/supabase/server";
import { createAdminClient } from "../../../lib/supabase/admin";

export async function GET(request: Request) {
  try {
    /*
     * Get the currently authenticated Supabase user.
     * We do NOT trust user_id or email supplied by the browser.
     */
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

    /*
     * Admin client is used for the database query.
     * Because the admin client bypasses RLS, we MUST explicitly
     * filter by the authenticated user's ID.
     */
    const supabase = createAdminClient();

    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Orders GET error:", error.message);

      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(data || []);
  } catch (error) {
    console.error("Orders GET error:", error);

    return NextResponse.json(
      { error: "Failed to fetch orders." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    /*
     * Get the authenticated user from Supabase.
     */
    const authClient = await createClient();

    const {
      data: { user },
      error: authError,
    } = await authClient.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized. Please log in before placing an order." },
        { status: 401 }
      );
    }

    const body = await request.json();

    const {
      user_name,
      user_phone,
      items,
      total_amount,
      notes,
    } = body;

    /*
     * Validate the order.
     */
    if (
      !items ||
      !Array.isArray(items) ||
      items.length === 0
    ) {
      return NextResponse.json(
        {
          error:
            "At least one cart item is required.",
        },
        { status: 400 }
      );
    }

    /*
     * IMPORTANT:
     * Do NOT accept user_id or user_email from the browser
     * as the ownership identity.
     *
     * We get the ID and email directly from Supabase Auth.
     */
    const userId = user.id;
    const userEmail = user.email || "";

    if (!userEmail) {
      return NextResponse.json(
        { error: "Authenticated user has no email address." },
        { status: 400 }
      );
    }

    /*
     * Use admin client for the insert.
     */
    const supabase = createAdminClient();

    const { data, error } = await supabase
      .from("orders")
      .insert({
        user_id: userId,
        user_email: userEmail,
        user_name: user_name || "Valued Customer",
        user_phone: user_phone || null,
        items,
        total_amount: Number(total_amount) || 0,
        status: "pending",
        notes: notes || "",
      })
      .select()
      .single();

    if (error) {
      console.error("Orders POST error:", error.message);

      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error("Orders POST error:", error);

    return NextResponse.json(
      { error: "Invalid order payload." },
      { status: 400 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    /*
     * Get authenticated user.
     */
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

    const body = await request.json();

    const { id, status, notes } = body;

    if (!id || !status) {
      return NextResponse.json(
        {
          error:
            "Order ID and status are required.",
        },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    /*
     * IMPORTANT:
     *
     * A normal member should NOT be able to change another
     * user's order simply by sending its ID.
     *
     * Check the user's role first.
     */
    const { data: profile, error: profileError } =
      await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .maybeSingle();

    if (profileError) {
      console.error(
        "Profile lookup error:",
        profileError.message
      );

      return NextResponse.json(
        { error: "Could not verify user permissions." },
        { status: 500 }
      );
    }

    /*
     * Only administrators can update arbitrary orders.
     */
    if (profile?.role !== "admin") {
      return NextResponse.json(
        {
          error:
            "You do not have permission to update orders.",
        },
        { status: 403 }
      );
    }

    const { data, error } = await supabase
      .from("orders")
      .update({
        status,
        notes: notes || "",
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error(
        "Order update error:",
        error.message
      );

      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Order PUT error:", error);

    return NextResponse.json(
      {
        error:
          "Invalid order update request.",
      },
      { status: 400 }
    );
  }
}