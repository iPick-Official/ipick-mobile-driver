const API = import.meta.env.VITE_API_ENDPOINT;
const token = localStorage.getItem("accessToken");

export interface UploadResponse {
  url: string;
  key: string;
}

export class UploadService {
  static async uploadFile(file: File): Promise<UploadResponse> {
    let fileToUpload = file;

    if (file.type.startsWith("image/")) {
      fileToUpload = await this.compressImage(file, 0.7);
    }

    const formData = new FormData();
    formData.append("file", fileToUpload);

    const res = await fetch(`${API}/files/upload`, {
      method: "POST",
      body: formData,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(err || "Failed to upload file");
    }

    const data: UploadResponse = await res.json();

    return data;
  }

  static async getFileUrl(key: string): Promise<string> {
    if (!key) return "";
    const res = await fetch(
      `${API}/files/url?filename=${encodeURIComponent(key)}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );
    if (!res.ok) {
      throw new Error(`Failed to get file URL: ${await res.text()}`);
    }
    const data = await res.json();
    return data.url;
  }

  private static compressImage(file: File, quality = 0.7): Promise<File> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const maxWidth = 1024;
          const maxHeight = 1024;
          let { width, height } = img;

          if (width > height && width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          } else if (height > maxHeight) {
            width = (width * maxHeight) / height;
            height = maxHeight;
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          if (!ctx) return reject("Failed to get canvas context");
          ctx.drawImage(img, 0, 0, width, height);

          canvas.toBlob(
            (blob) => {
              if (!blob) return reject("Compression failed");
              resolve(new File([blob], file.name, { type: file.type }));
            },
            file.type,
            quality,
          );
        };
        if (e.target?.result) img.src = e.target.result as string;
      };
      reader.onerror = (err) => reject(err);
      reader.readAsDataURL(file);
    });
  }
}
