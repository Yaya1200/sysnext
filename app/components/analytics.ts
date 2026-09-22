export type AnalyticsEvent = {
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

const CONSENT_KEY = "sysnet-analytics-consent";
const VISITOR_ID_KEY = "sysnet-visitor-id";
const SESSION_ID_KEY = "sysnet-session-id";

function getVisitorId() {
  let id = localStorage.getItem(VISITOR_ID_KEY);

  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(VISITOR_ID_KEY, id);
  }

  return id;
}

function getSessionId() {
  let id = sessionStorage.getItem(SESSION_ID_KEY);

  if (!id) {
    id = crypto.randomUUID();
    sessionStorage.setItem(SESSION_ID_KEY, id);
  }

  return id;
}

function getDeviceType() {
  const width = window.innerWidth;

  if (width < 768) return "mobile";
  if (width < 1024) return "tablet";

  return "desktop";
}

function getBrowser() {
  const userAgent = navigator.userAgent;

  if (userAgent.includes("Edg/")) return "Edge";
  if (userAgent.includes("OPR/")) return "Opera";
  if (userAgent.includes("Chrome/")) return "Chrome";
  if (userAgent.includes("Firefox/")) return "Firefox";
  if (userAgent.includes("Safari/")) return "Safari";

  return "Other";
}

function getOperatingSystem() {
  const userAgent = navigator.userAgent;

  if (userAgent.includes("Windows")) return "Windows";
  if (userAgent.includes("Android")) return "Android";

  if (
    userAgent.includes("iPhone") ||
    userAgent.includes("iPad")
  ) {
    return "iOS";
  }

  if (userAgent.includes("Mac OS")) return "macOS";
  if (userAgent.includes("Linux")) return "Linux";

  return "Other";
}

function getReferrer() {
  const referrer = document.referrer;

  if (!referrer) return null;

  try {
    const url = new URL(referrer);

    if (url.origin === window.location.origin) {
      return null;
    }

    return url.hostname;
  } catch {
    return null;
  }
}

function isAdminPage(pathname: string) {
  return (
    pathname === "/admin" ||
    pathname.startsWith("/admin/")
  );
}

export async function trackEvent(
  event: AnalyticsEvent
) {
  try {
    const consent =
      localStorage.getItem(CONSENT_KEY);

    if (consent !== "accepted") {
      return;
    }

    const pathname =
      event.page_path ??
      window.location.pathname;

    if (isAdminPage(pathname)) {
      return;
    }

    const visitorId =
      event.visitor_id ??
      getVisitorId();

    const sessionId =
      event.session_id ??
      getSessionId();

    const response = await fetch(
      "/api/analytics",
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          ...event,

          visitor_id: visitorId,
          session_id: sessionId,

          page_path: pathname,

          page_title:
            event.page_title ??
            document.title,

          device_type:
            event.device_type ??
            getDeviceType(),

          browser:
            event.browser ??
            getBrowser(),

          operating_system:
            event.operating_system ??
            getOperatingSystem(),

          referrer:
            event.referrer ??
            getReferrer(),
        }),

        keepalive: true,
      }
    );

    if (!response.ok) {
      console.error(
        "Analytics request failed:",
        response.status,
        await response.text()
      );
    }
  } catch (error) {
    console.error(
      "Analytics tracking error:",
      error
    );
  }
}

