import React, { useEffect } from "react";
import {
  IonButton,
  IonContent,
  IonFooter,
  IonHeader,
  IonImg,
  IonItem,
  IonPage,
  IonText,
  IonToolbar,
} from "@ionic/react";
import "@theme/variables.css";
import { useHistory } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { fetchActiveJobs } from "../../services/ApiService";

const Checklist: React.FC = () => {
  const history = useHistory();
  const { logout } = useAuth();
  const userName = localStorage.getItem("name");

  useEffect(() => {
    const intervalId = setInterval(() => {
      fetchActiveJobs(logout);
    }, 10000);

    fetchActiveJobs(logout); // initial call

    return () => clearInterval(intervalId);
  }, []);

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
        <IonItem lines="none">
          <IonText className="ion-text-center">
            Hello {userName}! Please submit all the requirements to continue
            driving with iPick.
          </IonText>
        </IonItem>
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
      <IonFooter>
        <IonButton
          className="custom-button"
          color="danger"
          expand="full"
          shape="round"
          size="large"
          onClick={() => {
            window.location.href =
              "https://docs.google.com/forms/d/1AH302t6VRm1R6268U9nYdeaIknpY7zuKuaMXu8BQ6AQ/edit";
          }}
        >
          Account Deletion
        </IonButton>
      </IonFooter>
    </IonPage>
  );
};

export default Checklist;
