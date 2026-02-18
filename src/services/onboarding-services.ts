// src/api/driversApi.ts
import axios from "axios";
import { Driver, FileData } from "../types/driverTypes";

export interface PersonalRequirementsPayload {
  driverLicenseNumber?: string;
  driverLicenseExpDate?: string;
  nationality?: string;
  emergencyContactName?: string;
  emergencyContactMobNum?: string;
  emergencyContactAddress?: string;
  emergencyRelationship?: string;
  vaccinationCertificateConsent?: boolean;
  documentType?: string;
  termsOfService?: boolean;
  codeOfConduct?: boolean;
  privacyNotice?: boolean;
  declarations?: boolean;
  profilePicture?: FileData;
  vaccinationCertificate?: FileData;
  driverLicenseFront?: FileData;
  driverLicenseBack?: FileData;
  pwdFile?: FileData;
  documentImg?: FileData;
}

export const updatePersonalRequirements = async (
  driverId: string,
  data: PersonalRequirementsPayload,
) => {
  const formData = new FormData();

  // Append normal fields
  Object.entries(data).forEach(([key, value]) => {
    if (value !== undefined && typeof value !== "object") {
      formData.append(key, String(value));
    }
  });

  // Append file fields separately
  const fileFields = [
    "profilePicture",
    "vaccinationCertificate",
    "driverLicenseFront",
    "driverLicenseBack",
    "pwdFile",
    "documentImg",
  ];
  fileFields.forEach((field) => {
    const fileData = (data as any)[field] as FileData | undefined;
    if (fileData && (fileData as any).file) {
      formData.append(field, (fileData as any).file);
    }
  });

  const token = localStorage.getItem("accessToken");
  const url = `${import.meta.env.VITE_API_ENDPOINT}/drivers/${driverId}/personal-requirements`;

  const response = await fetch(url, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to update personal requirements: ${errorText}`);
  }

  return response.json();
};
