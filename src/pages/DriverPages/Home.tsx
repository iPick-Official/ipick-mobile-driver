import React, { useRef, useState } from "react";
import {
  IonPage,
  IonHeader,
  IonContent,
  IonButtons,
  IonMenuButton,
  IonIcon,
  IonButton,
  IonModal,
  IonText,
  IonItem,
  IonToolbar,
  IonTitle,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonItemOption,
  IonItemOptions,
  IonItemSliding,
  IonActionSheet,
  IonCol,
  IonGrid,
  IonRow,
} from "@ionic/react";
import {
  powerOutline,
  searchOutline,
  menuOutline,
  sendSharp,
} from "ionicons/icons";
import {
  fetchActiveJobs,
  fetchBookingDetails,
} from "../../services/apiService";
import { useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import Map from "../../components/Map";
import "@theme/variables.css";

const Home: React.FC = () => {
  const { logout } = useAuth();
  const modalRef = useRef<HTMLIonModalElement>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showActionSheet, setShowActionSheet] = useState(false);
  const [bookingData, setBookingData] = useState<any | null>(null);

  const openModal = async () => {
    await modalRef.current?.present();
    setIsModalOpen(true);
  };

  const closeModal = async () => {
    setShowActionSheet(true);
  };

  useEffect(() => {
    const fetchAll = async () => {
      fetchActiveJobs(logout);
      const booking = await fetchBookingDetails();
      setBookingData(booking);
    };
    const intervalId = setInterval(fetchAll, 10000);
    fetchAll(); // initial call
    return () => clearInterval(intervalId);
  }, [bookingData]);

  const handleAcceptBooking = (bookingId: string) => {
    console.log("Accepted booking:", bookingId);
    // Add your API call or logic to accept the booking
  };

  return (
    <IonPage>
      <IonHeader className="ion-no-border">
        <IonButtons className="custom-button-position">
          <IonMenuButton className="circular-menu-button">
            <IonIcon icon={menuOutline} className="custom-font-size" />
          </IonMenuButton>
        </IonButtons>
      </IonHeader>

      <IonContent>
        <Map />
        {!isModalOpen && (
          <IonHeader>
            <div className="absolute-bottom-bar">
              <IonButton
                color="medium"
                id="open-modal"
                shape="round"
                onClick={openModal}
              >
                Offline
                <IonIcon icon={powerOutline} style={{ marginLeft: "10px" }} />
              </IonButton>
            </div>
          </IonHeader>
        )}

        {/* Modal */}
      </IonContent>
      <IonModal
        ref={modalRef}
        trigger="open-modal"
        initialBreakpoint={0.75}
        breakpoints={[0.25, 0.75, 1]}
        backdropDismiss={false}
        backdropBreakpoint={0.25}
        onWillDismiss={() => setIsModalOpen(false)}
      >
        <IonHeader class="no-ion-border" collapse="fade" translucent={true}>
          <IonToolbar>
            <IonTitle color="primary">Online</IonTitle>
            <IonButtons slot="end">
              <IonButton onClick={closeModal} color="danger">
                <IonIcon icon={powerOutline} slot="start" />
                Close
              </IonButton>
            </IonButtons>
          </IonToolbar>
        </IonHeader>

        <IonContent>
          {bookingData?.length > 0 ? (
            bookingData.map((booking: any) => (
              <IonItemSliding
                key={booking._id}
                className="ion-no-padding ion-no-margin"
              >
                <IonItem
                  lines="none"
                  className="fade-slide-up ion-no-padding ion-no-margin"
                >
                  <IonCard
                    className="ion-no-margin ion-no-padding"
                    style={{ width: "100%" }}
                  >
                    <IonCardHeader>
                      <IonCardTitle>
                        Ref: {booking.referenceNumber}
                      </IonCardTitle>
                    </IonCardHeader>
                    <IonCardContent>
                      <IonGrid>
                        <IonRow>
                          <IonCol size="auto">💳</IonCol>
                          <IonCol>
                            <strong>Payment:</strong>{" "}
                            {booking.paymentType?.paymentType}
                          </IonCol>
                        </IonRow>

                        <IonRow>
                          <IonCol size="auto">🚗</IonCol>
                          <IonCol>
                            <strong>Car:</strong> {booking.carType?.vehicleType}
                          </IonCol>
                        </IonRow>

                        <IonRow>
                          <IonCol size="auto">💰</IonCol>
                          <IonCol>
                            <strong>Fare:</strong> ₱
                            {booking.travelFare.toFixed(2)}
                          </IonCol>
                        </IonRow>

                        <IonRow>
                          <IonCol size="auto">📊</IonCol>
                          <IonCol>
                            <strong>Share:</strong> ₱
                            {booking.systemShare.toFixed(2)}
                          </IonCol>
                        </IonRow>
                      </IonGrid>
                    </IonCardContent>
                  </IonCard>
                </IonItem>

                <IonItemOptions
                  side="end"
                  className="ion-no-padding ion-no-border"
                >
                  <IonItemOption
                    color="transparent"
                    onClick={() => handleAcceptBooking(booking._id)}
                  >
                    <IonIcon size="large" icon={sendSharp} color="primary" />
                  </IonItemOption>
                </IonItemOptions>
              </IonItemSliding>
            ))
          ) : (
            <div
              className="ion-no-border ion-text-center ion-padding"
              style={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <IonText>
                <p>No bookings available.</p>
              </IonText>
              <IonIcon
                color="medium"
                icon={searchOutline}
                style={{ marginTop: "20px", fontSize: "100px" }}
              />
            </div>
          )}
        </IonContent>
      </IonModal>

      <IonActionSheet
        isOpen={showActionSheet}
        onDidDismiss={() => setShowActionSheet(false)}
        header="Go Offline?"
        subHeader="Are you sure you want to go offline?"
        cssClass="my-custom-action-sheet"
        buttons={[
          {
            text: "Yes",
            handler: async () => {
              await modalRef.current?.dismiss();
              setIsModalOpen(false);
            },
          },
          {
            text: "Cancel",
            role: "cancel",
          },
        ]}
      />
    </IonPage>
  );
};

export default Home;
