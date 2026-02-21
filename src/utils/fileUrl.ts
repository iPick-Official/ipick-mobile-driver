import { UploadService } from "../services/uploadService";
import { FileData } from "../types/driverTypes";

export const getFileUrlIfAvailable = async (file: FileData): Promise<string> => {
  try {
    if (!file.url && file.key) {
      return await UploadService.getFileUrl(file.key);
    }
    return file.url || "";
  } catch (err) {
    console.error("Failed to fetch file URL", err);
    return file.url || "";
  }
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
