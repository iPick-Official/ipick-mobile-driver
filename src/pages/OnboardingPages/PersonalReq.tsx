import React, { useEffect, useRef, useState } from "react";
import {
  IonAvatar,
  IonButton,
  IonButtons,
  IonCheckbox,
  IonCol,
  IonContent,
  IonFooter,
  IonGrid,
  IonHeader,
  IonIcon,
  IonImg,
  IonInput,
  IonItem,
  IonLabel,
  IonPage,
  IonRow,
  IonSegment,
  IonSegmentButton,
  IonSelect,
  IonSelectOption,
  IonText,
  IonTextarea,
  IonToast,
  IonToolbar,
} from "@ionic/react";
import "@theme/variables.css";

import { cloudUploadSharp } from "ionicons/icons";
import { UploadService } from "../../services/uploadService";
import { capitalizeWords } from "../../utils/textUtils";

import Loading from "../../components/Loading";
import BackButton from "../../components/BackButton";

const PersonlaReq: React.FC = () => {
  const [activeTab, setActiveTab] = useState("personal");
  const originalUserRef = useRef<any>(null);

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
  };

  const [nationality, setNationality] = useState("");
  const [licenseNumber, setLicenseNumber] = useState("");
  const [licenseExp, setLicenseExp] = useState("");
  const [emergencyPerson, setEmergencyPerson] = useState("");
  const [emergencyMobile, setEmergencyMobile] = useState("");
  const [emergencyAddress, setEmergencyAddress] = useState("");
  const [emergencyRelationship, setEmergencyRelationship] = useState("");
  const [documentType, setDocumentType] = useState("");
  const [vaccinationCertificateConsent, setvaccinationCertificateConsent] =
    useState<boolean>(false);
  type Agreements = {
    privacyNotice: boolean;
    codeOfConduct: boolean;
    termsOfService: boolean;
    declarations: boolean;
  };

  const [agreements, setAgreements] = useState<Agreements>({
    privacyNotice: false,
    codeOfConduct: false,
    termsOfService: false,
    declarations: false,
  });
  const allAgreementsChecked = Object.values(agreements).every(Boolean);

  const [expanded, setExpanded] = useState(false);
  const fullText = `Bilang iPick Driver-partner na may mataas na interaksyon sa publiko, ako ay boluntaryong sasailalim sa COVID-19 vaccination at nangangakong magsusumite ng proof of vaccination sa loob ng 30 araw mula sa aking activation. Naiintindihan kong may karapatan ang iPick na kumilos kung ako'y hindi sumunod.`;
  const shortText = fullText.slice(0, 100) + "...";

  const createInputRef = () =>
    useRef<HTMLInputElement>(null) as React.RefObject<HTMLInputElement>;

  const profilePicRef = createInputRef();
  const licenseFrontRef = createInputRef();
  const licenseBackRef = createInputRef();
  const pwdIdRef = createInputRef();
  const covidImgRef = createInputRef();
  const documentImgRef = createInputRef();

  const [profilePic, setProfilePic] = useState("");
  const [licenseFront, setLicenseFront] = useState("Driver's License Front");
  const [licenseBack, setLicenseBack] = useState("Driver's License Back");
  const [pwdId, setPwdId] = useState("PWD ID (Optional)");
  const [covidVax, setCovidVaxImg] = useState("Covid Vaccine Card");
  const [documentImg, setDocumentImg] = useState("Clearance Type");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const userId = localStorage.getItem("id");
  const status = localStorage.getItem("status") === "approved";

  const uploadService = new UploadService(
    import.meta.env.VITE_AWS_ACCESS_KEY,
    import.meta.env.VITE_AWS_SECRET_KEY,
    import.meta.env.VITE_REGION,
    import.meta.env.VITE_BUCKET
  );

  const handleUpdate = async () => {
    setLoading(true);
    setError("");

    try {
      const currentUser = originalUserRef.current;
      const personalRequirements = currentUser?.personalRequirements || {};

      // Upload files
      const uploadedFiles: Record<string, { name: string; url: string }> = {};

      const uploadIfExists = async (
        ref: React.RefObject<HTMLInputElement>,
        fieldName: string
      ) => {
        const file = ref.current?.files?.[0];

        if (file) {
          const arrayBuffer = await file.arrayBuffer();
          const uploaded = new File([arrayBuffer], file.name, {
            type: file.type,
          });
          await uploadService.uploadFile(uploaded);
          uploadedFiles[fieldName] = { name: file.name, url: file.name };
        } else if (personalRequirements?.[fieldName]) {
          uploadedFiles[fieldName] = {
            name: personalRequirements[fieldName].name || "",
            url: personalRequirements[fieldName].url || "",
          };
        } else {
          uploadedFiles[fieldName] = { name: "", url: "" };
        }
      };

      await Promise.all([
        uploadIfExists(profilePicRef, "profilePicture"),
        uploadIfExists(licenseFrontRef, "driverLicenseFront"),
        uploadIfExists(licenseBackRef, "driverLicenseBack"),
        uploadIfExists(pwdIdRef, "pwdFile"),
        uploadIfExists(covidImgRef, "vaccinationCertificate"),
        uploadIfExists(documentImgRef, "documentImg"),
      ]);

      const payload = {
        ...currentUser,
        profilePicture: uploadedFiles.profilePicture,
        nationality:
          capitalizeWords(refs.nationality.current?.trim() || "") ||
          personalRequirements?.nationality ||
          "",
        pwd: 0,
        pwdFile: uploadedFiles.pwdFile,
        vaccinationCertificate: uploadedFiles.vaccinationCertificate,
        vaccinationCertificateConsent,
        emergencyContactName:
          capitalizeWords(refs.emergencyPerson.current?.trim() || "") ||
          personalRequirements?.emergencyContactName ||
          "",
        emergencyContactAddress:
          capitalizeWords(refs.emergencyAddress.current?.trim() || "") ||
          personalRequirements?.emergencyContactAddress ||
          "",
        emergencyContactMobNum:
          refs.emergencyMobile.current?.trim() ||
          personalRequirements?.emergencyContactMobNum ||
          "",
        emergencyRelationship:
          capitalizeWords(refs.emergencyRelationship.current?.trim() || "") ||
          personalRequirements?.emergencyRelationship ||
          "",
        driverLicenseFront: uploadedFiles.driverLicenseFront,
        driverLicenseBack: uploadedFiles.driverLicenseBack,
        driverLicenseNumber:
          refs.licenseNumber.current?.trim() ||
          personalRequirements?.driverLicenseNumber ||
          "",
        driverLicenseExpDate:
          refs.licenseExp.current?.trim() ||
          personalRequirements?.driverLicenseExpDate ||
          "",
        documentType:
          capitalizeWords(refs.documentType.current?.trim() || "") ||
          personalRequirements?.documentType ||
          "",
        documentImg: uploadedFiles.documentImg,
        privacyNotice:
          refs.privacyNotice.current || personalRequirements?.privacyNotice,
        codeOfConduct:
          refs.codeOfConduct.current || personalRequirements?.codeOfConduct,
        termsOfService:
          refs.termsOfService.current || personalRequirements?.termsOfService,
        declarations:
          refs.declarations.current || personalRequirements?.declarations,
      };

      const response = await fetch(
        `${import.meta.env.VITE_API_ENDPOINT_DRIVER
        }/Drivers/updatePersonalRequirements/${userId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      if (response.status === 404) {
        setError("Please change information to update your account!");
        return;
      }

      let result: any = {};
      try {
        result = await response.json();
      } catch (_) { }

      originalUserRef.current = {
        ...originalUserRef.current,
        personalRequirements: result,
      };

      alert("Requirments updated successfully.");
      handleFetchPersonReq();
    } catch (e: any) {
      console.error("Update error:", e);
      setError("Please change information to update your account!");
    } finally {
      setLoading(false);
    }
  };

  const handleFetchPersonReq = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_ENDPOINT_DRIVER
        }/Drivers/getPersonalRequirements/${userId}`,
        {
          method: "GET",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch driver. Status: ${response.status}`);
      }

      const data = await response.json();
      originalUserRef.current = data; // keep full data for fallbacks

      const personalReq = data.personalRequirements || {};

      // Fill form state (simple strings)
      setNationality(personalReq.nationality || "");
      setLicenseNumber(personalReq.driverLicenseNumber || "");
      setLicenseExp(personalReq.driverLicenseExpDate || "");

      setEmergencyPerson(personalReq.emergencyContactName || "");
      setEmergencyMobile(personalReq.emergencyContactMobNum || "");
      setEmergencyAddress(personalReq.emergencyContactAddress || "");
      setEmergencyRelationship(personalReq.emergencyRelationship || "");
      setDocumentType(personalReq.documentType || "");
      setvaccinationCertificateConsent(
        personalReq.vaccinationCertificateConsent || false
      );

      setAgreements({
        privacyNotice: personalReq.privacyNotice || false,
        codeOfConduct: personalReq.codeOfConduct || false,
        termsOfService: personalReq.termsOfService || false,
        declarations: personalReq.declarations || false,
      });

      // Helper to get the file name or fallback string
      const getNameOrDefault = (
        fileObj: { name?: string; url?: string } | string | undefined,
        fallback: string
      ): string => {
        if (!fileObj) return fallback;
        if (typeof fileObj === "string") return fileObj || fallback;
        return fileObj.name || fallback;
      };

      const getFileUrlIfAvailable = async (
        fileObj: { name?: string; url?: string } | string | undefined
      ): Promise<string> => {
        const key = typeof fileObj === "string" ? fileObj : fileObj?.url || "";
        return key ? await uploadService.getFileUrl(key) : "";
      };

      setLicenseFront(
        getNameOrDefault(
          personalReq.driverLicenseFront,
          "Driver's License Front"
        )
      );
      setLicenseBack(
        getNameOrDefault(personalReq.driverLicenseBack, "Driver's License Back")
      );
      setPwdId(getNameOrDefault(personalReq.pwdFile, "PWD ID (Optional)"));
      setCovidVaxImg(
        getNameOrDefault(
          personalReq.vaccinationCertificate,
          "Covid Vaccine Card"
        )
      );
      setDocumentImg(
        getNameOrDefault(personalReq.documentImg, "Clearance Type")
      );

      // Get the signed URL only for profile picture (e.g. for preview image)
      const profilePicUrl = await getFileUrlIfAvailable(
        personalReq.profilePicture
      );
      setProfilePic(profilePicUrl); // For preview
    } catch (error) {
      console.error("Error fetching driver data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleFetchPersonReq();
  }, []);

  const handleTabChange = (e: CustomEvent) => {
    setActiveTab(e.detail.value);
  };

  const handleCompress = (img: HTMLImageElement): string => {
    const MAX_WIDTH = 800;
    const MAX_HEIGHT = 800;

    let width = img.width;
    let height = img.height;

    console.log(`Original image dimensions: ${width}x${height}`);

    // Maintain aspect ratio
    if (width > height) {
      if (width > MAX_WIDTH) {
        height = Math.round((height * MAX_WIDTH) / width);
        width = MAX_WIDTH;
      }
    } else {
      if (height > MAX_HEIGHT) {
        width = Math.round((width * MAX_HEIGHT) / height);
        height = MAX_HEIGHT;
      }
    }

    console.log(`Resized image dimensions: ${width}x${height}`);

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext("2d");
    if (!ctx) {
      console.error("Failed to get canvas context");
      return "";
    }

    ctx.drawImage(img, 0, 0, width, height);

    let quality = 0.7;
    let dataUrl = canvas.toDataURL("image/jpeg", quality);

    console.log(
      `Initial compressed size at quality ${quality}: ${(
        dataUrl.length / 1024
      ).toFixed(2)} KB`
    );

    while (dataUrl.length / 1024 > 300 && quality > 0.1) {
      quality -= 0.05;
      dataUrl = canvas.toDataURL("image/jpeg", quality);
      console.log(
        `Compressed size at quality ${quality.toFixed(2)}: ${(
          dataUrl.length / 1024
        ).toFixed(2)} KB`
      );
    }

    console.log(
      `Final compressed image size: ${(dataUrl.length / 1024).toFixed(2)} KB`
    );

    return dataUrl;
  };

  const handleFileClick = (ref: React.RefObject<{ click: () => void }>) => {
    ref.current?.click();
  };

  const handleProfileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      console.warn("No file selected");
      return;
    }

    console.log(
      `Original file size: ${(file.size / 1024 / 1024).toFixed(2)} MB`
    );

    const reader = new FileReader();
    reader.onload = (e) => {
      if (!e.target?.result) {
        console.error("Failed to read image data from FileReader");
        return;
      }

      const img = new Image();
      img.onload = () => {
        const compressedDataUrl = handleCompress(img);
        setProfilePic(compressedDataUrl);
      };
      img.src = e.target.result as string;
    };

    reader.readAsDataURL(file);
  };

  const handleFileChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    setFileName: (name: string) => void
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      setFileName(file.name);
    }
  };

  const handleAgreementChange = (key: string, checked: boolean) => {
    setAgreements((prev) => ({
      ...prev,
      [key]: checked,
    }));

    // Also update refs if you need to keep them in sync
    switch (key) {
      case "privacyNotice":
        refs.privacyNotice.current = checked;
        break;
      case "codeOfConduct":
        refs.codeOfConduct.current = checked;
        break;
      case "termsOfService":
        refs.termsOfService.current = checked;
        break;
      case "declarations":
        refs.declarations.current = checked;
        break;
    }
  };

  const agreementFields = [
    { key: "privacyNotice", label: "I agree with the Privacy Notice" },
    { key: "codeOfConduct", label: "I agree with the Code of Conduct" },
    { key: "termsOfService", label: "I agree with the Terms of Service" },
    { key: "declarations", label: "I agree with the Declarations" },
  ];

  return (
    <IonPage>
      <IonHeader translucent={true} className="ion-no-border">
        <IonToolbar>
          <IonButtons slot="start">
            <BackButton />
          </IonButtons>
        </IonToolbar>
        <IonToolbar>
          <IonSegment value={activeTab} onIonChange={handleTabChange}>
            <IonSegmentButton value="personal">
              <IonLabel>Personal</IonLabel>
            </IonSegmentButton>
            <IonSegmentButton value="emergency">
              <IonLabel>Emergency</IonLabel>
            </IonSegmentButton>
            <IonSegmentButton value="documents">
              <IonLabel>Documents</IonLabel>
            </IonSegmentButton>
          </IonSegment>
        </IonToolbar>
      </IonHeader>
      {activeTab === "personal" && (
        <IonContent className="ion-padding" fullscreen>
          {/* Profile Picture Section */}
          <div className="profile-upload-container" onClick={() => handleFileClick(profilePicRef)}>
            <IonAvatar className="profile-avatar">
              <IonImg src={profilePic || "/favicon.png"} alt="Profile" />
            </IonAvatar>

            {!profilePic && (
              <div className="upload-text">
                Upload Profile
              </div>
            )}

            <input
              type="file"
              accept="image/*"
              ref={profilePicRef}
              className="hidden-file-input"
              onChange={handleProfileChange}
            />
          </div>
          {/* Input Field */}
          <IonItem lines="none" className="input-field">
            <IonLabel>Nationality</IonLabel>
            <IonSelect
              interface="action-sheet"
              justify="start"
              slot="end"
              placeholder="Select Nationality"
              value={nationality}
              onIonChange={(e) => {
                const selectedValue = e.detail.value;
                setNationality(selectedValue);
                refs.nationality.current = selectedValue;
              }}
            >
              <IonSelectOption value="Filipino">Filipino</IonSelectOption>
              <IonSelectOption value="Foreign">Foreign</IonSelectOption>
            </IonSelect>
          </IonItem>
          <IonItem lines="none" className="input-field">
            <IonInput
              color="dark"
              inputMode="text"
              placeholder="Driver's License Number"
              label="Driver's License Number"
              labelPlacement="floating"
              type="text"
              value={licenseNumber}
              onIonChange={(e) => {
                const value = (e.detail.value || "").toUpperCase();
                setLicenseNumber(value);
                refs.licenseNumber.current = value;
              }}
              className="floating-label-dark"
            />
          </IonItem>
          <IonItem lines="none" className="input-field">
            <IonInput
              color="dark"
              inputMode="numeric"
              placeholder="Driver's License Exp. Date"
              label="Driver's License Exp. Date"
              labelPlacement="floating"
              type="date"
              value={licenseExp}
              onIonChange={(e) => {
                const value = e.detail.value || "";
                setLicenseExp(value);
                refs.licenseExp.current = value;
              }}
              className="floating-label-dark"
            />
          </IonItem>
          <IonItem lines="none" className="checkbox-field">
            <IonGrid>
              <IonRow className="ion-align-items-center">
                <IonCol size="9">
                  <IonText>{licenseFront}</IonText>
                </IonCol>
                <IonCol size="3">
                  <IonButton
                    size="small"
                    expand="block"
                    shape="round"
                    onClick={() => handleFileClick(licenseFrontRef)}
                  >
                    <IonIcon icon={cloudUploadSharp} />
                  </IonButton>
                  <input
                    type="file"
                    ref={licenseFrontRef}
                    style={{ display: "none" }}
                    onChange={(e) => handleFileChange(e, setLicenseFront)}
                  />
                </IonCol>
              </IonRow>
            </IonGrid>
          </IonItem>
          <IonItem lines="none" className="checkbox-field">
            <IonGrid>
              <IonRow className="ion-align-items-center">
                <IonCol size="9">
                  <IonText>{licenseBack}</IonText>
                </IonCol>
                <IonCol size="3">
                  <IonButton
                    size="small"
                    expand="block"
                    shape="round"
                    onClick={() => handleFileClick(licenseBackRef)}
                  >
                    <IonIcon icon={cloudUploadSharp} />
                  </IonButton>
                  <input
                    type="file"
                    ref={licenseBackRef}
                    style={{ display: "none" }}
                    onChange={(e) => handleFileChange(e, setLicenseBack)}
                  />
                </IonCol>
              </IonRow>
            </IonGrid>
          </IonItem>
          <IonItem lines="none" className="checkbox-field">
            <IonGrid>
              <IonRow className="ion-align-items-center">
                <IonCol size="9">
                  <IonText>{pwdId}</IonText>
                </IonCol>
                <IonCol size="3">
                  <IonButton
                    size="small"
                    expand="block"
                    shape="round"
                    onClick={() => handleFileClick(pwdIdRef)}
                  >
                    <IonIcon icon={cloudUploadSharp} />
                  </IonButton>
                  <input
                    type="file"
                    ref={pwdIdRef}
                    style={{ display: "none" }}
                    onChange={(e) => handleFileChange(e, setPwdId)}
                  />
                </IonCol>
              </IonRow>
            </IonGrid>
          </IonItem>
        </IonContent>
      )}

      {activeTab === "emergency" && (
        <IonContent className="ion-padding" fullscreen>
          <IonItem lines="none" className="input-field">
            <IonInput
              color="dark"
              inputMode="text"
              placeholder="ex. (Marites Dela Cruz)"
              label="Contact Person"
              labelPlacement="floating"
              type="text"
              value={emergencyPerson}
              onIonChange={(e) => {
                const value = capitalizeWords(e.detail.value || "");
                setEmergencyPerson(value);
                refs.emergencyPerson.current = value;
              }}
              className="floating-label-dark"
            />
          </IonItem>
          <IonItem lines="none" className="input-field">
            <IonInput
              color="dark"
              inputMode="numeric"
              placeholder="ex. (09123456789)"
              label="Mobile Number"
              labelPlacement="floating"
              type="tel"
              value={emergencyMobile}
              onIonChange={(e) => {
                const value = e.detail.value || "";
                setEmergencyMobile(value);
                refs.emergencyMobile.current = value;
              }}
              className="floating-label-dark"
            />
          </IonItem>
          <IonItem lines="none" className="input-field">
            <IonTextarea
              color="dark"
              inputMode="text"
              placeholder="123 Orange St. Cubao, QC"
              label="Address"
              labelPlacement="floating"
              value={emergencyAddress}
              onIonChange={(e) => {
                const value = capitalizeWords(e.detail.value || "");
                setEmergencyAddress(value);
                refs.emergencyAddress.current = value;
              }}
              className="floating-label-dark"
            />
          </IonItem>
          <IonItem lines="none" className="input-field">
            <IonInput
              color="dark"
              inputMode="text"
              placeholder="ex. (Spouse)"
              label="Relationship"
              labelPlacement="floating"
              value={emergencyRelationship}
              type="text"
              onIonChange={(e) => {
                const value = capitalizeWords(e.detail.value || "");
                setEmergencyRelationship(value);
                refs.emergencyRelationship.current = value;
              }}
              className="floating-label-dark"
            />
          </IonItem>
          <IonItem lines="none" className="checkbox-field">
            <IonGrid>
              <IonRow className="ion-align-items-center">
                <IonCol size="9">
                  <IonText>{covidVax}</IonText>
                </IonCol>
                <IonCol size="3">
                  <IonButton
                    size="small"
                    expand="block"
                    shape="round"
                    onClick={() => handleFileClick(covidImgRef)}
                  >
                    <IonIcon icon={cloudUploadSharp} />
                  </IonButton>
                  <input
                    type="file"
                    ref={covidImgRef}
                    style={{ display: "none" }}
                    onChange={(e) => handleFileChange(e, setCovidVaxImg)}
                  />
                </IonCol>
              </IonRow>
            </IonGrid>
          </IonItem>
          <IonItem lines="none" className="checkbox-field">
            <IonCheckbox
              labelPlacement="end"
              checked={vaccinationCertificateConsent || false}
              onIonChange={(e) =>
                setvaccinationCertificateConsent(e.detail.checked)
              }
            />
            <IonText style={{ padding: "16px" }}>
              {expanded ? fullText : shortText}
              <IonButton
                fill="clear"
                size="small"
                onClick={() => setExpanded(!expanded)}
              >
                {expanded ? "Show Less" : "Show More"}
              </IonButton>
            </IonText>
          </IonItem>
        </IonContent>
      )}

      {activeTab === "documents" && (
        <IonContent className="ion-padding" fullscreen>
          <IonItem lines="none" className="input-field">
            <IonLabel>Document Type</IonLabel>
            <IonSelect
              interface="action-sheet"
              justify="start"
              slot="end"
              placeholder="Select Document"
              value={documentType}
              onIonChange={(e) => {
                const selectedValue = e.detail.value;
                setDocumentType(selectedValue);
                refs.documentType.current = selectedValue;
              }}
            >
              <IonSelectOption value="NBI Clearance">
                NBI Clearance
              </IonSelectOption>
              <IonSelectOption value="Police Clearance">
                Police Clearance
              </IonSelectOption>
            </IonSelect>
          </IonItem>
          <IonItem lines="none" className="checkbox-field">
            <IonGrid>
              <IonRow className="ion-align-items-center">
                <IonCol size="9">
                  <IonText>{documentImg}</IonText>
                </IonCol>
                <IonCol size="3">
                  <IonButton
                    size="small"
                    expand="block"
                    shape="round"
                    onClick={() => handleFileClick(documentImgRef)}
                  >
                    <IonIcon icon={cloudUploadSharp} />
                  </IonButton>
                  <input
                    type="file"
                    ref={documentImgRef}
                    style={{ display: "none" }}
                    onChange={(e) => handleFileChange(e, setDocumentImg)}
                  />
                </IonCol>
              </IonRow>
            </IonGrid>
          </IonItem>
          {agreementFields.map(({ key, label }) => (
            <IonItem key={key} lines="none" className="checkbox-field">
              <IonCheckbox
                labelPlacement="end"
                checked={agreements[key as keyof Agreements] || false}
                onIonChange={(e) =>
                  handleAgreementChange(key, e.detail.checked)
                }
              >
                {label}
              </IonCheckbox>
            </IonItem>
          ))}
        </IonContent>
      )}
      <Loading isOpen={loading} message="Waiting..." />
      <IonToast
        isOpen={!!error}
        message={error}
        duration={3000}
        color="danger"
        position="top"
        onDidDismiss={() => setError("")}
      />

      <IonFooter translucent={true} className="ion-no-border ion-padding">
        <IonToolbar>
          <IonButton
            className="custom-button"
            expand="full"
            shape="round"
            size="large"
            onClick={handleUpdate}
            disabled={
              vaccinationCertificateConsent === false || !allAgreementsChecked || !profilePic
            }
          >
            Submit
          </IonButton>
        </IonToolbar>
      </IonFooter>
    </IonPage>
  );
};

export default PersonlaReq;
