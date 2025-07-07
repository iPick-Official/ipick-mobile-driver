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
import { fetchActiveJobs } from "../../services/apiService";
import "@theme/variables.css";
import "./Home.css";
import Loading from "../../components/Loading";
import { watchLocation } from "../../utils/locationHelpers";

const Home: React.FC = () => {
  const { logout } = useAuth();
  const modalRef = useRef<HTMLIonModalElement>(null);
  const history = useHistory();
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentLocation, setCurrentLocation] =
    useState<google.maps.LatLngLiteral | null>(null);
  const [distanceToPickup, setRiderDistances] = useState<
    { riderId: string; distance: number }[] | null
  >(null);
  const prevUsersRef = useRef<any[]>([]);

  const [isWorking, setIsWorking] = useState(false);
  const [acceptBooking, setAcceptBooking] = useState(false);
  const [header, setHeader] = useState<any | null>(null);
  const [subHeader, setSubHeader] = useState<any | null>(null);
  const [showActionSheet, setShowActionSheet] = useState(false);
  const [bookingData, setBookingData] = useState<any | null>(null);
  const [tripStatus, setTripStatus] = useState<any | null>(null);
  const [users, setUsers] = useState<any | null>(null);

  const [bookingId, setBookingId] = useState<any | null>(null);
  const [riderId, setRiderId] = useState<any | null>(null);
  const userId = localStorage.getItem("userId");

  useEffect(() => {
    const id = watchLocation(
      (position) => {
        const loc = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        setCurrentLocation(loc);
      },
      (error) => {
        console.error("Geolocation error:", error);
      }
    );
    return () => {
      if (id !== null) {
        navigator.geolocation.clearWatch(id);
      }
    };
  }, []);

  useEffect(() => {
    if (userId) {
      connectSocket(userId);
    }

    socket?.off("all_users");
    socket?.on("all_users", (data: any) => {
      // console.log("All user data received:", data);

      if (Array.isArray(data.users)) {
        const origins = data.users.map((user: any, index: number) => {
          const origin = user?.origin?.coordinates || "Unnamed Rider";
          // console.log(`User ${index + 1} origin: ${origin}`);
          return origin;
        });
        setUsers(data.users);
      } else {
        console.warn("Expected 'users' to be an array.");
        setUsers([]);
      }
    });
  }, []);

  useEffect(() => {
    const prevUsers = prevUsersRef.current;
    const currentUserIds = (users || []).map(
      (u: { riderId: string }) => u?.riderId
    );
    const prevUserIds = (prevUsers || []).map((u) => u?.riderId);

    const hasNewUsers =
      currentUserIds.length > prevUserIds.length &&
      currentUserIds.some((id: string) => !prevUserIds.includes(id));

    if (!users || !Array.isArray(users)) return;

    const ridersPickupCoordinates = users
      .map((rider: { riderId: any; origin: { coordinates: any } }) => ({
        riderId: rider?.riderId,
        coordinates: rider?.origin?.coordinates,
      }))
      .filter(
        (r): r is { riderId: string; coordinates: [number, number] } =>
          !!r.riderId &&
          Array.isArray(r.coordinates) &&
          r.coordinates.length === 2
      );

    const fetchDistances = async () => {
      if (!currentLocation || ridersPickupCoordinates.length === 0) return;

      const { lat: currentLat, lng: currentLng } = currentLocation;

      const directionsService = new google.maps.DirectionsService();
      const distances: { riderId: string; distance: number }[] = [];

      for (const rider of ridersPickupCoordinates) {
        const [pickupLat, pickupLng] = rider.coordinates;
        try {
          const result = await directionsService.route({
            origin: new google.maps.LatLng(currentLat, currentLng),
            destination: new google.maps.LatLng(pickupLat, pickupLng),
            travelMode: google.maps.TravelMode.DRIVING,
          });

          if (result && result.routes.length > 0) {
            const leg = result.routes[0].legs[0];
            const distanceText = leg?.distance?.text ?? "0 km";
            const numericDistance = parseFloat(
              distanceText.replace(/[^\d.]/g, "")
            );
            distances.push({
              riderId: rider.riderId,
              distance: numericDistance,
            });
          } else {
            console.warn(`No route found for rider ${rider.riderId}`);
          }
        } catch (err) {
          console.error(
            `❌ Failed to fetch route for rider ${rider.riderId}:`,
            err
          );
        }
      }

      console.log("📦 Distances to riders:", distances);
      distances.sort((a, b) => a.distance - b.distance);
      setRiderDistances(distances);
    };

    if (hasNewUsers) {
      console.log("🆕 New users detected. Fetching distances...");
      fetchDistances();
    }

    // Update previous users for the next render
    prevUsersRef.current = users;
  }, [users, currentLocation]);

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
    if (userId) {
      connectSocket(userId);
    }

    socket?.off("booking_data");
    socket?.on("booking_data", (data: any) => {
      console.log("Received booking data:", data);
      setTripStatus(data?.tripStatus);
    });
  }, []);

  useEffect(() => {
    const handleTripStatus = async () => {
      if (tripStatus > 0 && tripStatus < 4) {
        await modalRef.current?.dismiss();
        history.push("/driver-trip");
        window.location.reload();
      }
    };
    handleTripStatus();
  }, [tripStatus]);

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
    const fetchAll = async () => {
      const booking = await fetchBookingDetails();
      fetchActiveJobs(logout);
      setBookingData(booking);
      postDriverLocation();
    };
    fetchAll();
  }, [bookingData]);

  const postDriverLocation = async () => {
    const watchId = navigator.geolocation.watchPosition(
      async (position) => {
        // your existing position processing code here
        const { latitude, longitude } = position.coords;

        const reqBody = {
          bookingId: bookingId,
          id: localStorage.getItem("userId"),
          location: {
            lat: latitude,
            lng: longitude,
          },
        };

        try {
          const response = await fetch(
            `${import.meta.env.VITE_API_ENDPOINT}/ride-hail/driverLocation`,
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
            const error = await response.json().catch(() => ({}));
            console.error(
              "Failed to send location:",
              error || response.statusText
            );
          } else {
            const result = await response.json();
            console.log("Driver location sent successfully:", result);
          }
        } catch (err) {
          console.error("Error sending driver location:", err);
        }
      },
      (error) => {
        console.error("Geolocation error:", error.message);
      },
      {
        enableHighAccuracy: false,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

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
                      <div className="user-card-title-row">
                        <span className="rider-name">
                          {user?.riderData?.name || "Unnamed"}
                        </span>
                        <IonText className="rider-distance" slot="end">
                          {distanceToPickup
                            ?.find((d) => d.riderId === user.riderId)
                            ?.distance.toFixed(1)}{" "}
                          km from you ~
                        </IonText>
                      </div>
                    </IonCardTitle>
                  </IonCardHeader>

                  <IonCardContent className="user-card-content">
                    <div className="user-card-columns">
                      <div className="user-card-left">
                        <IonText color="dark">
                          <p className="user-text">
                            <strong>Pickup:</strong>{" "}
                            {user?.origin?.name
                              ?.split(",")
                              ?.slice(-3)
                              ?.map((part: string) => part.trim())
                              ?.join(", ") || "Unknown origin"}
                          </p>
                          <p className="user-text">
                            <strong>Dropoff:</strong>{" "}
                            {user?.destination?.name
                              ?.split(",")
                              ?.slice(-3)
                              ?.map((part: string) => part.trim())
                              ?.join(", ") || "Unknown destination"}
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
