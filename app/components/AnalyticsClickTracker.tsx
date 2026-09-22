"use client";

import { useEffect } from "react";
import { trackEvent } from "./analytics";

const CONSENT_KEY =
  "sysnet-analytics-consent";

function isAdminPage() {
  const pathname =
    window.location.pathname;

  return (
    pathname === "/admin" ||
    pathname.startsWith("/admin/")
  );
}

async function handleTrackedClick(
  element: HTMLElement
) {
  // Never track admin activity.
  if (isAdminPage()) {
    return;
  }

  // Require consent.
  const consent =
    localStorage.getItem(
      CONSENT_KEY
    );

  if (consent !== "accepted") {
    return;
  }

  const isButton =
    element.tagName === "BUTTON";

  const isLink =
    element.tagName === "A";

  if (!isButton && !isLink) {
    return;
  }

  const link = isLink
    ? (element as HTMLAnchorElement)
    : null;

  const text =
    element.textContent
      ?.trim()
      .replace(/\s+/g, " ")
      .slice(0, 300) || "";

  const href =
    link?.href || null;

  const elementId =
    element.id || null;

  if (!text && !href && !elementId) {
    return;
  }

  let eventType:
    | "button_click"
    | "link_click"
    | "phone_click"
    | "email_click"
    | "contact_click";

  let eventName =
    text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "_")
      .replace(/^_+|_+$/g, "")
      .slice(0, 100);

  let destinationPath: string | null =
    null;

  if (href) {
    try {
      const url = new URL(
        href,
        window.location.origin
      );

      destinationPath =
        url.pathname +
        url.search +
        url.hash;
    } catch {
      destinationPath = null;
    }
  }

  if (href?.startsWith("tel:")) {
    eventType = "phone_click";
    eventName = "phone_click";
  } else if (
    href?.startsWith("mailto:")
  ) {
    eventType = "email_click";
    eventName = "email_click";
  } else if (
    text
      .toLowerCase()
      .includes("contact") ||
    destinationPath?.startsWith(
      "/contact"
    )
  ) {
    eventType = "contact_click";
    eventName = "contact";
  } else if (isButton) {
    eventType = "button_click";

    if (!eventName) {
      eventName = "button";
    }
  } else {
    eventType = "link_click";

    if (!eventName) {
      eventName = "link";
    }
  }

  await trackEvent({
    event_type: eventType,
    event_name: eventName,

    page_path:
      window.location.pathname,

    page_title:
      document.title,

    element_text:
      text || undefined,

    element_id:
      elementId || undefined,

    element_href:
      destinationPath || undefined,

    metadata: {
      tag:
        element.tagName.toLowerCase(),

      destination_path:
        destinationPath,
    },
  });
}

export default function AnalyticsClickTracker() {
  useEffect(() => {
    function handleClick(
      event: MouseEvent
    ) {
      const target =
        event.target;

      if (
        !(target instanceof HTMLElement)
      ) {
        return;
      }

      const element =
        target.closest(
          "button, a"
        ) as HTMLElement | null;

      if (!element) {
        return;
      }

      void handleTrackedClick(element);
    }

    document.addEventListener(
      "click",
      handleClick
    );

    return () => {
      document.removeEventListener(
        "click",
        handleClick
      );
    };
  }, []);

  return null;
}