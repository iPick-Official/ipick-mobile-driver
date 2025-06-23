import {
  IonModal,
  IonRow,
  IonCol,
  IonItem,
  IonInput,
  IonButton,
  IonIcon,
} from "@ionic/react";
import { arrowForward } from "ionicons/icons";
import { RefObject } from "react";
import ResendOtpButton from "./ResendOtpButton";

interface OtpModalProps {
  modalRef: RefObject<HTMLIonModalElement>;
  otpRef: RefObject<HTMLIonInputElement>;
  onVerify: () => void;
  canDismiss?: boolean;
}

const OtpModal: React.FC<OtpModalProps> = ({
  modalRef,
  otpRef,
  onVerify,
  canDismiss = true,
}) => {
  return (
    <IonModal
      ref={modalRef}
      initialBreakpoint={1}
      breakpoints={[0, 1]}
      canDismiss={canDismiss}
    >
      <IonRow className="otp-row">
        <IonCol size="9">
          <IonItem lines="none" className="input-field">
            <IonInput
              ref={otpRef}
              color="dark"
              inputMode="numeric"
              pattern="[0-9]*"
              placeholder="XXXXXX"
              label="OTP"
              labelPlacement="floating"
              type="tel"
              maxlength={6}
              className="floating-label-dark"
              onIonFocus={(e) => {
                e.target?.scrollIntoView({
                  behavior: "smooth",
                  block: "center",
                });
              }}
            />
          </IonItem>
        </IonCol>

        <IonCol size="3" className="ion-text-end">
          <IonButton
            onClick={onVerify}
            color="primary"
            shape="round"
            size="large"
            fill="solid"
          >
            <IonIcon icon={arrowForward} slot="icon-only" />
          </IonButton>
        </IonCol>
      </IonRow>
    </IonModal>
  );
};

export default OtpModal;
