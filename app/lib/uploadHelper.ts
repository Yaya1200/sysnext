import { validateUploadFile } from "./uploadValidation";

export async function uploadFile(
  file: File,
  acceptImagesOnly: boolean = true
): Promise<string> {
  const validationError = validateUploadFile(
    file,
    acceptImagesOnly
  );

  if (validationError) {
    throw new Error(validationError);
  }

  const formData = new FormData();

  formData.append("file", file);
  formData.append(
    "imagesOnly",
    String(acceptImagesOnly)
  );

  const response = await fetch("/api/upload", {
    method: "POST",
    body: formData,
  });

  let data: {
    url?: string;
    error?: string;
  };

  try {
    data = await response.json();
  } catch {
    throw new Error(
      "Upload failed. The server returned an invalid response."
    );
  }

  if (!response.ok) {
    throw new Error(data.error || "Upload failed");
  }

  if (!data.url) {
    throw new Error(
      "Upload succeeded but no file URL was returned."
    );
  }

  return data.url;
}