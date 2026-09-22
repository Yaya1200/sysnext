import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

type AnalyticsEvent = {
  event_type:
    | "page_view"
    | "button_click"
    | "link_click"
    | "product_view"
    | "add_to_cart"
    | "checkout_start"
    | "contact_click"
    | "phone_click"
    | "email_click";

  event_name?: string | null;
  page_path?: string | null;
  page_title?: string | null;
  element_text?: string | null;
  element_id?: string | null;
  element_href?: string | null;
  visitor_id?: string | null;
  session_id?: string | null;
  device_type?: string | null;
  browser?: string | null;
  operating_system?: string | null;
  referrer?: string | null;
  metadata?: Record<string, unknown> | null;
};

const VALID_EVENT_TYPES = new Set([
  "page_view",
  "button_click",
  "link_click",
  "product_view",
  "add_to_cart",
  "checkout_start",
  "contact_click",
  "phone_click",
  "email_click",
]);

function isAdminPath(path: string | null | undefined) {
  if (!path) return false;

  return (
    path === "/admin" ||
    path.startsWith("/admin/")
  );
}

function normalizeReferrer(
  referrer: string | null,
  origin: string
) {
  if (!referrer) {
    return "Direct";
  }

  try {
    const url = new URL(referrer);

    if (url.origin === origin) {
      return null;
    }

    return url.hostname;
  } catch {
    return null;
  }
}

/*
 * ----------------------------------------
 * POST /api/analytics
 * ----------------------------------------
 *
 * Receives analytics events from the
 * public website and stores them in
 * analytics_events.
 */
export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as AnalyticsEvent;

    /*
     * Validate event type.
     */
    if (
      !body.event_type ||
      !VALID_EVENT_TYPES.has(body.event_type)
    ) {
      return NextResponse.json(
        {
          error: "Invalid analytics event type.",
        },
        { status: 400 }
      );
    }

    /*
     * Never collect admin activity.
     */
    if (isAdminPath(body.page_path)) {
      return NextResponse.json({
        success: true,
        ignored: true,
      });
    }

    const supabase = createAdminClient();

    const { error } = await supabase
      .from("analytics_events")
      .insert({
        event_type: body.event_type,
        event_name: body.event_name ?? null,

        page_path: body.page_path ?? null,
        page_title: body.page_title ?? null,

        element_text: body.element_text ?? null,
        element_id: body.element_id ?? null,
        element_href: body.element_href ?? null,

        visitor_id: body.visitor_id ?? null,
        session_id: body.session_id ?? null,

        device_type: body.device_type ?? null,
        browser: body.browser ?? null,
        operating_system:
          body.operating_system ?? null,

        referrer: body.referrer ?? null,

        metadata: body.metadata ?? null,
      });

    if (error) {
      console.error(
        "Analytics insert error:",
        error
      );

      return NextResponse.json(
        {
          error: "Failed to save analytics event.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error(
      "Analytics POST error:",
      error
    );

    return NextResponse.json(
      {
        error: "Invalid analytics request.",
      },
      { status: 400 }
    );
  }
}

