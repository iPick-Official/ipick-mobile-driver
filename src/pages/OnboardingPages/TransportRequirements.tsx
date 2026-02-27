import React, { useEffect, useRef, useState } from "react";
import {
  IonContent,
  IonPage,
} from "@ionic/react";
import Loading from "../../components/Loading";
import HeaderWithTabs from "../../components/ui/TabHeader";
import FormField from "../../components/ui/FormField";
import ActionFooterButton from "../../components/ui/ActionFooterButton";
import { ltfrbDocsOptions, ownershipOptions } from "../../utils/transportSelect";
import { Driver, FileData } from "../../types/driverTypes";
import { setFileIfExists } from "../../utils/fileUrl";
import { UploadService } from "../../services/uploadService";

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
  const [originalTransportReq, setOriginalTransportReq] = useState<any>(null);
  const [confirm, setConfirm] = useState<boolean>(false);

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

  const fileFields: {
    key: string;
    state: any;
    setter: any;
  }[] = [
      { key: "ownerDocuments", state: ownerDocuments, setter: setOwnerDocuments },
      { key: "operatorsDocument", state: operatorsDocument, setter: setOperatorsDocument },
      { key: "vehicleOR", state: vehicleOR, setter: setVehicleOR },
      { key: "vehicleCR", state: vehicleCR, setter: setVehicleCR },
      { key: "vehicleSalesInvoice", state: vehicleSalesInvoice, setter: setVehicleSalesInvoice },
      { key: "authorizationLetterPageOne", state: authorizationLetterPageOne, setter: setAuthorizationLetterPageOne },
      { key: "authorizationLetterPageTwo", state: authorizationLetterPageTwo, setter: setAuthorizationLetterPageTwo },
      { key: "sPAPageOne", state: sPAPageOne, setter: setSPAPageOne },
      { key: "sPAPageTwo", state: sPAPageTwo, setter: setSPAPageTwo },
      { key: "pAPageOne", state: pAPageOne, setter: setPAPageOne },
      { key: "pAPageTwo", state: pAPageTwo, setter: setPAPageTwo },
      { key: "cPCPageOne", state: cPCPageOne, setter: setCPCPageOne },
      { key: "cPCPageTwo", state: cPCPageTwo, setter: setCPCPageTwo },
      { key: "mEPAPageOne", state: mEPAPageOne, setter: setMEPAPageOne },
      { key: "mEPAPageTwo", state: mEPAPageTwo, setter: setMEPAPageTwo },
      { key: "pAMI", state: pAMI, setter: setPAMI },
    ];

  useEffect(() => {
    const stored = localStorage.getItem("driverData");
    if (!stored) return;

    const parsed: Driver = JSON.parse(stored);
    setDriverData(parsed);

    const req = parsed.transportRequirements;
    setOriginalTransportReq(req);
    if (!req) return;

    // BASIC VEHICLE INFO
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

    // LOAD FILES DYNAMICALLY
    (async () => {
      await Promise.all(
        fileFields.map(({ key, setter }) => setFileIfExists(req[key], setter))
      );
    })();
  }, []);

  const handleUpdate = async () => {
    if (!driverData || !driverData.transportRequirements) return;

    setLoading(true);

    try {
      const updates: any = {};
      const vo = driverData.transportRequirements.vehicleOwnership || {};
      const vehicleOwnershipUpdates: any = {};

      // ---- NORMAL FIELDS ----
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

      Object.entries(fieldMap).forEach(([key, value]) => {
        const originalValue = originalTransportReq?.[key] ?? "";
        if ((value ?? "") !== (originalValue ?? "")) {
          updates[key] = value;
        }
      });

      // ---- VEHICLE OWNERSHIP FIELDS ----
      if ((ownershipId ?? "") !== (vo.ownershipId ?? "")) {
        vehicleOwnershipUpdates.ownershipId = ownershipId;
        vehicleOwnershipUpdates.description =
          ownershipOptions.find((o) => o.value === ownershipId)?.label || "";
      }
      if ((operatorsFullName ?? "") !== (vo.operatorsFullName ?? "")) {
        vehicleOwnershipUpdates.operatorsFullName = operatorsFullName;
      }
      if ((operatorsAddress ?? "") !== (vo.operatorsAddress ?? "")) {
        vehicleOwnershipUpdates.operatorsAddress = operatorsAddress;
      }
      if ((operatorsMobileNumber ?? "") !== (vo.operatorsMobileNumber ?? "")) {
        vehicleOwnershipUpdates.operatorsMobileNumber = operatorsMobileNumber;
      }

      // ---- FILES ----
      for (const { key, state, setter } of fileFields) {
        const originalFile = originalTransportReq?.[key];
        const hasFileChanged = state
          ? !originalFile || originalFile.url !== state.url
          : false;

        if (hasFileChanged && state?.file) {
          // only upload if truly changed
          const uploaded = await UploadService.uploadFile(state.file);
          const uploadedKey = uploaded.key;

          // Only update if URL really changed
          if (!originalFile || originalFile.url !== uploadedKey) {
            updates[key] = { name: state.name, url: uploadedKey };
            setter({ name: state.name, url: uploadedKey, file: state.file });
          }
        }
      }

      // ---- OPERATOR DOCUMENT ----
      if (
        operatorsDocument &&
        (!vo.operatorDocuments || vo.operatorDocuments.url !== operatorsDocument.url)
      ) {
        vehicleOwnershipUpdates.operatorDocuments = {
          name: operatorsDocument.name,
          url: operatorsDocument.url,
        };
      }

      // ---- CHECK IF ANY CHANGE ----
      const hasUpdates =
        Object.keys(updates).length > 0 || Object.keys(vehicleOwnershipUpdates).length > 0;

      if (!hasUpdates) {
        alert("No changes detected.");
        setLoading(false);
        return;
      }

      // ---- MERGE AND PATCH ----
      const mergedUpdates = {
        ...driverData.transportRequirements,
        ...updates,
        vehicleOwnership: {
          ...vo,
          ...vehicleOwnershipUpdates,
        },
      };

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
      setOriginalTransportReq(updatedDriver.transportRequirements);

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
            <FormField
              fieldType="checkbox"
              label=""
              value={confirm}
              onChange={setConfirm}
              text="I confirm that all the provided information is accurate and complete."
            />
          </>
        )}
      </IonContent>
      <Loading isOpen={loading} message="Waiting..." />
      <ActionFooterButton
        text="Submit"
        onClick={handleUpdate}
        disabled={!confirm}
      />
    </IonPage>
  );
};

export default TransportReq;