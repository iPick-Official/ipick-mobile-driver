import { UploadService } from "../services/uploadService";

export const getFileUrlIfAvailable = async (
  fileObj: { name?: string; url?: string | null } | string | undefined,
): Promise<string> => {
  if (!fileObj) return "";

  const key =
    typeof fileObj === "string" ? fileObj : fileObj.url || fileObj.name || "";

  if (!key) return "";

  if (key.startsWith("http")) {
    return key;
  }

  return await UploadService.getFileUrl(key);
};

export const getNameOrDefault = (
  fileObj: { name?: string; url?: string } | string | undefined,
  fallback: string,
): string => {
  if (!fileObj) return fallback;
  if (typeof fileObj === "string") return fileObj || fallback;
  return fileObj.name || fallback;
};
