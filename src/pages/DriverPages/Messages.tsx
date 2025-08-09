import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonButton,
  IonTextarea,
  IonFooter,
  IonButtons,
  IonIcon,
} from "@ionic/react";
import React, { useEffect, useRef, useState } from "react";
import { sendMsg, fetchMsgs } from "../../services/apiService";
import { socket } from "../../utils/useSocket";
import { useLocationContext } from "../../contexts/LocationContext";
import { Message, ChatPageProps } from "../../types/messageTypes";
import "../../theme/ChatPage.css";
import BackButton from "../../components/BackButton";
import { callSharp } from "ionicons/icons";

const ChatPage: React.FC<ChatPageProps> = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMsg, setInputMsg] = useState("");
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const { driverId, bookingId, riderName, riderMobile, riderId, } = useLocationContext();

  useEffect(() => {
    const stored = localStorage.getItem(`chat_${bookingId}`);
    if (stored) {
      setMessages(JSON.parse(stored));
    }
  }, [bookingId]);

  useEffect(() => {
    socket?.emit("iAmDriver", driverId);
    const updateMessages = async () => {
      try {
        const fetchedMessages = await fetchMsgs(riderId, driverId);

        const relevantMessages = fetchedMessages.filter(
          (msg: { bookingId: any; }) => msg.bookingId === bookingId
        );
        setMessages(relevantMessages);
        scrollToBottom();
      } catch (error) {
        console.error("Error fetching messages:", error);
      }
    };

    const handleNewMessages = (newMessages: Message[]) => {
      const hasRelevant = newMessages.some(
        (msg) => msg.bookingId === bookingId
      );
      if (hasRelevant) {
        console.log(`[Socket] Relevant messages received, re-fetching for bookingId: ${bookingId}`);
        updateMessages(); // Refresh messages from server
      } else {
        console.log("[Socket] No relevant messages for bookingId:", bookingId);
      }
    };
    updateMessages();
    socket?.on("user_messages", handleNewMessages);
    return () => {
      socket?.off("user_messages", handleNewMessages);
    };
  }, [bookingId, riderId]);

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    const trimmedMsg = inputMsg.trim();
    if (!trimmedMsg) return;

    const newMessage: Message = {
      bookingId,
      driverId,
      riderId,
      sender: "driver",
      msg: trimmedMsg,
    };

    try {
      await sendMsg(riderId, bookingId, driverId, trimmedMsg, "driver");
      const updated = [
        ...messages,
        { ...newMessage, createdAt: new Date().toISOString() },
      ];
      setMessages(updated);
      scrollToBottom();
      setInputMsg("");
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  return (
    <IonPage>
      <IonHeader className="ion-no-border" collapse="fade">
        <IonToolbar>
          <IonButtons slot="start">
            <BackButton />
          </IonButtons>
          <IonTitle>{riderName}</IonTitle>
          <IonButton fill="clear" slot="end" href={`tel:+63${riderMobile}`} size="default">
            <IonIcon icon={callSharp} />
          </IonButton>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding" fullscreen scrollY={true}>
        <div className="messages-container">
          {[...messages]
            .sort((a, b) => new Date(a.createdAt!).getTime() - new Date(b.createdAt!).getTime())
            .map((msg) => (
              <div
                key={`${msg.createdAt}-${msg.msg}`}
                className={`chat-bubble ${msg.sender === "driver" ? "sent" : "received"}`}
              >
                <p className="chat-text">{msg.msg}</p>
                <small className="chat-time">
                  {new Date(msg.createdAt || "").toLocaleTimeString()}
                </small>
              </div>
            ))}
          <div ref={messagesEndRef} />
        </div>
      </IonContent>

      <IonFooter className="chat-footer ion-no-border" collapse="fade">
        <div className="chat-input-container">
          <IonTextarea
            rows={1}
            placeholder="Type a message..."
            value={inputMsg}
            autoGrow
            onIonChange={(e) => setInputMsg(e.detail.value ?? "")}
            onInput={(e: any) => setInputMsg(e.target.value ?? "")}
            className="chat-textarea"
          />
          <IonButton
            onClick={handleSend}
            disabled={!inputMsg.trim()}
            shape="round"
          >
            Send
          </IonButton>
        </div>
      </IonFooter>
    </IonPage>
  );
};

export default ChatPage;
