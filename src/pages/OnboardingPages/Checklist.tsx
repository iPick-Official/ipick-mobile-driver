import React from "react";
import { IonButton, IonContent, IonHeader, IonImg, IonPage, IonToolbar } from "@ionic/react";
import "@theme/variables.css";
import { useHistory } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

const Checklist: React.FC = () => {
  const history = useHistory();
  const { logout } = useAuth();

  const handleLogin = () => {
    // Implement login logic here
    console.log("Sign In clicked");
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
        <IonButton
          className="custom-button"
          expand="full"
          shape="round"
          size="large"
          onClick={() => history.push("/personal-info")}
        >
          Personal Information
        </IonButton>
        <IonButton
          className="custom-button"
          expand="full"
          shape="round"
          size="large"
          onClick={() => history.push("/personal-req")}
        >
          Personal Requirements
        </IonButton>
        <IonButton
          className="custom-button"
          expand="full"
          shape="round"
          size="large"
          onClick={() => history.push("/transport-req")}
        >
          Transport Requirements
        </IonButton>
        <IonButton
          className="custom-button"
          expand="full"
          shape="round"
          size="large"
          onClick={() => {
            logout();
          }}
        >
          Sign Out
        </IonButton>
      </IonContent>
    </IonPage>
  );
};

export default Checklist;
