import React, { useEffect, useRef, useState } from "react";
import {
  IonButton,
  IonContent,
  IonPage,
  IonInput,
  IonToast,
  IonItem,
  IonImg,
  IonText,
  IonLabel,
  IonFooter,
} from "@ionic/react";
import { useAuth } from "../../contexts/AuthContext";
import { useHistory } from "react-router-dom";
import Loading from "../../components/Loading";
import OtpModal from "../../components/OtpModal";
import "@theme/variables.css";

const Login: React.FC = () => {
  const { login } = useAuth();
  const history = useHistory();
  const modalRef = useRef<HTMLIonModalElement>(
    null!
  ) as React.RefObject<HTMLIonModalElement>;
  const otpRef = useRef<HTMLIonInputElement>(
    null!
  ) as React.RefObject<HTMLIonInputElement>;
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingOtp, setLoadingOtp] = useState(false);
  const [isDisabled, setIsDisabled] = useState(false);
  const [countdown, setCountdown] = useState(0);

  // Refs to access real-time values
  const mobileRef = useRef<HTMLIonInputElement>(null);
  const passwordRef = useRef<HTMLIonInputElement>(null);

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

  const handleLogin = async () => {
    const normalizedMobile = String(mobileRef.current?.value ?? "").trim();
    const normalizedPassword = String(passwordRef.current?.value ?? "").trim();

    const lastTenDigits = normalizedMobile.slice(-10);
    if (!/^\d{10}$/.test(lastTenDigits)) {
      setError("Enter a valid 11-digit mobile number");
      return;
    }

    const loginPayload = {
      mobnum: lastTenDigits,
      password: normalizedPassword,
    };

    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_ENDPOINT}/auth/login`,
        {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify(loginPayload),
        }
      );

      if (response.status === 401) {
        setError("Incorrect credentials!");
        return;
      }

      if (!response.ok) {
        throw new Error("Unexpected server response");
      }

      const data = await response.json();
      console.log("Login response data:", data);

      const user = data.user;

      if (!data.access_token || !user || user.type !== "driver") {
        setError("Incorrect credentials!");
        return;
      }

      if (data.logged) {
        alert("You have been logged out of all other devices.");
      }

      // Save to local storage
      localStorage.setItem("userId", user.id);
      localStorage.setItem("name", user.name);
      localStorage.setItem("accessToken", data.access_token);
      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("isLogged", "true");
      localStorage.setItem("userType", user.type);
      localStorage.setItem("status", user.status); // <-- from user object
      localStorage.setItem("accountStatus", data.accountStatus); // <-- top-level key

      // Trigger login in context
      login();

      // Redirect based on user status
      const userStatus = user.status?.toLowerCase();
      if (userStatus === "approved") {
        history.replace("/home");
      } else {
        history.replace("/checklist");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("An error occurred while logging in.");
    } finally {
      setLoading(false);
    }
  };

  const handleRequestOtp = async () => {
    const normalizedMobile = String(mobileRef.current?.value ?? "").trim();
    const lastTenDigits = normalizedMobile.slice(-10);

    if (!/^\d{10}$/.test(lastTenDigits)) {
      setError("Enter a valid 11-digit mobile number");
      return;
    }

    const confirmReset = window.confirm(
      `Are you sure you want to reset the password for this mobile number: ${lastTenDigits}?`
    );
    if (!confirmReset) {
      return;
    }

    setLoadingOtp(true);
    setError("");

    try {
      // STEP 1: Request OTP
      const otpResponse = await fetch(
        `${
          import.meta.env.VITE_API_ENDPOINT
        }/otp/requestOtpReset/${lastTenDigits}`,
        {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        }
      );

      if (otpResponse.status === 201) {
        // Store mobile number for later use
        localStorage.setItem("otpMobile", lastTenDigits);

        // STEP 2: Fetch driver info
        const driverInfoResponse = await fetch(
          `${
            import.meta.env.VITE_API_ENDPOINT_DRIVER
          }/Drivers/${lastTenDigits}`,
          {
            method: "GET",
            headers: {
              Accept: "application/json",
            },
          }
        );

        if (driverInfoResponse.ok) {
          const driverData = await driverInfoResponse.json();

          if (driverData && driverData._id) {
            localStorage.setItem("driverData", JSON.stringify(driverData));
            localStorage.setItem("driverObjectId", driverData._id);
          } else {
            console.warn("Driver data is missing _id field.");
          }
        } else {
          console.warn(
            "Failed to fetch driver info. Status:",
            driverInfoResponse.status
          );
        }

        // Show OTP modal
        modalRef.current?.present();

        // Disable button for 60 seconds
        setIsDisabled(true);
        setCountdown(60);
      } else if (otpResponse.status === 404) {
        setError("Mobile number not registered. Please register first.");
      } else {
        setError("Failed to send OTP. Please try again.");
      }
    } catch (err) {
      console.error("OTP request error:", err);
      setError("An error occurred while requesting OTP.");
    } finally {
      setLoadingOtp(false);
    }
  };

  const handleVerify = async () => {
    const mobile = String(mobileRef.current?.value ?? "")
      .trim()
      .slice(-10);
    const otp = otpRef.current?.value?.toString().trim();

    if (!otp || otp.length < 6) {
      setError("Please enter a valid OTP.");
      return;
    }

    setLoadingOtp(true);
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
          history.push("/new-password");
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
      setLoadingOtp(false);
    }
  };

  return (
    <IonPage>
      <IonContent className="ion-padding" fullscreen>
        {/* Logo */}
        <div className="ion-text-center" style={{ marginTop: "40px" }}>
          <IonImg src="/assets/logo-word.png" className="logo-image" />
        </div>

        {/* App Name */}
        <div
          style={{
            color: "#008000",
            textAlign: "center",
            marginBottom: "30px",
            fontWeight: 600,
            fontSize: "1.3rem",
          }}
        >
          Driver's App
        </div>

        {/* Mobile Input */}
        <IonItem lines="none" className="input-field">
          <IonInput
            ref={mobileRef}
            color="dark"
            inputMode="numeric"
            pattern="[0-9]*"
            placeholder="09xxxxxxxxx"
            label="Mobile Number"
            labelPlacement="floating"
            type="tel"
            maxlength={11}
            className="floating-label-dark"
          />
        </IonItem>

        <IonItem lines="none" className="input-field">
          <IonInput
            ref={passwordRef}
            color="dark"
            placeholder="Password"
            label="Password"
            labelPlacement="floating"
            type="password"
            className="floating-label-dark"
          />
        </IonItem>

        <IonButton
          className="custom-button"
          expand="full"
          shape="round"
          size="large"
          onClick={handleLogin}
        >
          Sign In
        </IonButton>

        {/* Extra Options */}
        <div className="ion-text-center" style={{ marginTop: "15px" }}>
          <IonButton
            fill="clear"
            size="default"
            onClick={() => history.push("/register")}
          >
            Become a Driver
          </IonButton>
          <IonButton
            fill="clear"
            size="default"
            onClick={handleRequestOtp}
            disabled={isDisabled}
          >
            {isDisabled ? `Retry in ${countdown}s` : "Forgot Password?"}
          </IonButton>
        </div>

        <OtpModal
          modalRef={modalRef}
          otpRef={otpRef}
          onVerify={handleVerify}
          onResend={handleRequestOtp}
        />

        {/* Loading Spinner */}
        <Loading isOpen={loading} message="Logging in..." />
        <Loading isOpen={loadingOtp} message="Requesting Otp..." />
        {/* Error Toast */}
        <IonToast
          isOpen={!!error}
          message={error}
          duration={3000}
          color="danger"
          position="top"
          onDidDismiss={() => setError("")}
        />
      </IonContent>
      <IonFooter
        className="ion-no-border ion-text-center ion-padding"
        style={{ bottom: "20px" }}
      >
        <IonText>
          <IonLabel>
            &copy; {new Date().getFullYear()} All rights reserved.
          </IonLabel>
        </IonText>
      </IonFooter>
    </IonPage>
  );
};

export default Login;
