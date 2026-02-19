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
import HeaderWithTabs from "../../components/ui/TabHeader";
import FormField from "../../components/ui/FormField";
import ActionFooterButton from "../../components/ui/ActionFooterButton";
import { ltfrbDocsOptions, ownershipOptions } from "../../utils/transportSelect";
import { Driver, FileData, TransportRequirements } from "../../types/driverTypes";
import { getFileUrlIfAvailable, setFileIfExists } from "../../utils/fileUrl";
const token = localStorage.getItem("accessToken");

const TransportReq: React.FC = () => {
  const [activeTab, setActiveTab] = useState("vehicle");
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

  const [vehicleCR, setVehicleCR] = useState<FileData | null>(null);
  const [vehicleOR, setVehicleOR] = useState<FileData | null>(null);
  const [authorizationLetterPageOne, setAuthorizationLetterPageOne] = useState<FileData | null>(null);
  const [authorizationLetterPageTwo, setAuthorizationLetterPageTwo] = useState<FileData | null>(null);
  const [cPCPageOne, setCPCPageOne] = useState<FileData | null>(null);
  const [cPCPageTwo, setCPCPageTwo] = useState<FileData | null>(null);
  const [mEPAPageOne, setMEPAPageOne] = useState<FileData | null>(null);
  const [mEPAPageTwo, setMEPAPageTwo] = useState<FileData | null>(null);
  const [operatorsDocument, setOperatorsDocument] = useState<FileData | null>(null);
  const [ownerDocuments, setOwnerDocuments] = useState<FileData | null>(null);
  const [pAMI, setPAMI] = useState<FileData | null>(null);
  const [pAPageOne, setPAPageOne] = useState<FileData | null>(null);
  const [pAPageTwo, setPAPageTwo] = useState<FileData | null>(null);
  const [sPAPageOne, setSPAPageOne] = useState<FileData | null>(null);
  const [sPAPageTwo, setSPAPageTwo] = useState<FileData | null>(null);
  const [vehicleSalesInvoice, setVehicleSalesInvoice] = useState<FileData | null>(null);
  const [loading, setLoading] = useState(false);
  const [driverData, setDriverData] = useState<Driver | null>(null);
  const [originalPersonalReq, setOriginalPersonalReq] = useState<any>(null);

  const token = localStorage.getItem("accessToken");

  const showOperatorTab = ownershipId === "2" || ownershipId === "4";

  const tabs = [
    { value: "vehicle", label: "Vehicle Information" },
    { value: "vehicle-doc", label: "OR/CR Number & Docs" },
    ...(showOperatorTab
      ? [{ value: "operator", label: "Operator's Information" }]
      : []),
    { value: "documents", label: "LTFRB Documents" },
  ];

  useEffect(() => {
    const stored = localStorage.getItem("driverData");
    if (!stored) return;

    const parsed: Driver = JSON.parse(stored);
    setDriverData(parsed);

    const req = parsed.transportRequirements;
    if (!req) return;

    // =============================
    // BASIC VEHICLE INFO
    // =============================

    setOwnershipId(req.vehicleOwnership?.ownershipId || "");
    setPlateNumber(req.plateNumber || "");
    setCarBrand(req.carBrand || "");
    setCarModel(req.carModel || "");
    setCarColor(req.carColor || "");
    setOrNumber(req.orNumber || "");
    setCrNumber(req.crNumber || "");
    setLtfrbDocType(req.ltfrbDocType || "");
    setOperatorsFullName(req.vehicleOwnership?.operatorsFullName || "");
    setOperatorsAddress(req.vehicleOwnership?.operatorsAddress || "");
    setOperatorsMobileNumber(req.vehicleOwnership?.operatorsMobileNumber || "");

    // =============================
    // LOAD FILES
    // =============================

    (async () => {
      await Promise.all([
        setFileIfExists(req.ownerDocuments, setOwnerDocuments),
        setFileIfExists(req.operatorsDocument, setOperatorsDocument),
        setFileIfExists(req.vehicleOR, setVehicleOR),
        setFileIfExists(req.vehicleCR, setVehicleCR),
        setFileIfExists(req.vehicleSalesInvoice, setVehicleSalesInvoice),
        setFileIfExists(req.authorizationLetterPageOne, setAuthorizationLetterPageOne),
        setFileIfExists(req.authorizationLetterPageTwo, setAuthorizationLetterPageTwo),
        setFileIfExists(req.sPAPageOne, setSPAPageOne),
        setFileIfExists(req.sPAPageTwo, setSPAPageTwo),
        setFileIfExists(req.pAPageOne, setPAPageOne),
        setFileIfExists(req.pAPageTwo, setPAPageTwo),
        setFileIfExists(req.cPCPageOne, setCPCPageOne),
        setFileIfExists(req.cPCPageTwo, setCPCPageTwo),
        setFileIfExists(req.mEPAPageOne, setMEPAPageOne),
        setFileIfExists(req.mEPAPageTwo, setMEPAPageTwo),
        setFileIfExists(req.pAMI, setPAMI),
      ]);
    })();
  }, []);

  const handleUpdate = async () => {
    if (!driverData || !driverData.transportRequirements) return;

    setLoading(true);

    try {
      const updates: any = {};

      // ---- File fields to upload ----
      const fileFields = [
        { state: ownerDocuments, key: "ownerDocuments", setter: setOwnerDocuments },
        { state: operatorsDocument, key: "operatorsDocument", setter: setOperatorsDocument },
        { state: vehicleOR, key: "vehicleOR", setter: setVehicleOR },
        { state: vehicleCR, key: "vehicleCR", setter: setVehicleCR },
        { state: vehicleSalesInvoice, key: "vehicleSalesInvoice", setter: setVehicleSalesInvoice },
        { state: authorizationLetterPageOne, key: "authorizationLetterPageOne", setter: setAuthorizationLetterPageOne },
        { state: authorizationLetterPageTwo, key: "authorizationLetterPageTwo", setter: setAuthorizationLetterPageTwo },
        { state: sPAPageOne, key: "sPAPageOne", setter: setSPAPageOne },
        { state: sPAPageTwo, key: "sPAPageTwo", setter: setSPAPageTwo },
        { state: pAPageOne, key: "pAPageOne", setter: setPAPageOne },
        { state: pAPageTwo, key: "pAPageTwo", setter: setPAPageTwo },
        { state: cPCPageOne, key: "cPCPageOne", setter: setCPCPageOne },
        { state: cPCPageTwo, key: "cPCPageTwo", setter: setCPCPageTwo },
        { state: mEPAPageOne, key: "mEPAPageOne", setter: setMEPAPageOne },
        { state: mEPAPageTwo, key: "mEPAPageTwo", setter: setMEPAPageTwo },
        { state: pAMI, key: "pAMI", setter: setPAMI },
      ];

      for (const field of fileFields) {
        if (field.state?.file) {
          const uploaded = await UploadService.uploadFile(field.state.file);

          let url = uploaded.url;
          try {
            url = await UploadService.getFileUrl(uploaded.key);
          } catch (err) {
            console.error(`Failed to get URL for ${field.key}`, err);
          }

          updates[field.key] = { name: field.state.name, url, file: field.state.file };
          field.setter({ name: field.state.name, url, file: field.state.file });
        }
      }

      // ---- Normal fields ----
      const fieldMap: Record<string, any> = {
        ownershipId,
        plateNumber,
        carBrand,
        carColor,
        carModel,
        orNumber,
        crNumber,
        ltfrbDocType,
        operatorsFullName,
        operatorsAddress,
        operatorsMobileNumber,
      };

      // Compare with existing transportRequirements to only send changed fields
      Object.entries(fieldMap).forEach(([key, value]) => {
        const originalValue = driverData.transportRequirements[key as keyof TransportRequirements];
        if (value !== originalValue) {
          updates[key] = value;
        }
      });

      // If nothing changed
      if (Object.keys(updates).length === 0) {
        alert("Please make changes.");
        setLoading(false);
        return;
      }

      // ---- Merge with existing transportRequirements ----
      const mergedUpdates = {
        ...driverData.transportRequirements,
        ...updates,
        vehicleOwnership: {
          ...driverData.transportRequirements.vehicleOwnership,
          ownershipId,
          description: ownershipOptions.find((o) => o.value === ownershipId)?.label || "",
          operatorsFullName,
          operatorsAddress,
          operatorsMobileNumber,
          operatorDocuments: operatorsDocument
            ? { name: operatorsDocument.name, url: operatorsDocument.url || "" }
            : driverData.transportRequirements.vehicleOwnership.operatorDocuments,
        },
      };

      // ---- Send PATCH request ----
      const response = await fetch(
        `${import.meta.env.VITE_API_ENDPOINT}/drivers/${driverData._id}/transport-requirements`,
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
        throw new Error(errText || "Failed to update transport requirements");
      }

      const updatedDriver = await response.json();
      localStorage.setItem("driverData", JSON.stringify(updatedDriver));
      setDriverData(updatedDriver);

      alert("Transport requirements updated successfully!");
    } catch (err: any) {
      console.error("Update failed:", err);
      alert("Update failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <IonPage>
      <HeaderWithTabs
        title="Transport Requirements"
        activeTab={activeTab}
        onTabChange={setActiveTab}
        size="small"
        tabs={tabs}
      />
      <IonContent fullscreen className="ion-padding">
        {activeTab === "vehicle" && (
          <>
            <FormField
              fieldType="select"
              label="Vehicle Ownership"
              value={ownershipId}
              onChange={setOwnershipId}
              options={ownershipOptions}
              required
            />

            {[
              { label: "Plate Number", value: plateNumber, setter: setPlateNumber, ref: refs.plateNumber, placeholder: "eg. (NHB1234)" },
              { label: "Car Brand", value: carBrand, setter: setCarBrand, ref: refs.carBrand, placeholder: "eg. (Toyota)" },
              { label: "Car Model", value: carModel, setter: setCarModel, ref: refs.carModel, placeholder: "eg. (Vios)" },
              { label: "Car Color", value: carColor, setter: setCarColor, ref: refs.carColor, placeholder: "eg. (Black)" },
            ].map(({ label, value, setter, ref, placeholder }) => (
              <FormField
                key={label}
                fieldType="text"
                label={label}
                value={value}
                onChange={setter}
                refObj={ref}
                placeholder={placeholder}
                required
              />
            ))}

            <FormField
              fieldType="file"
              label="Owners Govt. ID"
              value={ownerDocuments}
              onChange={setOwnerDocuments}
            />
            {ownershipId === "4" && (

              [
                { label: "Special Power of Attorney Pg.1", value: sPAPageOne, setter: setSPAPageOne },
                { label: "Special Power of Attorney Pg.2", value: sPAPageTwo, setter: setSPAPageTwo },
              ].map(({ label, value, setter }) => (
                <FormField
                  key={label}
                  fieldType="file"
                  label={label}
                  value={value}
                  onChange={setter}
                />
              ))
            )}
          </>
        )}
        {activeTab === "vehicle-doc" && (
          <>
            {[
              { label: "OR Number", value: orNumber, setter: setOrNumber, ref: refs.orNumber, placeholder: "eg. (12345677)" },
              { label: "CR Number", value: crNumber, setter: setCrNumber, ref: refs.crNumber, placeholder: "eg. (123456789)" }
            ].map(({ label, value, setter, ref, placeholder }) => (
              <FormField
                key={label}
                fieldType="text"
                label={label}
                value={value}
                onChange={setter}
                refObj={ref}
                placeholder={placeholder}
                required
              />
            ))}
            {[
              { label: "Official Receipt", value: vehicleOR, setter: setVehicleOR },
              { label: "Certificate of Registration", value: vehicleCR, setter: setVehicleCR },
              { label: "Sales Invoice", value: vehicleSalesInvoice, setter: setVehicleSalesInvoice },
            ].map(({ label, value, setter }) => (
              <FormField
                key={label}
                fieldType="file"
                label={label}
                value={value}
                onChange={setter}
              />
            ))}
          </>
        )}
        {activeTab === "operator" && (
          <>
            {[
              { label: "Operator's FullName", value: operatorsFullName, setter: setOperatorsFullName, ref: refs.operatorsFullName, placeholder: "eg. (Kim Garalde)" },
              { label: "Operator's Mobile Number", value: operatorsMobileNumber, setter: setOperatorsMobileNumber, ref: refs.operatorsMobileNumber, placeholder: "eg. (09123465789)" }
            ].map(({ label, value, setter, ref, placeholder }) => (
              <FormField
                key={label}
                fieldType="text"
                label={label}
                value={value}
                onChange={setter}
                refObj={ref}
                placeholder={placeholder}
                required
              />
            ))}
            <FormField
              fieldType="textarea"
              label="Complete Address"
              value={operatorsAddress}
              onChange={setOperatorsAddress}
              placeholder="123 Main St Cubao QC"
              rows={4}
            />
            {[
              { label: "Authorization Letter Pg.1", value: authorizationLetterPageOne, setter: setAuthorizationLetterPageOne },
              { label: "Authorization Letter Pg.2", value: authorizationLetterPageTwo, setter: setAuthorizationLetterPageTwo },
              { label: "Operator's Govt. ID", value: operatorsDocument, setter: setOperatorsDocument },
            ].map(({ label, value, setter }) => (
              <FormField
                key={label}
                fieldType="file"
                label={label}
                value={value}
                onChange={setter}
              />
            ))}
          </>
        )}
        {activeTab === "documents" && (
          <>
            <FormField
              fieldType="select"
              label="LTFRB Docs Status"
              value={ltfrbDocType}
              onChange={setLtfrbDocType}
              options={ltfrbDocsOptions}
              required
            />
            {ltfrbDocType === "1" && (
              [
                { label: "Provisionary Authority Pg.1", value: pAPageOne, setter: setPAPageOne },
                { label: "Provisionary Authority Pg.2", value: pAPageTwo, setter: setPAPageTwo },
              ].map(({ label, value, setter }) => (
                <FormField
                  key={label}
                  fieldType="file"
                  label={label}
                  value={value}
                  onChange={setter}
                />
              ))
            )}
            {ltfrbDocType === "2" && (
              [
                { label: "CPC Pg.1", value: cPCPageOne, setter: setCPCPageOne },
                { label: "CPC Pg.2", value: cPCPageTwo, setter: setCPCPageTwo },
              ].map(({ label, value, setter }) => (
                <FormField
                  key={label}
                  fieldType="file"
                  label={label}
                  value={value}
                  onChange={setter}
                />
              ))
            )}
            {ltfrbDocType === "3" && (
              [
                { label: "Motion of Extension of PA Pg.1", value: mEPAPageOne, setter: setMEPAPageOne },
                { label: "Motion of Extension of PA Pg.2", value: mEPAPageTwo, setter: setMEPAPageTwo },
              ].map(({ label, value, setter }) => (
                <FormField
                  key={label}
                  fieldType="file"
                  label={label}
                  value={value}
                  onChange={setter}
                />
              ))
            )}
            <FormField
              fieldType="file"
              label="PAMI (Optional)"
              value={pAMI}
              onChange={setPAMI}
            />
          </>
        )}
      </IonContent>
      <Loading isOpen={loading} message="Waiting..." />
      <ActionFooterButton
        text="Submit"
      onClick={handleUpdate}
      // disabled={!isFormValid}
      />
    </IonPage>
  );
};

export default TransportReq;