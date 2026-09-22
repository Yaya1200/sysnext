import { NextResponse } from "next/server";
import { createAdminClient } from "../../../lib/supabase/admin";
import { MAX_UPLOAD_SIZE, validateUploadFile } from "../../lib/uploadValidation";

const BUCKET_NAME = "uploads";

const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/svg+xml",
];

const ALLOWED_PRODUCT_TYPES = [
  ...ALLOWED_IMAGE_TYPES,
  "application/pdf",
];

export async function POST(request: Request) {
  try {
    const supabase = createAdminClient();

    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: "No file was uploaded." },
        { status: 400 }
      );
    }

    // Maximum size: 5 MiB
    if (file.size > MAX_UPLOAD_SIZE) {
      return NextResponse.json(
        { error: "File size must be <= 5 MiB." },
        { status: 400 }
      );
    }

    // true = images only
    // false = images + PDF
    const imagesOnly = formData.get("imagesOnly") !== "false";

    const validationError = validateUploadFile(
      file,
      imagesOnly
    );

    if (validationError) {
      return NextResponse.json(
        { error: validationError },
        { status: 400 }
      );
    }

    const allowedTypes = imagesOnly
      ? ALLOWED_IMAGE_TYPES
      : ALLOWED_PRODUCT_TYPES;

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        {
          error: imagesOnly
            ? "Only image files are allowed."
            : "Only image files and PDF files are allowed.",
        },
        { status: 400 }
      );
    }

    // Generate a unique filename.
    const originalExtension =
      file.name.split(".").pop()?.toLowerCase() || "bin";

    const allowedExtensions = [
      "jpg",
      "jpeg",
      "png",
      "webp",
      "gif",
      "svg",
      "pdf",
    ];

    const extension = allowedExtensions.includes(
      originalExtension
    )
      ? originalExtension
      : "bin";

    const fileName = `${crypto.randomUUID()}.${extension}`;

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const { error: uploadError } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(fileName, buffer, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      console.error("Supabase upload error:", uploadError);

      return NextResponse.json(
        {
          error: "Failed to upload file.",
          details: uploadError.message,
        },
        { status: 500 }
      );
    }

    const { data: publicUrlData } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(fileName);

    return NextResponse.json({
      success: true,
      url: publicUrlData.publicUrl,
      path: fileName,
    });
  } catch (error) {
    console.error("Upload API error:", error);

    return NextResponse.json(
      { error: "Upload failed. Please try again." },
      { status: 500 }
    );
  }
}