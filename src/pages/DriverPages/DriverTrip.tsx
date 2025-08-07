import {
  IonAccordion,
  IonAccordionGroup,
  IonButton,
  IonCard,
  IonCol,
  IonContent,
  IonFooter,
  IonGrid,
  IonHeader,
  IonIcon,
  IonImg,
  IonItem,
  IonLabel,
  IonList,
  IonModal,
  IonPage,
  IonRow,
  IonSkeletonText,
  IonText,
  IonToolbar,
} from "@ionic/react";
import {
  fetchBookingDetails,
  fetchRiderDetails,
  postDriverLocation,
} from "../../services/apiService";
import React, { useState, useEffect, useRef } from "react";
import Map from "../../components/Map";
import { useHistory } from "react-router";
import ConfirmActionSheet from "../../components/ConfirmActionSheet";
import Loading from "../../components/Loading";
import { connectSocket, socket } from "../../utils/useSocket";
import { call, chatbubblesSharp, mapOutline, star } from "ionicons/icons";
import { useLocationContext } from "../../contexts/LocationContext";
import { Message } from "../../types/messageTypes";
import CustomAlert from "../../components/CustomAlert";

const DriverTrip: React.FC = () => {
  const history = useHistory();
  const [loading, setLoading] = useState(false);
  const [confirmAction, setConfirmAction] = useState<() => Promise<void>>(
    () => async () => { }
  );

  const [messages, setMessages] = useState<Message[]>([]);
  const [socketAlerts, setSocketAlerts] = useState(false);
  const [statusHead, setStatusHead] = useState<string>("");
  const [statusMsg, setStatusMsg] = useState<string>("");

  const [showActionSheet, setShowActionSheet] = useState(false);
  const modalRef = useRef<HTMLIonModalElement>(null);
  const hasSetDestination = useRef(false);
  const [header, setHeader] = useState<any | null>(null);
  const [subHeader, setSubHeader] = useState<any | null>(null);
  const [currentLocation, setCurrentLocation] =
    useState<google.maps.LatLngLiteral | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [bookingData, setBookingData] = useState<any | null>(null);
  const [bookingRatings, setBookingRatings] = useState<any | null>(null);
  const [tripStatus, setTripStatus] = useState<any | null>(null);
  const [bookingDetails, setBookingDetails] = useState<any | null>(null);
  const [paymentType, setPaymentType] = useState<any | null>(null);
  const [destination, setDestination] =
    useState<google.maps.LatLngLiteral | null>(null);
  const hasFetchedBooking = useRef(false);

  const {
    driverId,
    bookingId, setBookingId,
    setRiderId, setDriverId,
    riderName, setRiderName,
    setRiderMobile
  } = useLocationContext();

  const saveMessagesToStorage = (msgs: Message[]) => {
    localStorage.setItem(`chat_${bookingId}`, JSON.stringify(msgs));
  };

  useEffect(() => {
    socket?.emit("iAmDriver", driverId);

    const handleNewMessages = (newMessages: Message[]) => {
      const relevantMessages = newMessages.filter((msg) => msg.bookingId === bookingId);

      if (relevantMessages.length > 0) {
        console.log(`[Messages Match] ${relevantMessages.length} messages for bookingId ${bookingId}`);

        setMessages((prev) => {
          const existingTimestamps = new Set(prev.map((m) => m.createdAt));

          const filteredNew = relevantMessages.filter(
            (m) => m.createdAt && !existingTimestamps.has(m.createdAt)
          );

          if (filteredNew.length === 0) {
            console.log("[No New Messages] All messages are duplicates.");
            return prev;
          }

          const updated = [...prev, ...filteredNew];
          saveMessagesToStorage(updated);

          // ✅ Only alert the user if new messages were added
          setSocketAlerts(true);
          setStatusHead("New Message Received");
          setStatusMsg("You have a new message in the conversation thread.");

          return updated;
        });
      } else {
        console.log("[Messages Ignored] No messages matched bookingId:", bookingId);
      }
    };

    socket?.on("user_messages", handleNewMessages);

    return () => {
      socket?.off("user_messages", handleNewMessages);
    };
  }, [bookingId, driverId]);

  useEffect(() => {
    const item = localStorage.getItem("acceptedBooking");
    if (item) {
      try {
        const data = JSON.parse(item);
        if (data?._id) {
          setBookingId(data?._id);
          setRiderName(data?.riderData.name);
          setBookingRatings(data?.userRating);
          setRiderMobile(data?.riderData.mobnum);
        }
      } catch (error) {
        console.error(
          "Error parsing acceptedBooking from localStorage:",
          error
        );
      }
    }
  }, []);

  useEffect(() => {
    const intervalId = setInterval(() => {
      postDriverLocation(bookingId);
    }, 30000);
    postDriverLocation(bookingId);
    return () => clearInterval(intervalId);
  }, [bookingId]);

  useEffect(() => {
    const fetchAll = async () => {
      if (!hasFetchedBooking.current) {
        const booking = await fetchBookingDetails();
        setBookingDetails(booking);
        hasFetchedBooking.current = true;

        if (booking && booking.length > 0) {
          const payment = booking[0].paymentType.paymentType;
          setPaymentType(payment);
        }
        const riderId = bookingData?.riderId;

        if (riderId) {
          const riderDetails = await fetchRiderDetails(riderId);
          console.log("Rider Details:", riderDetails);
          setRiderName(riderDetails?.name);
          setRiderMobile(riderDetails?.mobnum);
          const item = localStorage.getItem("acceptedBooking");
          if (item) {
            const bookingObj = JSON.parse(item);
            bookingObj.name = riderDetails?.name;
            bookingObj.mobile = riderDetails?.mobnum;
            localStorage.setItem("acceptedBooking", JSON.stringify(bookingObj));
          }
        }
      }
    };

    fetchAll();
  }, [bookingData, bookingDetails]);

  useEffect(() => {
    if (driverId) {
      connectSocket(driverId);
    }

    socket?.off("booking_data");
    socket?.on("booking_data", (data: any) => {
      console.log("Received booking data:", data);
      setBookingData(data);
      setBookingId(data?._id);
      setRiderId(data?.riderId);
      setDriverId(data?.driverId);

      const hasSetDestinationLS = localStorage.getItem("hasSetDestination");
      if (!hasSetDestinationLS) {
        const coords = data?.origin?.coordinates || null;
        localStorage.setItem("destination", JSON.stringify(coords));
        localStorage.setItem("hasSetDestination", "true");
      }

      setTripStatus(data?.tripStatus);
    });
  }, []);

  useEffect(() => {
    modalRef.current?.present();
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          setLocationError("Unable to retrieve your location.");
          console.error(error);
        }
      );
    } else {
      setLocationError("Geolocation is not supported by this browser.");
    }
  }, []);

  const showPrompt = (
    header: string,
    subHeader: string,
    action: () => Promise<void>
  ) => {
    setHeader(header);
    setSubHeader(subHeader);
    setConfirmAction(() => action);
    setShowActionSheet(true);
  };

  const promptCancelRide = () =>
    showPrompt(
      "Cancel Ride?",
      "Are you sure you want to cancel this ride?",
      confirmCancelRide
    );

  const promptArrived = () =>
    showPrompt(
      "You've Arrived?",
      "Are you sure you've arrived at the pickup location?",
      arrivedAtPickup
    );

  const promptConfirmPassenger = () =>
    showPrompt(
      "Confirm Passenger",
      "Please confirm: Has the passenger boarded your car?",
      confirmPassenger
    );

  const promptEndTrip = () => {
    const fare = bookingData.travelFare.toFixed(2);
    showPrompt("End Trip?", `Please collect payment of ₱${fare}`, endTrip);
  };

  const updateRideStatus = async (
    status: number,
    shouldReset = false,
    onSuccess?: (data?: any) => void
  ) => {
    setLoading(true);
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_ENDPOINT}/ride-hail/rideUpdate`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            _id: bookingData?._id,
            status,
            action: "driver",
          }),
        }
      );

      const data = await res.json(); // get the response data
      setTripStatus(status);

      if (onSuccess) onSuccess(data); // run callback

      if (shouldReset) {
        localStorage.removeItem("destination");
        localStorage.removeItem("hasSetDestination");
        history.replace("/");
        window.location.reload();
      }
    } catch (err) {
      console.error("Ride update failed:", err);
    } finally {
      setLoading(false);
    }
  };

  const confirmCancelRide = () => updateRideStatus(0, true);
  const arrivedAtPickup = () => updateRideStatus(2);
  const confirmPassenger = () =>
    updateRideStatus(3, false, (data) => {
      setDestination(data?.destination?.coordinates || null);
      localStorage.setItem(
        "destination",
        JSON.stringify(data?.destination?.coordinates)
      );
    });
  const endTrip = () => updateRideStatus(4, true);

  const navigateToLocation = (coordinates: [number, number]) => {
    if (!coordinates) {
      console.warn("Missing coordinates");
      return;
    }

    const [destLat, destLng] = coordinates;
    const url = `https://www.google.com/maps/dir/?api=1&destination=${destLat},${destLng}&travelmode=driving`;
    window.open(url, "_blank");
  };

  const LoadingText: React.FC<{ children?: React.ReactNode }> = ({
    children,
  }) =>
    children ? (
      <IonText color="medium">
        <p className="loading-text">{children}</p>
      </IonText>
    ) : (
      <IonSkeletonText animated style={{ width: "80%", height: "1.2em" }} />
    );

  return (
    <IonPage>
      <IonContent fullscreen scrollY={false}>
        <Map />
      </IonContent>
      <IonFooter className="rounded-toolbar">
        <div className="footer-container">
          <IonCard className="footer-card ion-padding">
            <div className="driver-info">
              {/* Left: Driver info */}
              <div className="driver-details">
                <IonImg src="./favicon.png" className="driver-avatar" />
                <div>
                  <IonText><p className="driver-name">{riderName}</p></IonText>
                  <IonText color="medium" className="driver-rating">
                    {bookingRatings ?? 5} <IonIcon color="tertiary" icon={star} />
                  </IonText>
                </div>
              </div>

              {/* Cancel button */}
              {tripStatus < 3 && (
                <IonButton color="danger" fill="clear" onClick={promptCancelRide} disabled={!bookingData}>
                  Cancel
                </IonButton>
              )}
            </div>
          </IonCard>

          {/* Pickup & Drop-off */}
          <IonList>
            <IonItem button lines="none" onClick={() => navigateToLocation(bookingData?.origin?.coordinates)}>
              <IonLabel color="primary">
                <strong>Pick-up</strong>
                <p>{bookingData?.origin?.name || <LoadingText />}</p>
              </IonLabel>
              <IonIcon slot="end" icon={mapOutline} size="small" color="dark" />
            </IonItem>

            <IonItem button lines="none" onClick={() => navigateToLocation(bookingData?.destination?.coordinates)}>
              <IonLabel color="primary">
                <strong>Drop-off</strong>
                <p>{bookingData?.destination?.name || <LoadingText />}</p>
              </IonLabel>
              <IonIcon slot="end" icon={mapOutline} size="small" color="dark" />
            </IonItem>
          </IonList>

          {/* Fare & Payment */}
          <IonList>
            <IonItem lines="none">
              <IonLabel color="primary"><strong>Fare</strong></IonLabel>
              <IonText slot="end">
                <LoadingText><strong>₱{bookingData?.travelFare?.toFixed(2)}</strong></LoadingText>
              </IonText>
            </IonItem>

            <IonItem lines="none">
              <IonLabel color="primary"><strong>Payment Method</strong></IonLabel>
              <IonText slot="end">
                <LoadingText><strong>{paymentType}</strong></LoadingText>
              </IonText>
            </IonItem>
          </IonList>

          {/* Action buttons */}
          <div className="footer-actions">
            <div className="action-button">
              {tripStatus === 1 && (
                <IonButton expand="block" shape="round" disabled={!bookingData || !bookingDetails} onClick={promptArrived}>
                  I've arrived
                </IonButton>
              )}
              {tripStatus === 2 && (
                <IonButton expand="block" shape="round" disabled={!bookingData} onClick={promptConfirmPassenger}>
                  Confirm Passenger
                </IonButton>
              )}
              {tripStatus === 3 && (
                <IonButton expand="block" shape="round" disabled={!bookingData} onClick={promptEndTrip}>
                  End Trip
                </IonButton>
              )}
            </div>
            <IonButton shape="round" color="primary" onClick={() => history.push("/messages")} disabled={!bookingData}>
              <IonIcon icon={chatbubblesSharp} />
            </IonButton>
          </div>
        </div>
      </IonFooter>

      <Loading isOpen={loading} message="Processing..." />

      <ConfirmActionSheet
        isOpen={showActionSheet}
        onDismiss={() => setShowActionSheet(false)}
        header={header}
        subHeader={subHeader}
        onConfirm={async () => {
          setShowActionSheet(false)
          if (confirmAction) {
            await confirmAction();
          }
        }}
        cssClass="my-custom-action-sheet"
      />
      <CustomAlert
        isOpen={socketAlerts}
        onClose={() => { setSocketAlerts(false) }}
        header={statusHead}
        message={statusMsg}
      />
    </IonPage>
  );
};

export default DriverTrip;
