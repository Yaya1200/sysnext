"use client";

import { FormEvent, useEffect, useState } from "react";

interface SocialLink {
  id: number;
  platform: string;
  url: string;
  icon: string | null;
  is_active: boolean;
  display_order: number;
  created_at?: string;
}

const defaultForm = {
  platform: "",
  url: "",
  icon: "",
  display_order: 1,
  is_active: true,
};

export default function SocialMediaManager() {
  const [links, setLinks] = useState<SocialLink[]>([]);
  const [form, setForm] = useState(defaultForm);
  const [editingId, setEditingId] = useState<number | null>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function loadLinks() {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/social-links", {
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Failed to load social media links."
        );
      }

      setLinks(data || []);
    } catch (err: any) {
      setError(
        err?.message || "Failed to load social media links."
      );
      setLinks([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadLinks();
  }, []);

  function resetForm() {
    setForm({
      ...defaultForm,
      display_order: links.length + 1,
    });

    setEditingId(null);
  }

  function startEdit(link: SocialLink) {
    setEditingId(link.id);

    setForm({
      platform: link.platform,
      url: link.url,
      icon: link.icon || "",
      display_order: link.display_order,
      is_active: link.is_active,
    });

    setSuccess("");
    setError("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setSaving(true);
    setError("");
    setSuccess("");

    if (!form.platform.trim()) {
      setError("Platform name is required.");
      setSaving(false);
      return;
    }

    if (!form.url.trim()) {
      setError("Social media URL is required.");
      setSaving(false);
      return;
    }

    try {
      const payload = {
        platform: form.platform.trim(),
        url: form.url.trim(),
        icon: form.icon.trim() || null,
        display_order: Number(form.display_order),
        is_active: form.is_active,
      };

      let response: Response;

      if (editingId) {
        response = await fetch(
          `/api/social-links/${editingId}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
          }
        );
      } else {
        response = await fetch("/api/social-links", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            (editingId
              ? "Failed to update social link."
              : "Failed to add social link.")
        );
      }

      setSuccess(
        editingId
          ? "Social media link updated successfully."
          : "Social media link added successfully."
      );

      resetForm();
      await loadLinks();
    } catch (err: any) {
      setError(
        err?.message || "Failed to save social media link."
      );
    } finally {
      setSaving(false);
    }
  }

  async function toggleActive(link: SocialLink) {
    setError("");
    setSuccess("");

    try {
      const response = await fetch(
        `/api/social-links/${link.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            platform: link.platform,
            url: link.url,
            icon: link.icon,
            display_order: link.display_order,
            is_active: !link.is_active,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Failed to update social link."
        );
      }

      setSuccess(
        `${link.platform} ${
          !link.is_active ? "activated" : "hidden"
        } successfully.`
      );

      await loadLinks();
    } catch (err: any) {
      setError(
        err?.message || "Failed to update social link."
      );
    }
  }

  async function deleteLink(link: SocialLink) {
    const confirmed = window.confirm(
      `Are you sure you want to delete ${link.platform}?`
    );

    if (!confirmed) {
      return;
    }

    setError("");
    setSuccess("");

    try {
      const response = await fetch(
        `/api/social-links/${link.id}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Failed to delete social link."
        );
      }

      if (editingId === link.id) {
        resetForm();
      }

      setSuccess(
        `${link.platform} deleted successfully.`
      );

      await loadLinks();
    } catch (err: any) {
      setError(
        err?.message || "Failed to delete social link."
      );
    }
  }

  async function moveLink(
    link: SocialLink,
    direction: "up" | "down"
  ) {
    const currentIndex = links.findIndex(
      (item) => item.id === link.id
    );

    if (currentIndex === -1) {
      return;
    }

    const targetIndex =
      direction === "up"
        ? currentIndex - 1
        : currentIndex + 1;

    if (
      targetIndex < 0 ||
      targetIndex >= links.length
    ) {
      return;
    }

    const target = links[targetIndex];

    setError("");
    setSuccess("");

    try {
      const firstOrder = link.display_order;
      const secondOrder = target.display_order;

      // Update first link
      const firstResponse = await fetch(
        `/api/social-links/${link.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            platform: link.platform,
            url: link.url,
            icon: link.icon,
            display_order: secondOrder,
            is_active: link.is_active,
          }),
        }
      );

      const firstData = await firstResponse.json();

      if (!firstResponse.ok) {
        throw new Error(
          firstData.error ||
            "Failed to update social media order."
        );
      }

      // Update second link
      const secondResponse = await fetch(
        `/api/social-links/${target.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            platform: target.platform,
            url: target.url,
            icon: target.icon,
            display_order: firstOrder,
            is_active: target.is_active,
          }),
        }
      );

      const secondData = await secondResponse.json();

      if (!secondResponse.ok) {
        throw new Error(
          secondData.error ||
            "Failed to update social media order."
        );
      }

      setSuccess("Social media order updated.");

      await loadLinks();
    } catch (err: any) {
      setError(
        err?.message ||
          "Failed to change social media order."
      );

      await loadLinks();
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">
          Social Media
        </h1>

        <p className="mt-2 text-sm text-slate-400">
          Manage the social media links displayed on the
          public website footer.
        </p>
      </div>

      {/* Messages */}
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

      {/* Add / Edit Form */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-white">
              {editingId
                ? "Edit Social Link"
                : "Add Social Link"}
            </h2>

            <p className="mt-1 text-sm text-slate-400">
              Add a social platform and its public URL.
            </p>
          </div>

          {editingId && (
            <button
              type="button"
              onClick={resetForm}
              className="rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-300 transition hover:bg-slate-800"
            >
              Cancel
            </button>
          )}
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-5"
        >
          <div className="grid gap-5 md:grid-cols-2">
            {/* Platform */}
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">
                Platform
              </label>

              <input
                type="text"
                value={form.platform}
                onChange={(event) =>
                  setForm({
                    ...form,
                    platform: event.target.value,
                  })
                }
                placeholder="Facebook"
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition placeholder:text-slate-600 focus:border-blue-500"
              />
            </div>

            {/* Icon */}
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">
                Icon
              </label>

              <input
                type="text"
                value={form.icon}
                onChange={(event) =>
                  setForm({
                    ...form,
                    icon: event.target.value,
                  })
                }
                placeholder="facebook"
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition placeholder:text-slate-600 focus:border-blue-500"
              />

              <p className="mt-1 text-xs text-slate-500">
                Example: facebook, instagram, linkedin,
                youtube, telegram
              </p>
            </div>
          </div>

          {/* URL */}
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-300">
              Social Media URL
            </label>

            <input
              type="url"
              value={form.url}
              onChange={(event) =>
                setForm({
                  ...form,
                  url: event.target.value,
                })
              }
              placeholder="https://facebook.com/sysnetet"
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition placeholder:text-slate-600 focus:border-blue-500"
            />
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            {/* Display Order */}
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">
                Display Order
              </label>

              <input
                type="number"
                min="1"
                value={form.display_order}
                onChange={(event) =>
                  setForm({
                    ...form,
                    display_order: Number(
                      event.target.value
                    ),
                  })
                }
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-blue-500"
              />
            </div>

            {/* Active */}
            <div className="flex items-center">
              <label className="flex cursor-pointer items-center gap-3">
                <input
                  type="checkbox"
                  checked={form.is_active}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      is_active: event.target.checked,
                    })
                  }
                  className="h-5 w-5 rounded border-slate-700 bg-slate-950 text-blue-600"
                />

                <span className="text-sm text-slate-300">
                  Show this link on the website
                </span>
              </label>
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving
              ? "Saving..."
              : editingId
              ? "Update Social Link"
              : "Add Social Link"}
          </button>
        </form>
      </div>

      {/* Social Links List */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900">
        <div className="border-b border-slate-800 p-6">
          <h2 className="text-lg font-bold text-white">
            Social Media Links
          </h2>

          <p className="mt-1 text-sm text-slate-400">
            These links appear in the public website
            footer.
          </p>
        </div>

        {loading ? (
          <div className="p-8 text-center text-sm text-slate-400">
            Loading social media links...
          </div>
        ) : links.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-slate-400">
              No social media links have been added yet.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-800">
            {links.map((link, index) => (
              <div
                key={link.id}
                className="flex flex-col gap-4 p-5 lg:flex-row lg:items-center lg:justify-between"
              >
                {/* Info */}
                <div className="flex min-w-0 items-center gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-600/10 text-blue-400">
                    <i
                      className={`fab fa-${
                        link.icon || "globe"
                      }`}
                    />
                  </div>

                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-semibold text-white">
                        {link.platform}
                      </h3>

                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                          link.is_active
                            ? "bg-green-500/10 text-green-400"
                            : "bg-slate-800 text-slate-500"
                        }`}
                      >
                        {link.is_active
                          ? "Active"
                          : "Hidden"}
                      </span>
                    </div>

                    <a
                      href={link.url}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-1 block max-w-xl truncate text-sm text-slate-500 transition hover:text-blue-400"
                    >
                      {link.url}
                    </a>
                  </div>
                </div>

                {/* Controls */}
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    disabled={index === 0}
                    onClick={() =>
                      moveLink(link, "up")
                    }
                    className="rounded-lg border border-slate-700 px-3 py-2 text-sm text-slate-300 transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-30"
                  >
                    ↑
                  </button>

                  <button
                    type="button"
                    disabled={
                      index === links.length - 1
                    }
                    onClick={() =>
                      moveLink(link, "down")
                    }
                    className="rounded-lg border border-slate-700 px-3 py-2 text-sm text-slate-300 transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-30"
                  >
                    ↓
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      toggleActive(link)
                    }
                    className="rounded-lg border border-slate-700 px-3 py-2 text-sm text-slate-300 transition hover:bg-slate-800"
                  >
                    {link.is_active
                      ? "Hide"
                      : "Show"}
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      startEdit(link)
                    }
                    className="rounded-lg border border-blue-500/30 bg-blue-500/10 px-3 py-2 text-sm text-blue-400 transition hover:bg-blue-500/20"
                  >
                    Edit
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      deleteLink(link)
                    }
                    className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-400 transition hover:bg-red-500/20"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}