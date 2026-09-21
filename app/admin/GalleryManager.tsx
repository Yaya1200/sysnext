"use client";

import { ChangeEvent, useEffect, useState } from "react";
import Image from "next/image";
import { createClient } from "../../lib/supabase/client";

type GalleryImage = {
  id: number;
  name: string;
  url: string;
  storage_path: string;
  category: string;
  created_at: string;
};

const categories = [
  "general",
  "projects",
  "services",
  "blogs",
  "slider",
  "team",
  "partners",
];

export default function GalleryManager({
  showNotification,
}: {
  showNotification: (
    text: string,
    type?: "success" | "error"
  ) => void;
}) {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  const [name, setName] = useState("");
  const [category, setCategory] = useState("general");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const loadImages = async () => {
    try {
      setLoading(true);

      const res = await fetch("/api/gallery");

      if (!res.ok) {
        throw new Error("Failed to load gallery");
      }

      const data = await res.json();

      setImages(Array.isArray(data) ? data : []);
    } catch (error: any) {
      showNotification(
        error.message || "Failed to load gallery",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadImages();
  }, []);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (!file) {
      setSelectedFile(null);
      setPreview(null);
      return;
    }

    if (!file.type.startsWith("image/")) {
      showNotification("Please select an image file", "error");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      showNotification("Image must be smaller than 10MB", "error");
      return;
    }

    setSelectedFile(file);

    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);

    if (!name) {
      setName(file.name.replace(/\.[^/.]+$/, ""));
    }
  };

  const resetUploadForm = () => {
    setName("");
    setCategory("general");
    setSelectedFile(null);
    setPreview(null);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      showNotification("Please select an image", "error");
      return;
    }

    if (!name.trim()) {
      showNotification("Please enter an image name", "error");
      return;
    }

    try {
      setUploading(true);

      const supabase = createClient();

      const extension =
        selectedFile.name.split(".").pop()?.toLowerCase() || "jpg";

      const safeName = name
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");

      const filePath = `${category}/${Date.now()}-${safeName}.${extension}`;

      const { error: uploadError } = await supabase.storage
        .from("site-images")
        .upload(filePath, selectedFile, {
          cacheControl: "3600",
          upsert: false,
          contentType: selectedFile.type,
        });

      if (uploadError) {
        throw uploadError;
      }

      const {
        data: { publicUrl },
      } = supabase.storage
        .from("site-images")
        .getPublicUrl(filePath);

      const response = await fetch("/api/gallery", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: name.trim(),
          url: publicUrl,
          storage_path: filePath,
          category,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save gallery record");
      }

      showNotification("Image uploaded successfully");

      resetUploadForm();
      await loadImages();
    } catch (error: any) {
      showNotification(
        error.message || "Image upload failed",
        "error"
      );
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (image: GalleryImage) => {
    if (
      !confirm(
        `Delete "${image.name}"? This will remove the image from storage.`
      )
    ) {
      return;
    }

    try {
      const response = await fetch(
        `/api/gallery?id=${image.id}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete image");
      }

      showNotification("Image deleted");
      await loadImages();
    } catch (error: any) {
      showNotification(
        error.message || "Delete failed",
        "error"
      );
    }
  };

  const copyUrl = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      showNotification("Image URL copied");
    } catch {
      showNotification("Could not copy image URL", "error");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-black text-white">
          Image & Gallery
        </h2>

        <p className="mt-1 text-xs text-slate-400">
          Upload, organize, preview, and reuse images across your website.
        </p>
      </div>

      {/* Upload */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6">
        <h3 className="mb-5 text-lg font-bold text-white">
          Upload New Image
        </h3>

        <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-xs font-semibold text-slate-300">
                Image
              </label>

              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="block w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-slate-300 file:mr-4 file:rounded-lg file:border-0 file:bg-blue-600 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white"
              />

              <p className="mt-2 text-[11px] text-slate-500">
                Maximum size: 10MB
              </p>
            </div>

            <div>
              <label className="mb-2 block text-xs font-semibold text-slate-300">
                Image Name
              </label>

              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Smart City Project"
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-xs font-semibold text-slate-300">
                Category
              </label>

              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-blue-500"
              >
                {categories.map((item) => (
                  <option key={item} value={item}>
                    {item.charAt(0).toUpperCase() + item.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="button"
              onClick={handleUpload}
              disabled={uploading || !selectedFile}
              className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {uploading ? "Uploading..." : "Upload Image"}
            </button>
          </div>

          {/* Preview */}
          <div>
            <p className="mb-2 text-xs font-semibold text-slate-300">
              Preview
            </p>

            <div className="relative aspect-video overflow-hidden rounded-xl border border-slate-800 bg-slate-950">
              {preview ? (
                <Image
                  src={preview}
                  alt="Preview"
                  fill
                  className="object-cover"
                  unoptimized
                />
              ) : (
                <div className="flex h-full items-center justify-center text-sm text-slate-600">
                  No image selected
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Gallery */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-white">
              Gallery
            </h3>

            <p className="text-xs text-slate-500">
              {images.length} image{images.length === 1 ? "" : "s"}
            </p>
          </div>

          <button
            type="button"
            onClick={loadImages}
            className="rounded-lg border border-slate-700 px-3 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-800"
          >
            Refresh
          </button>
        </div>

        {loading ? (
          <div className="py-12 text-center text-sm text-slate-500">
            Loading gallery...
          </div>
        ) : images.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-700 py-12 text-center">
            <p className="text-sm text-slate-500">
              No images uploaded yet.
            </p>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {images.map((image) => (
              <div
                key={image.id}
                className="overflow-hidden rounded-xl border border-slate-800 bg-slate-950"
              >
                <div className="relative aspect-video">
                  <Image
                    src={image.url}
                    alt={image.name}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>

                <div className="space-y-3 p-4">
                  <div>
                    <h4 className="truncate text-sm font-bold text-white">
                      {image.name}
                    </h4>

                    <span className="mt-1 inline-block rounded-md bg-blue-500/10 px-2 py-1 text-[10px] font-semibold uppercase text-blue-400">
                      {image.category}
                    </span>
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => copyUrl(image.url)}
                      className="flex-1 rounded-lg border border-slate-700 px-3 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-800"
                    >
                      Copy URL
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDelete(image)}
                      className="rounded-lg bg-red-600/90 px-3 py-2 text-xs font-semibold text-white hover:bg-red-700"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}