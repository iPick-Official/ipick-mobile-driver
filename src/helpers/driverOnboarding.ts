import { UploadService } from "../services/uploadService";

const uploadService = new UploadService(
  import.meta.env.VITE_AWS_ACCESS_KEY,
  import.meta.env.VITE_AWS_SECRET_KEY,
  import.meta.env.VITE_REGION,
  import.meta.env.VITE_BUCKET,
);

export const getNameOrDefault = (
  fileObj: { name?: string; url?: string } | string | undefined,
  fallback: string,
): string => {
  if (!fileObj) return fallback;
  if (typeof fileObj === "string") return fileObj || fallback;
  return fileObj.name || fallback;
};

export const getFileUrlIfAvailable = async (
  fileObj: { name?: string; url?: string } | string | undefined,
): Promise<string> => {
  const key = typeof fileObj === "string" ? fileObj : fileObj?.url || "";
  return key ? await uploadService.getFileUrl(key) : "";
};
