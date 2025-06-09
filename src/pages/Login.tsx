import React, { useRef, useState } from "react";
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
import { useAuth } from "../contexts/AuthContext";
import { useHistory } from "react-router-dom";
import Loading from "../components/Loading";
import "../theme/variables.css";

const Login: React.FC = () => {
  const { login } = useAuth();
  const history = useHistory();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Refs to access real-time values
  const mobileRef = useRef<HTMLIonInputElement>(null);
  const passwordRef = useRef<HTMLIonInputElement>(null);

  const handleLogin = async () => {
    const normalizedMobile = String(mobileRef.current?.value ?? "").trim();
    const normalizedPassword = String(passwordRef.current?.value ?? "").trim();

    const lastTenDigits = normalizedMobile.slice(-10);
    if (!/^\d{10}$/.test(lastTenDigits)) {
      setError("Enter a valid 10-digit mobile number");
      return;
    }

    const loginPayload = {
      mobnum: lastTenDigits,
      password: normalizedPassword,
    };

    setLoading(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 3000));

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

      if (!data.access_token || !data.user || data.user.type !== "driver") {
        setError("Incorrect credentials!");
        return;
      }

      if (data.logged) {
        alert("You have been logged out of all other devices.");
      }

      localStorage.setItem("userId", data.user.id);
      localStorage.setItem("accessToken", data.access_token);
      localStorage.setItem("user", JSON.stringify(data.user));
      localStorage.setItem("isLogged", "true");
      localStorage.setItem("userType", data.user.type);

      login();
      history.replace("/home");
    } catch (err) {
      console.error("Login error:", err);
      setError("An error occurred while logging in.");
    } finally {
      setLoading(false);
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
          <IonButton fill="clear" size="default">
            Forgot Password?
          </IonButton>
        </div>

        {/* Loading Spinner */}
        <Loading isOpen={loading} message="Logging in..." />

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
