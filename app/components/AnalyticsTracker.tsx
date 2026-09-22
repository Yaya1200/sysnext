"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { trackEvent } from "./analytics";

const CONSENT_KEY =
  "sysnet-analytics-consent";

function isAdminPage(pathname: string) {
  return (
    pathname === "/admin" ||
    pathname.startsWith("/admin/")
  );
}

export default function AnalyticsTracker() {
  const pathname = usePathname();

  const trackedPathRef =
    useRef<string | null>(null);

  useEffect(() => {
    if (!pathname) {
      return;
    }

    // Never track admin pages.
    if (isAdminPage(pathname)) {
      return;
    }

    // Require consent.
    const consent =
      localStorage.getItem(CONSENT_KEY);

    if (consent !== "accepted") {
      console.log(
        "Analytics: waiting for consent"
      );

      return;
    }

    // Prevent duplicate page views.
    if (
      trackedPathRef.current === pathname
    ) {
      return;
    }

    trackedPathRef.current = pathname;

    console.log(
      "Analytics: tracking page view:",
      pathname
    );

    void trackEvent({
      event_type: "page_view",
      event_name: "page_view",
      page_path: pathname,
      page_title: document.title,
    });
  }, [pathname]);

  return null;
}