import React, { useEffect, useRef, useState } from "react";
import {
  IonContent,
  IonPage,
} from "@ionic/react";
import "../../styles/Onboarding.scss";
import HeaderWithTabs from "../../components/ui/TabHeader";
import FormField from "../../components/ui/FormField";
import ProfileUpload from "../../components/ui/ProfileUpload";
import ActionFooterButton from "../../components/ui/ActionFooterButton";
import { createDriverFileFields } from "../../config/driverFileFields";
import { fullText } from "../../utils/covid";
import { getFileUrlIfAvailable } from "../../utils/fileUrl";
import { Driver, FileData, PersonalRequirements } from "../../types/driverTypes";
import { UploadService } from "../../services/uploadService";
import Loading from "../../components/Loading";

const PersonlaReq: React.FC = () => {
  const [activeTab, setActiveTab] = useState("personal");

  const refs = {
    nationality: useRef(""),
    licenseNumber: useRef(""),
    licenseExp: useRef(""),
    emergencyPerson: useRef(""),
    emergencyMobile: useRef(""),
    emergencyAddress: useRef(""),
    emergencyRelationship: useRef(""),
    documentType: useRef(""),
    privacyNotice: useRef(false),
    codeOfConduct: useRef(false),
    termsOfService: useRef(false),
    declarations: useRef(false),
    vaccinationCertificateConsent: useRef(false),
  };

  const [nationality, setNationality] = useState("");
  const [licenseNumber, setLicenseNumber] = useState("");
  const [licenseExp, setLicenseExp] = useState("");
  const [emergencyPerson, setEmergencyPerson] = useState("");
  const [emergencyMobile, setEmergencyMobile] = useState("");
  const [emergencyAddress, setEmergencyAddress] = useState("");
  const [emergencyRelationship, setEmergencyRelationship] = useState("");
  const [documentType, setDocumentType] = useState("");
  const [vaccinationCertificateConsent, setvaccinationCertificateConsent] = useState<boolean>(false);
  const [privacyNotice, setPrivacyNotice] = useState<boolean>(false);
  const [termsOfService, setTermsOfService] = useState<boolean>(false);
  const [codeOfConduct, setCodeOfConduct] = useState<boolean>(false);
  const [declarations, setDeclarations] = useState<boolean>(false);
  const [profilePicture, setProfilePicture] = useState<FileData | null>(null);
  const [licenseFront, setLicenseFront] = useState<FileData | null>(null);
  const [licenseBack, setLicenseBack] = useState<FileData | null>(null);
  const [pwdId, setPwdId] = useState<FileData | null>(null);
  const [covidVaxImg, setCovidVaxImg] = useState<FileData | null>(null);
  const [documentImg, setDocumentImg] = useState<FileData | null>(null);
  const [loading, setLoading] = useState(false);
  const [driverData, setDriverData] = useState<Driver | null>(null);
  const [originalPersonalReq, setOriginalPersonalReq] = useState<any>(null);
  const token = localStorage.getItem("accessToken");

  const fileFields = createDriverFileFields(
    licenseFront,
    setLicenseFront,
    licenseBack,
    setLicenseBack
  );

  const isFormValid =
    privacyNotice &&
    termsOfService &&
    codeOfConduct &&
    declarations &&
    vaccinationCertificateConsent;

  useEffect(() => {
    const stored = localStorage.getItem("driverData");
    if (!stored) return;

    const parsed: Driver = JSON.parse(stored);
    setDriverData(parsed);

    const req = parsed.personalRequirements;
    if (!req) return;

    setOriginalPersonalReq(req);

    // Regular fields mapping
    const stateMap: {
      [K in keyof PersonalRequirements]?: {
        setter: (val: any) => void;
        ref: React.RefObject<any>;
      };
    } = {
      driverLicenseNumber: { setter: setLicenseNumber, ref: refs.licenseNumber },
      driverLicenseExpDate: { setter: setLicenseExp, ref: refs.licenseExp },
      nationality: { setter: setNationality, ref: refs.nationality },
      emergencyContactName: { setter: setEmergencyPerson, ref: refs.emergencyPerson },
      emergencyContactMobNum: { setter: setEmergencyMobile, ref: refs.emergencyMobile },
      emergencyContactAddress: { setter: setEmergencyAddress, ref: refs.emergencyAddress },
      emergencyRelationship: { setter: setEmergencyRelationship, ref: refs.emergencyRelationship },
      vaccinationCertificateConsent: { setter: setvaccinationCertificateConsent, ref: refs.vaccinationCertificateConsent },
      documentType: { setter: setDocumentType, ref: refs.documentType },
      termsOfService: { setter: setTermsOfService, ref: refs.termsOfService },
      codeOfConduct: { setter: setCodeOfConduct, ref: refs.codeOfConduct },
      privacyNotice: { setter: setPrivacyNotice, ref: refs.privacyNotice },
      declarations: { setter: setDeclarations, ref: refs.declarations },
    };

    Object.entries(stateMap).forEach(([key, config]) => {
      if (!config) return;

      const typedKey = key as keyof PersonalRequirements;
      const value = req[typedKey];

      config.setter(value ?? "");
      config.ref.current = value ?? "";
    });
  }, []);

  useEffect(() => {
    const loadFiles = async () => {
      if (!driverData) return;
      const req = driverData.personalRequirements;
      if (!req) return;

      const fileStateMap: Record<string, React.Dispatch<React.SetStateAction<FileData | null>>> = {
        profilePicture: setProfilePicture,
        vaccinationCertificate: setCovidVaxImg,
        driverLicenseFront: setLicenseFront,
        driverLicenseBack: setLicenseBack,
        pwdFile: setPwdId,
        documentImg: setDocumentImg,
      };

      await Promise.all(
        Object.entries(fileStateMap).map(async ([field, setter]) => {
          const file = req[field as keyof typeof req] as FileData | undefined;
          if (!file) return;

          // Always fetch a fresh URL from server
          const url = await getFileUrlIfAvailable(file);
          setter({ ...file, url }); // Keep original info, but update with fresh URL
        })
      );
    };

    loadFiles();
  }, [driverData]);

  const handleUpdate = async () => {
    if (!driverData || !originalPersonalReq) return;

    setLoading(true);

    try {
      const updates: any = {};

      // ---- Upload files if they have raw File ----
      const fileFields = [
        { state: profilePicture, key: "profilePicture", setter: setProfilePicture },
        { state: licenseFront, key: "driverLicenseFront", setter: setLicenseFront },
        { state: licenseBack, key: "driverLicenseBack", setter: setLicenseBack },
        { state: pwdId, key: "pwdFile", setter: setPwdId },
        { state: covidVaxImg, key: "vaccinationCertificate", setter: setCovidVaxImg },
        { state: documentImg, key: "documentImg", setter: setDocumentImg },
      ];

      for (const field of fileFields) {
        if (field.state?.file) {
          const uploaded = await UploadService.uploadFile(field.state.file);

          // Only save the key, not full URL
          const fileKey = uploaded.key;
          updates[field.key] = { name: field.state.name, url: fileKey };

          // Update local state so preview works immediately
          field.setter({ name: field.state.name, url: fileKey, file: field.state.file });
        }
      }

      // ---- Compare and add normal fields ----
      const fieldMap: Record<string, any> = {
        driverLicenseNumber: refs.licenseNumber.current,
        driverLicenseExpDate: refs.licenseExp.current,
        nationality: refs.nationality.current,
        emergencyContactName: refs.emergencyPerson.current,
        emergencyContactMobNum: refs.emergencyMobile.current,
        emergencyContactAddress: refs.emergencyAddress.current,
        emergencyRelationship: refs.emergencyRelationship.current,
        vaccinationCertificateConsent: refs.vaccinationCertificateConsent.current,
        documentType: refs.documentType.current,
        termsOfService: refs.termsOfService.current,
        codeOfConduct: refs.codeOfConduct.current,
        privacyNotice: refs.privacyNotice.current,
        declarations: refs.declarations.current,
      };

      Object.entries(fieldMap).forEach(([key, value]) => {
        const originalValue = originalPersonalReq[key];
        if (value !== originalValue) {
          updates[key] = value;
        }
      });

      if (Object.keys(updates).length === 0) {
        alert("Please make changes.");
        setLoading(false);
        return;
      }

      // ---- Merge updates with original data to prevent clearing other fields ----
      const mergedUpdates = {
        ...originalPersonalReq,
        ...updates,
      };

      // ---- Send PATCH ----
      const response = await fetch(
        `${import.meta.env.VITE_API_ENDPOINT}/drivers/${driverData._id}/personal-requirements`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(mergedUpdates),
        }
      );

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(errText || "Failed to update personal requirements");
      }

      const updatedDriver = await response.json();
      localStorage.setItem("driverData", JSON.stringify(updatedDriver));
      setDriverData(updatedDriver);
      setOriginalPersonalReq(updatedDriver.personalRequirements);

      alert("Personal requirements updated successfully!");
    } catch (err: any) {
      console.error("Update failed:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <IonPage>
      <HeaderWithTabs
        title="Personal Requirements"
        activeTab={activeTab}
        onTabChange={setActiveTab}
        size="small"
        tabs={[
          { value: "personal", label: "Personal" },
          { value: "emergency", label: "Emergency" },
          { value: "clearance", label: "Clearance" },
        ]}
      />

      <IonContent fullscreen className="ion-padding">
        {activeTab === "personal" && (
          <>
            <ProfileUpload
              profilePic={profilePicture}
              onFileChange={(file: File) => {
                setProfilePicture({
                  name: file.name,
                  url: URL.createObjectURL(file),
                  file,
                });
              }}
            />

            <FormField
              fieldType="text"
              label="License Number"
              value={licenseNumber}
              onChange={setLicenseNumber}
              refObj={refs.licenseNumber}
              placeholder="eg. (D08-65-001256)"
              required
            />

            <FormField
              fieldType="date"
              label="License Expiry"
              value={licenseExp}
              onChange={setLicenseExp}
              refObj={refs.licenseExp}
              required
            />

            <FormField
              fieldType="select"
              label="Nationality"
              value={nationality}
              onChange={setNationality}
              refObj={refs.nationality}
              options={[
                { value: "Filipino", label: "Filipino" },
                { value: "Foreign", label: "Foreign" },
              ]}
              required
            />

            {fileFields.map(({ label, value, setter }) => (
              <FormField
                key={label}
                fieldType="file"
                label={label}
                value={value} // FileData | null
                onChange={(fileData: FileData | null) => setter(fileData)} // matches type
                accept="image/*"
              // captureBackCamera
              />
            ))}
          </>
        )}

        {activeTab === "emergency" && (
          <>
            <FormField
              fieldType="text"
              label="Contact Person"
              value={emergencyPerson}
              onChange={setEmergencyPerson}
              refObj={refs.emergencyPerson}
              placeholder="eg. (Marites Santos)"
              required
            />

            <FormField
              fieldType="text"
              label="Mobile Number"
              value={emergencyMobile}
              onChange={setEmergencyMobile}
              refObj={refs.emergencyMobile}
              placeholder="eg. (09123456789)"
              type="tel"
              inputMode="tel"
              required
            />

            <FormField
              fieldType="text"
              label="Ralationship"
              value={emergencyRelationship}
              onChange={setEmergencyRelationship}
              refObj={refs.emergencyRelationship}
              placeholder="eg. (Mother)"
              required
            />

            <FormField
              fieldType="textarea"
              label="Complete Address"
              value={emergencyAddress}
              onChange={setEmergencyAddress}
              placeholder="123 Main St Cubao QC"
              rows={4}
            />

            <FormField
              fieldType="file"
              label="PWD ID (Optional)"
              value={pwdId}
              onChange={setPwdId}
            />

            <FormField
              fieldType="file"
              label="Covid Vaccine Certificate"
              value={covidVaxImg}
              onChange={setCovidVaxImg}
            />

            <FormField
              fieldType="checkbox"
              label=""
              value={vaccinationCertificateConsent}
              onChange={setvaccinationCertificateConsent}
              refObj={refs.vaccinationCertificateConsent}
              text={fullText}
            />
          </>
        )}

        {activeTab === "clearance" && (
          <>
            <FormField
              fieldType="select"
              label="Clearance Type"
              value={documentType}
              onChange={setDocumentType}
              refObj={refs.documentType}
              options={[
                { value: "Police Clearance", label: "Police Clearance" },
                { value: "NBI Clearance", label: "NBI Clearance" },
              ]}
              required
            />
            <FormField
              fieldType="file"
              label="NBI/Police Clearance"
              value={documentImg}
              onChange={setDocumentImg}
            />

            <FormField
              fieldType="checkbox"
              label=""
              value={privacyNotice}
              onChange={setPrivacyNotice}
              refObj={refs.privacyNotice}
              text="I agree with the Privacy Notice"
            />
            <FormField
              fieldType="checkbox"
              label=""
              value={codeOfConduct}
              onChange={setCodeOfConduct}
              refObj={refs.codeOfConduct}
              text="I agree with the Code of Conduct"
            />
            <FormField
              fieldType="checkbox"
              label=""
              value={termsOfService}
              onChange={setTermsOfService}
              refObj={refs.termsOfService}
              text="I agree with the Terms of Service"
            />
            <FormField
              fieldType="checkbox"
              label=""
              value={declarations}
              onChange={setDeclarations}
              refObj={refs.declarations}
              text="I agree with the Declarations"
            />
          </>
        )}
      </IonContent>
      <Loading isOpen={loading} message="Waiting..." />
      <ActionFooterButton
        text="Submit"
        onClick={handleUpdate}
        disabled={!isFormValid || loading}
      />

    </IonPage>
  );
};

export default PersonlaReq;