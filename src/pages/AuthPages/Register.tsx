import React, { useRef, useState } from "react";
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
import { useHistory } from "react-router-dom";
import { buildDriverPayload } from "../../utils/driverPayloadBuilder";
import { InputModeType, TextFieldTypes } from "../../types/textField";
import { capitalizeWords } from "../../utils/textUtils";

import BackButton from "../../components/BackButton";
import Loading from "../../components/Loading";
import bcrypt from "bcryptjs";
import "@theme/variables.css";

const Register: React.FC = () => {
  const history = useHistory();

  const mobnum = localStorage.getItem("mobileNumber") || "";

  const carTypeRef = useRef("");
  const firstNameRef = useRef("");
  const surNameRef = useRef("");
  const emailRef = useRef("");
  const addressRef = useRef("");
  const cityRef = useRef("");
  const provinceRef = useRef("");
  const zipCodeRef = useRef("");
  const mobileNumberRef = useRef("");
  const passwordRef = useRef("");
  const confirmPasswordRef = useRef("");

  const [carType, setCarType] = useState("");
  const [firstName, setFirstName] = useState("");
  const [surName, setSurName] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [province, setProvince] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [mobileNumber, setMobileNumber] = useState(mobnum);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);


  const handleRegister = async () => {
    const mobile = mobileNumberRef?.current?.slice(-10);
    const pass = passwordRef?.current;

    setLoading(true);
    setError("");

    try {

      const hashedPassword = await bcrypt.hash(pass, 10);
      const payload = buildDriverPayload({
        carType: carTypeRef?.current,
        firstName: firstNameRef?.current,
        surName: surNameRef?.current,
        email: emailRef?.current,
        lastTenDigits: mobnum,
        address: addressRef?.current,
        city: cityRef?.current,
        province: provinceRef?.current,
        zipCode: zipCodeRef?.current,
        hashedPassword,
      });

      const endpoint = `${import.meta.env.VITE_API_ENDPOINT_DRIVER}/Drivers`;
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        let errorMsg = "Registration failed.";
        try {
          const err = await response.json();
          errorMsg = err?.message || errorMsg;
        } catch { }
        setError(errorMsg);
        return;
      }
      alert("Please sign-in to continue onboarding!");
      history.push("/");
    } catch (err) {
      setError("Network error, please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <IonPage>
      <IonHeader translucent={true} className="ion-no-border">
        <IonToolbar>
          <IonButtons slot="start">
            <BackButton />
          </IonButtons>
          <IonTitle>Fill out this form</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen className="auth-ion-content ion-padding">

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
        {[
          { label: "First Name", value: firstName, setter: setFirstName, ref: firstNameRef, capitalize: true },
          { label: "Last Name", value: surName, setter: setSurName, ref: surNameRef, capitalize: true },
          { label: "Mobile Number", value: mobileNumber, setter: setMobileNumber, ref: mobileNumberRef, type: "tel", inputMode: "numeric", maxLength: 11, placeholder: "09xxxxxxxxx", disable: true },
          { label: "Email", value: email, setter: setEmail, ref: emailRef, type: "email", inputMode: "email" },
          { label: "Address", value: address, setter: setAddress, ref: addressRef, capitalize: true },
          { label: "City", value: city, setter: setCity, ref: cityRef, capitalize: true },
          { label: "Province", value: province, setter: setProvince, ref: provinceRef, capitalize: true },
          { label: "Zip Code", value: zipCode, setter: setZipCode, ref: zipCodeRef, type: "text", inputMode: "numeric" },
          { label: "Password", value: password, setter: setPassword, ref: passwordRef, type: "password" },
          { label: "Confirm Password", value: confirmPassword, setter: setConfirmPassword, ref: confirmPasswordRef, type: "password" }
        ].map((field, idx) => (
          <IonItem key={idx} lines="none" className="input-field">
            <IonInput
              color="dark"
              label={field.label}
              labelPlacement="floating"
              placeholder={field.placeholder || field.label}
              value={field.value}
              type={field.type as TextFieldTypes || "text" as TextFieldTypes}
              inputMode={field.inputMode as InputModeType || "text" as InputModeType}
              maxlength={field.maxLength}
              className="floating-label-dark"
              onIonChange={(e) => {
                let v = e.detail.value || "";
                if (field.capitalize) v = capitalizeWords(v);
                field.setter(v);
                field.ref.current = v;
              }}
              disabled={field.disable}
            />
          </IonItem>
        ))}

        {/* Loading + Toast */}
        <Loading isOpen={loading} message="Waiting..." />
        <IonToast
          isOpen={!!error}
          message={error}
          duration={3000}
          color="danger"
          position="top"
          onDidDismiss={() => setError("")}
        />
      </IonContent>
      <IonFooter translucent={true} className="ion-no-border ion-padding">
        <IonToolbar>
          <IonButton
            className="custom-button"
            expand="full"
            shape="round"
            size="large"
            onClick={handleRegister}
            disabled={loading}
          >
            Sign Up
          </IonButton>
        </IonToolbar>
      </IonFooter>
    </IonPage>
  );
};

export default Register;
