import { NextResponse } from "next/server";
import { createClient } from "../../../lib/supabase/server";
import { createAdminClient } from "../../../lib/supabase/admin";

/**
 * GET /api/site-stats
 *
 * Public read access is intentional because the homepage
 * needs to display these statistics.
 */
export async function GET() {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("site_stats")
      .select("id, label, value")
      .order("id", { ascending: true });

    if (error) {
      console.error("Site stats GET error:", error);

      return NextResponse.json(
        { error: "Failed to load site statistics." },
        { status: 500 }
      );
    }

    return NextResponse.json(data ?? []);
  } catch (error) {
    console.error("Site stats GET exception:", error);

    return NextResponse.json(
      { error: "Failed to load site statistics." },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/site-stats
 *
 * Updates homepage statistics.
 */
export async function PUT(request: Request) {
  try {
    const body = await request.json();

    if (!Array.isArray(body?.stats)) {
      return NextResponse.json(
        { error: "Invalid statistics payload." },
        { status: 400 }
      );
    }

    const updates = body.stats.map((stat: any) => ({
      id: Number(stat.id),
      label: String(stat.label || "").trim(),
      value: Math.max(
        0,
        Math.floor(Number(stat.value) || 0)
      ),
    }));

    for (const stat of updates) {
      if (!stat.id || !stat.label) {
        return NextResponse.json(
          {
            error:
              "Each statistic requires a valid id and label.",
          },
          { status: 400 }
        );
      }
    }

    const supabase = createAdminClient();

    for (const stat of updates) {
      const { error } = await supabase
        .from("site_stats")
        .update({
          label: stat.label,
          value: stat.value,
          updated_at: new Date().toISOString(),
        })
        .eq("id", stat.id);

      if (error) {
        console.error(
          "Site stat update error:",
          error
        );

        return NextResponse.json(
          {
            error: `Failed to update ${stat.label}.`,
          },
          { status: 500 }
        );
      }
    }

    const { data, error } = await supabase
      .from("site_stats")
      .select("id, label, value")
      .order("id", { ascending: true });

    if (error) {
      console.error(
        "Site stats refresh error:",
        error
      );

      return NextResponse.json(
        {
          error:
            "Statistics were updated, but could not be reloaded.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json(data ?? []);
  } catch (error) {
    console.error(
      "Site stats PUT exception:",
      error
    );

    return NextResponse.json(
      {
        error: "Invalid statistics update request.",
      },
      { status: 400 }
    );
  }
}