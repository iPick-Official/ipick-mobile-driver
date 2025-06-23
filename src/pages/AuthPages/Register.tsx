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
import { useHistory } from "react-router-dom";
import BackButton from "../../components/BackButton";
import Loading from "../../components/Loading";
import OtpModal from "../../components/OtpModal";
import "@theme/variables.css";
import bcrypt from "bcryptjs";
import { buildDriverPayload } from "../../utils/driverPayloadBuilder";

const Register: React.FC = () => {
  const history = useHistory();
  const modalRef = useRef<HTMLIonModalElement>(
    null!
  ) as React.RefObject<HTMLIonModalElement>;
  const otpRef = useRef<HTMLIonInputElement>(
    null!
  ) as React.RefObject<HTMLIonInputElement>;

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
  const [mobileNumber, setMobileNumber] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isDisabled, setIsDisabled] = useState(false);
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isDisabled && countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            setIsDisabled(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isDisabled, countdown]);

  const capitalizeWords = (str: string) =>
    str.replace(/\b\w/g, (char) => char.toUpperCase());

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
      // Other unexpected statuses
      console.error("Unexpected response when checking mobile:", res.status);
      return false;
    } catch (err) {
      console.error("Error checking duplicate mobile number:", err);
      return false;
    }
  };

  const handleRegister = async () => {
    const mobile = mobileNumberRef?.current?.slice(-10);
    const pass = passwordRef?.current;

    setLoading(true);
    setError("");

    try {
      if (!mobile || !pass) {
        setError("Missing mobile number or password.");
        setLoading(false);
        return;
      }

      const hashedPassword = await bcrypt.hash(pass, 10);

      const payload = buildDriverPayload({
        carType: carTypeRef?.current,
        firstName: firstNameRef?.current,
        surName: surNameRef?.current,
        email: emailRef?.current,
        lastTenDigits: mobile,
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
        } catch {}
        setError(errorMsg);
        return;
      }
      alert("Please sign-in to continue onboarding!")
      history.goBack();
    } catch (err) {
      setError("Network error, please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleRequestOtp = async () => {
    const mobile = mobileNumberRef.current.slice(-10);
    const pass = passwordRef.current;
    const confirmPass = confirmPasswordRef.current;

    if (
      !firstNameRef.current ||
      !surNameRef.current ||
      !emailRef.current ||
      !mobile ||
      !pass ||
      !carTypeRef.current
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

      const response = await fetch(
        `${import.meta.env.VITE_API_ENDPOINT}/otp/requestOtp/${mobile}`,
        {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 201) {
        modalRef.current?.present();
        setIsDisabled(true);
        setCountdown(60);
      } else {
        setError("Failed to send OTP. Please try again.");
      }
    } catch (err) {
      console.error("OTP request error:", err);
      setError("An error occurred while requesting OTP.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    const mobile = mobileNumberRef.current.slice(-10);
    const otp = otpRef.current?.value?.toString().trim();

    if (!otp || otp.length < 6) {
      setError("Please enter a valid OTP.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_ENDPOINT}/otp/validate/${mobile}/${otp}`,
        {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        }
      );
      if (response.status === 201) {
        const data = await response.json();

        if (
          data?.messages &&
          Array.isArray(data.messages) &&
          data.messages.length > 0 &&
          typeof data.messages[0].msg === "string"
        ) {
          console.log("OTP Verified:", data.messages[0].msg);
          modalRef.current?.dismiss(); // ✅ dismiss modal after success
          handleRegister();
        } else {
          setError(
            "Verification succeeded but response format was unexpected."
          );
        }
      } else {
        const errorData = await response.json();
        console.error("Verification failed:", errorData);
        setError("Failed to verify OTP. Please try again.");
      }
    } catch (err) {
      console.error("OTP verification error:", err);
      setError("Incorrect OTP. Please try again.");
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

      <IonContent fullscreen={true}>
        <IonHeader collapse="condense" translucent={true}>
          <IonToolbar>
            <IonTitle size="large" className="ion-text-center">
              Fill out this form
            </IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonItem lines="none" className="input-field">
          <IonLabel>Vehicle Type</IonLabel>
          <IonSelect
            interface="action-sheet"
            justify="start"
            slot="end"
            placeholder="Select Vehicle Type"
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
            keyboard-attach
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
            keyboard-attach
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
            keyboard-attach
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
            keyboard-attach
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
            keyboard-attach
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
            keyboard-attach
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
            keyboard-attach
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
            keyboard-attach
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
            keyboard-attach
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
            keyboard-attach
            className="floating-label-dark"
          />
        </IonItem>
        {/* Loading Spinner */}
        <Loading isOpen={loading} message="Waiting..." />
        <IonToast
          isOpen={!!error}
          message={error}
          duration={3000}
          color="danger"
          position="top"
          onDidDismiss={() => setError("")}
        />
        <OtpModal modalRef={modalRef} otpRef={otpRef} onVerify={handleVerify} />
      </IonContent>
      <IonFooter translucent={true} className="ion-no-border ion-padding">
        <IonToolbar>
          <IonButton
            className="custom-button"
            expand="full"
            shape="round"
            size="large"
            onClick={handleRequestOtp}
            disabled={isDisabled}
          >
            {isDisabled ? `Retry in ${countdown}s` : "Sign Up"}
          </IonButton>
        </IonToolbar>
      </IonFooter>
    </IonPage>
  );
};

export default Register;
