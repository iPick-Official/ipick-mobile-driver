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
import { eyeOffOutline, eyeOutline } from "ionicons/icons";
import bcrypt from "bcryptjs";

const UpdatePassword: React.FC = () => {
  const history = useHistory();
  const passwordRef = useRef<HTMLIonInputElement>(null);
  const conPasswordRef = useRef<HTMLIonInputElement>(null);
  const mobileNumber = localStorage.getItem("mobileNumber");

  const [showPassword, setShowPassword] = useState(false);
  const [showConPassword, setConShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

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

    if (!mobileNumber) {
      setError("Mobile number not found. Please try again.");
      return;
    }

    if (newPassword === "ipick@2025") {
      setError(
        "You cannot set the default password. Please choose a different one."
      );
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Hash the password using bcryptjs
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);

      const payload = {
        password: hashedPassword,
        mobnum: mobileNumber,
      };

      const response = await fetch(
        `${import.meta.env.VITE_API_ENDPOINT}/auth/updatepass`,
        {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        console.error("Password update failed:", errData);
        setError(errData.message || "Failed to update password.");
        return;
      }

      alert("Password updated successfully!");
      history.push("/");
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
        <div className="ion-text-center" style={{ marginBottom: "40px" }}>
          <IonImg src="/assets/logo-word.png" className="logo-image" />
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
            placeholder="Confirm Password"
            label="Confirm Password"
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
