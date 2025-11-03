import {
  IonButton,
  IonButtons,
  IonCard,
  IonCardContent,
  IonContent,
  IonHeader,
  IonIcon,
  IonInfiniteScroll,
  IonInfiniteScrollContent,
  IonInput,
  IonItem,
  IonLabel,
  IonList,
  IonModal,
  IonPage,
  IonSkeletonText,
  IonText,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import "../../theme/DriverEarningsToolbar.css";
import { searchOutline, closeOutline } from "ionicons/icons";
import html2canvas from "html2canvas";
import { useEffect, useRef, useState } from "react";
import BackButton from "../../components/BackButton";
import { fetchRideHistory } from "../../services/apiService";
import { Filesystem, Directory } from "@capacitor/filesystem";
import { FileOpener } from "@capacitor-community/file-opener";
import RatingsModal from "../../components/RatingsModal";
import { BookingDetail, Trip } from "../../types/bookingDetailsTypes";

const Earnings: React.FC = () => {
  const [rideHistory, setRideHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const receiptRef = useRef(null);

  const [showModal, setShowModal] = useState(false);
  const [selectedTrip, setSelectedTrip] = useState<any | null>(null);
  const [bookingDetails, setBookingDetails] = useState<any | null>(null);
  const [isRatingsOpen, setIsRatingsOpen] = useState(false);
  const ITEMS_PER_PAGE = 15;
  const [itemsToShow, setItemsToShow] = useState(ITEMS_PER_PAGE);

  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  const todayIncome = rideHistory
    .filter((ride) => {
      const d = new Date(ride.updatedAt);
      return (
        d.getFullYear() === today.getFullYear() &&
        d.getMonth() === today.getMonth() &&
        d.getDate() === today.getDate()
      );
    })
    .reduce((sum, ride) => sum + (ride.travelFare || 0), 0);

  const yesterdayIncome = rideHistory
    .filter((ride) => {
      const d = new Date(ride.updatedAt);
      return (
        d.getFullYear() === yesterday.getFullYear() &&
        d.getMonth() === yesterday.getMonth() &&
        d.getDate() === yesterday.getDate()
      );
    })
    .reduce((sum, ride) => sum + (ride.travelFare || 0), 0);

  const loadMoreData = (event: CustomEvent<void>) => {
    setTimeout(() => {
      setItemsToShow((prev) => {
        const newCount = prev + ITEMS_PER_PAGE;
        return newCount > rideHistory.length ? rideHistory.length : newCount;
      });
      (event.target as HTMLIonInfiniteScrollElement).complete();
    }, 500);
  };

  useEffect(() => {
    const loadHistory = async () => {
      setLoading(true);
      const data = await fetchRideHistory();
      setRideHistory(data || []);
      setLoading(false);
    };

    loadHistory();
  }, []);

  const rateDriver = () => {
    setIsRatingsOpen(true);
  }

  async function fetchBookingDetails(id: string): Promise<BookingDetail | null> {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      console.error("Access token not found");
      return null;
    }

    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_ENDPOINT}/mobile/SearchBookingDetails/${id}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!res.ok) {
        const errorText = await res.text();
        console.error("Error fetching booking details:", res.status, errorText);
        return null;
      }

      const data: BookingDetail = await res.json();
      return data;
    } catch (error) {
      console.error("Error fetching booking details:", error);
      return null;
    }
  }

  //  Open receipt modal
  const openReceipt = async (trip: Trip) => {
    try {
      if (!trip?._id) return;
      setSelectedTrip(trip);

      const detail = await fetchBookingDetails(trip._id);
      setBookingDetails(detail);
      setShowModal(true);
    } catch (error) {
      console.error("Error opening receipt:", error);
    }
  };

  const getSurgeCharge = () => {
    const { Computations, TotalFare, PickupFare } = bookingDetails;

    if (!Computations) return 0;

    const distance = Computations.fareDistanceInKM ?? 0;
    const costPerKM = Computations.costPerKM ?? 0;
    const duration = Computations.fareDurationInMins ?? 0;
    const costPerMin = Computations.costPerMin ?? 0;
    const serviceFee = Computations.serviceFee ?? 0;
    const baseFare = Computations.baseFare ?? 0;
    const travelFare = TotalFare ?? 0;
    const pickupFare = PickupFare ?? 0;

    const totalKm = distance * costPerKM;
    const totalDur = duration * costPerMin;

    const totalFare = totalKm + totalDur + serviceFee + baseFare + pickupFare;
    const surge = travelFare - totalFare;
    return parseFloat(surge.toFixed(2));
  };

  const captureScreenshot = async () => {
    const input = receiptRef.current;
    if (!input) return;

    try {
      // Capture the component as canvas
      const canvas = await html2canvas(input, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff", // Ensure background is not transparent
      });

      const dataUrl = canvas.toDataURL("image/png");
      const base64Data = dataUrl.split(",")[1];

      const fileName = `receipt-${bookingDetails?.ReferenceNumber || "trip"
        }.png`;

      // Save to filesystem
      const savedFile = await Filesystem.writeFile({
        path: fileName,
        data: base64Data,
        directory: Directory.Documents,
        recursive: true,
      });

      console.log("Saved file:", savedFile.uri);

      // Open the saved file
      await FileOpener.open({
        filePath: savedFile.uri,
        contentType: "image/png",
        openWithDefault: true,
      });
    } catch (error) {
      console.error("Screenshot capture failed:", error);
    }
  };

  return (
    <IonPage>
      <IonHeader collapse="fade" className="ion-no-border">
        <IonToolbar>
          <IonButtons slot="start">
            <BackButton />
          </IonButtons>
          <IonTitle>Earnings</IonTitle>
        </IonToolbar>

        {/* Earnings Summary Cards */}
        <IonToolbar>
          <div className="earnings-toolbar">
            {loading
              ? Array.from({ length: 2 }).map((_, index) => (
                <IonCard key={index} className="earnings-card skeleton-card">
                  <IonCardContent>
                    <IonSkeletonText animated className="skeleton-box" />
                  </IonCardContent>
                </IonCard>
              ))
              : [
                {
                  label: "Today",
                  value: `₱${todayIncome?.toFixed(2) ?? "0.00"}`,
                  icon: "assets/icons/income-daily.gif",
                },
                {
                  label: "Previous Day",
                  value: `₱${yesterdayIncome?.toFixed(2) ?? "0.00"}`,
                  icon: "assets/icons/income-weekly.gif",
                },
              ].map((item, index) => (
                <IonCard key={index} className="earnings-card">
                  <IonCardContent className="earnings-content">
                    <img src={item.icon} alt={item.label} className="earnings-icon" />
                    <IonText color="light">
                      <h6>{item.label}</h6>
                      <strong>{item.value}</strong>
                    </IonText>
                  </IonCardContent>
                </IonCard>
              ))}
          </div>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding" fullscreen>
        <IonList>
          {loading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <IonItem lines="none" className="card-style" key={i}>
                <IonLabel>
                  <IonSkeletonText animated style={{ width: "0%" }} />
                  <IonSkeletonText animated style={{ width: "60%" }} />
                  <IonSkeletonText animated style={{ width: "80%" }} />
                  <IonSkeletonText animated style={{ width: "80%" }} />
                </IonLabel>
                <IonSkeletonText
                  animated
                  style={{ width: "60px", height: "20px" }}
                />
              </IonItem>
            ))
          ) : rideHistory.length === 0 ? (
            <div
              className="ion-no-border ion-text-center ion-padding"
              style={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
              }}>
              <IonText>
                <p>No Trips today.</p>
              </IonText>
              <IonIcon
                color="medium"
                icon={searchOutline}
                style={{ marginTop: "20px", fontSize: "100px" }}
              />
            </div>
          ) : (
            <>
              {rideHistory
                .sort(
                  (a, b) =>
                    new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
                )
                .slice(0, itemsToShow)
                .map((trip, idx) => (
                  <IonItem
                    lines="none"
                    className="card-style"
                    button
                    key={trip._id || idx}
                    onClick={() => {
                      setSelectedTrip(trip);
                      setShowModal(true);
                      openReceipt(trip);
                    }}
                  >
                    <IonLabel>
                      <h6>Trip Earnings</h6>
                      <p>
                        {new Date(trip.updatedAt).toLocaleString()}
                        <br />
                        <small>
                          From: {trip.origin?.name || "Unknown"} <br />
                          To: {trip.destination?.name || "Unknown"}
                        </small>
                      </p>
                    </IonLabel>
                    <IonText color="primary" slot="end">
                      <strong>₱{(trip.travelFare || 0).toFixed(2)}</strong>
                    </IonText>
                  </IonItem>
                ))}

              {/* Load More button */}
              <IonInfiniteScroll
                onIonInfinite={loadMoreData}
                threshold="100px"
                disabled={itemsToShow >= rideHistory.length}
              >
                <IonInfiniteScrollContent
                  loadingSpinner="crescent"
                  loadingText="Loading more rides..."
                />
              </IonInfiniteScroll>
            </>
          )}
        </IonList>
        {/* Modal for trip receipt */}
        <IonModal
          trigger="open-modal"
          isOpen={showModal}
          onDidDismiss={() => setShowModal(false)}
          initialBreakpoint={1}
          breakpoints={[0.25, 0.75, 1]}
        >
          <IonHeader
            className="no-ion-border transparent-header"
            collapse="fade"
          >
            <IonToolbar>
              <IonButton slot="end"
                fill="outline"
                shape="round"
                color="tertiary"
                onClick={rateDriver}
                size="small"
                className="custom-button"
              >
                Rate
              </IonButton>
            </IonToolbar>
          </IonHeader>
          <IonContent className="ion-padding">
            {selectedTrip && bookingDetails && (
              <div ref={receiptRef}>
                <IonCard
                  style={{
                    fontFamily: "monospace",
                    maxWidth: 480,
                    margin: "auto",
                  }}
                >
                  <IonList lines="full" className="ion-padding">
                    {/* Booking Details */}
                    {[
                      {
                        label: "Date",
                        value: bookingDetails?.CreatedAt
                          ? new Date(bookingDetails.CreatedAt).toLocaleString("en-PH", {
                            dateStyle: "medium",
                            timeStyle: "short",
                          })
                          : "",
                      },
                      {
                        label: "Receipt #",
                        value: bookingDetails.ReferenceNumber,
                      },
                      { label: "Driver", value: bookingDetails.Driver },
                      { label: "Passenger", value: bookingDetails.Passenger },
                      { label: "Car Type", value: bookingDetails.Cartype },
                      { label: "Payment", value: bookingDetails.PaymentType },
                      {
                        label: "Pickup",
                        value: bookingDetails.Origin || "Unknown",
                      },
                      {
                        label: "Drop off",
                        value: bookingDetails.Destination || "Unknown",
                      },
                    ].map((f, idx) => (
                      <IonItem key={`details-${idx}`} lines="full">
                        <div style={{ display: "flex", width: "100%" }}>
                          <div style={{ flex: 1 }}>
                            <IonLabel>
                              <strong>{f.label}</strong>
                            </IonLabel>
                          </div>
                          <div style={{ flex: 2 }}>
                            <IonText color="medium">{f.value}</IonText>
                          </div>
                        </div>
                      </IonItem>
                    ))}

                    {/* Fare Breakdown */}
                    {[
                      {
                        label: "Description",
                        value: "Value",
                        total: "Total",
                        color: "primary",
                      },
                      {
                        label: "Base Fare",
                        total: `₱${bookingDetails.Computations.baseFare.toFixed(
                          2
                        )}`,
                        color: "medium",
                      },
                      {
                        label: `Distance (₱${bookingDetails.Computations.costPerKM})`,
                        value: `${bookingDetails.Computations.fareDistanceInKM.toFixed(
                          2
                        )}km`,
                        total: `₱${(
                          bookingDetails.Computations.fareDistanceInKM *
                          bookingDetails.Computations.costPerKM
                        ).toFixed(2)}`,
                        color: "medium",
                      },
                      {
                        label: `Duration (₱${bookingDetails.Computations.costPerMin})`,
                        value: `${bookingDetails.Computations.fareDurationInMins.toFixed(
                          2
                        )}mins`,
                        total: `₱${(
                          bookingDetails.Computations.fareDurationInMins *
                          bookingDetails.Computations.costPerMin
                        ).toFixed(2)}`,
                        color: "medium",
                      },
                      {
                        label: "Service Fee",
                        total: `₱${bookingDetails.Computations.serviceFee.toFixed(
                          2
                        )}`,
                        color: "medium",
                      },
                      {
                        label: "Pick-up Fare",
                        total: `₱${bookingDetails.PickupFare.toFixed(
                          2
                        )}`,
                        color: "medium",
                      },
                      {
                        label: "Surge Charge",
                        total: `₱${getSurgeCharge().toFixed(2)}`,
                        color: "medium",
                      },
                    ].map((f, idx) => (
                      <IonItem
                        key={`fare-${idx}`}
                        lines="full"
                        style={{ fontSize: "0.9rem", fontWeight: "bolder" }}
                      >
                        <div style={{ display: "flex", width: "100%" }}>
                          <div style={{ flex: 2 }}>
                            <IonLabel color={f.color}>{f.label}</IonLabel>
                          </div>
                          <div style={{ flex: 2 }}>
                            <IonText color={f.color}>{f.value}</IonText>
                          </div>
                          <div style={{ flex: 1 }}>
                            <IonText color={f.color}>{f.total}</IonText>
                          </div>
                        </div>
                      </IonItem>
                    ))}

                    {/* Total Fare */}
                    <IonItem lines="none" style={{ marginTop: "20px" }}>
                      <IonLabel style={{ fontWeight: 700 }}>
                        Total Fare
                      </IonLabel>
                      <IonText
                        slot="end"
                        color="dark"
                        style={{ fontWeight: 700, fontSize: "1.1em" }}
                      >
                        ₱{bookingDetails.TotalFare.toFixed(2)}
                      </IonText>
                    </IonItem>
                  </IonList>
                  <IonButton
                    className="custom-button"
                    expand="block"
                    fill="outline"
                    shape="round"
                    color="primary"
                    onClick={captureScreenshot}
                  >
                    Download
                  </IonButton>
                </IonCard>
              </div>
            )}
          </IonContent>
        </IonModal>
      </IonContent>
      <RatingsModal
        isOpen={isRatingsOpen}
        onClose={() => setIsRatingsOpen(false)}
        bookingId={bookingDetails?._id ?? ""}
        target="rider"
        name={bookingDetails?.Passenger}
        totalFare={bookingDetails?.TotalFare ?? 0}
      />
    </IonPage>
  );
};

export default Earnings;
