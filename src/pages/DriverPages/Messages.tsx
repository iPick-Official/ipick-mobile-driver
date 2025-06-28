import {
  IonButtons,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import BackButton from "../../components/BackButton";

const Messages: React.FC = () => {
  return (
    <IonPage>
      <IonHeader collapse="fade" className="ion-no-border">
        <IonToolbar>
          <IonButtons slot="start">
            <BackButton />
          </IonButtons>
          <IonTitle>Messages</IonTitle>
        </IonToolbar>
      </IonHeader>
    </IonPage>
  );
};

export default Messages;
