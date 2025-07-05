import {
  IonButtons,
  IonContent,
  IonHeader,
  IonItem,
  IonLabel,
  IonList,
  IonPage,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import BackButton from "../../components/BackButton";

const helpTopics = [
  {
    title: "Getting Started",
    description:
      "Learn how to register as a driver, upload your documents, and get approved to start earning.",
  },
  {
    title: "Accepting Rides",
    description:
      "Once you're online, you'll receive ride requests. Accept them quickly to maintain a high acceptance rate and improve your earnings.",
  },
  {
    title: "Navigation & Pickups",
    description:
      "Use the your preferred map app to reach pickup and drop-off locations efficiently. Communicate with riders if needed.",
  },
  {
    title: "Payments & Earnings",
    description:
      "Monitor your earnings in the Driver Wallet, available in supported regions.",
  },
  {
    title: "Ratings & Reviews",
    description:
      "Maintain a high rating by being polite, punctual, and providing a clean and safe ride. Consistently low ratings may result in account review.",
  },
  {
    title: "Account & Vehicle Management",
    description:
      "Update your vehicle info, insurance, and driver documents in the Profile section to stay active and compliant.",
  },
  {
    title: "Support & Safety",
    description:
      "In case of an incident, tap the in-app Safety button or contact our support team. Your safety is our priority.",
  },
  {
    title: "Contact Driver Support",
    description: (
      <>
        Reach us via the in-app chat or email{" "}
        <a href="mailto:customerservice@ipick.ph">customerservice@ipick.ph</a>{" "}
        for help with your account or trips.
      </>
    ),
  },
];

const HelpCenter: React.FC = () => {
  return (
    <IonPage>
      <IonHeader collapse="fade" className="ion-no-border">
        <IonToolbar>
          <IonButtons slot="start">
            <BackButton />
          </IonButtons>
          <IonTitle>Help Center</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding" fullscreen>
        <IonList lines="full">
          {helpTopics.map((topic, index) => (
            <IonItem key={index}>
              <IonLabel>
                <h2>{topic.title}</h2>
                <p>{topic.description}</p>
              </IonLabel>
            </IonItem>
          ))}
        </IonList>
      </IonContent>
    </IonPage>
  );
};

export default HelpCenter;
