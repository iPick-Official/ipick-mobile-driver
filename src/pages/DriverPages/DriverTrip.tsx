import {
  IonAccordion,
  IonAccordionGroup,
  IonButton,
  IonCol,
  IonContent,
  IonGrid,
  IonHeader,
  IonIcon,
  IonImg,
  IonItem,
  IonLabel,
  IonModal,
  IonPage,
  IonRow,
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
import {
  fetchBookingDetails,
  postDriverLocation,
} from "../../services/apiService";
import { call, mapOutline, star } from "ionicons/icons";

const DriverTrip: React.FC = () => {
  const history = useHistory();
  const [loading, setLoading] = useState(false);
  const [confirmAction, setConfirmAction] = useState<() => Promise<void>>(
    () => async () => {}
  );

  const [showActionSheet, setShowActionSheet] = useState(false);
  const modalRef = useRef<HTMLIonModalElement>(null);
  const hasSetDestination = useRef(false);
  const [header, setHeader] = useState<any | null>(null);
  const [subHeader, setSubHeader] = useState<any | null>(null);
  const [currentLocation, setCurrentLocation] =
    useState<google.maps.LatLngLiteral | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [bookingData, setBookingData] = useState<any | null>(null);
  const [bookingId, setBookingId] = useState<any | null>(null);
  const [bookingName, setBookingName] = useState<any | null>(null);
  const [bookingMobile, setBookingMobile] = useState<any | null>(null);
  const [bookingRatings, setBookingRatings] = useState<any | null>(null);
  const [tripStatus, setTripStatus] = useState<any | null>(null);
  const [bookingDetails, setBookingDetails] = useState<any | null>(null);
  const [paymentType, setPaymentType] = useState<any | null>(null);
  const userId = localStorage.getItem("userId");
  const [destination, setDestination] =
    useState<google.maps.LatLngLiteral | null>(null);
  const hasFetchedBooking = useRef(false);

  const getSurgeCharge = () => {
    if (!bookingData || !bookingData.computations) return "0.00";

    const {
      baseFare = 0,
      serviceFee = 0,
      fareDistanceInKM = 0,
      fareDurationInMins = 0,
      costPerKM = 0,
      costPerMin = 0,
    } = bookingData.computations;

    const totalFare = bookingData?.travelFare;

    const distanceFare = fareDistanceInKM * costPerKM;
    const timeFare = fareDurationInMins * costPerMin;

    const computedTotal = baseFare + serviceFee + distanceFare + timeFare;
    const surgeCharge = totalFare - computedTotal;

    return surgeCharge > 0 ? surgeCharge.toFixed(2) : "0.00";
  };

  useEffect(() => {}, []);

  useEffect(() => {
    const item = localStorage.getItem("acceptedBooking");
    if (item) {
      try {
        const data = JSON.parse(item);
        if (data?._id) {
          setBookingId(data?._id);
          setBookingName(data?.riderData.name);
          setBookingRatings(data?.userRating);
          setBookingMobile(data?.riderData.mobnum);
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
    const fetchAll = async () => {
      postDriverLocation(bookingId);

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
    if (userId) {
      connectSocket(userId);
    }

    socket?.off("booking_data");
    socket?.on("booking_data", (data: any) => {
      // console.log("Received booking data:", data);
      setBookingData(data);

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

  const navigateToLocation = (
    coordinates: [number, number],
    currentLocation: google.maps.LatLngLiteral | null
  ) => {
    if (!coordinates || !currentLocation) {
      console.warn("Missing coordinates or current location");
      return;
    }

    const [destLat, destLng] = coordinates;
    const { lat: originLat, lng: originLng } = currentLocation;

    const url = `https://www.google.com/maps/dir/?api=1&origin=${originLat},${originLng}&destination=${destLat},${destLng}&travelmode=driving`;
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
      <IonContent fullscreen>
        <Map />
      </IonContent>
      <IonModal
        ref={modalRef}
        trigger="open-modal"
        initialBreakpoint={0.75}
        breakpoints={[0.25, 0.5, 0.75, 1]}
        backdropDismiss={false}
        backdropBreakpoint={0.25}
      >
        <IonHeader
          className="no-ion-border"
          collapse="fade"
          style={{
            boxShadow: "none",
            "--box-shadow": "none",
            marginBottom: "10px",
          }}
        >
          <IonToolbar color="light">
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                width: "100%",
                padding: "0 12px",
              }}
            >
              {/* Left Side: Icon + Name + Rating */}
              <div
                style={{ display: "flex", alignItems: "center", gap: "12px" }}
              >
                <IonImg
                  src="./assets/icons/png/driver.svg"
                  style={{ width: 40, height: 40 }}
                />

                <div>
                  <IonText>
                    <p style={{ margin: 0 }}>{bookingName}</p>
                  </IonText>
                  <IonText
                    color="medium"
                    style={{
                      fontSize: "0.7rem",
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                    }}
                  >
                    {bookingRatings} <IonIcon color="tertiary" icon={star} />
                  </IonText>
                </div>
              </div>

              {/* Right Side: Cancel Button */}
              {tripStatus < 3 && (
                <IonButton
                  color="danger"
                  fill="clear"
                  onClick={() => promptCancelRide()}
                  disabled={!bookingData}
                >
                  Cancel
                </IonButton>
              )}
            </div>
          </IonToolbar>
        </IonHeader>
        <IonContent fullscreen>
          <IonGrid className="card-style">
            <IonRow className="ion-justify-content-between ion-align-items-center">
              <IonCol size="10">
                <IonLabel position="stacked" color="primary">
                  <strong>Pick-up</strong>
                </IonLabel>
                <IonText
                  style={{
                    fontSize: "0.8rem",
                    margin: "10px",
                    display: "block",
                  }}
                >
                  <LoadingText>{bookingData?.origin?.name}</LoadingText>
                </IonText>
              </IonCol>
              <IonCol size="2">
                <IonButton
                  size="small"
                  fill="clear"
                  shape="round"
                  disabled={!bookingData}
                  onClick={() =>
                    navigateToLocation(
                      bookingData?.origin?.coordinates,
                      currentLocation
                    )
                  }
                >
                  <IonIcon icon={mapOutline} />
                </IonButton>
              </IonCol>
            </IonRow>
          </IonGrid>

          <IonGrid className="card-style">
            <IonRow className="ion-justify-content-between ion-align-items-center">
              <IonCol size="10">
                <IonLabel position="stacked" color="primary">
                  <strong>Drop-off</strong>
                </IonLabel>

                <IonText
                  style={{
                    fontSize: "0.8rem",
                    margin: "10px",
                    display: "block",
                  }}
                >
                  <LoadingText>{bookingData?.destination?.name}</LoadingText>
                </IonText>
              </IonCol>
              <IonCol size="2">
                <IonButton
                  size="small"
                  fill="clear"
                  shape="round"
                  disabled={!bookingData}
                  onClick={() =>
                    navigateToLocation(
                      bookingData?.destination?.coordinates,
                      currentLocation
                    )
                  }
                >
                  <IonIcon icon={mapOutline} />
                </IonButton>
              </IonCol>
            </IonRow>
          </IonGrid>
          <IonAccordionGroup
            expand="compact"
            style={{ marginLeft: "10px", marginRight: "10px" }}
          >
            <IonAccordion value="fareBreakdown">
              <IonItem slot="header" lines="none">
                <IonLabel color="primary">Fare</IonLabel>
                <IonText slot="end">
                  <LoadingText>
                    <strong>₱{bookingData?.travelFare.toFixed(2)}</strong>
                  </LoadingText>
                </IonText>
              </IonItem>
              <IonItem slot="content" lines="none">
                <IonGrid>
                  <IonRow>
                    <IonCol size="12">
                      {bookingData ? (
                        <>
                          <IonItem lines="none" style={{ fontSize: "0.9rem" }}>
                            <IonLabel>Base Fare</IonLabel>
                            <IonText slot="end" color="medium">
                              ₱{" "}
                              {bookingData.computations.baseFare?.toFixed(2) ||
                                "0.00"}
                            </IonText>
                          </IonItem>
                          <IonItem lines="none" style={{ fontSize: "0.9rem" }}>
                            <IonLabel>
                              Distance Fare{" "}
                              <IonText color="medium">
                                (₱{bookingData.computations.costPerKM} *{" "}
                                {bookingData.computations.fareDistanceInKM.toFixed(
                                  2
                                )}
                                km)
                              </IonText>
                            </IonLabel>
                            <IonText slot="end" color="medium">
                              ₱{" "}
                              {bookingData &&
                              bookingData.computations.fareDistanceInKM !=
                                null &&
                              bookingData.computations.costPerKM != null
                                ? (
                                    bookingData.computations.fareDistanceInKM *
                                    bookingData.computations.costPerKM
                                  ).toFixed(2)
                                : "0.00"}
                            </IonText>
                          </IonItem>
                          <IonItem lines="none" style={{ fontSize: "0.9rem" }}>
                            <IonLabel>
                              Time Fare{" "}
                              <IonText color="medium">
                                (₱{bookingData.computations.costPerMin} *{" "}
                                {bookingData.computations.fareDurationInMins.toFixed(
                                  2
                                )}
                                mins)
                              </IonText>
                            </IonLabel>
                            <IonText slot="end" color="medium">
                              ₱{" "}
                              {bookingData &&
                              bookingData.computations.fareDurationInMins !=
                                null &&
                              bookingData.computations.costPerMin != null
                                ? (
                                    bookingData.computations
                                      .fareDurationInMins *
                                    bookingData.computations.costPerMin
                                  ).toFixed(2)
                                : "0.00"}
                            </IonText>
                          </IonItem>
                          <IonItem lines="none" style={{ fontSize: "0.9rem" }}>
                            <IonLabel>Service Fees</IonLabel>
                            <IonText slot="end" color="medium">
                              ₱{" "}
                              {bookingData.computations.serviceFee?.toFixed(
                                2
                              ) || "0.00"}
                            </IonText>
                          </IonItem>

                          <IonItem lines="none" style={{ fontSize: "0.9rem" }}>
                            <IonLabel>Surge Charges</IonLabel>
                            <IonText slot="end" color="medium">
                              ₱ {getSurgeCharge()}
                            </IonText>
                          </IonItem>

                          <IonItem lines="full">
                            <IonLabel color="primary">
                              <strong>Total</strong>
                            </IonLabel>
                            <IonText slot="end" color="primary">
                              <strong>
                                ₱ {bookingData.travelFare.toFixed(2)}
                              </strong>
                            </IonText>
                          </IonItem>
                        </>
                      ) : (
                        <LoadingText />
                      )}
                    </IonCol>
                  </IonRow>
                </IonGrid>
              </IonItem>
            </IonAccordion>
          </IonAccordionGroup>

          <IonItem
            lines="none"
            style={{ marginLeft: "10px", marginRight: "10px" }}
          >
            <IonLabel slot="start" color="primary">
              Payment Method
            </IonLabel>
            <IonText slot="end">
              <LoadingText>{paymentType}</LoadingText>
            </IonText>
          </IonItem>

          <IonGrid>
            <IonRow className="ion-justify-content-between ion-align-items-center">
              <IonCol size="9">
                {tripStatus === 1 && (
                  <>
                    <IonButton
                      color="primary"
                      expand="block"
                      shape="round"
                      disabled={!bookingData || !bookingDetails}
                      onClick={promptArrived}
                    >
                      I've arrived
                    </IonButton>
                    <IonText
                      color="medium"
                      style={{
                        fontSize: "0.8rem",
                        margin: "10px",
                        display: "block",
                      }}
                    >
                      Confirm you have arrived at the pickup location
                    </IonText>
                  </>
                )}
                {tripStatus === 2 && (
                  <>
                    <IonButton
                      color="primary"
                      expand="block"
                      shape="round"
                      disabled={!bookingData}
                      onClick={promptConfirmPassenger}
                    >
                      Confirm Passenger
                    </IonButton>
                    <IonText
                      color="medium"
                      style={{
                        fontSize: "0.8rem",
                        margin: "10px",
                        display: "block",
                      }}
                    >
                      Confirm the passenger has boarded
                    </IonText>
                  </>
                )}
                {tripStatus === 3 && (
                  <>
                    <IonButton
                      color="primary"
                      expand="block"
                      shape="round"
                      disabled={!bookingData}
                      onClick={promptEndTrip}
                    >
                      End Trip
                    </IonButton>
                    <IonText
                      color="medium"
                      style={{
                        fontSize: "0.8rem",
                        margin: "10px",
                        display: "block",
                      }}
                    >
                      End the trip and collect payment
                    </IonText>
                  </>
                )}
              </IonCol>
              <IonCol size="3">
                <IonButton
                  color="primary"
                  shape="round"
                  disabled={!bookingData}
                  onClick={() => {
                    if (bookingMobile) {
                      window.location.href = `tel:+63${bookingMobile}`;
                    }
                  }}
                >
                  <IonIcon icon={call} />
                </IonButton>
              </IonCol>
            </IonRow>
          </IonGrid>
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
          if (confirmAction) {
            await confirmAction();
          }
        }}
        cssClass="my-custom-action-sheet"
      />
    </IonPage>
  );
};

export default DriverTrip;
