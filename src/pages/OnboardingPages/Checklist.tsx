import React from "react";
import {
  IonButton,
  IonContent,
  IonHeader,
  IonImg,
  IonPage,
  IonText,
  IonToolbar,
  IonCard,
  IonCardContent,
  IonIcon,
  IonTitle,
} from "@ionic/react";
import { personCircle, documentText, carSport, logOut } from "ionicons/icons";
import { useHistory } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import "@theme/checklist.css";
import { useLocationContext } from "../../contexts/LocationContext";

const Checklist: React.FC = () => {
  const history = useHistory();
  const { logout } = useAuth();
  const {
    driverName, setDriverName, } = useLocationContext();

  return (
    <IonPage>
      <IonHeader className="header ion-no-border" collapse="fade">
        <IonToolbar className="toolbar">
          <IonTitle>Driver Checklist</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="content" fullscreen>
        <div className="top-section">
          <IonImg src="/assets/logo-word.png" className="logo" />
          <IonText className="app-title">Driver's App</IonText>
          <IonText className="welcome">
            Hello <b>{driverName}</b>, submit all requirements to continue driving.
          </IonText>
        </div>

        <IonCard className="card">
          <IonCardContent>
            <IonText className="card-title">
              <b>Required Documents</b>
            </IonText>

            <IonButton
              className="btn"
              expand="block"
              fill="solid"
              onClick={() => history.push("/personal-info")}
            >
              <IonIcon icon={personCircle} slot="start" />
              Personal Information
            </IonButton>

            <IonButton
              className="btn"
              expand="block"
              fill="solid"
              onClick={() => history.push("/personal-req")}
            >
              <IonIcon icon={documentText} slot="start" />
              Personal Requirements
            </IonButton>

            <IonButton
              className="btn"
              expand="block"
              fill="solid"
              onClick={() => history.push("/transport-req")}
            >
              <IonIcon icon={carSport} slot="start" />
              Transport Requirements
            </IonButton>

            <IonButton
              className="btn logout"
              expand="block"
              fill="solid"
              onClick={() => logout()}
            >
              <IonIcon icon={logOut} slot="start" />
              Sign Out
            </IonButton>
          </IonCardContent>
        </IonCard>
      </IonContent>
    </IonPage>
  );
};

export default Checklist;
