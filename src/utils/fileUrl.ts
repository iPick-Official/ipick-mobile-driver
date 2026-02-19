import { UploadService } from "../services/uploadService";
import { FileData } from "../types/driverTypes";

export const getFileUrlIfAvailable = async (
  fileObj:
    | { name?: string; url?: string | null; key?: string }
    | string
    | undefined,
): Promise<string> => {
  if (!fileObj) return "";

  // Determine the S3 key
  const key =
    typeof fileObj === "string"
      ? fileObj
      : fileObj.key || fileObj.url || fileObj.name || "";

  if (!key) return "";

  // If key is already a full HTTP(S) URL and not expired, return it
  if (key.startsWith("http")) return key;

  // Otherwise, request a fresh pre-signed URL from your API
  return await UploadService.getFileUrl(key);
};

export const setFileIfExists = async (
  file: FileData | undefined,
  setter: (val: FileData | null) => void,
) => {
  if (!file) return;
  const url = await getFileUrlIfAvailable(file);
  setter({
    name: file.name,
    url,
    key: file.key,
  });
};
