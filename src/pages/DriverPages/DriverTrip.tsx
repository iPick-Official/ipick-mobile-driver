import {
  IonButton,
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
  fetchWallet,
  postTransaction,
  updateWallet,
} from "../../services/apiService";
import React, { useState, useEffect, useRef } from "react";

import { useHistory } from "react-router";
import { socket } from "../../utils/useSocket";
import { chatbubblesSharp, mapOutline, star } from "ionicons/icons";
import { useLocationContext } from "../../contexts/LocationContext";
import { Message } from "../../types/messageTypes";
import { useAuth } from "../../contexts/AuthContext";

import RatingsModal from "../../components/RatingsModal";
import CustomAlert from "../../components/CustomAlert";
import ConfirmActionSheet from "../../components/ConfirmActionSheet";
import Loading from "../../components/Loading";
import Map from "../../components/Map";

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
  const [isRatingsOpen, setIsRatingsOpen] = useState(false);

  const [showActionSheet, setShowActionSheet] = useState(false);
  const [header, setHeader] = useState<any | null>(null);
  const [subHeader, setSubHeader] = useState<any | null>(null);
  const [bookingData, setBookingData] = useState<any | null>(null);
  const [bookingRatings, setBookingRatings] = useState<any | null>(null);
  const [paymentType, setPaymentType] = useState<any | null>(null);
  const [isCooldown, setIsCooldown] = useState<boolean>(false);

  const {
    driverId,
    bookingId, setBookingId,
    bookingRef, setBookingRef,
    setRiderId, setDriverId,
    riderName, setRiderName,
    setRiderMobile,
    tripStatus, setTripStatus,
    setPickupCoords, setDropoffCoords,
    notes, setNotes,
    systemShare, setSystemShare,
    walletBalance,
    riderBalance, setRiderBalance,
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
      setNotes(data?.notes);
      setPaymentType(data?.paymentMethod)
      setSystemShare(data?.systemShare);
      setBookingRef(data?.referenceNumber);
      const riderWallet = await fetchWallet(data?.riderData._id, "rider");
      setRiderBalance(riderWallet.walletBalance);
    } catch (error) {
      console.error("Error fetching active jobs:", error);
    }
  };

  useEffect(() => {
    getJobs();
  }, []);

  useEffect(() => {
    if (tripStatus === 4) {
      setIsRatingsOpen(true);
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

    const userId = localStorage.getItem("id");
    const fare = Number(bookingData?.travelFare || 0);
    const systemShareValue = Math.abs(Number(systemShare)) || 0;
    const incentive = systemShareValue * 0.4;

    if (!fare || !bookingId || systemShare == null || walletBalance == null || riderBalance == null) {
      console.error("Missing required data to end trip.", { fare, bookingId, systemShare, walletBalance, riderBalance });
      return;
    }

    showPrompt("End Trip?", `Please collect payment of ₱${fare.toFixed(2)}`, async () => {
      try {
        await endTrip();

        let newWallet = walletBalance;
        let newRiderWallet = riderBalance
        if (paymentType === "Cash") {
          newWallet -= systemShareValue;
          await postTransaction(-systemShareValue, bookingId, userId!, "driver", `Deduction of ₱${systemShareValue.toFixed(2)} system earnings (Ref: ${bookingRef}).`);
        } else {
          newWallet += fare - systemShareValue;
          newRiderWallet = riderBalance - fare;
          await postTransaction(fare, bookingId, userId!, "driver", `₱${fare.toFixed(2)} earnings credited (Ref: ${bookingRef}).`);
          await postTransaction(-systemShareValue, bookingId, userId!, "driver", `Deduction of ₱${systemShareValue.toFixed(2)} system earnings (Ref: ${bookingRef}).`);
          await postTransaction(-fare, bookingId, bookingData?.riderData._id, "rider", `₱${fare.toFixed(2)} payments to driver (Ref: ${bookingRef}).`);
          await updateWallet(newRiderWallet, "rider", bookingData?.riderData._id);
        }

        // Incentive
        newWallet += incentive;
        await postTransaction(incentive, bookingId, userId!, "driver", `An incentive of ₱${incentive.toFixed(2)} has been credited (Ref: ${bookingRef}).`);
        await updateWallet(newWallet, "driver", userId!);
        setIsRatingsOpen(true);
      } catch (error) {
        console.error("Failed to complete end trip process:", error);
      }
    });
  };

  const updateRideStatus = async (
    status: number,
    shouldReset = false,
    onSuccess?: (data?: any) => void
  ) => {
    const bookingId = bookingData?._id;

    if (!bookingId) {
      console.error("No booking ID provided.");
      return;
    }

    console.log("Updating ride status:", { status, shouldReset, bookingId });

    setLoading(true);

    try {
      const endpoint = `${import.meta.env.VITE_API_ENDPOINT}/ride-hail/rideUpdate`;
      const token = localStorage.getItem("accessToken");

      if (!token) {
        throw new Error("Access token is missing");
      }

      const body = JSON.stringify({
        _id: bookingId,
        status,
        action: "driver",
      });

      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body,
      });

      const data = await res.json();

      if (!res.ok) {
        console.error("API error:", data?.message || res.statusText);
        throw new Error(data?.message || "Failed to update ride status");
      }

      setTripStatus(status);
      console.log("Ride status updated to:", status);
      onSuccess?.(data);
      if (shouldReset) {
        history.replace("/");
      }
    } catch (error) {
      console.error("Error updating ride status:", error);
    } finally {
      setLoading(false);
    }
  };

  const confirmCancelRide = () => updateRideStatus(0, true);
  const arrivedAtPickup = () => updateRideStatus(2);
  const confirmPassenger = () => updateRideStatus(3, false);
  const endTrip = () => updateRideStatus(4);

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
                <IonText><p className="driver-name">{bookingData?.riderData.name}</p></IonText>
                <IonText color="medium" className="driver-rating">
                  {bookingRatings?.toFixed(1) ?? 5} <IonIcon color="tertiary" icon={star} />
                </IonText>
              </div>
            </div>

            {/* Cancel button */}
            {(tripStatus ?? 0) < 3 && (
              <IonButton color="medium" size="small" fill="outline" shape="round" onClick={promptCancelRide} disabled={!bookingData}>
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
            {notes &&
              <IonItem lines="none">
                <IonLabel color="dark">
                  <strong>Notes</strong>
                  <p>{bookingData?.notes}</p>
                </IonLabel>
              </IonItem>}
          </IonList>

          {/* Fare & Payment */}
          <IonList>
            <IonItem
              button
              lines="none"
              onClick={() => {
                if (!isCooldown) {
                  getJobs();
                  setIsCooldown(true);
                  setTimeout(() => {
                    setIsCooldown(false);
                  }, 10000);
                }
              }}
              detail={false}
            >
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
                <IonButton expand="block" shape="round" disabled={!bookingData} onClick={promptArrived}>
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
      />
      <CustomAlert
        isOpen={socketAlerts}
        onClose={() => { setSocketAlerts(false) }}
        header={statusHead}
        message={statusMsg}
      />
      <RatingsModal
        isOpen={isRatingsOpen}
        onClose={() => setIsRatingsOpen(false)}
        bookingId={bookingId}
        target="rider"
        name={riderName}
        totalFare={bookingData?.travelFare ? bookingData.travelFare : 0}
        redirectOnClose
      />
    </IonPage>
  );
};

export default DriverTrip;
