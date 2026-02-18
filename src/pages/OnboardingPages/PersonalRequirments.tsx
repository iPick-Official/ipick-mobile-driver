import React, { useRef, useState } from "react";
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
  const [declarations, setDdeclarations] = useState<boolean>(false);

  const createInputRef = () =>
    useRef<HTMLInputElement>(null) as React.RefObject<HTMLInputElement>;

  const profilePicRef = createInputRef();
  const licenseFrontRef = createInputRef();
  const licenseBackRef = createInputRef();
  const pwdIdRef = createInputRef();
  const covidImgRef = createInputRef();
  const documentImgRef = createInputRef();

  const [profilePic, setProfilePic] = useState("");
  const [licenseFront, setLicenseFront] = useState<File | null>(null);
  const [licenseBack, setLicenseBack] = useState<File | null>(null);
  const [pwdId, setPwdId] = useState<File | null>(null);
  const [covidVaxImg, setCovidVaxImg] = useState<File | null>(null);
  const [documentImg, setDocumentImg] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const userId = localStorage.getItem("id");
  const token = localStorage.getItem("accessToken");

  const handleFileInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];

      const reader = new FileReader();
      reader.onload = () => setProfilePic(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const fileFields = createDriverFileFields(
    licenseFront,
    setLicenseFront,
    licenseBack,
    setLicenseBack
  );

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
              profilePic={profilePic}
              onFileChange={(file: File) =>
                handleFileInputChange({ target: { files: [file] } } as any)
              }
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
              refObj={refs.vaccinationCertificateConsent}
              text="I agree with the Terms of Service"
            />
            <FormField
              fieldType="checkbox"
              label=""
              value={declarations}
              onChange={setDdeclarations}
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