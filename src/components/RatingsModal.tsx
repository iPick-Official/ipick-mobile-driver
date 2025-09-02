import { useRef, useState } from "react";
import {
  IonModal,
  IonContent,
  IonButton,
  IonItem,
  IonLabel,
  IonTextarea,
  IonCard,
  IonCardContent,
  IonToast,
} from "@ionic/react";
import Rating from "@mui/material/Rating";
import { useHistory } from "react-router";
import { useLocationContext } from "../contexts/LocationContext";

interface RatingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookingId: string;
  target: "driver" | "rider";
  name: string;
  totalFare: number;
  redirectOnClose?: boolean;
}

const RatingsModal: React.FC<RatingsModalProps> = ({
  isOpen,
  onClose,
  bookingId,
  target,
  name,
  totalFare,
  redirectOnClose,
}) => {
   const {
      tripStatus, setTripStatus,
    } = useLocationContext();
  const token = localStorage.getItem("accessToken");
  const history = useHistory();

  const [rating, setRating] = useState<number | null>(0);
  const [comments, setComments] = useState<string>("");
  const [toastMessage, setToastMessage] = useState<string>("");

  const handleClose = () => {
    setRating(0);
    setComments("");
    onClose();
    setTripStatus(0)
    if (redirectOnClose) {
      history.replace("/");
    }
  };

  const submitRatings = async () => {
    if (!rating || rating <= 0) {
      setToastMessage("Please provide a rating.");
      return;
    }

    if (!token) {
      setToastMessage("Missing authentication token.");
      return;
    }

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_ENDPOINT}/ride-hail/rating/${target}/${bookingId}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ rating, comments }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to submit rating");
      }

      setToastMessage("Rating submitted successfully!");
      handleClose();
    } catch (err) {
      console.error(err);
      setToastMessage("Error submitting rating.");
    }
  };

  return (
    <>
      <IonModal
        isOpen={isOpen}
        onDidDismiss={handleClose}
        trigger="open-modal"
        initialBreakpoint={0.75}
        breakpoints={[0.25, 0.5, 0.75]}
        backdropDismiss={true}
      >
        <IonContent className="ion-padding" scrollY={false}>
          <div className="ion-text-center" style={{ marginBottom: "1rem" }}>
            <h2
              style={{
                fontSize: "1.4rem",
                fontWeight: "600",
                margin: 0,
                padding: 0,
              }}
            >
              Rate your {target}
            </h2>
            <h2
              style={{
                fontSize: "1rem",
                fontWeight: "600",
                margin: 0,
                padding: 0,
              }}
            >
              {name}
            </h2>
          </div>
          <IonCard className="ion-margin card-style">
            <IonCardContent>
              <div className="ion-text-center" style={{ marginBottom: "1rem" }}>
                <Rating
                  size="large"
                  precision={0.5}
                  name="rating"
                  value={rating}
                  onChange={(_, value) => setRating(value)}
                />
              </div>

              <IonItem lines="none">
                <IonLabel position="stacked">Comments</IonLabel>
                <IonTextarea
                  placeholder="Share your thoughts..."
                  autoGrow
                  value={comments}
                  onIonInput={(e) => setComments(e.detail.value!)}
                />
              </IonItem>

              <div style={{ marginTop: "1.5rem" }}>
                <IonButton expand="block" shape="round" onClick={submitRatings}>
                  Submit
                </IonButton>
                <IonButton
                  expand="block"
                  shape="round"
                  color="medium"
                  fill="outline"
                  onClick={handleClose}
                >
                  Skip
                </IonButton>
              </div>
              <div className="ion-text-center">
                <h3
                  style={{
                    fontSize: "1.8rem",
                    fontWeight: "900",
                    margin: "0.5rem 0",
                    color: "#3e3e3eff",
                  }}
                >
                  Total Fare: ₱{totalFare.toFixed(2) ?? 0.00}
                </h3>
              </div>
            </IonCardContent>
          </IonCard>
        </IonContent>
      </IonModal>

      <IonToast
        isOpen={!!toastMessage}
        message={toastMessage}
        duration={2000}
        onDidDismiss={() => setToastMessage("")}
        position="bottom"
        color="dark"
      />
    </>
  );
};

export default RatingsModal;
