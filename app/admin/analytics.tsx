"use client";

import { useEffect, useState } from "react";

type AnalyticsData = {
  overview: {
    visitors: number;
    sessions: number;
    pageViews: number;
    clicks: number;
  };

  topPages: {
    page_path: string;
    views: number;
  }[];

  topClicks: {
    element_text: string;
    element_href: string | null;
    page_path: string;
    clicks: number;
  }[];

  devices: {
    device_type: string;
    events: number;
  }[];

  browsers: {
    browser: string;
    events: number;
  }[];

  operatingSystems: {
    operating_system: string;
    events: number;
  }[];

  referrers: {
    referrer: string;
    visits: number;
  }[];
};

export default function AnalyticsPage() {
  const [data, setData] =
    useState<AnalyticsData | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function loadAnalytics() {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        "/api/analytics",
        {
          cache: "no-store",
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.error ||
            "Failed to load analytics."
        );
      }

      setData(result);
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load analytics."
      );

      setData(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadAnalytics();
  }, []);

  function refreshAnalytics() {
    setSuccess("Analytics refreshed.");

    void loadAnalytics();

    setTimeout(() => {
      setSuccess("");
    }, 3000);
  }

  return (
    <div className="space-y-8">

      {/* HEADER */}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

        <div>
          <h1 className="text-2xl font-bold text-white">
            Website Analytics
          </h1>

          <p className="mt-2 text-sm text-slate-400">
            Understand how visitors interact with
            your website.
          </p>
        </div>

        <button
          type="button"
          onClick={refreshAnalytics}
          disabled={loading}
          className="rounded-xl border border-slate-700 bg-slate-900 px-4 py-2.5 text-sm font-semibold text-slate-300 transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading
            ? "Refreshing..."
            : "Refresh Analytics"}
        </button>

      </div>

      {/* MESSAGES */}

      {error && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      {success && (
        <div className="rounded-xl border border-green-500/30 bg-green-500/10 px-4 py-3 text-sm text-green-400">
          {success}
        </div>
      )}

      {/* INITIAL LOADING */}

      {loading && !data && (
        <div className="space-y-6">

          <div className="grid gap-5 md:grid-cols-4">
            <LoadingCard />
            <LoadingCard />
            <LoadingCard />
            <LoadingCard />
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <LoadingSection />
            <LoadingSection />
          </div>

        </div>
      )}

      {/* DATA */}

      {data && (
        <>

          {/* OVERVIEW */}

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">

            <AnalyticsCard
              title="Visitors"
              value={data.overview.visitors}
              description="Unique visitors"
              icon="👥"
            />

            <AnalyticsCard
              title="Sessions"
              value={data.overview.sessions}
              description="Website sessions"
              icon="🧭"
            />

            <AnalyticsCard
              title="Page Views"
              value={data.overview.pageViews}
              description="Total pages viewed"
              icon="👁"
            />

            <AnalyticsCard
              title="Clicks"
              value={data.overview.clicks}
              description="Tracked interactions"
              icon="🖱"
            />

          </div>

          {/* TOP PAGES + TOP CLICKS */}

          <div className="grid gap-6 lg:grid-cols-2">

            {/* TOP PAGES */}

            <AnalyticsSection
              title="Most Viewed Pages"
              description="Pages visitors viewed most often."
            >
              {data.topPages.length === 0 ? (
                <EmptyState />
              ) : (
                <div className="space-y-3">

                  {data.topPages.map(
                    (page, index) => (
                      <div
                        key={page.page_path}
                        className="flex items-center gap-4 rounded-xl border border-slate-800 bg-slate-950 p-4"
                      >

                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-500/10 text-sm font-bold text-blue-400">
                          {index + 1}
                        </div>

                        <div className="min-w-0 flex-1">

                          <p className="truncate font-medium text-white">
                            {page.page_path}
                          </p>

                          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-800">

                            <div
                              className="h-full rounded-full bg-blue-500"
                              style={{
                                width: `${getPercentage(
                                  page.views,
                                  data.topPages[0]?.views || 1
                                )}%`,
                              }}
                            />

                          </div>

                        </div>

                        <span className="font-bold text-white">
                          {page.views}
                        </span>

                      </div>
                    )
                  )}

                </div>
              )}
            </AnalyticsSection>

            {/* TOP CLICKS */}

            <AnalyticsSection
              title="Most Clicked"
              description="Links and buttons visitors interact with."
            >
              {data.topClicks.length === 0 ? (
                <EmptyState />
              ) : (
                <div className="space-y-3">

                  {data.topClicks.map(
                    (click, index) => (
                      <div
                        key={`${click.element_text}-${click.page_path}-${index}`}
                        className="rounded-xl border border-slate-800 bg-slate-950 p-4"
                      >

                        <div className="flex items-start justify-between gap-4">

                          <div className="min-w-0">

                            <p className="truncate font-medium text-white">
                              {click.element_text}
                            </p>

                            <p className="mt-1 truncate text-xs text-slate-500">
                              {click.page_path}
                            </p>

                            {click.element_href && (
                              <p className="mt-1 truncate text-xs text-slate-600">
                                → {click.element_href}
                              </p>
                            )}

                          </div>

                          <span className="shrink-0 rounded-lg bg-blue-500/10 px-3 py-1 text-sm font-bold text-blue-400">
                            {click.clicks}
                          </span>

                        </div>

                      </div>
                    )
                  )}

                </div>
              )}
            </AnalyticsSection>

          </div>

          {/* TECHNOLOGY */}

          <div>

            <div className="mb-5">
              <h2 className="text-lg font-bold text-white">
                Visitor Technology
              </h2>

              <p className="mt-1 text-sm text-slate-400">
                Devices, browsers and operating systems
                used by visitors.
              </p>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">

              <AnalyticsList
                title="Devices"
                description="Page views by device"
                items={data.devices.map(
                  (item) => ({
                    name: item.device_type,
                    value: item.events,
                  })
                )}
              />

              <AnalyticsList
                title="Browsers"
                description="Page views by browser"
                items={data.browsers.map(
                  (item) => ({
                    name: item.browser,
                    value: item.events,
                  })
                )}
              />

              <AnalyticsList
                title="Operating Systems"
                description="Page views by operating system"
                items={data.operatingSystems.map(
                  (item) => ({
                    name: item.operating_system,
                    value: item.events,
                  })
                )}
              />

            </div>

          </div>

          {/* TRAFFIC SOURCES */}

          <AnalyticsSection
            title="Traffic Sources"
            description="External websites that referred visitors to your website."
          >
            {data.referrers.length === 0 ? (
              <EmptyState />
            ) : (
              <div className="space-y-3">

                {data.referrers.map(
                  (referrer, index) => (
                    <div
                      key={`${referrer.referrer}-${index}`}
                      className="flex items-center gap-4 rounded-xl border border-slate-800 bg-slate-950 p-4"
                    >

                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-purple-500/10 text-purple-400">
                        {index + 1}
                      </div>

                      <div className="min-w-0 flex-1">

                        <p className="truncate text-sm font-medium text-slate-300">
                          {referrer.referrer}
                        </p>

                      </div>

                      <span className="font-bold text-white">
                        {referrer.visits}
                      </span>

                    </div>
                  )
                )}

              </div>
            )}
          </AnalyticsSection>

        </>
      )}

    </div>
  );
}


