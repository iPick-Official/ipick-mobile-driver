import React, { useEffect, useRef, useState } from "react";
import {
  IonContent,
  IonPage,
} from "@ionic/react";
import "../../styles/Onboarding.scss";
import HeaderWithTabs from "../../components/ui/TabHeader";
import FormField from "../../components/ui/FormField";
import ProfileUpload from "../../components/ui/ProfileUpload";
import { createDriverFileFields } from "../../config/driverFileFields";
import { fullText } from "../../utils/covid";
import ActionFooterButton from "../../components/ui/ActionFooterButton";
import { getFileUrlIfAvailable } from "../../utils/fileUrl";
import { Driver, FileData } from "../../types/driverTypes";

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
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const fileFields = createDriverFileFields(
    licenseFront,
    setLicenseFront,
    licenseBack,
    setLicenseBack
  );

  useEffect(() => {
    const loadData = async () => {
      const parsed: Driver | null = JSON.parse(localStorage.getItem("driverData") || "null");
      const req = parsed?.personalRequirements;
      if (!req) return;

      // Regular fields mapping
      const stateMap: Record<string, Function> = {
        driverLicenseNumber: setLicenseNumber,
        driverLicenseExpDate: setLicenseExp,
        nationality: setNationality,
        emergencyContactName: setEmergencyPerson,
        emergencyContactMobNum: setEmergencyMobile,
        emergencyContactAddress: setEmergencyAddress,
        emergencyRelationship: setEmergencyRelationship,
        vaccinationCertificateConsent: setvaccinationCertificateConsent,
        documentType: setDocumentType,
        termsOfService: setTermsOfService,
        codeOfConduct: setCodeOfConduct,
        privacyNotice: setPrivacyNotice,
        declarations: setDeclarations,
      };

      // Set non-file fields
      Object.entries(stateMap).forEach(([key, setter]) => setter(req[key as keyof typeof req]));

      // File fields mapping dynamically
      const fileStateMap: Record<
        string,
        Function
      > = {
        profilePicture: setProfilePicture,
        vaccinationCertificate: setCovidVaxImg,
        driverLicenseFront: setLicenseFront,
        driverLicenseBack: setLicenseBack,
        pwdFile: setPwdId,
        documentImg: setDocumentImg,
      };

      // Set file URLs dynamically
      await Promise.all(
        Object.entries(fileStateMap).map(async ([field, setter]) => {
          const file = req[field as keyof typeof req] as { name?: string; url?: string } | undefined;
          if (file && file.url) {
            setter({ name: file.name || field, url: await getFileUrlIfAvailable(file) });
          }
        })
      );
    };

    loadData();
  }, []);

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
                value={value}
                onChange={setter}
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
              refObj={refs.termsOfService}
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

      <ActionFooterButton
        text="Submit"
      // onClick={handleSubmit}
      // disabled={!profilePic || vaccinationConsent === false}
      />

    </IonPage>
  );
};

export default PersonlaReq;