import React, { useEffect, useRef, useState } from "react";
import {
  IonButtons,
  IonContent,
  IonHeader,
  IonIcon,
  IonItem,
  IonLabel,
  IonPage,
  IonSelect,
  IonSelectOption,
  IonSegment,
  IonSegmentButton,
  IonToolbar,
  IonInput,
  IonButton,
  IonCol,
  IonGrid,
  IonRow,
  IonFooter,
  IonTextarea,
  IonToast,
  IonText,
} from "@ionic/react";
import { capitalizeWords } from "../../utils/textUtils";
import BackButton from "../../components/BackButton";
import { cloudUploadSharp } from "ionicons/icons";
import { UploadService } from "../../services/uploadService";
import Loading from "../../components/Loading";

const TransportReq: React.FC = () => {
  const [activeTab, setActiveTab] = useState("vehicle");
  const [ownership, setOwnership] = useState("");
  const originalUserRef = useRef<any>(null);

  const ownershipOptions = [
    { id: "1", value: "Own Car" },
    { id: "2", value: "Car is owned by my operator" },
    { id: "3", value: "My Operator is NOT the car owner" },
    { id: "4", value: "I'll be the driver using the car owner's SPA" },
  ];

  const ltfrbDocsOptions = [
    { id: "1", value: "Provision Authority" },
    { id: "2", value: "Certificate of Public Convenience" },
    { id: "3", value: "Motion of Extension of PA" },
  ];

  const refs = {
    carType: useRef(""),
    carBrand: useRef(""),
    carColor: useRef(""),
    carModel: useRef(""),
    crNumber: useRef(""),
    ltfrbDocType: useRef(""),
    orNumber: useRef(""),
    plateNumber: useRef(""),
    operatorsAddress: useRef(""),
    operatorsFullName: useRef(""),
    operatorsMobileNumber: useRef(""),
    ownershipId: useRef(""),
    ownership: useRef(""),
  };

  const [carBrand, setCarBrand] = useState("");
  const [carColor, setCarColor] = useState("");
  const [carModel, setCarModel] = useState("");
  const [crNumber, setCrNumber] = useState("");
  const [ltfrbDocType, setLtfrbDocType] = useState("");
  const [orNumber, setOrNumber] = useState("");
  const [plateNumber, setPlateNumber] = useState("");
  const [operatorsAddress, setOperatorsAddress] = useState("");
  const [operatorsFullName, setOperatorsFullName] = useState("");
  const [operatorsMobileNumber, setOperatorsMobileNumber] = useState("");
  const [ownershipId, setOwnershipId] = useState("");
  const [vehicleCR, setVehicleCR] = useState("");
  const [vehicleOR, setVehicleOR] = useState("");

  const createInputRef = () =>
    useRef<HTMLInputElement>(null) as React.RefObject<HTMLInputElement>;

  const authorizationLetterPageOneRef = createInputRef();
  const authorizationLetterPageTwoRef = createInputRef();
  const cPCPageOneRef = createInputRef();
  const cPCPageTwoRef = createInputRef();
  const mEPAPageOneRef = createInputRef();
  const mEPAPageTwoRef = createInputRef();
  const operatorsDocumentRef = createInputRef();
  const ownerDocumentsRef = createInputRef();
  const pAMIRef = createInputRef();
  const pAPageOneRef = createInputRef();
  const pAPageTwoRef = createInputRef();
  const sPAPageOneRef = createInputRef();
  const sPAPageTwoRef = createInputRef();
  const vehicleCRRef = createInputRef();
  const vehicleORRef = createInputRef();
  const vehicleSalesInvoiceRef = createInputRef();

  const [authorizationLetterPageOne, setAuthorizationLetterPageOne] = useState(
    "Authorization Letter Pg.1"
  );
  const [authorizationLetterPageTwo, setAuthorizationLetterPageTwo] = useState(
    "Authorization Letter Pg.2"
  );
  const [cPCPageOne, setCPCPageOne] = useState("CPC Pg.1");
  const [cPCPageTwo, setCPCPageTwo] = useState("CPC Pg.2");
  const [mEPAPageOne, setMEPAPageOne] = useState(
    "Motion of Extension of PA Pg.1"
  );
  const [mEPAPageTwo, setMEPAPageTwo] = useState(
    "Motion of Extension of PA Pg.2"
  );
  const [operatorsDocument, setOperatorsDocument] = useState(
    "Photocopy of Operator's Government ID with 3 Original Specimen Signatures"
  );
  const [ownerDocuments, setOwnerDocuments] = useState(
    "Photocopy of Owner's Government ID with 3 Original Specimen Signatures"
  );
  const [pAMI, setPAMI] = useState("PAMI (Optional");
  const [pAPageOne, setPAPageOne] = useState("Provision Authority Pg.1");
  const [pAPageTwo, setPAPageTwo] = useState("Provision Authority Pg.2");
  const [sPAPageOne, setSPAPageOne] = useState(
    "Special Power of Attorney Pg.1"
  );
  const [sPAPageTwo, setSPAPageTwo] = useState(
    "Special Power of Attorney Pg.2"
  );
  const [vehicleSalesInvoice, setVehicleSalesInvoice] = useState(
    "Sale Invoice and Delivery Receipt (Optional)"
  );

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const userId = localStorage.getItem("id");

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
      const transportRequirements = currentUser?.transportRequirements || {};

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
          uploadedFiles[fieldName] = { name: file.name, url: file.name }; // Replace with real URL
        } else if (transportRequirements?.[fieldName]) {
          uploadedFiles[fieldName] = {
            name: transportRequirements[fieldName].name || "",
            url: transportRequirements[fieldName].url || "",
          };
        } else {
          uploadedFiles[fieldName] = { name: "", url: "" };
        }
      };

      await Promise.all([
        uploadIfExists(
          authorizationLetterPageOneRef,
          "authorizationLetterPageOne"
        ),
        uploadIfExists(
          authorizationLetterPageTwoRef,
          "authorizationLetterPageTwo"
        ),
        uploadIfExists(cPCPageOneRef, "cPCPageOne"),
        uploadIfExists(cPCPageTwoRef, "cPCPageTwo"),
        uploadIfExists(mEPAPageOneRef, "mEPAPageOne"),
        uploadIfExists(mEPAPageTwoRef, "mEPAPageTwo"),
        uploadIfExists(operatorsDocumentRef, "operatorsDocument"),
        uploadIfExists(ownerDocumentsRef, "ownerDocuments"),
        uploadIfExists(pAMIRef, "pAMI"),
        uploadIfExists(pAPageOneRef, "pAPageOne"),
        uploadIfExists(pAPageTwoRef, "pAPageTwo"),
        uploadIfExists(sPAPageOneRef, "sPAPageOne"),
        uploadIfExists(sPAPageTwoRef, "sPAPageTwo"),
        uploadIfExists(vehicleCRRef, "vehicleCR"),
        uploadIfExists(vehicleORRef, "vehicleOR"),
        uploadIfExists(vehicleSalesInvoiceRef, "vehicleSalesInvoice"),
      ]);

      const vehicleOwnership = {
        ownershipId:
          refs.ownershipId.current ||
          transportRequirements?.vehicleOwnership?.ownershipId ||
          "",
        description:
          capitalizeWords(refs.ownership.current?.trim() || "") ||
          transportRequirements?.vehicleOwnership?.description ||
          "",
        operatorsFullName:
          capitalizeWords(refs.operatorsFullName.current?.trim() || "") ||
          transportRequirements?.vehicleOwnership?.operatorsFullName ||
          "",
        operatorsAddress:
          capitalizeWords(refs.operatorsAddress.current?.trim() || "") ||
          transportRequirements?.vehicleOwnership?.operatorsAddress ||
          "",
        operatorsMobileNumber:
          capitalizeWords(refs.operatorsMobileNumber.current?.trim() || "") ||
          transportRequirements?.vehicleOwnership?.operatorsMobileNumber ||
          "",
        operatorDocuments: uploadedFiles.operatorDocuments || {
          name: "",
          url: "",
        },
      };

      const payload = {
        ...currentUser,
        vehicleOwnership,
        authorizationLetterPageOne: uploadedFiles.authorizationLetterPageOne,
        authorizationLetterPageTwo: uploadedFiles.authorizationLetterPageTwo,
        cPCPageOne: uploadedFiles.cPCPageOne,
        cPCPageTwo: uploadedFiles.cPCPageTwo,
        mEPAPageOne: uploadedFiles.mEPAPageOne,
        mEPAPageTwo: uploadedFiles.mEPAPageTwo,
        operatorsDocument: uploadedFiles.operatorsDocument,
        ownerDocuments: uploadedFiles.ownerDocuments,
        pAMI: uploadedFiles.pAMI,
        pAPageOne: uploadedFiles.pAPageOne,
        pAPageTwo: uploadedFiles.pAPageTwo,
        sPAPageOne: uploadedFiles.sPAPageOne,
        sPAPageTwo: uploadedFiles.sPAPageTwo,
        vehicleCR: uploadedFiles.vehicleCR,
        vehicleOR: uploadedFiles.vehicleOR,
        vehicleSalesInvoice: uploadedFiles.vehicleSalesInvoice,
        carType:
          capitalizeWords(refs.carType.current?.trim() || "") ||
          transportRequirements?.carType ||
          "",
        carBrand:
          capitalizeWords(refs.carBrand.current?.trim() || "") ||
          transportRequirements?.carBrand ||
          "",
        carColor:
          capitalizeWords(refs.carColor.current?.trim() || "") ||
          transportRequirements?.carColor ||
          "",
        carModel:
          capitalizeWords(refs.carModel.current?.trim() || "") ||
          transportRequirements?.carModel ||
          "",
        crNumber:
          capitalizeWords(refs.crNumber.current?.trim() || "") ||
          transportRequirements?.crNumber ||
          "",
        ltfrbDocType:
          capitalizeWords(refs.ltfrbDocType.current?.trim() || "") ||
          transportRequirements?.ltfrbDocType ||
          "",
        orNumber:
          capitalizeWords(refs.orNumber.current?.trim() || "") ||
          transportRequirements?.orNumber ||
          "",
        plateNumber:
          capitalizeWords(refs.plateNumber.current?.trim() || "") ||
          transportRequirements?.plateNumber ||
          "",
      };

      const response = await fetch(
        `${
          import.meta.env.VITE_API_ENDPOINT_DRIVER
        }/Drivers/updateTransportRequirements/${userId}`,
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
      } catch (_) {}

      originalUserRef.current = {
        ...originalUserRef.current,
        transportRequirements: result,
      };

      alert("Profile updated successfully.");
      handleFetchVehicleReq();
    } catch (e: any) {
      console.error("Update error:", e);
      setError("Please change information to update your account!");
    } finally {
      setLoading(false);
    }
  };

  const handleFetchVehicleReq = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `${
          import.meta.env.VITE_API_ENDPOINT_DRIVER
        }/Drivers/getTransportRequirements/${userId}`,
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
      originalUserRef.current = data;

      const transportReq = data.transportRequirements || {};
      const vehicleOwnership = transportReq.vehicleOwnership || {};

      setCarBrand(transportReq.carBrand || "");
      setCarColor(transportReq.carColor || "");
      setCarModel(transportReq.carModel || "");
      setCrNumber(transportReq.crNumber || "");
      setLtfrbDocType(transportReq.ltfrbDocType || "");
      setOrNumber(transportReq.orNumber || "");
      setPlateNumber(transportReq.plateNumber || "");
      setOperatorsAddress(vehicleOwnership.operatorsAddress || "");
      setOperatorsFullName(vehicleOwnership.operatorsFullName || "");
      setOperatorsMobileNumber(vehicleOwnership.operatorsMobileNumber || "");
      setOwnershipId(vehicleOwnership.ownershipId || "");
      setOwnership(vehicleOwnership.description || "");
      const getNameOrDefault = (
        fileObj: { name?: string; url?: string } | string | undefined,
        fallback: string
      ): string => {
        if (!fileObj) return fallback;
        if (typeof fileObj === "string") return fileObj || fallback;
        return fileObj.name || fallback;
      };
      setAuthorizationLetterPageOne(
        getNameOrDefault(
          transportReq.authorizationLetterPageOne,
          "Authorization Letter Pg.1"
        )
      );
      setAuthorizationLetterPageTwo(
        getNameOrDefault(
          transportReq.authorizationLetterPageTwo,
          "Authorization Letter Pg.2"
        )
      );
      setCPCPageOne(getNameOrDefault(transportReq.cPCPageOne, "CPC Pg.1"));
      setCPCPageTwo(getNameOrDefault(transportReq.cPCPageTwo, "CPC Pg.2"));
      setMEPAPageOne(
        getNameOrDefault(
          transportReq.mEPAPageOne,
          "Motion of Extension of PA Pg.1"
        )
      );
      setMEPAPageTwo(
        getNameOrDefault(
          transportReq.mEPAPageTwo,
          "Motion of Extension of PA Pg.2"
        )
      );
      setOperatorsDocument(
        getNameOrDefault(
          transportReq.operatorsDocument,
          "Operator's Government ID"
        )
      );
      setOwnerDocuments(
        getNameOrDefault(transportReq.ownerDocuments, "Owner's Government ID")
      );
      setPAMI(getNameOrDefault(transportReq.pAMI, "PAMI (Optional)"));
      setPAPageOne(
        getNameOrDefault(transportReq.pAPageOne, "Provisionary Authority Pg.1")
      );
      setPAPageTwo(
        getNameOrDefault(transportReq.pAPageTwo, "Provisionary Authority Pg.2")
      );
      setSPAPageOne(
        getNameOrDefault(
          transportReq.sPAPageOne,
          "Special Power of Attorney Pg.1"
        )
      );
      setSPAPageTwo(
        getNameOrDefault(
          transportReq.sPAPageTwo,
          "Special Power of Attorney Pg.2"
        )
      );
      setVehicleCR(getNameOrDefault(transportReq.vehicleCR, "Vehicle CR"));
      setVehicleOR(getNameOrDefault(transportReq.vehicleOR, "Vehicle OR"));
      setVehicleSalesInvoice(
        getNameOrDefault(transportReq.vehicleSalesInvoice, "Sales Invoice")
      );
    } catch (error) {
      console.error("Error fetching driver data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleFetchVehicleReq();
  }, []);

  const handleFileClick = (ref: React.RefObject<{ click: () => void }>) => {
    ref.current?.click();
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

  const handleTabChange = (e: CustomEvent) => {
    setActiveTab(e.detail.value);
  };

  const handleOwnershipChange = (e: CustomEvent) => {
    const selectedId = e.detail.value;
    setOwnershipId(selectedId);
    refs.ownershipId.current = selectedId;
    const selectedOption = ownershipOptions.find(
      (opt) => opt.id === selectedId
    );
    const selectedDescription = selectedOption?.value || "";
    setOwnership(selectedDescription);
    refs.ownership.current = selectedDescription;
  };

  const handleLtfrbStatus = (e: CustomEvent) => {
    const selectedId = e.detail.value;
    setLtfrbDocType(selectedId);
    refs.ltfrbDocType.current = selectedId;
  };
  const showOperatorTab = ownershipId === "2" || ownershipId === "3";

  return (
    <IonPage>
      <IonHeader translucent className="ion-no-border">
        <IonToolbar>
          <IonButtons slot="start">
            <BackButton />
          </IonButtons>
        </IonToolbar>
        <IonToolbar>
          <IonSegment value={activeTab} onIonChange={handleTabChange}>
            <IonSegmentButton value="vehicle">
              <IonLabel>Vehicle</IonLabel>
            </IonSegmentButton>
            {showOperatorTab && (
              <IonSegmentButton value="operator">
                <IonLabel>Operator</IonLabel>
              </IonSegmentButton>
            )}
            <IonSegmentButton value="documents">
              <IonLabel>LTFRB Docs</IonLabel>
            </IonSegmentButton>
          </IonSegment>
        </IonToolbar>
      </IonHeader>

      {activeTab === "vehicle" && (
        <IonContent className="ion-padding" fullscreen>
          <IonItem lines="none" className="input-field">
            <IonSelect
              slot="start"
              placeholder="Vehicle Ownership"
              value={ownershipId}
              onIonChange={handleOwnershipChange}
              interface="action-sheet"
              justify="start"
            >
              {ownershipOptions.map((option) => (
                <IonSelectOption key={option.id} value={option.id}>
                  {option.value}
                </IonSelectOption>
              ))}
            </IonSelect>
          </IonItem>

          <IonItem lines="none" className="input-field">
            <IonInput
              color="dark"
              inputMode="text"
              placeholder="ex. (NHB1253)"
              label="Plate Number"
              labelPlacement="floating"
              type="text"
              value={plateNumber}
              onIonChange={(e) => {
                const value = (e.detail.value || "").toUpperCase();
                setPlateNumber(value);
                refs.plateNumber.current = value;
              }}
              className="floating-label-dark"
            />
          </IonItem>
          <IonItem lines="none" className="input-field">
            <IonInput
              color="dark"
              inputMode="numeric"
              placeholder="ex. (53782947)"
              label="OR Number"
              labelPlacement="floating"
              type="number"
              value={orNumber}
              onIonChange={(e) => {
                const value = capitalizeWords(e.detail.value || "");
                setOrNumber(value);
                refs.orNumber.current = value;
              }}
              className="floating-label-dark"
            />
          </IonItem>
          <IonItem lines="none" className="input-field">
            <IonInput
              color="dark"
              inputMode="numeric"
              placeholder="ex. (123456789)"
              label="CR Number"
              labelPlacement="floating"
              type="number"
              value={crNumber}
              onIonChange={(e) => {
                const value = capitalizeWords(e.detail.value || "");
                setCrNumber(value);
                refs.crNumber.current = value;
              }}
              className="floating-label-dark"
            />
          </IonItem>
          <IonItem lines="none" className="input-field">
            <IonInput
              color="dark"
              inputMode="text"
              placeholder="ex. (Toyota)"
              label="Brand"
              labelPlacement="floating"
              type="text"
              value={carBrand}
              onIonChange={(e) => {
                const value = capitalizeWords(e.detail.value || "");
                setCarBrand(value);
                refs.carBrand.current = value;
              }}
              className="floating-label-dark"
            />
            <IonInput
              color="dark"
              inputMode="text"
              placeholder="ex. (Vios)"
              label="Model"
              labelPlacement="floating"
              type="text"
              value={carModel}
              onIonChange={(e) => {
                const value = capitalizeWords(e.detail.value || "");
                setCarModel(value);
                refs.carModel.current = value;
              }}
              className="floating-label-dark"
              style={{
                borderLeft: "solid 1px #008000",
                borderRight: "solid 1px #008000",
              }}
            />
            <IonInput
              color="dark"
              inputMode="text"
              placeholder="ex. (Blue)"
              label="Color"
              labelPlacement="floating"
              type="text"
              value={carColor}
              onIonChange={(e) => {
                const value = capitalizeWords(e.detail.value || "");
                setCarColor(value);
                refs.carColor.current = value;
              }}
              className="floating-label-dark"
            />
          </IonItem>
          {ownershipId === "4" && (
            <>
              <IonItem lines="none" className="checkbox-field">
                <IonGrid>
                  <IonRow className="ion-align-items-center">
                    <IonCol size="9">
                      <IonText>{sPAPageOne}</IonText>
                    </IonCol>
                    <IonCol size="3">
                      <IonButton
                        size="small"
                        expand="block"
                        shape="round"
                        onClick={() => handleFileClick(sPAPageOneRef)}
                      >
                        <IonIcon icon={cloudUploadSharp} />
                      </IonButton>
                      <input
                        type="file"
                        ref={sPAPageOneRef}
                        style={{ display: "none" }}
                        onChange={(e) => handleFileChange(e, setSPAPageOne)}
                      />
                    </IonCol>
                  </IonRow>
                </IonGrid>
              </IonItem>
              <IonItem lines="none" className="checkbox-field">
                <IonGrid>
                  <IonRow className="ion-align-items-center">
                    <IonCol size="9">
                      <IonText>{sPAPageTwo}</IonText>
                    </IonCol>
                    <IonCol size="3">
                      <IonButton
                        size="small"
                        expand="block"
                        shape="round"
                        onClick={() => handleFileClick(sPAPageTwoRef)}
                      >
                        <IonIcon icon={cloudUploadSharp} />
                      </IonButton>
                      <input
                        type="file"
                        ref={sPAPageTwoRef}
                        style={{ display: "none" }}
                        onChange={(e) => handleFileChange(e, setSPAPageTwo)}
                      />
                    </IonCol>
                  </IonRow>
                </IonGrid>
              </IonItem>
            </>
          )}
          <IonItem lines="none" className="checkbox-field">
            <IonGrid>
              <IonRow className="ion-align-items-center">
                <IonCol size="9">
                  <IonText>{vehicleOR}</IonText>
                </IonCol>
                <IonCol size="3">
                  <IonButton
                    size="small"
                    expand="block"
                    shape="round"
                    onClick={() => handleFileClick(vehicleORRef)}
                  >
                    <IonIcon icon={cloudUploadSharp} />
                  </IonButton>
                  <input
                    type="file"
                    ref={vehicleORRef}
                    style={{ display: "none" }}
                    onChange={(e) => handleFileChange(e, setVehicleOR)}
                  />
                </IonCol>
              </IonRow>
            </IonGrid>
          </IonItem>
          <IonItem lines="none" className="checkbox-field">
            <IonGrid>
              <IonRow className="ion-align-items-center">
                <IonCol size="9">
                  <IonText>{vehicleCR}</IonText>
                </IonCol>
                <IonCol size="3">
                  <IonButton
                    size="small"
                    expand="block"
                    shape="round"
                    onClick={() => handleFileClick(vehicleCRRef)}
                  >
                    <IonIcon icon={cloudUploadSharp} />
                  </IonButton>
                  <input
                    type="file"
                    ref={vehicleCRRef}
                    style={{ display: "none" }}
                    onChange={(e) => handleFileChange(e, setVehicleCR)}
                  />
                </IonCol>
              </IonRow>
            </IonGrid>
          </IonItem>
          <IonItem lines="none" className="checkbox-field">
            <IonGrid>
              <IonRow className="ion-align-items-center">
                <IonCol size="9">
                  <IonText>{vehicleSalesInvoice}</IonText>
                </IonCol>
                <IonCol size="3">
                  <IonButton
                    size="small"
                    expand="block"
                    shape="round"
                    onClick={() => handleFileClick(vehicleSalesInvoiceRef)}
                  >
                    <IonIcon icon={cloudUploadSharp} />
                  </IonButton>
                  <input
                    type="file"
                    ref={vehicleSalesInvoiceRef}
                    style={{ display: "none" }}
                    onChange={(e) =>
                      handleFileChange(e, setVehicleSalesInvoice)
                    }
                  />
                </IonCol>
              </IonRow>
            </IonGrid>
          </IonItem>
          <IonItem lines="none" className="checkbox-field">
            <IonGrid>
              <IonRow className="ion-align-items-center">
                <IonCol size="9">
                  <IonText>{ownerDocuments}</IonText>
                </IonCol>
                <IonCol size="3">
                  <IonButton
                    size="small"
                    expand="block"
                    shape="round"
                    onClick={() => handleFileClick(ownerDocumentsRef)}
                  >
                    <IonIcon icon={cloudUploadSharp} />
                  </IonButton>
                  <input
                    type="file"
                    ref={ownerDocumentsRef}
                    style={{ display: "none" }}
                    onChange={(e) => handleFileChange(e, setOwnerDocuments)}
                  />
                </IonCol>
              </IonRow>
            </IonGrid>
          </IonItem>
        </IonContent>
      )}

      {activeTab === "operator" && (
        <IonContent className="ion-padding" fullscreen>
          <IonItem lines="none" className="input-field">
            <IonInput
              color="dark"
              inputMode="text"
              placeholder="ex. (Juan Dela Cruz)"
              label="Operator Fullname"
              labelPlacement="floating"
              type="text"
              value={operatorsFullName}
              onIonChange={(e) => {
                const value = capitalizeWords(e.detail.value || "");
                setOrNumber(value);
                refs.operatorsFullName.current = value;
              }}
              className="floating-label-dark"
            />
          </IonItem>
          <IonItem lines="none" className="input-field">
            <IonInput
              color="dark"
              inputMode="numeric"
              placeholder="ex. (09123456789)"
              label="Operator Mobile Number"
              labelPlacement="floating"
              type="tel"
              value={operatorsMobileNumber}
              onIonChange={(e) => {
                const value = capitalizeWords(e.detail.value || "");
                setOrNumber(value);
                refs.operatorsMobileNumber.current = value;
              }}
              className="floating-label-dark"
            />
          </IonItem>
          <IonItem lines="none" className="input-field">
            <IonTextarea
              color="dark"
              inputMode="text"
              placeholder="ex. (123 Main st. New York, Cubao QC)"
              label="Operator Address"
              labelPlacement="floating"
              value={operatorsAddress}
              onIonChange={(e) => {
                const value = capitalizeWords(e.detail.value || "");
                setOrNumber(value);
                refs.operatorsAddress.current = value;
              }}
              className="floating-label-dark"
            />
          </IonItem>
          {ownershipId === "2" && (
            <>
              <IonItem lines="none" className="checkbox-field">
                <IonGrid>
                  <IonRow className="ion-align-items-center">
                    <IonCol size="9">
                      <IonText>{authorizationLetterPageOne}</IonText>
                    </IonCol>
                    <IonCol size="3">
                      <IonButton
                        size="small"
                        expand="block"
                        shape="round"
                        onClick={() =>
                          handleFileClick(authorizationLetterPageOneRef)
                        }
                      >
                        <IonIcon icon={cloudUploadSharp} />
                      </IonButton>
                      <input
                        type="file"
                        ref={authorizationLetterPageOneRef}
                        style={{ display: "none" }}
                        onChange={(e) =>
                          handleFileChange(e, setAuthorizationLetterPageOne)
                        }
                      />
                    </IonCol>
                  </IonRow>
                </IonGrid>
              </IonItem>
              <IonItem lines="none" className="checkbox-field">
                <IonGrid>
                  <IonRow className="ion-align-items-center">
                    <IonCol size="9">
                      <IonText>{authorizationLetterPageTwo}</IonText>
                    </IonCol>
                    <IonCol size="3">
                      <IonButton
                        size="small"
                        expand="block"
                        shape="round"
                        onClick={() =>
                          handleFileClick(authorizationLetterPageTwoRef)
                        }
                      >
                        <IonIcon icon={cloudUploadSharp} />
                      </IonButton>
                      <input
                        type="file"
                        ref={authorizationLetterPageTwoRef}
                        style={{ display: "none" }}
                        onChange={(e) =>
                          handleFileChange(e, setAuthorizationLetterPageTwo)
                        }
                      />
                    </IonCol>
                  </IonRow>
                </IonGrid>
              </IonItem>
            </>
          )}
          {ownershipId === "3" && (
            <>
              <IonItem lines="none" className="checkbox-field">
                <IonGrid>
                  <IonRow className="ion-align-items-center">
                    <IonCol size="9">
                      <IonText>{sPAPageOne}</IonText>
                    </IonCol>
                    <IonCol size="3">
                      <IonButton
                        size="small"
                        expand="block"
                        shape="round"
                        onClick={() => handleFileClick(sPAPageOneRef)}
                      >
                        <IonIcon icon={cloudUploadSharp} />
                      </IonButton>
                      <input
                        type="file"
                        ref={sPAPageOneRef}
                        style={{ display: "none" }}
                        onChange={(e) => handleFileChange(e, setSPAPageOne)}
                      />
                    </IonCol>
                  </IonRow>
                </IonGrid>
              </IonItem>
              <IonItem lines="none" className="checkbox-field">
                <IonGrid>
                  <IonRow className="ion-align-items-center">
                    <IonCol size="9">
                      <IonText>{sPAPageTwo}</IonText>
                    </IonCol>
                    <IonCol size="3">
                      <IonButton
                        size="small"
                        expand="block"
                        shape="round"
                        onClick={() => handleFileClick(sPAPageTwoRef)}
                      >
                        <IonIcon icon={cloudUploadSharp} />
                      </IonButton>
                      <input
                        type="file"
                        ref={sPAPageTwoRef}
                        style={{ display: "none" }}
                        onChange={(e) => handleFileChange(e, setSPAPageTwo)}
                      />
                    </IonCol>
                  </IonRow>
                </IonGrid>
              </IonItem>
            </>
          )}

          <IonItem lines="none" className="checkbox-field">
            <IonGrid>
              <IonRow className="ion-align-items-center">
                <IonCol size="9">
                  <IonText>{operatorsDocument}</IonText>
                </IonCol>
                <IonCol size="3">
                  <IonButton
                    size="small"
                    expand="block"
                    shape="round"
                    onClick={() => handleFileClick(operatorsDocumentRef)}
                  >
                    <IonIcon icon={cloudUploadSharp} />
                  </IonButton>
                  <input
                    type="file"
                    ref={operatorsDocumentRef}
                    style={{ display: "none" }}
                    onChange={(e) => handleFileChange(e, setOperatorsDocument)}
                  />
                </IonCol>
              </IonRow>
            </IonGrid>
          </IonItem>
        </IonContent>
      )}

      {activeTab === "documents" && (
        <IonContent className="ion-padding" fullscreen>
          <IonItem lines="none" className="input-field">
            <IonSelect
              slot="start"
              placeholder="LTFRB Docs Status"
              value={ltfrbDocType}
              onIonChange={handleLtfrbStatus}
              interface="action-sheet"
              justify="start"
            >
              {ltfrbDocsOptions.map((option) => (
                <IonSelectOption key={option.id} value={option.id}>
                  {option.value}
                </IonSelectOption>
              ))}
            </IonSelect>
          </IonItem>
          {ltfrbDocType === "1" && (
            <>
              <IonItem lines="none" className="checkbox-field">
                <IonGrid>
                  <IonRow className="ion-align-items-center">
                    <IonCol size="9">
                      <IonText>{pAPageOne}</IonText>
                    </IonCol>
                    <IonCol size="3">
                      <IonButton
                        size="small"
                        expand="block"
                        shape="round"
                        onClick={() => handleFileClick(pAPageOneRef)}
                      >
                        <IonIcon icon={cloudUploadSharp} />
                      </IonButton>
                      <input
                        type="file"
                        ref={pAPageOneRef}
                        style={{ display: "none" }}
                        onChange={(e) => handleFileChange(e, setPAPageOne)}
                      />
                    </IonCol>
                  </IonRow>
                </IonGrid>
              </IonItem>
              <IonItem lines="none" className="checkbox-field">
                <IonGrid>
                  <IonRow className="ion-align-items-center">
                    <IonCol size="9">
                      <IonText>{pAPageTwo}</IonText>
                    </IonCol>
                    <IonCol size="3">
                      <IonButton
                        size="small"
                        expand="block"
                        shape="round"
                        onClick={() => handleFileClick(pAPageTwoRef)}
                      >
                        <IonIcon icon={cloudUploadSharp} />
                      </IonButton>
                      <input
                        type="file"
                        ref={pAPageTwoRef}
                        style={{ display: "none" }}
                        onChange={(e) => handleFileChange(e, setPAPageTwo)}
                      />
                    </IonCol>
                  </IonRow>
                </IonGrid>
              </IonItem>
            </>
          )}
          {ltfrbDocType === "2" && (
            <>
              <IonItem lines="none" className="checkbox-field">
                <IonGrid>
                  <IonRow className="ion-align-items-center">
                    <IonCol size="9">
                      <IonText>{cPCPageOne}</IonText>
                    </IonCol>
                    <IonCol size="3">
                      <IonButton
                        size="small"
                        expand="block"
                        shape="round"
                        onClick={() => handleFileClick(cPCPageOneRef)}
                      >
                        <IonIcon icon={cloudUploadSharp} />
                      </IonButton>
                      <input
                        type="file"
                        ref={cPCPageOneRef}
                        style={{ display: "none" }}
                        onChange={(e) => handleFileChange(e, setCPCPageOne)}
                      />
                    </IonCol>
                  </IonRow>
                </IonGrid>
              </IonItem>
              <IonItem lines="none" className="checkbox-field">
                <IonGrid>
                  <IonRow className="ion-align-items-center">
                    <IonCol size="9">
                      <IonText>{cPCPageTwo}</IonText>
                    </IonCol>
                    <IonCol size="3">
                      <IonButton
                        size="small"
                        expand="block"
                        shape="round"
                        onClick={() => handleFileClick(cPCPageTwoRef)}
                      >
                        <IonIcon icon={cloudUploadSharp} />
                      </IonButton>
                      <input
                        type="file"
                        ref={cPCPageTwoRef}
                        style={{ display: "none" }}
                        onChange={(e) => handleFileChange(e, setCPCPageTwo)}
                      />
                    </IonCol>
                  </IonRow>
                </IonGrid>
              </IonItem>
            </>
          )}
          {ltfrbDocType === "3" && (
            <>
              <IonItem lines="none" className="checkbox-field">
                <IonGrid>
                  <IonRow className="ion-align-items-center">
                    <IonCol size="9">
                      <IonText>{mEPAPageOne}</IonText>
                    </IonCol>
                    <IonCol size="3">
                      <IonButton
                        size="small"
                        expand="block"
                        shape="round"
                        onClick={() => handleFileClick(mEPAPageOneRef)}
                      >
                        <IonIcon icon={cloudUploadSharp} />
                      </IonButton>
                      <input
                        type="file"
                        ref={mEPAPageOneRef}
                        style={{ display: "none" }}
                        onChange={(e) => handleFileChange(e, setMEPAPageOne)}
                      />
                    </IonCol>
                  </IonRow>
                </IonGrid>
              </IonItem>
              <IonItem lines="none" className="checkbox-field">
                <IonGrid>
                  <IonRow className="ion-align-items-center">
                    <IonCol size="9">
                      <IonText>{mEPAPageTwo}</IonText>
                    </IonCol>
                    <IonCol size="3">
                      <IonButton
                        size="small"
                        expand="block"
                        shape="round"
                        onClick={() => handleFileClick(mEPAPageTwoRef)}
                      >
                        <IonIcon icon={cloudUploadSharp} />
                      </IonButton>
                      <input
                        type="file"
                        ref={mEPAPageTwoRef}
                        style={{ display: "none" }}
                        onChange={(e) => handleFileChange(e, setMEPAPageTwo)}
                      />
                    </IonCol>
                  </IonRow>
                </IonGrid>
              </IonItem>
            </>
          )}
          <IonItem lines="none" className="checkbox-field">
            <IonGrid>
              <IonRow className="ion-align-items-center">
                <IonCol size="9">
                  <IonText>{pAMI}</IonText>
                </IonCol>
                <IonCol size="3">
                  <IonButton
                    size="small"
                    expand="block"
                    shape="round"
                    onClick={() => handleFileClick(pAMIRef)}
                  >
                    <IonIcon icon={cloudUploadSharp} />
                  </IonButton>
                  <input
                    type="file"
                    ref={pAMIRef}
                    style={{ display: "none" }}
                    onChange={(e) => handleFileChange(e, setPAMI)}
                  />
                </IonCol>
              </IonRow>
            </IonGrid>
          </IonItem>
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
          >
            Submit
          </IonButton>
        </IonToolbar>
      </IonFooter>
    </IonPage>
  );
};

export default TransportReq;
