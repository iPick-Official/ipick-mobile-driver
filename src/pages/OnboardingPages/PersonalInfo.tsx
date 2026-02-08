import React, { useEffect, useRef, useState } from "react";
import {
  IonButton,
  IonButtons,
  IonContent,
  IonFooter,
  IonHeader,
  IonInput,
  IonItem,
  IonLabel,
  IonPage,
  IonSelect,
  IonSelectOption,
  IonTitle,
  IonToast,
  IonToolbar,
} from "@ionic/react";
import "@theme/variables.css";
import axios from "axios";
import BackButton from "../../components/BackButton";
import Loading from "../../components/Loading";
import { capitalizeWords } from "../../utils/textUtils";
import { Driver } from "../../types/driverTypes";
import { personalInfoFields } from "../../utils/personalInfoFields";

const PersonalInfo: React.FC = () => {
  const [carType, setCarType] = useState("");
  const [firstName, setFirstName] = useState("");
  const [surName, setSurName] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [province, setProvince] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [caseNumber, setCaseNumber] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [driverData, setDriverData] = useState<Driver | null>(null);
  const [originalDriverData, setOriginalDriverData] = useState<Driver | null>(null);

  const token = localStorage.getItem("accessToken");

  // Refs like Register page
  const carTypeRef = useRef("");
  const firstNameRef = useRef("");
  const surNameRef = useRef("");
  const emailRef = useRef("");
  const addressRef = useRef("");
  const cityRef = useRef("");
  const provinceRef = useRef("");
  const zipCodeRef = useRef("");
  const mobileNumberRef = useRef("");
  const caseNumberRef = useRef("");

  useEffect(() => {
    const stored = localStorage.getItem("driverData");
    if (!stored) return;

    const parsed: Driver = JSON.parse(stored);

    setDriverData(parsed);
    setOriginalDriverData(parsed);
    setCarType(parsed.carType || "");
    setFirstName(parsed.firstName || "");
    setSurName(parsed.surName || "");
    setEmail(parsed.email || "");
    setAddress(parsed.address || "");
    setCity(parsed.city || "");
    setProvince(parsed.province || "");
    setZipCode(parsed.zipCode || "");
    setMobileNumber(parsed.mobnum || "");
    setCaseNumber(parsed.caseNum || "");

    carTypeRef.current = parsed.carType || "";
    firstNameRef.current = parsed.firstName || "";
    surNameRef.current = parsed.surName || "";
    emailRef.current = parsed.email || "";
    addressRef.current = parsed.address || "";
    cityRef.current = parsed.city || "";
    provinceRef.current = parsed.province || "";
    zipCodeRef.current = parsed.zipCode || "";
    mobileNumberRef.current = parsed.mobnum || "";
    caseNumberRef.current = parsed.caseNum || "";
  }, []);

  const handleUpdate = async () => {
    if (!driverData || !originalDriverData) return;

    setLoading(true);
    setError("");

    // Build updates like in Register
    const updates: Partial<Driver> = {};

    if (carTypeRef.current !== originalDriverData.carType)
      updates.carType = carTypeRef.current;

    if (firstNameRef.current !== originalDriverData.firstName)
      updates.firstName = firstNameRef.current;

    if (surNameRef.current !== originalDriverData.surName)
      updates.surName = surNameRef.current;

    if (emailRef.current !== originalDriverData.email)
      updates.email = emailRef.current;

    if (addressRef.current !== originalDriverData.address)
      updates.address = addressRef.current;

    if (cityRef.current !== originalDriverData.city)
      updates.city = cityRef.current;

    if (provinceRef.current !== originalDriverData.province)
      updates.province = provinceRef.current;

    if (zipCodeRef.current !== originalDriverData.zipCode)
      updates.zipCode = zipCodeRef.current;

    if (mobileNumberRef.current !== originalDriverData.mobnum)
      updates.mobnum = mobileNumberRef.current;

    if (caseNumberRef.current !== originalDriverData.caseNum)
      updates.caseNum = caseNumberRef.current;

    if (Object.keys(updates).length === 0) {
      setLoading(false);
      setError("Please make changes.");
      return;
    }

    try {
      const { data } = await axios.patch(
        `${import.meta.env.VITE_API_ENDPOINT}/drivers/${driverData._id}/basic-info`,
        updates,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      localStorage.setItem("driverData", JSON.stringify(data));
      setDriverData(data);
      setOriginalDriverData(data);
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
        err.message ||
        "Failed to update"
      );
    } finally {
      setLoading(false);
    }
  };

  const fields = personalInfoFields({
    firstName,
    surName,
    mobileNumber,
    email,
    address,
    city,
    province,
    zipCode,
    caseNumber,
    refs: {
      firstNameRef,
      surNameRef,
      mobileNumberRef,
      emailRef,
      addressRef,
      cityRef,
      provinceRef,
      zipCodeRef,
      caseNumberRef
    },
    setters: {
      setFirstName,
      setSurName,
      setMobileNumber,
      setEmail,
      setAddress,
      setCity,
      setProvince,
      setZipCode,
      setCaseNumber,
    },
  });

  return (
    <IonPage>
      <IonHeader translucent className="ion-no-border">
        <IonToolbar>
          <IonButtons slot="start">
            <BackButton />
          </IonButtons>
          <IonTitle>Edit Account</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding auth-ion-content" fullscreen>
        {/* Vehicle Type */}
        <IonItem lines="none" className="input-field">
          <IonLabel>Vehicle Type</IonLabel>
          <IonSelect
            interface="action-sheet"
            slot="end"
            placeholder="Select Vehicle Type"
            value={carType}
            onIonChange={(e) => {
              const v = e.detail.value;
              setCarType(v);
              carTypeRef.current = v;
            }}
          >
            <IonSelectOption value="4-seater">4 Seaters</IonSelectOption>
            <IonSelectOption value="6-seater">6 Seaters</IonSelectOption>
          </IonSelect>
        </IonItem>

        {/* Auto-generated Inputs */}
        {fields.map((field, idx) => (
          <IonItem key={idx} lines="none" className="input-field">
            <IonInput
              color="dark"
              label={field.label}
              labelPlacement="floating"
              placeholder={field.label}
              value={field.value}
              type={field.type as any || "text"}
              inputMode={field.inputMode as any || "text"}
              maxlength={field.maxLength}
              className="floating-label-dark"
              disabled={field.disable}
              onIonChange={(e) => {
                let v = e.detail.value || "";
                if (field.capitalize) v = capitalizeWords(v);
                field.setter(v);
                field.ref.current = v;
              }}
            />
          </IonItem>
        ))}
      </IonContent>

      <Loading isOpen={loading} message="Waiting..." />

      <IonToast
        isOpen={!!error}
        message={error}
        duration={3000}
        color="danger"
        position="top"
        onDidDismiss={() => setError("")}
      />

      <IonFooter translucent className="ion-no-border ion-padding">
        <IonToolbar>
          <IonButton
            className="custom-button"
            expand="block"
            size="large"
            onClick={handleUpdate}
            disabled={loading}
          >
            Save Changes
          </IonButton>
        </IonToolbar>
      </IonFooter>
    </IonPage>
  );
};

export default PersonalInfo;
