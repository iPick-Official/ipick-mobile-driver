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
  IonListHeader,
  IonPage,
  IonSkeletonText,
  IonText,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import {
  calendar,
  calendarClearOutline,
  calendarNumber,
  calendarNumberOutline,
  calendarOutline,
  calendarSharp,
  searchOutline,
  timeOutline,
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

  useEffect(() => {
    const loadHistory = async () => {
      setLoading(true);
      const data = await fetchRideHistory();
      setRideHistory(data || []);
      setLoading(false);
    };

    loadHistory();
  }, []);

  // Convert selectedDate string to Date
  const selected = new Date(selectedDate);
  const selectedYear = selected.getFullYear();
  const selectedMonth = selected.getMonth();
  const selectedDay = selected.getDate();

  // Helper: get start of week (Sunday)
  const getWeekStart = (date: Date) => {
    const d = new Date(date);
    d.setDate(d.getDate() - d.getDay());
    d.setHours(0, 0, 0, 0);
    return d;
  };

  // Filtered earnings by time scope
  const todayIncome = rideHistory
    .filter((ride) => {
      const d = new Date(ride.createdAt);
      return (
        d.getFullYear() === selectedYear &&
        d.getMonth() === selectedMonth &&
        d.getDate() === selectedDay
      );
    })
    .reduce((sum, ride) => sum + (ride.travelFare || 0), 0);

  const weekIncome = rideHistory
    .filter((ride) => {
      const d = new Date(ride.createdAt);
      const weekStart = getWeekStart(selected);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 7);
      return d >= weekStart && d < weekEnd;
    })
    .reduce((sum, ride) => sum + (ride.travelFare || 0), 0);

  const monthIncome = rideHistory
    .filter((ride) => {
      const d = new Date(ride.createdAt);
      return d.getFullYear() === selectedYear && d.getMonth() === selectedMonth;
    })
    .reduce((sum, ride) => sum + (ride.travelFare || 0), 0);

  const yearIncome = rideHistory
    .filter((ride) => {
      const d = new Date(ride.createdAt);
      return d.getFullYear() === selectedYear;
    })
    .reduce((sum, ride) => sum + (ride.travelFare || 0), 0);

  // Filter trip list by selected date (daily detail)
  const filteredTrips = rideHistory.filter((ride) => {
    const d = new Date(ride.createdAt);
    return (
      d.getFullYear() === selectedYear &&
      d.getMonth() === selectedMonth &&
      d.getDate() === selectedDay
    );
  });

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
                    icon: timeOutline,
                  },
                  {
                    label: "This Week",
                    value: `₱${weekIncome.toFixed(2)}`,
                    icon: calendarClearOutline,
                  },
                  {
                    label: "This Month",
                    value: `₱${monthIncome.toFixed(2)}`,
                    icon: calendarNumberOutline,
                  },
                  {
                    label: "This Year",
                    value: `₱${yearIncome.toFixed(2)}`,
                    icon: calendarOutline,
                  },
                ].map((item, index) => (
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
                      <IonIcon
                        icon={item.icon}
                        style={{ fontSize: "24px", color: "#ffffff" }}
                      />
                      <h6>{item.label}</h6>
                      <strong>{item.value}</strong>
                    </IonCardContent>
                  </IonCard>
                ))}
          </div>

          {/* Date Picker */}
          <IonItem lines="none" className="input-field">
            {loading ? (
              <IonSkeletonText
                animated
                style={{ width: "100%", height: "48px", borderRadius: "6px" }}
              />
            ) : (
              <IonInput
                color="dark"
                inputMode="numeric"
                placeholder="Select Date"
                label="Filter Transactions By Date"
                labelPlacement="floating"
                type="date"
                value={selectedDate}
                onIonChange={(e) => setSelectedDate(e.detail.value || "")}
                className="floating-label-dark"
              />
            )}
          </IonItem>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding" fullscreen>
        <IonList>
          {loading ? (
            <IonItem
              lines="none"
              className="ion-no-border ion-text-center ion-padding"
            >
              <IonLabel>Processing...</IonLabel>
            </IonItem>
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
              <IonItem lines="full" key={trip._id || idx}>
                <IonLabel>
                  <h6>Trip Earnings</h6>
                  <p>
                    {new Date(trip.createdAt).toLocaleString()}
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
      </IonContent>
    </IonPage>
  );
};

export default Earnings;