/* =========================================================
   ANALYTICS CARD
========================================================= */

function AnalyticsCard({
  title,
  value,
  description,
  icon,
}: {
  title: string;
  value: number;
  description: string;
  icon: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 transition hover:border-slate-700">

      <div className="flex items-start justify-between">

        <div>
          <p className="text-sm font-medium text-slate-400">
            {title}
          </p>

          <p className="mt-3 text-3xl font-bold text-white">
            {value.toLocaleString()}
          </p>

          <p className="mt-1 text-xs text-slate-500">
            {description}
          </p>
        </div>

        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-500/10 text-lg">
          {icon}
        </div>

      </div>

    </div>
  );
}


/* =========================================================
   SECTION
========================================================= */

function AnalyticsSection({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">

      <div className="mb-6">
        <h2 className="text-lg font-bold text-white">
          {title}
        </h2>

        <p className="mt-1 text-sm text-slate-400">
          {description}
        </p>
      </div>

      {children}

    </section>
  );
}


/* =========================================================
   LIST
========================================================= */

function AnalyticsList({
  title,
  description,
  items,
}: {
  title: string;
  description: string;
  items: {
    name: string;
    value: number;
  }[];
}) {
  const total = items.reduce(
    (sum, item) => sum + item.value,
    0
  );

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">

      <h3 className="font-bold text-white">
        {title}
      </h3>

      <p className="mt-1 text-xs text-slate-500">
        {description}
      </p>

      {items.length === 0 ? (
        <div className="mt-6">
          <EmptyState />
        </div>
      ) : (
        <div className="mt-6 space-y-4">

          {items.map((item) => {

            const percentage =
              total > 0
                ? (item.value / total) * 100
                : 0;

            return (
              <div key={item.name}>

                <div className="mb-2 flex items-center justify-between">

                  <span className="text-sm capitalize text-slate-300">
                    {item.name}
                  </span>

                  <span className="text-sm font-semibold text-white">
                    {item.value}
                  </span>

                </div>

                <div className="h-1.5 overflow-hidden rounded-full bg-slate-800">

                  <div
                    className="h-full rounded-full bg-blue-500"
                    style={{
                      width: `${percentage}%`,
                    }}
                  />

                </div>

              </div>
            );
          })}

        </div>
      )}

    </div>
  );
}


/* =========================================================
   LOADING
========================================================= */

function LoadingCard() {
  return (
    <div className="h-32 animate-pulse rounded-2xl border border-slate-800 bg-slate-900" />
  );
}

function LoadingSection() {
  return (
    <div className="h-80 animate-pulse rounded-2xl border border-slate-800 bg-slate-900" />
  );
}


/* =========================================================
   EMPTY
========================================================= */

function EmptyState() {
  return (
    <div className="rounded-xl border border-dashed border-slate-800 p-8 text-center">

      <p className="text-sm text-slate-500">
        No data available yet.
      </p>

    </div>
  );
}


/* =========================================================
   HELPERS
========================================================= */

function getPercentage(
  value: number,
  max: number
) {
  if (!max || max <= 0) {
    return 0;
  }

  return Math.min(
    100,
    Math.max(5, (value / max) * 100)
  );
}