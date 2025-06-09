import {
  IonButtons,
  IonContent,
  IonHeader,
  IonMenuButton,
  IonPage,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import { useParams } from "react-router";
import { useAuth } from "../contexts/AuthContext";
import "../theme/variables.css";

const Home: React.FC = () => {
  const { name } = useParams<{ name: string }>();
  const { logout } = useAuth();

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar className="transparent-toolbar">
          <IonButtons slot="start">
            <IonMenuButton />
          </IonButtons>
          <IonTitle>{name}</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen>
        <IonButtons>
          <button
            style={{
              padding: "10px 20px",
              background: "#3880ff",
              color: "#fff",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              fontSize: "16px",
            }}
            onClick={() => {
              logout();
            }}
          >
            Logout
          </button>
        </IonButtons>
      </IonContent>
    </IonPage>
  );
};

export default Home;
