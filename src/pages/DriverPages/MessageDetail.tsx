import {
  IonButtons,
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonBackButton,
  IonList,
  IonFooter,
  IonItem,
  IonInput,
  IonButton,
  IonIcon,
} from "@ionic/react";
import { useParams } from "react-router";
import { useEffect, useRef, useState } from "react";
import "./MessageDetail.css";
import { sendSharp } from "ionicons/icons";
import BackButton from "../../components/BackButton";

const mockMessages: {
  [key: string]: {
    sender: string;
    messages: { text: string; from: "me" | "them" }[];
  };
} = {
  "1": {
    sender: "John Doe",
    messages: [
      { text: "Thanks for the smooth ride today!", from: "them" },
      { text: "I'll recommend you to my friends.", from: "them" },
    ],
  },
  "2": {
    sender: "Sarah Smith",
    messages: [
      { text: "You were so patient in traffic. Thank you!", from: "them" },
    ],
  },
  "3": {
    sender: "Mike Johnson",
    messages: [
      { text: "I forgot my sunglasses in your car.", from: "them" },
      { text: "Can you let me know if you find them?", from: "them" },
    ],
  },
};

const MessageDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messageData = mockMessages[id];

  const [messages, setMessages] = useState(messageData?.messages || []);
  const [newMessage, setNewMessage] = useState("");

  const sendMessage = () => {
    if (!newMessage.trim()) return;

    const newMsg = { text: newMessage.trim(), from: "me" as const };
    setMessages([...messages, newMsg]);
    setNewMessage("");
  };

  // Save to localStorage when messages update
  useEffect(() => {
    localStorage.setItem(`messages-${id}`, JSON.stringify(messages));
  }, [messages]);

  // Load from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(`messages-${id}`);
    if (stored) {
      setMessages(JSON.parse(stored));
    }
  }, [id]);

  if (!messageData) {
    return (
      <IonPage>
        <IonHeader>
          <IonToolbar>
            <IonButtons slot="start">
              <IonBackButton defaultHref="/messages" />
            </IonButtons>
            <IonTitle>Message</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent className="ion-padding">Message not found.</IonContent>
      </IonPage>
    );
  }

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);
  return (
    <IonPage>
      <IonHeader collapse="fade" className="ion-no-border">
        <IonToolbar>
          <IonButtons slot="start">
            <BackButton />
          </IonButtons>
          <IonTitle>{messageData.sender}</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding" fullscreen>
        <IonList className="chat-list">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`chat-bubble ${
                msg.from === "me" ? "from-me" : "from-them"
              }`}
            >
              {msg.text}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </IonList>
      </IonContent>

      <IonFooter className="ion-no-border">
        <div className="message-input-container">
          <IonItem lines="none" className="message-input-item">
            <IonInput
              className="message-input"
              placeholder="Type a message..."
              value={newMessage}
              onIonChange={(e) => setNewMessage(e.detail.value!)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              clearInput
            />
          </IonItem>
          <IonButton
            fill="clear"
            className="send-button"
            onClick={sendMessage}
            disabled={!newMessage.trim()}
          >
            <IonIcon icon={sendSharp} />
          </IonButton>
        </div>
      </IonFooter>
    </IonPage>
  );
};

export default MessageDetail;
