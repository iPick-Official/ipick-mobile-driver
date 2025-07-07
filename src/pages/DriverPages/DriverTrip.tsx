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
import {
  call,
  cashOutline,
  chatbubbleOutline,
  mapOutline,
  star,
} from "ionicons/icons";

const DriverTrip: React.FC = () => {
  const history = useHistory();
  const [loading, setLoading] = useState(false);
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
      const booking = await fetchBookingDetails();
      setBookingDetails(booking);
      // console.log("Booking Details", booking);
      if (booking && booking.length > 0) {
        const bookingId = booking[0].paymentType.paymentType;
        setPaymentType(bookingId);
      }
      postDriverLocation(bookingId);
    };
    fetchAll();
  }, [bookingData, bookingDetails]);

  useEffect(() => {
    if (userId) {
      connectSocket(userId);
    }

    socket?.off("booking_data");
    socket?.on("booking_data", (data: any) => {
      console.log("Received booking data:", data);
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

  const promptCancelRide = () => {
    setHeader("Cancel Ride?");
    setSubHeader("Are you sure you want to cancel this ride?");
    setShowActionSheet(true);
  };

  const updateRideStatus = async (
    status: number,
    shouldReset = false,
    onSuccess?: (data?: any) => void // optional callback
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
  const confrimPassenger = () =>
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
      console.warn("No coordinates to navigate to");
      return;
    }

    const [lat, lng] = coordinates; // assuming coordinates is [lat, lng]

    // Example: open Google Maps to the coordinates in a new tab
    const url = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
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
          style={{ boxShadow: "none", "--box-shadow": "none" }}
        >
          <IonToolbar style={{ boxShadow: "none", "--box-shadow": "none" }}>
            <IonButton
              color="primary"
              slot="start"
              fill="clear"
              disabled={!bookingData}
            >
              <IonIcon icon={call} />
              <IonText color="medium" style={{ marginLeft: "5px" }}>
                +63{bookingMobile}
              </IonText>
            </IonButton>
            <IonButton
              color="danger"
              slot="end"
              fill="clear"
              onClick={() => promptCancelRide()}
              disabled={!bookingData}
              style={{ display: tripStatus >= 2 ? "none" : "inline-flex" }}
            >
              Cancel
            </IonButton>
          </IonToolbar>
        </IonHeader>
        <IonContent fullscreen>
          <IonItem
            lines="full"
            style={{
              marginLeft: "10px",
              marginRight: "10px",
              marginBottom: "10px",
            }}
          >
            <IonImg
              slot="start"
              src="./assets/icons/png/driver.svg"
              style={{ width: 40, height: 40, marginBottom: 10 }}
            />
            <IonText>
              <p>{bookingName}</p>
            </IonText>
            <IonText slot="end">
              {bookingRatings} <IonIcon color="tertiary" icon={star} />
            </IonText>
          </IonItem>

          <IonGrid className="card-style">
            <IonRow className="ion-justify-content-between ion-align-items-center">
              <IonCol size="10">
                <IonLabel position="stacked" color="primary">
                  Pick-up
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
                  fill="solid"
                  shape="round"
                  onClick={() =>
                    navigateToLocation(bookingData?.origin?.coordinates)
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
                  Drop-off
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
                  fill="solid"
                  shape="round"
                  onClick={() =>
                    navigateToLocation(bookingData?.destination?.coordinates)
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
                          <IonItem lines="none">
                            <IonLabel>Base Fare</IonLabel>
                            <IonText slot="end" color="medium">
                              ₱{" "}
                              {bookingData.computations.baseFare?.toFixed(2) ||
                                "0.00"}
                            </IonText>
                          </IonItem>
                          <IonItem lines="none">
                            <IonLabel>
                              Distance Fare{" "}
                              <IonText color="medium">
                                ({bookingData.computations.costPerKM.toFixed(2)}{" "}
                                *{" "}
                                {bookingData.computations.fareDistanceInKM.toFixed(
                                  2
                                )}
                                )
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
                          <IonItem lines="none">
                            <IonLabel>
                              Time Fare{" "}
                              <IonText color="medium">
                                (
                                {bookingData.computations.costPerMin.toFixed(2)}{" "}
                                *{" "}
                                {bookingData.computations.fareDurationInMins.toFixed(
                                  2
                                )}
                                )
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
                          <IonItem lines="none">
                            <IonLabel>Service Fees</IonLabel>
                            <IonText slot="end" color="medium">
                              ₱{" "}
                              {bookingData.computations.serviceFee?.toFixed(
                                2
                              ) || "0.00"}
                            </IonText>
                          </IonItem>

                          <IonItem lines="none">
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
                      onClick={arrivedAtPickup}
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
                      onClick={confrimPassenger}
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
                      onClick={endTrip}
                    >
                      Collect Payment ₱{bookingData?.travelFare.toFixed(2)}
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
                >
                  <IonIcon icon={chatbubbleOutline} />
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
          await confirmCancelRide();
        }}
        cssClass="my-custom-action-sheet"
      />
    </IonPage>
  );
};

export default DriverTrip;
