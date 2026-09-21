"use client";

import { FormEvent, useEffect, useState } from "react";

type Stat = {
id: number;
label: string;
value: number;
};

const DEFAULT_STATS = [
{ label: "Projects", value: 50 },
{ label: "Clients", value: 30 },
{ label: "Success", value: 5 },
{ label: "Awards", value: 15 },
];

export default function StatsManager({
showNotification,
}: {
showNotification: (msg: string, type?: "success" | "error") => void;
}) {
const [stats, setStats] = useState<Stat[]>([]);
const [loading, setLoading] = useState(true);
const [saving, setSaving] = useState(false);

const loadStats = async () => {
setLoading(true);

try {
  const supabaseResponse = await fetch("/api/site-stats");

  if (!supabaseResponse.ok) {
    throw new Error("Failed to load statistics");
  }

  const data = await supabaseResponse.json();

  if (Array.isArray(data) && data.length > 0) {
    setStats(data);
  } else {
    setStats(
      DEFAULT_STATS.map((stat, index) => ({
        id: index + 1,
        ...stat,
      }))
    );
  }
} catch {
  setStats(
    DEFAULT_STATS.map((stat, index) => ({
      id: index + 1,
      ...stat,
    }))
  );

  showNotification("Could not load statistics.", "error");
} finally {
  setLoading(false);
}


};

useEffect(() => {
loadStats();
}, []);

const updateValue = (id: number, value: string) => {
const numericValue = Math.max(0, Number(value) || 0);


setStats((current) =>
  current.map((stat) =>
    stat.id === id
      ? {
          ...stat,
          value: numericValue,
        }
      : stat
  )
);


};

const handleSave = async (e: FormEvent) => {
e.preventDefault();


setSaving(true);

try {
  const response = await fetch("/api/site-stats", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      stats: stats.map((stat) => ({
        id: stat.id,
        label: stat.label,
        value: stat.value,
      })),
    }),
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(data?.error || "Failed to save statistics");
  }

  if (Array.isArray(data)) {
    setStats(data);
  }

  showNotification("Homepage statistics updated successfully.");
} catch (err: any) {
  showNotification(
    err?.message || "Failed to save statistics.",
    "error"
  );
} finally {
  setSaving(false);
}


};

return ( <div> <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"> <div> <h2 className="text-2xl font-black text-white">
Homepage Statistics </h2> <p className="text-xs text-slate-400">
Edit the numbers displayed in the statistics section on the
homepage. </p> </div> </div>

  {loading ? (
    <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-950 p-8 text-center">
      <p className="text-sm text-slate-500">
        Loading statistics...
      </p>
    </div>
  ) : (
    <form onSubmit={handleSave} className="mt-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.id}
            className="rounded-2xl border border-slate-800 bg-slate-950 p-5"
          >
            <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">
              {stat.label}
            </label>

            <input
              type="number"
              min="0"
              value={stat.value}
              onChange={(e) =>
                updateValue(stat.id, e.target.value)
              }
              className="w-full rounded-xl border border-slate-800 bg-slate-900 px-4 py-3 text-2xl font-black text-white outline-none transition focus:border-blue-500"
            />

            <p className="mt-2 text-[11px] text-slate-500">
              Current homepage value
            </p>
          </div>
        ))}
      </div>

      <div className="mt-6 flex justify-end">
        <button
          type="submit"
          disabled={saving}
          className="rounded-xl bg-blue-600 px-6 py-3 text-xs font-bold text-white shadow-lg shadow-blue-600/30 transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save Statistics"}
        </button>
      </div>
    </form>
  )}
</div>

);
}
