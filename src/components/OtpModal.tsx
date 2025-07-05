import {
  IonModal,
  IonRow,
  IonCol,
  IonItem,
  IonInput,
  IonText,
  IonImg,
} from "@ionic/react";
import {
  RefObject,
  useRef,
  useEffect,
  useCallback,
  KeyboardEvent,
  ClipboardEvent,
} from "react";
import "../theme/variables.css";

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
  const inputsRef = useRef<(HTMLIonInputElement | null)[]>([]);

  const updateOtpRefValue = useCallback(() => {
    const otp = inputsRef.current
      .map((input) => input?.value?.toString().trim() ?? "")
      .join("");

    if (otpRef.current) {
      otpRef.current.value = otp;
    }

    if (otp.length === 6 && /^[0-9]{6}$/.test(otp)) {
      onVerify(); // ✅ Auto-submit
    }
  }, [onVerify, otpRef]);

  const handleChange = (value: string, index: number) => {
    if (!/^[0-9]?$/.test(value)) return;

    const input = inputsRef.current[index];
    if (input) input.value = value;

    updateOtpRefValue();

    if (value && index < 5) {
      inputsRef.current[index + 1]?.setFocus();
    }
  };

  const handleKeyDown = (e: KeyboardEvent, index: number) => {
    const input = inputsRef.current[index];
    if (e.key === "Backspace" && !input?.value && index > 0) {
      inputsRef.current[index - 1]?.setFocus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();

    const pastedText = e.clipboardData.getData("Text").trim();
    const digits = pastedText.replace(/\D/g, "").slice(0, 6).split("");

    digits.forEach((digit, i) => {
      const input = inputsRef.current[i];
      if (input) {
        input.value = digit;
      }
    });

    updateOtpRefValue();

    // Focus the next empty box or last
    const nextIndex = digits.length < 6 ? digits.length : 5;
    inputsRef.current[nextIndex]?.setFocus();
  };

  useEffect(() => {
    const modal = modalRef.current;
    if (!modal) return;

    const handler = () => {
      inputsRef.current.forEach((input) => {
        if (input) input.value = "";
      });
      updateOtpRefValue();
      otpRef.current?.setFocus();
    };

    modal.addEventListener("ionModalDidPresent", handler);
    return () => modal.removeEventListener("ionModalDidPresent", handler);
  }, [modalRef, updateOtpRefValue]);

  return (
    <IonModal
      ref={modalRef}
      initialBreakpoint={1}
      breakpoints={[0, 1]}
      canDismiss={canDismiss}
    >
      <IonRow className="otp-row block ion-padding ion-justify-content-center">
        <div className="otp-box-row" onPaste={handlePaste}>
          {Array.from({ length: 6 }).map((_, index) => (
            <IonInput
              key={index}
              ref={(el) => {
                inputsRef.current[index] = el;
              }}
              type="tel"
              inputMode="numeric"
              maxlength={1}
              onIonInput={(e) => {
                const input = e.target as HTMLIonInputElement;
                handleChange(input.value?.toString() || "", index);
              }}
              onKeyDown={(e) => handleKeyDown(e, index)}
              className="otp-box"
            />
          ))}
        </div>
        <IonItem lines="none" className="ion-text-center ion-margin-bottom">
          <IonText>Enter the 6-digit code sent to your mobile number</IonText>
        </IonItem>
        <IonCol size="12" className="ion-text-center ion-margin-top">
          <IonImg
            src="./assets/icons/png/passcode.svg"
            style={{
              width: "auto",
              maxWidth: "150px",
              height: "auto",
              opacity: 0.7,
              margin: "0 auto",
            }}
          />
        </IonCol>
        <IonInput
          ref={otpRef}
          className="hidden-otp-input"
          type="tel"
          inputMode="numeric"
          maxlength={6}
          autocomplete="one-time-code"
          onIonInput={(e) => {
            const input = e.target as HTMLIonInputElement;
            const value = input.value?.toString().trim() || "";
            if (value.length === 6 && /^[0-9]{6}$/.test(value)) {
              value.split("").forEach((digit, i) => {
                const box = inputsRef.current[i];
                if (box) box.value = digit;
              });
              onVerify();
            }
          }}
          style={{
            position: "absolute",
            opacity: 0,
            height: 0,
            pointerEvents: "none",
          }}
        />
      </IonRow>
    </IonModal>
  );
};

export default OtpModal;
