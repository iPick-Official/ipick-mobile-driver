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
import ActionFooterButton from "../../components/ui/ActionFooterButton";
import FormField from "../../components/ui/FormField";

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

  // Define mapping once
  const driverFields: {
    key: keyof Driver;
    setter: (val: any) => void;
    ref: React.RefObject<any>;
  }[] = [
      { key: "carType", setter: setCarType, ref: carTypeRef },
      { key: "firstName", setter: setFirstName, ref: firstNameRef },
      { key: "surName", setter: setSurName, ref: surNameRef },
      { key: "email", setter: setEmail, ref: emailRef },
      { key: "address", setter: setAddress, ref: addressRef },
      { key: "city", setter: setCity, ref: cityRef },
      { key: "province", setter: setProvince, ref: provinceRef },
      { key: "zipCode", setter: setZipCode, ref: zipCodeRef },
      { key: "mobnum", setter: setMobileNumber, ref: mobileNumberRef },
      { key: "caseNum", setter: setCaseNumber, ref: caseNumberRef },
    ];

  // ----- Initialize state & refs -----
  useEffect(() => {
    const stored = localStorage.getItem("driverData");
    if (!stored) return;

    const parsed: Driver = JSON.parse(stored);
    setDriverData(parsed);
    setOriginalDriverData(parsed);
    driverFields.forEach(({ key, setter, ref }) => {
      const value = parsed[key] || "";
      setter(value);
      ref.current = value;
    });
  }, []);

  // ----- Handle update -----
  const handleUpdate = async () => {
    if (!driverData || !originalDriverData) return;

    setLoading(true);
    setError("");

    const updates: Partial<Driver> = {};

    driverFields.forEach(({ key, ref }) => {
      if (ref.current !== originalDriverData[key]) updates[key] = ref.current;
    });

    if (Object.keys(updates).length === 0) {
      setLoading(false);
      setError("Please make changes.");
      return;
    }

    try {
      const { data } = await axios.patch(
        `${import.meta.env.VITE_API_ENDPOINT}/drivers/${driverData._id}/basic-info`,
        updates,
        { headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } }
      );

      localStorage.setItem("driverData", JSON.stringify(data));
      setDriverData(data);
      setOriginalDriverData(data);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || "Failed to update");
    } finally {
      setLoading(false);
    }
  };

  const refs = { firstNameRef, surNameRef, mobileNumberRef, emailRef, addressRef, cityRef, provinceRef, zipCodeRef, caseNumberRef };
  const setters = { setFirstName, setSurName, setMobileNumber, setEmail, setAddress, setCity, setProvince, setZipCode, setCaseNumber };
  const fields = personalInfoFields({
    firstName, surName, mobileNumber, email, address, city, province, zipCode, caseNumber,
    refs, setters
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
        <FormField
          fieldType="select"
          label="Car Type"
          value={carType}
          onChange={setCarType}
          refObj={carTypeRef}
          options={[
            { value: "4-seater", label: "4 Seater" },
            { value: "6-seater", label: "6 Seater" },
          ]}
          required
        />

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
        color="dark"
        position="top"
        onDidDismiss={() => setError("")}
      />

      <ActionFooterButton
        text="Submit"
        onClick={handleUpdate}
        disabled={loading}
      />
    </IonPage>
  );
};

export default PersonalInfo;
