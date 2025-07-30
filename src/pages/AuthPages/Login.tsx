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
  IonHeader,
  IonToolbar,
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
    const mobile = String(mobileRef.current?.value ?? "").trim();
    const password = String(passwordRef.current?.value ?? "").trim();
    const lastTenDigits = mobile.slice(-10);

    if (!/^\d{10}$/.test(lastTenDigits)) {
      setError("Enter a valid 11-digit mobile number");
      return;
    }

    const loginPayload = {
      mobnum: lastTenDigits,
      password,
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

      const { user, access_token, logged, accountStatus } =
        await response.json();

      if (!access_token || !user || user.type !== "driver") {
        setError("Incorrect credentials!");
        return;
      }

      // Warn on default password usage
      if (password === "ipick@2025") {
        alert(
          "You are using the default password. Please change it immediately for security reasons."
        );
        setTimeout(handleRequestOtp, 100);
        return;
      }

      if (logged) {
        alert("You have been logged out of all other devices.");
      }

      // Save user info to localStorage
      const profilePictureUrl =
        user.personalRequirements?.profilePicture?.url || "";
      localStorage.setItem("id", user._id);
      localStorage.setItem("userId", user.id);
      localStorage.setItem("name", user.name);
      localStorage.setItem("accessToken", access_token);
      localStorage.setItem("driverData", JSON.stringify(user));
      localStorage.setItem("isLogged", "true");
      localStorage.setItem("userType", user.type);
      localStorage.setItem("status", user.status);
      localStorage.setItem("accountStatus", accountStatus);
      localStorage.setItem("profilePicture", profilePictureUrl);

      login();

      const userStatus = user.status?.toLowerCase();
      history.replace(userStatus === "approved" ? "/home" : "/checklist");
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

    setLoadingOtp(true);
    setError("");

    try {
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
        localStorage.setItem("otpMobile", lastTenDigits);
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
        modalRef.current?.present();
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
      <IonHeader collapse="fade" className="ion-no-border">
        <IonToolbar>
          <IonLabel slot="end" style={{ margin: "10px", fontSize: "12px" }}>
            v{import.meta.env.VITE_CURRENT_VERSION}
          </IonLabel>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding" fullscreen>
        <div className="ion-text-center">
          <IonImg src="/assets/logo-word.png" className="logo-image" />
        </div>
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

        <OtpModal modalRef={modalRef} otpRef={otpRef} onVerify={handleVerify} />

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
    </IonPage>
  );
};

export default Login;
