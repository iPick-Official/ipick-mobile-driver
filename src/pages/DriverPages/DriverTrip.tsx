import {
  IonButton,
  IonContent,
  IonHeader,
  IonItem,
  IonLabel,
  IonModal,
  IonPage,
  IonSkeletonText,
  IonText,
  IonToolbar,
} from "@ionic/react";
import React, { useState, useEffect, useRef } from "react";
import Map from "../../components/Map";
import { useHistory } from "react-router";
import ConfirmActionSheet from "../../components/ConfirmActionSheet";
import Loading from "../../components/Loading";
import { connectSocket, socket } from "../../utils/useSocket";

const DriverTrip: React.FC = () => {
  const history = useHistory();
  const [loading, setLoading] = useState(false);
  const [showActionSheet, setShowActionSheet] = useState(false);
  const modalRef = useRef<HTMLIonModalElement>(null);
  const [header, setHeader] = useState<any | null>(null);
  const [subHeader, setSubHeader] = useState<any | null>(null);
  const [currentLocation, setCurrentLocation] =
    useState<google.maps.LatLngLiteral | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [bookingData, setBookingData] = useState<any | null>(null);
  const userId = localStorage.getItem("userId");
  const [destination, setDestination] =
    useState<google.maps.LatLngLiteral | null>(null);

  useEffect(() => {
    if (userId) {
      connectSocket(userId);
    }

    socket?.off("booking_data");
    socket?.on("booking_data", (data: any) => {
      setBookingData(data);
      setDestination(data?.destination?.coordinates);
      localStorage.setItem(
        "destination",
        JSON.stringify(data?.destination?.coordinates)
      );
      console.log("Current Destination", data?.destination?.coordinates);
    });
  }, []);

  useEffect(() => {
    if (!navigator.geolocation) {
      console.error("Geolocation is not supported");
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      async (position) => {
        // your existing position processing code here
        const { latitude, longitude } = position.coords;

        const reqBody = {
          bookingId: bookingData?._id,
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

    return () => {
      navigator.geolocation.clearWatch(watchId);
    };
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

  const promptCancelRide = () => {
    setHeader("Cancel Ride?");
    setSubHeader("Are you sure you want to cancel this ride?");
    setShowActionSheet(true);
  };

  const confirmCancelRide = async () => {
    const reqBody = {
      _id: bookingData?._id,
      status: 0,
      action: "driver",
    };

    try {
      setLoading(true);

      const response = await fetch(
        `${import.meta.env.VITE_API_ENDPOINT}/ride-hail/rideUpdate`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(reqBody),
        }
      );
      localStorage.removeItem("destination");
      history.replace("/");
      window.location.reload();
    } catch (error) {
      console.error("Network or server error during booking:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <IonPage>
      <IonContent fullscreen>
        <Map />
      </IonContent>
      <IonModal
        ref={modalRef}
        trigger="open-modal"
        initialBreakpoint={0.75}
        breakpoints={[0.25, 0.5, 0.75]}
        backdropDismiss={false}
        backdropBreakpoint={0.25}
      >
        <IonHeader className="no-ion-border transparent-header" collapse="fade">
          <IonToolbar>
            <IonButton
              color="danger"
              slot="end"
              fill="clear"
              onClick={promptCancelRide}
            >
              Cancel
            </IonButton>
          </IonToolbar>
        </IonHeader>
        <IonContent>
          <IonItem>
            <IonLabel position="stacked" color="primary">
              Pick-up
            </IonLabel>
            {bookingData ? (
              <IonText color="medium">
                <p>{bookingData.origin?.name}</p>
              </IonText>
            ) : (
              <IonSkeletonText
                animated
                style={{ width: "80%", height: "1.2em" }}
              />
            )}
          </IonItem>

          <IonItem>
            <IonLabel position="stacked" color="primary">
              Drop-off
            </IonLabel>
            {bookingData ? (
              <IonText color="medium">
                <p>{bookingData.destination?.name}</p>
              </IonText>
            ) : (
              <IonSkeletonText
                animated
                style={{ width: "80%", height: "1.2em" }}
              />
            )}
          </IonItem>

          <IonItem>
            <IonLabel position="stacked" color="primary">
              Drop-off
            </IonLabel>
            {bookingData ? (
              <IonText color="medium">
                <p>{bookingData.destination?.name}</p>
              </IonText>
            ) : (
              <IonSkeletonText
                animated
                style={{ width: "80%", height: "1.2em" }}
              />
            )}
          </IonItem>

          <IonButton
            className="custom-button"
            color="primary"
            expand="full"
            shape="round"
            disabled={!bookingData} // disable while loading
          >
            Pick up the passenger
          </IonButton>
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
          await confirmCancelRide();
        }}
        cssClass="my-custom-action-sheet"
      />
    </IonPage>
  );
};

export default DriverTrip;
