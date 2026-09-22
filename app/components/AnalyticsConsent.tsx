"use client";

import { useEffect, useState } from "react";

const CONSENT_KEY = "sysnet-analytics-consent";

export default function AnalyticsConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent =
      localStorage.getItem(CONSENT_KEY);

    if (!consent) {
      setVisible(true);
    }
  }, []);

  function acceptAnalytics() {
    localStorage.setItem(
      CONSENT_KEY,
      "accepted"
    );

    setVisible(false);

    // Reload so the analytics tracker
    // immediately tracks the current page.
    window.location.reload();
  }

  function rejectAnalytics() {
    localStorage.setItem(
      CONSENT_KEY,
      "rejected"
    );

    setVisible(false);
  }

  if (!visible) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 z-[9999] mx-auto max-w-3xl">
      <div className="rounded-2xl border border-slate-700 bg-slate-900 p-5 shadow-2xl">

        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">

          <div className="min-w-0">
            <h3 className="text-base font-semibold text-white">
              We value your privacy
            </h3>

            <p className="mt-1 text-sm leading-6 text-slate-400">
              We use anonymous analytics to understand
              how visitors use our website and improve
              our services. Analytics will only be collected
              if you give us permission.
            </p>
          </div>

          <div className="flex shrink-0 gap-3">

            <button
              type="button"
              onClick={rejectAnalytics}
              className="rounded-xl border border-slate-700 px-4 py-2.5 text-sm font-medium text-slate-300 transition hover:bg-slate-800 hover:text-white"
            >
              Decline
            </button>

            <button
              type="button"
              onClick={acceptAnalytics}
              className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-500"
            >
              Accept
            </button>

          </div>

        </div>

      </div>
    </div>
  );
}