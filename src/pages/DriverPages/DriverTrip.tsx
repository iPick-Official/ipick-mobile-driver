import {
  IonButton,
  IonCard,
  IonContent,
  IonFooter,
  IonIcon,
  IonImg,
  IonItem,
  IonLabel,
  IonList,
  IonPage,
  IonSkeletonText,
  IonText,
} from "@ionic/react";
import {
  fetchActiveJobs,
  fetchBookingDetails,
  fetchRiderDetails,
} from "../../services/apiService";
import React, { useState, useEffect, useRef } from "react";
import Map from "../../components/Map";
import { useHistory } from "react-router";
import ConfirmActionSheet from "../../components/ConfirmActionSheet";
import Loading from "../../components/Loading";
import { connectSocket, socket } from "../../utils/useSocket";
import { chatbubblesSharp, mapOutline, star } from "ionicons/icons";
import { useLocationContext } from "../../contexts/LocationContext";
import { Message } from "../../types/messageTypes";
import CustomAlert from "../../components/CustomAlert";
import { useAuth } from "../../contexts/AuthContext";

const DriverTrip: React.FC = () => {
  const history = useHistory();
  const { logout } = useAuth();
  const [loading, setLoading] = useState(false);
  const [confirmAction, setConfirmAction] = useState<() => Promise<void>>(
    () => async () => { }
  );
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
    setRiderMobile,
    tripStatus, setTripStatus,
    setPickupCoords, setDropoffCoords
  } = useLocationContext();

  useEffect(() => {
    socket?.emit("iAmDriver", driverId);

    const handleNewMessages = (newMessages: Message[]) => {
      const hasRelevantMessages = newMessages.some(
        (msg) => msg.bookingId === bookingId
      );

      if (hasRelevantMessages) {
        console.log(`[Alert] New message received for bookingId: ${bookingId}`);
        setSocketAlerts(true);
        setStatusHead("New Message Received");
        setStatusMsg("You have a new message in the conversation thread.");
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
    const getJobs = async () => {
      try {
        const data = await fetchActiveJobs(logout);
        console.log("Active jobs response:", data);
        setBookingData(data);
        setBookingId(data?._id);
        setRiderName(data?.riderData.name);
        setBookingRatings(data?.userRating);
        setRiderMobile(data?.riderData.mobnum);
        setDriverId(data?.driverId);
        setRiderId(data?.riderId);
        setTripStatus(data?.tripStatus);
        setPickupCoords({
          lat: data?.origin.coordinates[0],
          lng: data?.origin.coordinates[1],
        });

        setDropoffCoords({
          lat: data?.destination.coordinates[0],
          lng: data?.destination.coordinates[1],
        });
      } catch (error) {
        console.error("Error fetching active jobs:", error);
      }
    };
    getJobs();
  }, []);

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
      }
    };
    fetchAll();
  }, [bookingData, bookingDetails]);

  useEffect(() => {
    if (tripStatus === 0 || tripStatus === 4) {
      history.goBack();
    }
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
    console.log("updateRideStatus called with:", {
      status,
      shouldReset,
      bookingId: bookingData?._id,
    });

    setLoading(true);
    try {
      const endpoint = `${import.meta.env.VITE_API_ENDPOINT}/ride-hail/rideUpdate`;
      const token = localStorage.getItem("accessToken");

      console.log("Sending request to:", endpoint);
      console.log("Request headers and body:", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: {
          _id: bookingData?._id,
          status,
          action: "driver",
        },
      });

      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          _id: bookingData?._id,
          status,
          action: "driver",
        }),
      });

      console.log("Response status:", res.status);

      const data = await res.json();
      console.log("Response JSON:", data);

      setTripStatus(status);
      console.log("Trip status updated to:", status);

      if (onSuccess) {
        console.log("Executing onSuccess callback...");
        onSuccess(data);
      }

      if (shouldReset) {
        console.log("Resetting localStorage and reloading...");
        localStorage.removeItem("destination");
        localStorage.removeItem("hasSetDestination");
        history.goBack();
      }
    } catch (err) {
      console.error("Ride update failed:", err);
    } finally {
      setLoading(false);
      console.log("Loading state set to false");
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
        <Map isHomeScreen={false} />
      </IonContent>
      <IonFooter className="rounded-toolbar">
        <div className="footer-container">
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
            {(tripStatus ?? 0) < 3 && (
              <IonButton color="danger" fill="clear" onClick={promptCancelRide} disabled={!bookingData}>
                Cancel
              </IonButton>
            )}
          </div>

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
