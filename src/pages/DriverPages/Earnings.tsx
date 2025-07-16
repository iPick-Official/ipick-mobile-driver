import {
  IonButton,
  IonButtons,
  IonCard,
  IonCardContent,
  IonContent,
  IonHeader,
  IonIcon,
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
import { searchOutline, closeOutline, downloadOutline } from "ionicons/icons";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { useEffect, useRef, useState } from "react";
import BackButton from "../../components/BackButton";
import { fetchRideHistory } from "../../services/apiService";
import { Filesystem, Directory, Encoding } from "@capacitor/filesystem";
import { FileOpener } from "@capacitor-community/file-opener";

const Earnings: React.FC = () => {
  const [rideHistory, setRideHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const receiptRef = useRef(null);
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );

  const [showModal, setShowModal] = useState(false);
  const [selectedTrip, setSelectedTrip] = useState<any | null>(null);
  const [bookingDetails, setBookingDetails] = useState<any | null>(null);

  useEffect(() => {
    const loadHistory = async () => {
      setLoading(true);
      const data = await fetchRideHistory();
      setRideHistory(data || []);
      setLoading(false);
    };

    loadHistory();
  }, []);

  const selected = new Date(selectedDate);
  const selectedYear = selected.getFullYear();
  const selectedMonth = selected.getMonth();
  const selectedDay = selected.getDate();

  const getWeekStart = (date: Date) => {
    const d = new Date(date);
    d.setDate(d.getDate() - d.getDay());
    d.setHours(0, 0, 0, 0);
    return d;
  };

  const todayIncome = rideHistory
    .filter((ride) => {
      const d = new Date(ride.updatedAt);
      return (
        d.getFullYear() === selectedYear &&
        d.getMonth() === selectedMonth &&
        d.getDate() === selectedDay
      );
    })
    .reduce((sum, ride) => sum + (ride.travelFare || 0), 0);

  const weekIncome = rideHistory
    .filter((ride) => {
      const d = new Date(ride.updatedAt);
      const weekStart = getWeekStart(selected);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 7);
      return d >= weekStart && d < weekEnd;
    })
    .reduce((sum, ride) => sum + (ride.travelFare || 0), 0);

  const monthIncome = rideHistory
    .filter((ride) => {
      const d = new Date(ride.updatedAt);
      return d.getFullYear() === selectedYear && d.getMonth() === selectedMonth;
    })
    .reduce((sum, ride) => sum + (ride.travelFare || 0), 0);

  const yearIncome = rideHistory
    .filter((ride) => {
      const d = new Date(ride.updatedAt);
      return d.getFullYear() === selectedYear;
    })
    .reduce((sum, ride) => sum + (ride.travelFare || 0), 0);

  const filteredTrips = rideHistory.filter((ride) => {
    const d = new Date(ride.updatedAt);
    return (
      d.getFullYear() === selectedYear &&
      d.getMonth() === selectedMonth &&
      d.getDate() === selectedDay
    );
  });

  const openReceipt = async (trip: any) => {
    setSelectedTrip(trip);
    const detail = await fetchBookingDetails(trip._id);
    setBookingDetails(detail?.[0] ?? null);
    setShowModal(true);
  };

  async function fetchBookingDetails(id: string) {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_BOOKING_ENDPOINT}/SearchBookingDetails`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ id }),
        }
      );
      if (!res.ok) throw new Error("Failed");
      return await res.json();
    } catch {
      console.error("Error fetching booking details");
      return null;
    }
  }

  const getSurgeCharge = () => {
    const { Computations, TotalFare } = bookingDetails;

    if (!Computations) return 0;

    const distance = Computations.fareDistanceInKM ?? 0;
    const costPerKM = Computations.costPerKM ?? 0;
    const duration = Computations.fareDurationInMins ?? 0;
    const costPerMin = Computations.costPerMin ?? 0;
    const serviceFee = Computations.serviceFee ?? 0;
    const baseFare = Computations.baseFare ?? 0;
    const travelFare = TotalFare ?? 0;

    const totalKm = distance * costPerKM;
    const totalDur = duration * costPerMin;

    const totalFare = totalKm + totalDur + serviceFee + baseFare;
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

      const fileName = `receipt-${
        bookingDetails?.ReferenceNumber || "trip"
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
          <div
            style={{
              display: "flex",
              overflowX: "auto",
              paddingBottom: "1rem",
              scrollbarWidth: "none",
              msOverflowStyle: "none",
            }}
            className="no-scrollbar"
          >
            {loading
              ? Array.from({ length: 4 }).map((_, index) => (
                  <IonCard
                    key={index}
                    className="profile-item"
                    style={{
                      minWidth: "140px",
                      background:
                        "linear-gradient(135deg, #008000 0%,rgb(0, 83, 0) 100%)",
                    }}
                  >
                    <IonCardContent>
                      <IonSkeletonText
                        animated
                        style={{ width: "90px", height: "65px" }}
                      />
                    </IonCardContent>
                  </IonCard>
                ))
              : [
                  {
                    label: "This day",
                    value: `₱${todayIncome.toFixed(2)}`,
                    icon: "assets/icons/income-daily.gif",
                  },
                  {
                    label: "This Week",
                    value: `₱${weekIncome.toFixed(2)}`,
                    icon: "assets/icons/income-weekly.gif",
                  },
                  {
                    label: "This Month",
                    value: `₱${monthIncome.toFixed(2)}`,
                    icon: "assets/icons/income-monthly.gif",
                  },
                  {
                    label: "This Year",
                    value: `₱${yearIncome.toFixed(2)}`,
                    icon: "assets/icons/income-anually.gif",
                  },
                ].map((item, index) => (
                  <IonCard
                    key={index}
                    className="profile-item"
                    style={{
                      minWidth: "140px",
                      background:
                        "linear-gradient(135deg, #008000 0%,rgb(0, 83, 0) 100%)",
                    }}
                  >
                    <IonCardContent>
                      <img
                        src={item.icon}
                        alt="Earnings"
                        style={{
                          width: "35px",
                          height: "35px",
                          marginBottom: "4px",
                        }}
                      />
                      <IonText color="light">
                        <h6>{item.label}</h6>
                        <strong>{item.value}</strong>
                      </IonText>
                    </IonCardContent>
                  </IonCard>
                ))}
          </div>

          {/* Date Picker */}
          <IonItem lines="none" className="input-field">
            <IonInput
              color="dark"
              inputMode="numeric"
              placeholder="Select Date"
              label="Filter Trips By Date"
              labelPlacement="floating"
              type="date"
              value={selectedDate}
              onIonChange={(e) => setSelectedDate(e.detail.value || "")}
              className="floating-label-dark"
            />
          </IonItem>
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
          ) : filteredTrips.length === 0 ? (
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
                <p>No Trips today.</p>
              </IonText>
              <IonIcon
                color="medium"
                icon={searchOutline}
                style={{ marginTop: "20px", fontSize: "100px" }}
              />
            </div>
          ) : (
            filteredTrips
              .sort(
                (a, b) =>
                  new Date(b.updatedAt).getTime() -
                  new Date(a.updatedAt).getTime()
              )
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
              ))
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
              <IonTitle>Receipt</IonTitle>
              <IonButtons slot="end">
                <IonIcon
                  color="danger"
                  icon={closeOutline}
                  slot="icon-only"
                  onClick={() => setShowModal(false)}
                />
              </IonButtons>
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
                        label: "Reference #",
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
                        color="primary"
                        style={{ fontWeight: 700, fontSize: "1.1em" }}
                      >
                        ₱{bookingDetails.TotalFare.toFixed(2)}
                      </IonText>
                    </IonItem>
                    {/* {[
                      {
                        label: "Commision",
                        value: "20%",
                        total: `₱-${(bookingDetails.TotalFare * 0.2).toFixed(
                          2
                        )}`,
                        color: "medium",
                      },
                      {
                        label: "Earnings",
                        total: `₱${(
                          bookingDetails.TotalFare -
                          bookingDetails.TotalFare * 0.2
                        ).toFixed(2)}`,
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
                    ))} */}
                  </IonList>
                  <IonButton
                    expand="block"
                    fill="default"
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
    </IonPage>
  );
};

export default Earnings;
