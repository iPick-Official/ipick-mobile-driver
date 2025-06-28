import React, { useState } from "react";
import {
  IonButtons,
  IonContent,
  IonHeader,
  IonItem,
  IonPage,
  IonTitle,
  IonToolbar,
  IonButton,
  IonSelect,
  IonSelectOption,
  IonList,
  IonLabel,
  IonText,
  IonInput,
  IonIcon,
} from "@ionic/react";
import BackButton from "../../components/BackButton";
import { searchOutline } from "ionicons/icons";

const Wallet: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  const transactionHistory = [
    {
      id: 1,
      date: "2025-06-25",
      description: "Top Up",
      amount: "+$50.00",
    },
    {
      id: 2,
      date: "2025-06-25",
      description: "Payment to Vendor A",
      amount: "-$20.00",
    },
    {
      id: 3,
      date: "2025-06-24",
      description: "Refund from Vendor B",
      amount: "+$10.00",
    },
  ];

  const filteredTransactions = transactionHistory.filter(
    (tx) => tx.date === selectedDate
  );

  return (
    <IonPage>
      <IonHeader collapse="fade" className="ion-no-border">
        <IonToolbar>
          <IonButtons slot="start">
            <BackButton />
          </IonButtons>
          <IonTitle>Wallet</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding" fullscreen>
        <IonItem lines="none" className="profile-item">
          <IonLabel className="ion-text-wrap">
            <h2>Current Balance</h2>
            <IonText color="primary">
              <h1>$120.00</h1>
            </IonText>
          </IonLabel>
          <IonButton slot="end" fill="solid" color="primary">
            Top Up
          </IonButton>
        </IonItem>

        {/* Use IonInput with type="date" to filter transactions */}
        <IonItem lines="none" className="input-field">
          <IonInput
            color="dark"
            inputMode="numeric"
            placeholder="Select Date"
            label="Filter Transactions By Date"
            labelPlacement="floating"
            type="date"
            value={selectedDate}
            onIonChange={(e) => {
              const value = e.detail.value || "";
              setSelectedDate(value);
            }}
            className="floating-label-dark"
          />
        </IonItem>

        <IonList>
          {filteredTransactions.length > 0 ? (
            filteredTransactions.map((tx) => (
              <IonItem key={tx.id}>
                <IonLabel>
                  <h2>{tx.description}</h2>
                  <p>{tx.date}</p>
                </IonLabel>
                <IonText
                  color={tx.amount.startsWith("+") ? "success" : "danger"}
                >
                  <h2>{tx.amount}</h2>
                </IonText>
              </IonItem>
            ))
          ) : (
            <div
              className="ion-no-border ion-text-center ion-padding"
              style={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                marginTop: "40px",
              }}
            >
              <IonText color="medium">
                <p>No transactions found for this date.</p>
              </IonText>
              <IonIcon
                color="medium"
                icon={searchOutline}
                style={{ fontSize: "100px", marginBottom: "10px" }}
              />
            </div>
          )}
        </IonList>
      </IonContent>
    </IonPage>
  );
};

export default Wallet;
