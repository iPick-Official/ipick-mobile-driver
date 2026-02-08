import { useCallback } from "react";
import { getNameOrDefault } from "../helpers/driverFile";
import { Driver } from "../types/driverTypes";
import { getFileUrlIfAvailable } from "../utils/fileUrl";

export const useDriverPersonalRequirements = ({
  setNationality,
  setLicenseNumber,
  setLicenseExp,
  setEmergencyPerson,
  setEmergencyMobile,
  setEmergencyAddress,
  setEmergencyRelationship,
  setDocumentType,
  setvaccinationCertificateConsent,
  setAgreements,
  setLicenseFront,
  setLicenseBack,
  setPwdId,
  setCovidVaxImg,
  setDocumentImg,
  setProfilePic,
}: {
  setNationality: (v: string) => void;
  setLicenseNumber: (v: string) => void;
  setLicenseExp: (v: string) => void;
  setEmergencyPerson: (v: string) => void;
  setEmergencyMobile: (v: string) => void;
  setEmergencyAddress: (v: string) => void;
  setEmergencyRelationship: (v: string) => void;
  setDocumentType: (v: string) => void;
  setvaccinationCertificateConsent: (v: boolean) => void;
  setAgreements: (v: {
    privacyNotice: boolean;
    codeOfConduct: boolean;
    termsOfService: boolean;
    declarations: boolean;
  }) => void;
  setLicenseFront: (v: string) => void;
  setLicenseBack: (v: string) => void;
  setPwdId: (v: string) => void;
  setCovidVaxImg: (v: string) => void;
  setDocumentImg: (v: string) => void;
  setProfilePic: (v: string) => void;
}) => {
  const fetchPersonalRequirements = useCallback(async () => {
    try {
      const stored = localStorage.getItem("driverData");
      if (!stored) return;

      const parsed: Driver = JSON.parse(stored);
      const personalReq = parsed.personalRequirements ?? {};

      setNationality(personalReq.nationality ?? "");
      setLicenseNumber(personalReq.driverLicenseNumber ?? "");
      setLicenseExp(personalReq.driverLicenseExpDate ?? "");

      setEmergencyPerson(personalReq.emergencyContactName ?? "");
      setEmergencyMobile(personalReq.emergencyContactMobNum ?? "");
      setEmergencyAddress(personalReq.emergencyContactAddress ?? "");
      setEmergencyRelationship(personalReq.emergencyRelationship ?? "");
      setDocumentType(personalReq.documentType ?? "");

      setvaccinationCertificateConsent(
        personalReq.vaccinationCertificateConsent ?? false,
      );

      setAgreements({
        privacyNotice: personalReq.privacyNotice ?? false,
        codeOfConduct: personalReq.codeOfConduct ?? false,
        termsOfService: personalReq.termsOfService ?? false,
        declarations: personalReq.declarations ?? false,
      });

      setLicenseFront(
        getNameOrDefault(
          personalReq.driverLicenseFront,
          "Driver's License Front",
        ),
      );
      setLicenseBack(
        getNameOrDefault(
          personalReq.driverLicenseBack,
          "Driver's License Back",
        ),
      );
      setPwdId(getNameOrDefault(personalReq.pwdFile, "PWD ID (Optional)"));
      setCovidVaxImg(
        getNameOrDefault(
          personalReq.vaccinationCertificate,
          "Covid Vaccine Card",
        ),
      );
      setDocumentImg(
        getNameOrDefault(personalReq.documentImg, "Clearance Type"),
      );

      const profilePicUrl = await getFileUrlIfAvailable(
        personalReq.profilePicture,
      );
      setProfilePic(profilePicUrl);
    } catch (err) {
      console.error("Failed to fetch personal requirements:", err);
    }
  }, []);

  return { fetchPersonalRequirements };
};
