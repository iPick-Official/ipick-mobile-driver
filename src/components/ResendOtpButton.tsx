import { useEffect, useRef, useState } from "react";
import { IonButton } from "@ionic/react";

interface ResendOtpButtonProps {
  onResend: () => Promise<void> | void;
  duration?: number;
}

const ResendOtpButton: React.FC<ResendOtpButtonProps> = ({
  onResend,
  duration = 60,
}) => {
  const [isDisabled, setIsDisabled] = useState(false);
  const [timer, setTimer] = useState(duration);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isDisabled) {
      intervalRef.current = setInterval(() => {
        setTimer((prev) => {
          if (prev <= 1) {
            clearInterval(intervalRef.current!);
            setIsDisabled(false);
            return duration;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isDisabled, duration]);

  const handleClick = async () => {
    setIsDisabled(true);
    setTimer(duration);
    if (typeof onResend === "function") {
      await onResend();
    }
  };

  return (
    <IonButton
      className="custom-button"
      expand="full"
      shape="round"
      size="large"
      disabled={isDisabled}
      onClick={handleClick}
    >
      {isDisabled ? `Resend in ${timer}s` : "Resend"}
    </IonButton>
  );
};

export default ResendOtpButton;
