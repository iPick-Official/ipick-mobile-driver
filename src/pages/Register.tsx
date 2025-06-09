import React, { useRef, useState } from "react";
import {
  IonButton,
  IonButtons,
  IonContent,
  IonFooter,
  IonHeader,
  IonInput,
  IonItem,
  IonPage,
  IonTitle,
  IonToast,
  IonToolbar,
} from "@ionic/react";
import { useHistory } from "react-router-dom";
import BackButton from "../components/BackButton";
import Loading from "../components/Loading";
import "../theme/variables.css";
import bcrypt from "bcryptjs";
import { buildDriverPayload } from "../utils/driverPayloadBuilder";

const Register: React.FC = () => {
  const history = useHistory();

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

  const [firstName, setFirstName] = useState("");
  const [surName, setSurName] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [province, setProvince] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const capitalizeWords = (str: string) =>
    str.replace(/\b\w/g, (char) => char.toUpperCase());

  const hashPassword = async (rawPassword: string): Promise<string> => {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(rawPassword, salt);
  };

  const checkDuplicateMobile = async (mobile: string): Promise<boolean> => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_ENDPOINT_DRIVER}/Drivers/${mobile}`
      );

      if (res.ok) {
        // If the mobile number exists, the API returns 200 with data
        const data = await res.json();
        return !!data; // true = duplicate
      }

      // If 404, mobile number not found — not a duplicate
      if (res.status === 404) {
        return false;
      }

      // Other unexpected statuses
      console.error("Unexpected response when checking mobile:", res.status);
      return false;
    } catch (err) {
      console.error("Error checking duplicate mobile number:", err);
      return false;
    }
  };

  const handleRegister = async () => {
    const mobile = mobileNumberRef.current.slice(-10);
    const pass = passwordRef.current;
    const confirmPass = confirmPasswordRef.current;

    if (
      !firstNameRef.current ||
      !surNameRef.current ||
      !emailRef.current ||
      !mobile ||
      !pass
    ) {
      setError("Please fill in all required fields.");
      return;
    }

    if (!/^\d{10}$/.test(mobile)) {
      setError("Enter a valid 10-digit mobile number.");
      return;
    }

    if (pass !== confirmPass) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const isDuplicate = await checkDuplicateMobile(mobile);
      if (isDuplicate) {
        setError("Mobile number already registered.");
        return;
      }

      const hashedPassword = await hashPassword(pass);

      const payload = buildDriverPayload({
        firstName: firstNameRef.current,
        surName: surNameRef.current,
        email: emailRef.current,
        lastTenDigits: mobile,
        address: addressRef.current,
        city: cityRef.current,
        province: provinceRef.current,
        zipCode: zipCodeRef.current,
        hashedPassword,
      });

      const response = await fetch(
        `${import.meta.env.VITE_API_ENDPOINT_DRIVER}/Drivers`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        let errorMsg = "Registration failed.";
        try {
          const err = await response.json();
          errorMsg = err.message || errorMsg;
        } catch {}
        setError(errorMsg);
        return;
      }

      history.push("/login");
    } catch (err) {
      setError("Network error, please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <BackButton />
          </IonButtons>
          <IonTitle>Fill out this form</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent>
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
            placeholder="09xxxxxxxxx"
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
            maxlength={11}
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
          <IonInput
            color="dark"
            placeholder="Password"
            label="Password"
            labelPlacement="floating"
            value={password}
            type="password"
            onIonChange={(e) => {
              const value = e.detail.value || "";
              setPassword(value);
              passwordRef.current = value;
            }}
            className="floating-label-dark"
          />
        </IonItem>

        <IonItem lines="none" className="input-field">
          <IonInput
            color="dark"
            placeholder="Confirm Password"
            label="Confirm Password"
            labelPlacement="floating"
            value={confirmPassword}
            type="password"
            onIonChange={(e) => {
              const value = e.detail.value || "";
              setConfirmPassword(value);
              confirmPasswordRef.current = value;
            }}
            className="floating-label-dark"
          />
        </IonItem>
        {/* Loading Spinner */}
        <Loading isOpen={loading} message="Signing up..." />
        <IonToast
          isOpen={!!error}
          message={error}
          duration={3000}
          color="danger"
          position="top"
          onDidDismiss={() => setError("")}
        />
      </IonContent>
      <IonFooter className="ion-no-border ion-padding">
        <IonButton
          className="custom-button"
          expand="full"
          shape="round"
          size="large"
          onClick={handleRegister}
        >
          Sign Up
        </IonButton>
      </IonFooter>
    </IonPage>
  );
};

export default Register;
