import React, { useEffect, useRef, useState } from "react";
import {
  IonButton,
  IonButtons,
  IonContent,
  IonFooter,
  IonHeader,
  IonImg,
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
import BackButton from "../../components/BackButton";
import Loading from "../../components/Loading";
import { capitalizeWords } from "../../utils/textUtils";

const PersonalInfo: React.FC = () => {
  const originalUserRef = useRef<any>(null);
  const firstNameRef = useRef("");
  const surNameRef = useRef("");
  const emailRef = useRef("");
  const addressRef = useRef("");
  const cityRef = useRef("");
  const provinceRef = useRef("");
  const zipCodeRef = useRef("");
  const mobileNumberRef = useRef("");
  const carTypeRef = useRef("");

  const [firstName, setFirstName] = useState("");
  const [surName, setSurName] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [province, setProvince] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [carType, setCarType] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const userId = localStorage.getItem("id");
  const status = localStorage.getItem("status") === "approved";

  const handleUpdate = async () => {
    if (!userId || !originalUserRef.current) {
      setError("User data not available.");
      return;
    }

    const firstName =
      firstNameRef.current.trim() || originalUserRef.current.firstName;
    const surName =
      surNameRef.current.trim() || originalUserRef.current.surName;

    const updatedPayload = {
      ...originalUserRef.current,
      name: `${firstName} ${surName}`.trim() || originalUserRef.current.name,
      firstName,
      surName,
      email: emailRef.current.trim() || originalUserRef.current.email,
      address: addressRef.current.trim() || originalUserRef.current.address,
      city: cityRef.current.trim() || originalUserRef.current.city,
      province: provinceRef.current.trim() || originalUserRef.current.province,
      zipCode: zipCodeRef.current.trim() || originalUserRef.current.zipCode,
      mobileNumber:
        mobileNumberRef.current.trim() || originalUserRef.current.mobileNumber,
      carType: carTypeRef.current.trim() || originalUserRef.current.carType,
    };

    const hasChanges = Object.keys(updatedPayload).some((key) => {
      const oldVal = originalUserRef.current[key]?.toString().trim();
      const newVal = updatedPayload[key]?.toString().trim();
      return oldVal !== newVal;
    });

    if (!hasChanges) {
      setError("Please change information to update your account!");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const response = await fetch(
        `${
          import.meta.env.VITE_API_ENDPOINT_DRIVER
        }/Drivers/updateDrivers/${userId}`,
        {
          method: "PUT",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updatedPayload),
        }
      );

      const contentType = response.headers.get("content-type");
      const isJson = contentType && contentType.includes("application/json");
      if (!response.ok) {
        const errorData = isJson ? await response.json() : null;
        throw new Error(errorData?.message || "Update failed.");
      }

      const result = isJson ? await response.json() : updatedPayload;
      originalUserRef.current = result; // Update local reference
      alert("Your profile has been updated successfully.");
    } catch (err: any) {
      console.error("Update error:", err);
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const handleGetDriver = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `${
          import.meta.env.VITE_API_ENDPOINT_DRIVER
        }/Drivers/getDrivers/${userId}`,
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
      originalUserRef.current = data; // Save original data

      setFirstName(data.firstName || "");
      setSurName(data.surName || "");
      setEmail(data.email || "");
      setAddress(data.address || "");
      setCity(data.city || "");
      setProvince(data.province || "");
      setZipCode(data.zipCode || "");
      setMobileNumber(data.mobileNumber || "");
      setCarType(data.carType);
    } catch (error) {
      console.error("Error fetching driver data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleGetDriver();
  }, []);

  return (
    <IonPage>
      <IonHeader translucent={true} className="ion-no-border">
        <IonToolbar>
          <IonButtons slot="start">
            <BackButton />
          </IonButtons>
          <IonTitle>Edit Account</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding auth-ion-content" fullscreen>
        <IonHeader collapse="condense" translucent={true}>
          <IonToolbar>
            <IonTitle size="large" className="ion-text-center">
              My Account
            </IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonItem lines="none" className="input-field">
          <IonInput
            color="dark"
            inputMode="text"
            placeholder="First Name"
            label="First Name"
            labelPlacement="floating"
            value={firstName}
            type="text"
            onIonChange={(e) => {
              const value = capitalizeWords(e.detail.value || "");
              setFirstName(value);
              firstNameRef.current = value;
            }}
            className="floating-label-dark"
          />
        </IonItem>
        <IonItem lines="none" className="input-field">
          <IonInput
            color="dark"
            inputMode="text"
            placeholder="Last Name"
            label="Last Name"
            labelPlacement="floating"
            value={surName}
            type="text"
            onIonChange={(e) => {
              const value = capitalizeWords(e.detail.value || "");
              setSurName(value);
              surNameRef.current = value;
            }}
            className="floating-label-dark"
          />
        </IonItem>
        <IonItem lines="none" className="input-field">
          <IonInput
            color="dark"
            inputMode="numeric"
            pattern="[0-9]*"
            placeholder="9xxxxxxxxx"
            label="Mobile Number"
            labelPlacement="floating"
            value={mobileNumber}
            type="tel"
            onIonChange={(e) => {
              const value = e.detail.value || "";
              setMobileNumber(value);
              mobileNumberRef.current = value;
            }}
            className="floating-label-dark"
            maxlength={10}
            disabled
          />
        </IonItem>
        <IonItem lines="none" className="input-field">
          <IonInput
            color="dark"
            inputMode="email"
            placeholder="Email"
            label="Email"
            labelPlacement="floating"
            value={email}
            type="email"
            onIonChange={(e) => {
              const value = e.detail.value || "";
              setEmail(value);
              emailRef.current = value;
            }}
            className="floating-label-dark"
          />
        </IonItem>
        <IonItem lines="none" className="input-field">
          <IonInput
            color="dark"
            inputMode="text"
            placeholder="Address"
            label="Address"
            labelPlacement="floating"
            value={address}
            type="text"
            onIonChange={(e) => {
              const value = capitalizeWords(e.detail.value || "");
              setAddress(value);
              addressRef.current = value;
            }}
            className="floating-label-dark"
          />
        </IonItem>
        <IonItem lines="none" className="input-field">
          <IonInput
            color="dark"
            inputMode="text"
            placeholder="City"
            label="City"
            labelPlacement="floating"
            value={city}
            type="text"
            onIonChange={(e) => {
              const value = capitalizeWords(e.detail.value || "");
              setCity(value);
              cityRef.current = value;
            }}
            className="floating-label-dark"
          />
        </IonItem>
        <IonItem lines="none" className="input-field">
          <IonInput
            color="dark"
            inputMode="text"
            placeholder="Province"
            label="Province"
            labelPlacement="floating"
            value={province}
            type="text"
            onIonChange={(e) => {
              const value = capitalizeWords(e.detail.value || "");
              setProvince(value);
              provinceRef.current = value;
            }}
            className="floating-label-dark"
          />
        </IonItem>
        <IonItem lines="none" className="input-field">
          <IonInput
            color="dark"
            inputMode="numeric"
            placeholder="Zip Code"
            label="Zip Code"
            labelPlacement="floating"
            value={zipCode}
            type="text"
            onIonChange={(e) => {
              const value = e.detail.value || "";
              setZipCode(value);
              zipCodeRef.current = value;
            }}
            className="floating-label-dark"
          />
        </IonItem>
        <IonItem lines="none" className="input-field">
          <IonLabel>Vehicle Type</IonLabel>
          <IonSelect
            interface="action-sheet"
            justify="start"
            slot="end"
            placeholder="Vehicle Type"
            value={carType}
            onIonChange={(e) => {
              const selectedValue = e.detail.value;
              setCarType(selectedValue);
              carTypeRef.current = selectedValue;
            }}
          >
            <IonSelectOption value="4-seater">4 Seaters</IonSelectOption>
            <IonSelectOption value="6-seater">6 Seaters</IonSelectOption>
          </IonSelect>
        </IonItem>
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
      <IonFooter translucent={true} className="ion-no-border ion-padding">
        <IonToolbar>
          <IonButton
            className="custom-button"
            expand="full"
            shape="round"
            size="large"
            onClick={handleUpdate}
            disabled={status}
          >
            Submit
          </IonButton>
        </IonToolbar>
      </IonFooter>
    </IonPage>
  );
};

export default PersonalInfo;
