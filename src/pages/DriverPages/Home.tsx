import React, { useEffect, useRef, useState, useMemo } from "react";
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
  IonToast,
  IonSelect,
  IonSelectOption,
  IonLabel,
} from "@ionic/react";
import {
  powerOutline,
  searchOutline,
  menuOutline,
  powerSharp,
  refreshOutline,
} from "ionicons/icons";
import {
  fetchBookingDetails,
  postDriverLocation,
} from "../../services/apiService";
import Map from "../../components/Map";
import { connectSocket, socket } from "../../utils/useSocket";
import ConfirmActionSheet from "../../components/ConfirmActionSheet";
import "@theme/variables.css";
import "../../theme/Home.css";
import Loading from "../../components/Loading";
import { watchLocation } from "../../utils/locationHelpers";
import { fetchDriverWallet } from "../../services/apiService";
import { fetchRiderDistances } from "../../utils/fetchRiderDistances";
import { useLocationContext } from "../../contexts/LocationContext";

const Home: React.FC = () => {
  const {
    tripStatus, setTripStatus,
    bookingId, setBookingId,
    riderId, setRiderId,
    currentLocation, setCurrentLocation,
  } = useLocationContext();

  const modalRef = useRef<HTMLIonModalElement>(null);
  const history = useHistory();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [riderDistances, setRiderDistances] = useState<
    { riderId: string; distance: number }[] | null
  >(null);
  const prevUsersRef = useRef<any[]>([]);
  const prevRiderDistancesRef = useRef<{ riderId: string; distance: number }[] | null>(null);

  const [isWorking, setIsWorking] = useState(false);
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
  const [disabled, setDisabled] = useState(false);
  const [countdown, setCountdown] = useState(0);

  const DISABLE_TIME = 30;
  const STORAGE_KEY = "refresh_disabled_until";

  const coords: [number, number] | null = currentLocation
    ? [currentLocation.lat, currentLocation.lng]
    : null;

  useEffect(() => {
    const disabledUntil = localStorage.getItem(STORAGE_KEY);
    if (disabledUntil) {
      const now = Date.now();
      const target = parseInt(disabledUntil, 10);
      const diff = Math.floor((target - now) / 1000);

      if (diff > 0) {
        setDisabled(true);
        setCountdown(diff);
      }
    }
  }, []);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown > 0) {
      timer = setTimeout(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    } else if (disabled) {
      setDisabled(false);
      localStorage.removeItem(STORAGE_KEY);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleRefresh = () => {
    const now = Date.now();
    const disabledUntil = now + DISABLE_TIME * 1000;
    localStorage.setItem(STORAGE_KEY, disabledUntil.toString());

    setDisabled(true);
    setCountdown(DISABLE_TIME);

    window.location.reload();
  };

  // Countdown logic
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown > 0) {
      timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
    } else if (disabled) {
      setDisabled(false);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

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
      console.log("🆕 New users or distances detected. Fetching distances...");
      fetchRiderDistances({
        currentLocation,
        ridersPickupCoordinates,
        distanceLimit: Number(distanceLimit),
        callback: setRiderDistances,
      });
    }, 500);

    prevUsersRef.current = users;
    prevRiderDistancesRef.current = riderDistances;

    return timeout; // return so we can cleanup
  };

  useEffect(() => {
    const timeout = handleRiderUpdates({
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

    return () => {
      if (timeout) clearTimeout(timeout);
    };
  }, [users, currentLocation, driverData, distanceLimit, riderDistances]);


  const checkWallet = async (): Promise<boolean> => {
    try {
      const walletData = await fetchDriverWallet();

      if (!walletData || walletData.walletBalance < 100) {
        setError("Please top up at least ₱100 to continue accepting jobs!");
        setIsWorking(false);
        await modalRef.current?.dismiss();
        return false;
      }

      return true;
    } catch (error) {
      console.error("❌ Error checking wallet:", error);
      alert("Something went wrong while checking your wallet.");
      return false;
    }
  };

  const openJobs = async () => {
    const isWalletOk = await checkWallet();
    if (!isWalletOk) return;
    await modalRef.current?.present();
    setIsModalOpen(true);
    postDriverLocation(bookingId);
    setIsWorking(true);
    localStorage.setItem("working", "true");
  };

  const closeJobs = async () => {
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
      if ((tripStatus ?? 0) > 0 && (tripStatus ?? 0) < 4) {
        await modalRef.current?.dismiss();
        history.push("/driver-trip");
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
        {!isModalOpen && (
          <IonHeader>
            <div className="absolute-bottom-bar">
              <IonButton
                color="medium"
                id="open-modal"
                shape="round"
                onClick={openJobs}
              >
                Go Online
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
            <IonTitle color="primary" slot="start">
              Online
            </IonTitle>
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
              <IonButton
                onClick={handleRefresh}
                color="primary"
                disabled={disabled}
              >
                {disabled ? (
                  <IonLabel>{countdown}s</IonLabel>
                ) : (
                  <IonIcon icon={refreshOutline} slot="icon-only" />
                )}
              </IonButton>

              <IonButton onClick={closeJobs} color="danger">
                <IonIcon icon={powerSharp} slot="icon-only" />
              </IonButton>
            </IonButtons>
          </IonToolbar>
        </IonHeader>
        <IonContent>
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
                        color="primary"
                      >
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
                            </IonText>
                          </div>

                          <div className="user-card-right">
                            <IonText color="primary" className="user-text-bold">
                              <p>
                                {user?.computations?.fareDistanceInKM?.toFixed(
                                  2
                                ) || "0"}{" "}
                                km
                              </p>
                              <p className="user-text-bold">
                                ₱ {user?.travelFare?.toFixed(2) || "0.00"}
                              </p>
                            </IonText>
                            <IonText color="medium">
                              <p className="user-text-small">
                                <strong>Rating:</strong>{" "}
                                {user?.userRating?.toFixed(1) ?? 5}
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
      </IonModal>
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
            await modalRef.current?.dismiss();
            setIsModalOpen(false);
            bookAccepted();
            fetchBookingDetails();
            postDriverLocation(bookingId);
            history.push("/driver-trip");
          } else {
            await modalRef.current?.dismiss();
            setIsModalOpen(false);
          }
        }}
      />
    </IonPage>
  );
};

export default Home;
