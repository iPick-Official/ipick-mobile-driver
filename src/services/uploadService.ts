const API = import.meta.env.VITE_API_ENDPOINT;

export class UploadService {
  /**
   * Get a downloadable file URL from backend
   */
  static async getFileUrl(filename: string): Promise<string> {
    const res = await fetch(`${API}/files/url?filename=${filename}`);

    if (!res.ok) {
      throw new Error("Failed to get file URL");
    }

    const data = await res.json();
    return data.url;
  }

  /**
   * Upload file using backend-generated presigned URL
   */
  static async uploadFile(file: File): Promise<string> {
    // Ask backend for presigned upload URL
    const res = await fetch(`${API}/files/upload-url`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        fileName: file.name,
        contentType: file.type,
      }),
    });

    if (!res.ok) {
      throw new Error("Failed to get upload URL");
    }

    const { uploadUrl, key } = await res.json();

    // Upload directly to S3
    const uploadRes = await fetch(uploadUrl, {
      method: "PUT",
      headers: {
        "Content-Type": file.type,
      },
      body: file,
    });

    if (!uploadRes.ok) {
      throw new Error("Failed to upload file");
    }

    // Return stored key (save this in DB)
    return key;
  }
}
