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
  IonText,
  IonToolbar,
  IonTitle,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonList,
  IonToast,
  IonSelect,
  IonSelectOption,
  IonToggle,
  IonImg,
  RefresherCustomEvent,
} from "@ionic/react";
import {
  searchOutline,
  menuOutline,
  star,
} from "ionicons/icons";
import {
  fetchBookingDetails, postDriverLocation,
} from "../../services/apiService";
import Map from "../../components/Map";
import { connectSocket, socket } from "../../utils/useSocket";
import ConfirmActionSheet from "../../components/ConfirmActionSheet";
import "@theme/variables.css";
import "../../theme/Home.css";
import Loading from "../../components/Loading";
import { fetchDriverWallet } from "../../services/apiService";
import { fetchRiderDistances } from "../../utils/fetchRiderDistances";
import { useLocationContext } from "../../contexts/LocationContext";
import Refresher from "../../components/Refresher";

const Home: React.FC = () => {
  const {
    tripStatus, setTripStatus,
    bookingId, setBookingId,
    riderId, setRiderId,
    currentLocation, setCurrentLocation,
    setWalletBalance
  } = useLocationContext();

  const history = useHistory();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [riderDistances, setRiderDistances] = useState<{ riderId: string; distance: number }[] | null>(null);
  const prevUsersRef = useRef<any[]>([]);
  const prevRiderDistancesRef = useRef<{ riderId: string; distance: number }[] | null>(null);

  const [acceptBooking, setAcceptBooking] = useState(false);
  const [header, setHeader] = useState<any | null>(null);
  const [subHeader, setSubHeader] = useState<any | null>(null);
  const [showActionSheet, setShowActionSheet] = useState(false);
  const [users, setUsers] = useState<any | null>(null);
  const userId = localStorage.getItem("userId");
  const driverData = JSON.parse(localStorage.getItem("driverData") || "{}");

  const [distanceLimit, setDistanceLimit] = useState<number>(() => {
    const stored = localStorage.getItem("distanceLimit");
    return stored ? Number(stored) : 10;
  });

  const active = useRef<HTMLIonToggleElement>(null);
  const [isChecked, setIsChecked] = useState<boolean>(false);

  const coords: [number, number] | null = currentLocation
    ? [currentLocation.lat, currentLocation.lng]
    : null;

  useEffect(() => {
    const watchId = navigator.geolocation.watchPosition(
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

    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  useEffect(() => {
    checkWallet();
  }, []);

  useEffect(() => {
    if (userId) {
      connectSocket(userId);
    }
    socket?.off("all_users");
    socket?.on("all_users", (data: any) => {
      // console.log("All user data received:", data);

      if (Array.isArray(data.users)) {
        const user = data.users.map((user: any, index: number) => {
          const baseFare = user?.computations?.baseFare || "Unnamed Rider";
          const seatType = getSeatType(baseFare);
          console
            .log
            // `User ${index + 1} origin: ${baseFare} and seat type: ${seatType}`
            ();
          return baseFare;
        });
        setUsers(data.users);
      } else {
        console.warn("Expected 'users' to be an array.");
        setUsers([]);
      }
    });
  }, []);

  const handleSocketEvents = () => {
    if (userId) {
      connectSocket(userId);
    }

    socket?.off("all_users");

    socket?.on("all_users", (data: any) => {
      if (Array.isArray(data.users)) {
        // Optional: Debug info
        data.users.forEach((user: any, index: number) => {
          const baseFare = user?.computations?.baseFare || "Unnamed Rider";
          const seatType = getSeatType(baseFare);
          // console.log(`User ${index + 1} origin: ${baseFare} and seat type: ${seatType}`);
        });

        setUsers(data.users);
      } else {
        console.warn("Expected 'users' to be an array.");
        setUsers([]);
      }
    });
  };

  useEffect(() => {
    if (!socket || !userId) return;
    handleSocketEvents();
    return () => {
      socket?.off("all_users");
    };
  }, [userId, socket, setUsers]);

  const handleRefresh = (event: RefresherCustomEvent) => {
    window.location.reload();
    event.detail.complete();
  };

  const getSeatType = (baseFare: number) => {
    if (baseFare === 45) {
      return "4 Seater";
    } else if (baseFare === 55) {
      return "6 Seater";
    } else {
      return "Taxi";
    }
  };

  const getAllowedSeatTypes = (driverSeatType: string): string[] => {
    switch (driverSeatType) {
      case "6 Seater":
        return ["6 Seater", "4 Seater"]; // 6-seater can accept both
      case "4 Seater":
        return ["4 Seater"];
      case "Taxi":
        return ["Taxi"];
      default:
        return [];
    }
  };

  const filterByCarType = (
    users: any[],
    allowedTypes: string[] = ["4 Seater", "6 Seater", "Taxi"]
  ) => {
    return users.filter((user) => {
      const baseFare = user?.computations?.baseFare;
      const seatType = getSeatType(baseFare);
      return allowedTypes.includes(seatType);
    });
  };

  const handleRiderUpdates = ({
    users,
    currentLocation,
    driverData,
    distanceLimit,
    riderDistances,
    prevUsersRef,
    prevRiderDistancesRef,
    fetchRiderDistances,
    setRiderDistances,
  }: {
    users: any[];
    currentLocation: [number, number] | null;
    driverData: any;
    distanceLimit: number | string;
    riderDistances: any[];
    prevUsersRef: React.RefObject<any[] | null>;
    prevRiderDistancesRef: React.RefObject<any[] | null>;
    fetchRiderDistances: Function;
    setRiderDistances: Function;
  }) => {
    if (!users || !Array.isArray(users) || !currentLocation) return;

    const prevUsers = prevUsersRef.current;
    const currentUserIds = users.map((u) => u?.riderId);
    const prevUserIds = (prevUsers || []).map((u) => u?.riderId);

    const hasNewUsers =
      currentUserIds.length > prevUserIds.length &&
      currentUserIds.some((id: string) => !prevUserIds.includes(id));

    const riderDistancesChanged =
      JSON.stringify(riderDistances ?? []) !==
      JSON.stringify(prevRiderDistancesRef.current ?? []);

    if (!hasNewUsers && !riderDistancesChanged) return;

    const driverSeatType = driverData?.carType
      ?.replace("-", " ")
      ?.replace(/\b\w/g, (char: string) => char.toUpperCase());

    if (!driverSeatType) return;

    const allowedSeatTypes = getAllowedSeatTypes(driverSeatType);
    const filteredUsersByCarType = filterByCarType(users, allowedSeatTypes);

    const ridersPickupCoordinates = filteredUsersByCarType
      .map((rider: { riderId: string; origin: { coordinates: any } }) => ({
        riderId: rider?.riderId,
        coordinates: rider?.origin?.coordinates,
      }))
      .filter(
        (r): r is { riderId: string; coordinates: [number, number] } =>
          !!r.riderId &&
          Array.isArray(r.coordinates) &&
          r.coordinates.length === 2
      );

    if (ridersPickupCoordinates.length === 0) return;

    const timeout = setTimeout(() => {
      console.log("New users or distances detected. Fetching distances...");
      fetchRiderDistances({
        currentLocation,
        ridersPickupCoordinates,
        distanceLimit: Number(distanceLimit),
        callback: setRiderDistances,
      });
    }, 500);

    prevUsersRef.current = users;
    prevRiderDistancesRef.current = riderDistances;

    return timeout;
  };

  useEffect(() => {
    handleRiderUpdates({
      users,
      currentLocation: coords,
      driverData,
      distanceLimit,
      riderDistances: riderDistances || [],
      prevUsersRef,
      prevRiderDistancesRef,
      fetchRiderDistances,
      setRiderDistances,
    });
  }, [
    users,
    coords,
    driverData,
    distanceLimit,
    riderDistances,
    prevUsersRef,
    prevRiderDistancesRef,
    fetchRiderDistances,
    setRiderDistances,
  ]);

  const checkWallet = async (): Promise<boolean> => {
    try {
      const walletData = await fetchDriverWallet();

      if (!walletData || typeof walletData.walletBalance !== 'number') {
        setError("Unable to retrieve wallet balance.");
        setIsChecked(false);
        return false;
      }

      if (walletData.walletBalance < 100) {
        setError("Please top up at least ₱100 to continue accepting jobs!");
        setIsChecked(false);
        return false;
      }

      setWalletBalance(walletData.walletBalance);
      setIsChecked(true); // Assuming you want to mark it as checked when valid
      return true;

    } catch (error) {
      console.error("Error checking wallet:", error);
      setError("Something went wrong while checking your wallet.");
      setIsChecked(false);
      return false;
    }
  };

  const onlineJobs = async () => {
    try {
      setLoading(true);
      const isWalletOk = await checkWallet();
      if (!isWalletOk) return;

      if (!currentLocation || currentLocation.lat == null || currentLocation.lng == null) {
        console.error("Current location is missing or invalid.");
        return;
      }

      await postDriverLocation(bookingId);

      setIsChecked(true);
      localStorage.setItem("isWorking", "true");
    } catch (error) {
      console.error("Error sending driver location:", error);
    } finally {
      setLoading(false);
    }
  };

  const offlineJobs = async () => {
    setIsChecked(false);
    postDriverLocation(bookingId);
    localStorage.setItem("isWorking", "false");
  };

  useEffect(() => {
    const storedWorkingStatus = localStorage.getItem("isWorking");
    if (storedWorkingStatus === "true") {
      setIsChecked(true);
    } else if (storedWorkingStatus === "false") {
      setIsChecked(false);
    }
  }, []);

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
      if ((tripStatus ?? 0) > 0 && (tripStatus ?? 0) < 4) {
        history.push("/driver-trip");
      }
    };
    handleTripStatus();
  }, [tripStatus]);

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
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        console.error("Booking failed:", errorData || response.statusText);
        return;
      }

      const result = await response.json();
      console.log("Booking successful:", result);
      window.location.reload();
      const selectedBooking = users.find(
        (user: any) => user._id === bookingId && user.riderId === riderId
      );

      if (selectedBooking) {
        localStorage.setItem(
          "acceptedBooking",
          JSON.stringify(selectedBooking)
        );
        localStorage.setItem("riderId", riderId);
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

      <IonContent fullscreen scrollY={false}>
        <Map isHomeScreen={true} />
      </IonContent>
      <IonToolbar>
        {isChecked ? (
          <IonTitle color="primary" slot="start">
            Online
          </IonTitle>
        ) : (
          <IonTitle color="medium" slot="start">
            Oflline
          </IonTitle>
        )}
        <IonSelect
          interface="action-sheet"
          slot="start"
          value={String(distanceLimit)}
          placeholder="Set Distance"
          onIonChange={(e) => {
            const selectedValue = Number(e.detail.value);
            setDistanceLimit(selectedValue);
            localStorage.setItem("distanceLimit", String(selectedValue));
          }}
        >
          <IonSelectOption value="5">5km</IonSelectOption>
          <IonSelectOption value="10">10km</IonSelectOption>
          <IonSelectOption value="20">20km</IonSelectOption>
          <IonSelectOption value="30">30km</IonSelectOption>
        </IonSelect>

        <IonButtons slot="end">
          <IonToggle
            ref={active}
            justify="space-between"
            checked={isChecked}
            onIonChange={async (event) => {
              const checked = event.detail.checked;
              if (checked) {
                await onlineJobs();
              } else {
                await offlineJobs();
              }
            }}
          />
        </IonButtons>
      </IonToolbar>

      {!isChecked ? (
        <IonContent scrollY={false}>
          <div
            className="ion-no-border ion-text-center ion-padding"
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100vw",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <IonImg
              src="/assets/offline-mode.png" // Replace with your actual image path
              alt="Offline mode"

            />
          </div>
        </IonContent>
      ) : (
        <IonContent scrollY={true} style={{ height: '80vh', backgroundColor: '#fff' }}>
          {/* <Refresher onRefresh={handleRefresh} /> */}
          {users && users.length > 0 ? (
            (() => {
              const filteredUsers = users.filter((user: any) =>
                riderDistances?.some((d) => d.riderId === user.riderId)
              );

              return filteredUsers.length > 0 ? (
                <IonList className="ion-padding">
                  {filteredUsers.map((user: any, index: number) => (
                    <IonCard key={user._id || index} className="user-card">
                      <IonCardHeader
                        className="user-card-header"
                        color="primary">
                        <IonCardTitle className="user-card-title">
                          <div className="user-card-title-row">
                            <span className="rider-name">
                              {user?.riderData?.name || "Unnamed"}
                            </span>
                            <IonText className="rider-distance" slot="end">
                              {riderDistances
                                ?.find((d) => d.riderId === user.riderId)
                                ?.distance.toFixed(1)}{" "}
                              km from you
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
                              {user?.notes && (
                                <p className="user-text">
                                  <strong>Notes:</strong>{" "}
                                  {user.notes.length > 20
                                    ? `${user.notes.slice(0, 20)}...`
                                    : user.notes}
                                </p>
                              )}
                            </IonText>
                          </div>

                          <div className="user-card-right">
                            <IonText color="primary" className="user-text-bold">
                              <p>
                                <strong>
                                  {user?.computations?.fareDistanceInKM?.toFixed(
                                    2
                                  ) || "0"}{" "}
                                  km
                                </strong>
                              </p>
                              <p className="user-text-bold">
                                <strong>
                                  ₱{user?.travelFare?.toFixed(2)}-₱{(user?.travelFare ? (user.travelFare + 97).toFixed(2) : "0.00")}
                                </strong>
                              </p>
                            </IonText>
                            <IonText color="medium">
                              <p className="user-text-small">
                                <strong>{user?.userRating?.toFixed(1) ?? 5}</strong>{" "}
                                <IonIcon icon={star} color="tertiary" />
                              </p>
                            </IonText>
                            <IonText color="medium">
                              <p className="user-text-small">
                                <strong>
                                  {getSeatType(user?.computations.baseFare)}
                                </strong>
                              </p>
                            </IonText>
                          </div>
                        </div>
                      </IonCardContent>
                      <IonButton
                        color="light"
                        expand="full"
                        shape="round"
                        onClick={() =>
                          handleAcceptBooking(user._id, user.riderId)
                        }
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
                    <p>Bookings may be available within a {Number(distanceLimit)} km radius. Please refresh to check for updates.</p>
                  </IonText>
                  <IonIcon
                    color="medium"
                    icon={searchOutline}
                    style={{ marginTop: "20px", fontSize: "100px" }}
                  />
                </div>
              );
            })()
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
      )}
      <Loading isOpen={loading} message="Processing..." />
      <IonToast
        isOpen={!!error}
        message={error}
        duration={3000}
        color="danger"
        position="top"
        onDidDismiss={() => setError("")}
      />
      <ConfirmActionSheet
        isOpen={showActionSheet}
        onDismiss={() => setShowActionSheet(false)}
        header={header}
        subHeader={subHeader}
        onConfirm={async () => {
          setShowActionSheet(false);

          if (acceptBooking) {
            setAcceptBooking(false);
            bookAccepted();
            fetchBookingDetails();
            postDriverLocation(bookingId);
            history.push("/driver-trip");
          }
        }}
      />
    </IonPage >
  );
};

export default Home;
