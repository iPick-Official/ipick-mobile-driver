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
  IonBadge,
} from "@ionic/react";
import { useHistory } from "react-router";
import BackButton from "../../components/BackButton";

const Messages: React.FC = () => {
  const history = useHistory();

  const messageThreads = [
    {
      id: "1",
      sender: "John Doe",
      preview: "Thanks for the smooth ride today!",
      time: "2h ago",
      unread: false,
    },
    {
      id: "2",
      sender: "Sarah Smith",
      preview: "You were really helpful with the bags. Thanks!",
      time: "5h ago",
      unread: false,
    },
    {
      id: "3",
      sender: "Mike Johnson",
      preview: "I think I left my sunglasses in your car.",
      time: "1d ago",
      unread: false,
    },
  ];

  const hasMessages = messageThreads.length > 0;

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
      <IonContent className="ion-padding" fullscreen>
        {hasMessages ? (
          <IonList>
            {messageThreads.map((msg) => (
              <IonItem
                button
                key={msg.id}
                onClick={() => history.push(`/messages/${msg.id}`)}
              >
                <IonLabel>
                  <h2>{msg.sender}</h2>
                  <p>{msg.preview}</p>
                  <small>{msg.time}</small>
                </IonLabel>
                {msg.unread && <IonBadge color="primary">New</IonBadge>}
              </IonItem>
            ))}
          </IonList>
        ) : (
          <div
            style={{ textAlign: "center", marginTop: "40px", color: "#888" }}
          >
            <p>No messages yet</p>
          </div>
        )}
      </IonContent>
    </IonPage>
  );
};

export default Messages;
