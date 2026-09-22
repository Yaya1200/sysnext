"use client";

import { useEffect, useState } from "react";

type Overview = {
  visitors: number;
  sessions: number;
  pageViews: number;
  clicks: number;
};

type AnalyticsData = {
  overview: Overview;
  topPages: {
    page_path: string;
    views: number;
  }[];
  topClicks: {
    event_name: string;
    element_text: string | null;
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

export default function Analytics() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadAnalytics() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/admin/analytics", {
        method: "GET",
        cache: "no-store",
      });

      const contentType = response.headers.get("content-type");

      if (!response.ok) {
        const text = await response.text();

        throw new Error(
          `Analytics API returned ${response.status}: ${text.slice(0, 200)}`
        );
      }

      if (!contentType?.includes("application/json")) {
        const text = await response.text();

        throw new Error(
          `Expected JSON but received ${contentType || "unknown content type"}: ${text.slice(
            0,
            200
          )}`
        );
      }

      const result = await response.json();

      setData(result);
    } catch (err) {
      console.error("Analytics loading error:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Failed to load analytics."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-8">
        <p className="text-sm text-slate-500">
          Loading analytics...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
        <h2 className="text-lg font-semibold text-red-700">
          Website Analytics
        </h2>

        <p className="mt-2 text-sm text-red-600">
          {error}
        </p>

        <button
          type="button"
          onClick={loadAnalytics}
          className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Website Analytics
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Understand how visitors interact with your website.
          </p>
        </div>

        <button
          type="button"
          onClick={loadAnalytics}
          className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
        >
          Refresh Analytics
        </button>
      </div>

      {/* Overview */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Visitors"
          value={data.overview.visitors}
          icon="👥"
        />

        <StatCard
          title="Sessions"
          value={data.overview.sessions}
          icon="🕒"
        />

        <StatCard
          title="Page Views"
          value={data.overview.pageViews}
          icon="📄"
        />

        <StatCard
          title="Clicks"
          value={data.overview.clicks}
          icon="🖱️"
        />
      </div>

      {/* Main analytics */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Top Pages */}
        <AnalyticsCard title="Top Pages">
          {data.topPages.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="space-y-3">
              {data.topPages.map((page) => (
                <div
                  key={page.page_path}
                  className="flex items-center justify-between rounded-lg bg-slate-50 px-4 py-3"
                >
                  <span className="truncate text-sm font-medium text-slate-700">
                    {page.page_path}
                  </span>

                  <span className="ml-4 text-sm font-semibold text-slate-900">
                    {page.views}
                  </span>
                </div>
              ))}
            </div>
          )}
        </AnalyticsCard>

        {/* Top Clicks */}
        <AnalyticsCard title="Top Clicks">
          {data.topClicks.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="space-y-3">
              {data.topClicks.map((click, index) => (
                <div
                  key={`${click.event_name}-${click.element_text}-${index}`}
                  className="rounded-lg bg-slate-50 px-4 py-3"
                >
                  <div className="flex items-center justify-between gap-4">
                    <span className="truncate text-sm font-medium text-slate-700">
                      {click.element_text ||
                        click.event_name ||
                        "Unnamed element"}
                    </span>

                    <span className="shrink-0 text-sm font-semibold text-slate-900">
                      {click.clicks}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </AnalyticsCard>

        {/* Devices */}
        <AnalyticsCard title="Devices">
          {data.devices.length === 0 ? (
            <EmptyState />
          ) : (
            <AnalyticsList
              items={data.devices.map((item) => ({
                label: item.device_type,
                value: item.events,
              }))}
            />
          )}
        </AnalyticsCard>

        {/* Browsers */}
        <AnalyticsCard title="Browsers">
          {data.browsers.length === 0 ? (
            <EmptyState />
          ) : (
            <AnalyticsList
              items={data.browsers.map((item) => ({
                label: item.browser,
                value: item.events,
              }))}
            />
          )}
        </AnalyticsCard>

        {/* Operating Systems */}
        <AnalyticsCard title="Operating Systems">
          {data.operatingSystems.length === 0 ? (
            <EmptyState />
          ) : (
            <AnalyticsList
              items={data.operatingSystems.map((item) => ({
                label: item.operating_system,
                value: item.events,
              }))}
            />
          )}
        </AnalyticsCard>

        {/* Referrers */}
        <AnalyticsCard title="Traffic Sources">
          {data.referrers.length === 0 ? (
            <EmptyState />
          ) : (
            <AnalyticsList
              items={data.referrers.map((item) => ({
                label: item.referrer,
                value: item.visits,
              }))}
            />
          )}
        </AnalyticsCard>
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  icon,
}: {
  title: string;
  value: number;
  icon: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-slate-500">
          {title}
        </span>

        <span className="text-xl">{icon}</span>
      </div>

      <p className="mt-3 text-3xl font-bold text-slate-900">
        {value.toLocaleString()}
      </p>
    </div>
  );
}

function AnalyticsCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="mb-4 text-lg font-semibold text-slate-900">
        {title}
      </h2>

      {children}
    </div>
  );
}

function AnalyticsList({
  items,
}: {
  items: {
    label: string;
    value: number;
  }[];
}) {
  return (
    <div className="space-y-3">
      {items.map((item) => (
        <div
          key={item.label}
          className="flex items-center justify-between rounded-lg bg-slate-50 px-4 py-3"
        >
          <span className="text-sm font-medium capitalize text-slate-700">
            {item.label}
          </span>

          <span className="text-sm font-semibold text-slate-900">
            {item.value}
          </span>
        </div>
      ))}
    </div>
  );
}

function EmptyState() {
  return (
    <p className="py-4 text-sm text-slate-400">
      No analytics data available yet.
    </p>
  );
}
