import { Dispatch, SetStateAction } from "react";

export interface FileFieldConfig {
  label: string;
  value: File | null;
  setter: Dispatch<SetStateAction<File | null>>;
}

export const createDriverFileFields = (
  licenseFront: File | null,
  setLicenseFront: Dispatch<SetStateAction<File | null>>,
  licenseBack: File | null,
  setLicenseBack: Dispatch<SetStateAction<File | null>>,
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
