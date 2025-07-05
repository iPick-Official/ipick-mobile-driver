import React, { useEffect, useRef, useState } from "react";
import { useHistory } from "react-router";
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
  IonToolbar,
  IonTitle,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonList,
} from "@ionic/react";
import {
  powerOutline,
  searchOutline,
  menuOutline,
  powerSharp,
} from "ionicons/icons";
import { fetchBookingDetails } from "../../services/apiService";
import { useAuth } from "../../contexts/AuthContext";
import Map from "../../components/Map";
import { connectSocket, socket } from "../../utils/useSocket";
import ConfirmActionSheet from "../../components/ConfirmActionSheet";
import "@theme/variables.css";
import "./Home.css";
import Loading from "../../components/Loading";

const Home: React.FC = () => {
  const { logout } = useAuth();
  const modalRef = useRef<HTMLIonModalElement>(null);
  const history = useHistory();
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isWorking, setIsWorking] = useState(false);
  const [acceptBooking, setAcceptBooking] = useState(false);
  const [header, setHeader] = useState<any | null>(null);
  const [subHeader, setSubHeader] = useState<any | null>(null);
  const [showActionSheet, setShowActionSheet] = useState(false);
  const [bookingData, setBookingData] = useState<any | null>(null);
  const [users, setUsers] = useState<any | null>(null);

  const [bookingId, setBookingId] = useState<any | null>(null);
  const [riderId, setRiderId] = useState<any | null>(null);

  const userId = localStorage.getItem("userId");

  const openModal = async () => {
    await modalRef.current?.present();
    setIsModalOpen(true);
    setIsWorking(true);
    localStorage.setItem("working", "true");
  };

  const closeModal = async () => {
    setShowActionSheet(true);
    setHeader("Go Offline");
    setSubHeader("Are you sure you want to go offline?");
    setIsWorking(false);
    localStorage.setItem("working", "false");
  };

  useEffect(() => {
    const checkWorking = async () => {
      const storedWorking = localStorage.getItem("working");
      if (storedWorking === "true") {
        await modalRef.current?.present();
        setIsModalOpen(true);
      } else {
        await modalRef.current?.dismiss();
        setIsModalOpen(false);
      }
    };
    checkWorking();
  }, []);

  useEffect(() => {
    if (userId) {
      connectSocket(userId);
    }

    socket?.off("all_users");
    socket?.on("all_users", (data: any) => {
      console.log("All user data received:", data);
      if (Array.isArray(data.users)) {
        data.users.forEach((user: any, index: number) => {
          const name = user?.riderData?.name || "Unnamed Rider";
          console.log(`User ${index + 1} name: ${name}`);
        });
      } else {
        console.warn("Expected 'users' to be an array.");
      }

      setUsers(data.users || []);
    });
  }, []);

  useEffect(() => {
    const fetchAll = async () => {
      const booking = await fetchBookingDetails();
      setBookingData(booking);
    };
    fetchAll();
  }, [bookingData]);

  const handleAcceptBooking = (bookingId: string, riderId: string) => {
    setAcceptBooking(true);
    setShowActionSheet(true);
    setHeader("Accept Bookings");
    setSubHeader("Are you ready to start the ride?");
    setBookingId(bookingId);
    setRiderId(riderId);
  };

  const bookAccepted = async () => {
    const reqBody = {
      id: riderId,
      status: "booked",
      timestamp: new Date().toISOString().substring(0, 10),
      driverId: localStorage.getItem("userId"),
      tripStatus: 1,
      _id: bookingId,
    };

    try {
      setLoading(true);

      const response = await fetch(
        `${import.meta.env.VITE_API_ENDPOINT}/ride-hail/bookAccepted`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(reqBody),
        }
      );
      window.location.reload();
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        console.error("Booking failed:", errorData || response.statusText);
        return;
      }

      const result = await response.json();
      console.log("Booking successful:", result);
      const selectedBooking = users.find(
        (user: any) => user._id === bookingId && user.riderId === riderId
      );

      if (selectedBooking) {
        localStorage.setItem(
          "acceptedBooking",
          JSON.stringify(selectedBooking)
        );
        console.log("Booking saved locally.");
      }
    } catch (error) {
      console.error("Network or server error during booking:", error);
    } finally {
      setLoading(false);
    }
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

      <IonContent fullscreen>
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
        <IonHeader className="no-ion-border transparent-header" collapse="fade">
          <IonToolbar>
            <IonTitle color="primary">Online</IonTitle>
            <IonButtons slot="end">
              <IonButton onClick={closeModal} color="danger">
                <IonIcon icon={powerSharp} slot="start" />
              </IonButton>
            </IonButtons>
          </IonToolbar>
        </IonHeader>

        <IonContent>
          {users && users.length > 0 ? (
            <IonList className="ion-padding">
              {users.map((user: any, index: number) => (
                <IonCard key={user._id || index} className="user-card">
                  <IonCardHeader className="user-card-header" color="primary">
                    <IonCardTitle className="user-card-title">
                      {user?.riderData?.name || "Unnamed"}
                    </IonCardTitle>
                  </IonCardHeader>

                  <IonCardContent className="user-card-content">
                    <div className="user-card-columns">
                      <div className="user-card-left">
                        <IonText color="dark">
                          <p className="user-text">
                            <strong>Origin:</strong>{" "}
                            {user?.origin?.name || "Unknown origin"}
                          </p>
                          <p className="user-text">
                            <strong>Destination:</strong>{" "}
                            {user?.destination?.name || "Unknown destination"}
                          </p>
                        </IonText>
                      </div>

                      <div className="user-card-right">
                        <IonText color="primary" className="user-text-bold">
                          <p>
                            {user?.computations?.fareDistanceInKM?.toFixed(2) ||
                              "0"}{" "}
                            km
                          </p>
                          <p className="user-text-bold">
                            ₱ {user?.travelFare?.toFixed(2) || "0.00"}
                          </p>
                        </IonText>
                        <IonText color="medium">
                          <p className="user-text-small">
                            <strong>Rating:</strong>{" "}
                            {user?.userRating ?? "Not rated"}
                          </p>
                        </IonText>
                      </div>
                    </div>
                  </IonCardContent>
                  <IonButton
                    color="light"
                    expand="full"
                    shape="round"
                    onClick={() => handleAcceptBooking(user._id, user.riderId)}
                  >
                    Accept
                  </IonButton>
                </IonCard>
              ))}
            </IonList>
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
      <Loading isOpen={loading} message="Processing..." />
      <ConfirmActionSheet
        isOpen={showActionSheet}
        onDismiss={() => setShowActionSheet(false)}
        header={header}
        subHeader={subHeader}
        onConfirm={async () => {
          setShowActionSheet(false);

          if (acceptBooking) {
            setAcceptBooking(false);
            await modalRef.current?.dismiss();
            setIsModalOpen(false);
            bookAccepted();
            history.push("/driver-trip");
          } else {
            await modalRef.current?.dismiss();
            setIsModalOpen(false);
          }
        }}
        cssClass="my-custom-action-sheet"
      />
    </IonPage>
  );
};

export default Home;