/*
 * ----------------------------------------
 * GET /api/analytics
 * ----------------------------------------
 *
 * Loads analytics data for the admin
 * dashboard.
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = createAdminClient();

    const { data, error } = await supabase
      .from("analytics_events")
      .select(`
        event_type,
        event_name,
        page_path,
        page_title,
        element_text,
        element_id,
        element_href,
        visitor_id,
        session_id,
        device_type,
        browser,
        operating_system,
        referrer,
        created_at
      `)
      .order("created_at", {
        ascending: false,
      })
      .limit(10000);

    if (error) {
      console.error(
        "Analytics database error:",
        error
      );

      return NextResponse.json(
        {
          error: "Failed to load analytics.",
        },
        { status: 500 }
      );
    }

    /*
     * Remove admin activity.
     */
    const events = (data ?? []).filter(
      (event) => !isAdminPath(event.page_path)
    );

    /*
     * Page views.
     */
    const pageViews = events.filter(
      (event) =>
        event.event_type === "page_view"
    );

    /*
     * Everything except page views is
     * considered an interaction/click.
     */
    const clicks = events.filter(
      (event) =>
        event.event_type !== "page_view"
    );

    /*
     * ----------------------------------------
     * UNIQUE VISITORS
     * ----------------------------------------
     */

    const visitorIds = new Set(
      pageViews
        .map((event) => event.visitor_id)
        .filter(Boolean)
    );

    /*
     * ----------------------------------------
     * SESSIONS
     * ----------------------------------------
     */

    const sessionIds = new Set(
      pageViews
        .map((event) => event.session_id)
        .filter(Boolean)
    );

    /*
     * ----------------------------------------
     * TOP PAGES
     * ----------------------------------------
     */

    const pageCounts = new Map<
      string,
      number
    >();

    for (const event of pageViews) {
      if (!event.page_path) continue;

      pageCounts.set(
        event.page_path,
        (pageCounts.get(event.page_path) ?? 0) + 1
      );
    }

    const topPages = Array.from(
      pageCounts.entries()
    )
      .map(([page_path, views]) => ({
        page_path,
        views,
      }))
      .sort((a, b) => b.views - a.views)
      .slice(0, 10);

    /*
     * ----------------------------------------
     * TOP CLICKS
     * ----------------------------------------
     */

    const clickCounts = new Map<
      string,
      {
        element_text: string;
        element_href: string | null;
        page_path: string;
        clicks: number;
      }
    >();

    for (const event of clicks) {
      const text =
        event.element_text?.trim() ||
        event.event_name ||
        "Unknown";

      const pagePath =
        event.page_path || "/";

      const key = [
        text.toLowerCase(),
        event.element_href ?? "",
        pagePath,
      ].join("|");

      const existing = clickCounts.get(key);

      if (existing) {
        existing.clicks += 1;
      } else {
        clickCounts.set(key, {
          element_text: text,
          element_href:
            event.element_href,
          page_path: pagePath,
          clicks: 1,
        });
      }
    }

    const topClicks = Array.from(
      clickCounts.values()
    )
      .sort((a, b) => b.clicks - a.clicks)
      .slice(0, 10);

    /*
     * ----------------------------------------
     * DEVICES
     * ----------------------------------------
     */

    const deviceCounts = new Map<
      string,
      number
    >();

    for (const event of pageViews) {
      if (!event.device_type) continue;

      deviceCounts.set(
        event.device_type,
        (deviceCounts.get(event.device_type) ?? 0) + 1
      );
    }

    const devices = Array.from(
      deviceCounts.entries()
    )
      .map(([device_type, events]) => ({
        device_type,
        events,
      }))
      .sort((a, b) => b.events - a.events);

    /*
     * ----------------------------------------
     * BROWSERS
     * ----------------------------------------
     */

    const browserCounts = new Map<
      string,
      number
    >();

    for (const event of pageViews) {
      if (!event.browser) continue;

      browserCounts.set(
        event.browser,
        (browserCounts.get(event.browser) ?? 0) + 1
      );
    }

    const browsers = Array.from(
      browserCounts.entries()
    )
      .map(([browser, events]) => ({
        browser,
        events,
      }))
      .sort((a, b) => b.events - a.events);

    /*
     * ----------------------------------------
     * OPERATING SYSTEMS
     * ----------------------------------------
     */

    const operatingSystemCounts = new Map<
      string,
      number
    >();

    for (const event of pageViews) {
      if (!event.operating_system) continue;

      operatingSystemCounts.set(
        event.operating_system,
        (operatingSystemCounts.get(
          event.operating_system
        ) ?? 0) + 1
      );
    }

    const operatingSystems = Array.from(
      operatingSystemCounts.entries()
    )
      .map(([operating_system, events]) => ({
        operating_system,
        events,
      }))
      .sort((a, b) => b.events - a.events);

    /*
     * ----------------------------------------
     * TRAFFIC SOURCES
     * ----------------------------------------
     */

    const origin = request.nextUrl.origin;

    const referrerCounts = new Map<
      string,
      number
    >();

    for (const event of pageViews) {
      const source = normalizeReferrer(
        event.referrer,
        origin
      );

      if (!source) continue;

      referrerCounts.set(
        source,
        (referrerCounts.get(source) ?? 0) + 1
      );
    }

    const referrers = Array.from(
      referrerCounts.entries()
    )
      .map(([referrer, visits]) => ({
        referrer,
        visits,
      }))
      .sort((a, b) => b.visits - a.visits)
      .slice(0, 10);

    /*
     * ----------------------------------------
     * RESPONSE
     * ----------------------------------------
     */

    return NextResponse.json({
      overview: {
        visitors: visitorIds.size,
        sessions: sessionIds.size,
        pageViews: pageViews.length,
        clicks: clicks.length,
      },

      topPages,
      topClicks,
      devices,
      browsers,
      operatingSystems,
      referrers,
    });
  } catch (error) {
    console.error(
      "Admin analytics error:",
      error
    );

    return NextResponse.json(
      {
        error: "Unexpected analytics error.",
      },
      { status: 500 }
    );
  }
}