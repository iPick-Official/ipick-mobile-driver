import React from "react";
import { IonButton, IonContent, IonImg, IonPage } from "@ionic/react";
import "@theme/variables.css";
import { useHistory } from "react-router-dom";

const PersonlaReq: React.FC = () => {
  const history = useHistory();
  
  const handleLogin = () => {
    // Implement login logic here
    console.log("Sign In clicked");
  };

  return (
    <IonPage>
      <IonContent className="ion-padding" fullscreen>
        <IonButton
          className="custom-button"
          expand="full"
          shape="round"
          size="large"
          onClick={handleLogin}
        >
          Sign Out
        </IonButton>
      </IonContent>
    </IonPage>
  );
};

export default PersonlaReq;
