import React, { useRef, useState } from "react";
import {
  IonPage,
  IonContent,
  IonInput,
  IonButton,
  IonItem,
  IonImg,
  IonToast,
  IonHeader,
  IonToolbar,
  IonIcon,
} from "@ionic/react";
import { useHistory } from "react-router-dom";
import Loading from "../../components/Loading";
import "@theme/variables.css";
import bcrypt from "bcryptjs";
import { eyeOffOutline, eyeOutline } from "ionicons/icons";

const UpdatePassword: React.FC = () => {
  const history = useHistory();
  const [showPassword, setShowPassword] = useState(false);
  const [showConPassword, setConShowPassword] = useState(false);
  const passwordRef = useRef<HTMLIonInputElement>(null);
  const conPasswordRef = useRef<HTMLIonInputElement>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const driverId = localStorage.getItem("driverObjectId");

  const handleSubmit = async () => {
    const newPassword = String(passwordRef.current?.value ?? "").trim();
    const confirmPassword = String(conPasswordRef.current?.value ?? "").trim();

    if (!newPassword || newPassword.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (!driverId) {
      setError("Driver ID not found. Please try again.");
      return;
    }

    if (newPassword === "ipick@2025") {
      setError(
        "You cannot set the default password. Please choose a different password."
      );
      return;
    }

    const storedDriver = localStorage.getItem("driverData");
    if (!storedDriver) {
      setError("Driver data missing. Please log in again.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const driverPayload = JSON.parse(storedDriver);
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      const updatedDriver = {
        ...driverPayload,
        password: hashedPassword,
      };

      const response = await fetch(
        `${import.meta.env.VITE_API_ENDPOINT_DRIVER
        }/Drivers/updateDrivers/${driverId}`,
        {
          method: "PUT", // Backend likely expects full object
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updatedDriver),
        }
      );

      if (!response.ok) {
        const errData = await response.json();
        console.error("Password update failed:", errData);
        setError(
          errData.message || "Failed to update password. Please try again."
        );
        return;
      }

      alert("Password updated successfully!");
      history.goBack();
    } catch (err) {
      console.error("Password update error:", err);
      setError("An error occurred while updating the password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <IonPage>
      <IonHeader collapse="fade" className="ion-no-border">
        <IonToolbar />
      </IonHeader>
      <IonContent className="ion-padding" fullscreen>
        <div className="ion-text-center" style={{ marginTop: "40px" }}>
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

        <IonItem lines="none" className="input-field">
          <IonInput
            ref={conPasswordRef}
            color="dark"
            placeholder="Password"
            label="Password"
            labelPlacement="floating"
            type={showConPassword ? "text" : "password"}
            className="floating-label-dark"
          />
          <IonIcon
            slot="end"
            icon={showConPassword ? eyeOffOutline : eyeOutline}
            onClick={() => setConShowPassword((prev) => !prev)}
            style={{ cursor: "pointer", fontSize: "1.4rem" }}
          />
        </IonItem>

        <IonButton
          className="custom-button" 
          expand="full"
          shape="round"
          size="large"
          onClick={handleSubmit}
        >
          Update Password
        </IonButton>

        <Loading isOpen={loading} message="Updating password..." />

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

export default UpdatePassword;
