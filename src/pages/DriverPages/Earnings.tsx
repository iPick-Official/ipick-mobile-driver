import {
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
import {
  calendarClearOutline,
  calendarNumberOutline,
  calendarOutline,
  searchOutline,
  timeOutline,
  closeOutline,
} from "ionicons/icons";
import { useEffect, useState } from "react";
import BackButton from "../../components/BackButton";
import { fetchRideHistory } from "../../services/apiService";

const Earnings: React.FC = () => {
  const [rideHistory, setRideHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
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
                        "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
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
              <IonItem key={i}>
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
            filteredTrips.map((trip, idx) => (
              <IonItem
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
          initialBreakpoint={0.75}
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
                  icon={closeOutline}
                  slot="icon-only"
                  onClick={() => setShowModal(false)}
                />
              </IonButtons>
            </IonToolbar>
          </IonHeader>
          <IonContent className="ion-padding">
            {selectedTrip && bookingDetails && (
              <IonCard
                style={{
                  fontFamily: "monospace",
                  maxWidth: 480,
                  margin: "auto",
                }}
              >
                <IonList lines="full">
                  {/* Booking-specific fields */}
                  {[
                    {
                      label: "Reference #",
                      value: bookingDetails.ReferenceNumber,
                    },
                    { label: "Driver", value: bookingDetails.Driver },
                    { label: "Passenger", value: bookingDetails.Passenger },
                    { label: "Car Type", value: bookingDetails.Cartype },
                    { label: "Payment", value: bookingDetails.PaymentType },
                  ].map((f, idx) => (
                    <IonItem key={idx}>
                      <IonLabel>{f.label}</IonLabel>
                      <IonText slot="end">{f.value}</IonText>
                    </IonItem>
                  ))}

                  {/* Computation & fare breakdown */}
                  {[
                    {
                      label: "Pickup",
                      value: bookingDetails.Origin || "Unknown",
                    },
                    {
                      label: "Drop off",
                      value: bookingDetails.Destination || "Unknown",
                    },
                    {
                      label: "Distance (km)",
                      value:
                        bookingDetails.Computations.fareDistanceInKM.toFixed(2),
                    },
                    {
                      label: "Duration (mins)",
                      value:
                        bookingDetails.Computations.fareDurationInMins.toFixed(
                          2
                        ),
                    },
                    {
                      label: "Base Fare",
                      value: `₱${bookingDetails.Computations.baseFare.toFixed(
                        2
                      )}`,
                    },
                    {
                      label: "Service Fee",
                      value: `₱${bookingDetails.Computations.serviceFee.toFixed(
                        2
                      )}`,
                    },
                  ].map((f, idx) => (
                    <IonItem key={idx}>
                      <IonLabel>{f.label}</IonLabel>
                      <IonText slot="end">{f.value}</IonText>
                    </IonItem>
                  ))}

                  {/* Total */}
                  <IonItem
                    lines="none"
                    className="ion-no-padding"
                    style={{ marginTop: "20px" }}
                  >
                    <IonLabel style={{ fontWeight: 700 }}>Total Fare</IonLabel>
                    <IonText
                      slot="end"
                      color="primary"
                      style={{ fontWeight: 700 }}
                    >
                      ₱{bookingDetails.TotalFare.toFixed(2)}
                    </IonText>
                  </IonItem>
                </IonList>
              </IonCard>
            )}
          </IonContent>
        </IonModal>
      </IonContent>
    </IonPage>
  );
};

export default Earnings;
