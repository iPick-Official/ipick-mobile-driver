import {
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonModal,
  IonPage,
  IonTextarea,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import BackButton from "../../components/BackButton";
import { useState } from "react";
import Loading from "../../components/Loading";
import { sendSharp } from "ionicons/icons";

const helpTopics = [
  {
    title: "Getting Started",
    description:
      "Learn how to register as a driver, upload your documents, and get approved to start earning.",
    action: "https://ipickph.com/become-driver",
  },
  {
    title: "Accepting Rides",
    description:
      "Once you're online, you'll receive ride requests. Accept them quickly to maintain a high acceptance rate and improve your earnings.",
  },
  {
    title: "Navigation & Pickups",
    description:
      "Use googlemap app to reach pickup and drop-off locations efficiently. Communicate with riders if needed.",
  },
  {
    title: "Payments & Earnings",
    description:
      "Monitor your earnings in the Driver Wallet, available in supported regions.",
    action: "/wallet",
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
    action: "/my-profile",
  },
  {
    title: "Support & Safety",
    description:
      "In case of an incident, tap the in-app Safety button or contact our support team. Your safety is our priority.",
  },
  {
    title: "Feedback",
    description:
      "Have a suggestion or found an issue? Let us know your feedback helps us improve!",
    action: "/",
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
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const driverData = JSON.parse(localStorage.getItem("driverData") || "{}");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const sendFeedback = async () => {
    const reqBody = {
      id: driverData?.id,
      msg: message,
    };

    try {
      setLoading(true);
      const response = await fetch(
        `${import.meta.env.VITE_API_ENDPOINT}/ride-hail/feedback`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(reqBody),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Server responded with an error:", errorData);
        return; // Stop execution if request failed
      }

      // Optionally log response or show a success message
      const data = await response.json();
      console.log("Feedback sent successfully:", data);
    } catch (error) {
      console.error("Network or server error while sending feedback:", error);
    } finally {
      setLoading(false);
    }
  };

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
            <IonItem
              key={index}
              onClick={() => {
                if (topic.title === "Feedback") {
                  setIsModalOpen(true);
                } else if (topic.action) {
                  window.location.href = topic.action;
                }
              }}
              detail
            >
              <IonLabel>
                <h2>{topic.title}</h2>
                <p>{topic.description}</p>
              </IonLabel>
            </IonItem>
          ))}
        </IonList>
      </IonContent>
      <IonModal
        isOpen={isModalOpen}
        onDidDismiss={() => setIsModalOpen(false)}
        trigger="open-modal"
        initialBreakpoint={0.25}
        breakpoints={[0.25, 0.5, 0.75]}
        backdropDismiss={true}
      >
        <IonHeader className="no-ion-border transparent-header" collapse="fade">
          <IonToolbar>
            <IonTitle>Send Feedback</IonTitle>
            <IonButtons slot="end">
              <IonButton
                color="primary"
                onClick={async () => {
                  await sendFeedback();
                  setIsModalOpen(false);
                  setMessage("");
                }}
                disabled={!message.trim()}
              >
                <IonIcon icon={sendSharp} />
              </IonButton>
            </IonButtons>
          </IonToolbar>
        </IonHeader>
        <IonContent className="ion-padding" fullscreen>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              height: "100%",
              justifyContent: "center",
              maxWidth: "600px",
              margin: "0 auto",
            }}
          >
            <IonTextarea
              placeholder="Write your feedback here..."
              value={message}
              onIonInput={(e) => setMessage(e.detail.value!)}
              autoGrow
              rows={6}
              style={{
                flex: 1,
                backgroundColor: "#f9f9f9",
                borderRadius: "12px",
                padding: "14px",
                boxShadow: "0 2px 6px rgba(0, 0, 0, 0.05)",
                fontSize: "1rem",
                fontFamily: "system-ui, sans-serif",
                transition: "border 0.3s ease, box-shadow 0.3s ease",
              }}
            />
          </div>
        </IonContent>
      </IonModal>

      <Loading isOpen={loading} message="Processing..." />
    </IonPage>
  );
};

export default HelpCenter;
