import { Dispatch, SetStateAction } from "react";
import { FileData } from "../types/driverTypes";

export interface FileFieldConfig {
  label: string;
  value: FileData | null;
  setter: Dispatch<SetStateAction<FileData | null>>;
}

/**
 * Creates the driver license file fields for the onboarding form.
 * Each field works with FileData | null, which allows previews.
 */
export const createDriverFileFields = (
  licenseFront: FileData | null,
  setLicenseFront: Dispatch<SetStateAction<FileData | null>>,
  licenseBack: FileData | null,
  setLicenseBack: Dispatch<SetStateAction<FileData | null>>,
): FileFieldConfig[] => [
  {
    label: "Driver License Front",
    value: licenseFront,
    setter: setLicenseFront,
  },
  {
    label: "Driver License Back",
    value: licenseBack,
    setter: setLicenseBack,
  },
];
