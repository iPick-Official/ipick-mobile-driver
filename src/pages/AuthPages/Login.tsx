import React, { useRef, useState } from "react";
import {
  IonButton,
  IonContent,
  IonPage,
  IonInput,
  IonToast,
  IonItem,
  IonImg,
  IonLabel,
  IonHeader,
  IonToolbar,
  IonIcon,
  IonFooter,
} from "@ionic/react";
import { useLocationContext } from "../../contexts/LocationContext";
import { eyeOffOutline, eyeOutline } from "ionicons/icons";
import { useAuth } from "../../contexts/AuthContext";
import { useHistory } from "react-router-dom";
import Loading from "../../components/Loading";

import "@theme/variables.css";


const Login: React.FC = () => {
  const { login } = useAuth();
  const history = useHistory();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const mobileRef = useRef<HTMLIonInputElement>(null);
  const passwordRef = useRef<HTMLIonInputElement>(null);

  const {
    setUserId, setDriverId,
    setDriverName, setAccessToken,
    userType, setUserType,
    setStatus, setAccountStatus,
    setProfilePicture, setPlateNum,
    setCarBrand, setCarModel,
    setUserCarType,
    setCarColor } = useLocationContext();

  const handleLogin = async () => {
    const mobile = String(mobileRef.current?.value ?? "").trim();
    const password = String(passwordRef.current?.value ?? "").trim();
    const lastTenDigits = mobile.slice(-10);
    localStorage.setItem("mobileNumber", lastTenDigits);

    if (!/^\d{10}$/.test(lastTenDigits)) {
      setError("Enter a valid mobile number");
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

      if (password === "ipick@2025") {
        alert(
          "You are using the default password. Please change it immediately for security reasons."
        );
        history.push("/new-password");
        return;
      }

      if (logged) {
        alert("You have been logged out of all other devices.");
      }

      // Save user info to localStorage
      const profilePictureUrl =
        user.personalRequirements?.profilePicture?.url || "";
      setUserId(user._id);
      setDriverId(user.id);
      setDriverName(user.name);
      setAccessToken(access_token);
      setUserType(userType);
      setStatus(user.status);
      setUserCarType(user.carType)
      setAccountStatus(accountStatus);
      setProfilePicture(profilePictureUrl);
      setPlateNum(user?.transportRequirements?.plateNumber);
      setCarBrand(user?.transportRequirements?.carColor);
      setCarModel(user?.transportRequirements?.carBrand);
      setCarColor(user?.transportRequirements?.carModel);
      localStorage.setItem("driverData", JSON.stringify(user));
      localStorage.setItem("id", user._id);
      localStorage.setItem("userId", user.id);
      localStorage.setItem("accessToken", access_token);
      localStorage.setItem("isLogged", "true");
      localStorage.setItem("userType", user.type);
      localStorage.setItem("status", user.status);
      localStorage.setItem("accountStatus", user.accountStatus);
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
        <div className="ion-text-center" style={{ marginBottom: "2rem" }}>
          <IonImg src="/assets/logo-word.png" className="logo-image" />
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
          <IonLabel
            style={{
              display: "block",
              textAlign: "center",
              fontSize: "0.9rem",
              color: "#1b1b1b",
              margin: "2rem",
            }}
          >
            This app is intended exclusively for iPick drivers.
          </IonLabel>
        </div>

        {/* Mobile Input */}
        <div className="phone-row">
          <IonItem lines="none" className="prefix-item">
            <img src="/assets/philippines.png" alt="PH Flag" className="flag" />
            <span className="code">+63</span>
          </IonItem>

          <IonItem lines="none" className="input-item">
            <IonInput
              ref={mobileRef}
              color="dark"
              inputMode="numeric"
              pattern="[0-9]*"
              placeholder="9xxxxxxxxx"
              label="Mobile Number"
              labelPlacement="stacked"
              type="tel"
              maxlength={10}
              className="floating-label-dark"
            />
          </IonItem>
        </div>

        <IonItem lines="none" className="input-field">
          <IonInput
            ref={passwordRef}
            color="dark"
            placeholder="Password"
            label="Password"
            labelPlacement="floating"
            type={showPassword ? "text" : "password"}
            className="floating-label-dark"
          />
          <IonIcon
            slot="end"
            icon={showPassword ? eyeOffOutline : eyeOutline}
            onClick={() => setShowPassword((prev) => !prev)}
            style={{ cursor: "pointer", fontSize: "1.4rem" }}
          />
        </IonItem>

        <IonButton
          className="custom-button"
          expand="block"
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
            onClick={() =>
              history.push("/phone-auth", { mode: "signup" })
            }
          >
            Sign-up
          </IonButton>
          <IonButton
            fill="clear"
            size="default"
            onClick={() =>
              history.push("/phone-auth", { mode: "login" })
            }
          >
            Forgot Password?
          </IonButton>
        </div>
        <Loading isOpen={loading} message="Logging in..." />

        <IonToast
          isOpen={!!error}
          message={error}
          duration={3000}
          position="top"
          onDidDismiss={() => setError("")}
        />
      </IonContent>
    </IonPage>
  );
};

export default Login;
