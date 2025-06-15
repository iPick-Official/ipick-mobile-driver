// src/components/ModalPrompt.tsx
import {
  IonModal,
  IonButton,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  
} from "@ionic/react";
import { useState, useRef, useImperativeHandle, forwardRef } from "react";

type ModalPromptProps = {
  title?: string;
};

export type ModalPromptHandle = {
  show: (message: string, confirmOnly?: boolean) => Promise<boolean>;
};

const ModalPrompt = forwardRef<ModalPromptHandle, ModalPromptProps>(
  ({ title = "Notice" }, ref) => {
    const modal = useRef<HTMLIonModalElement>(null);
    const [message, setMessage] = useState("");
    const [confirmOnly, setConfirmOnly] = useState(true);
    const [resolvePromise, setResolvePromise] = useState<
      ((value: boolean) => void) | null
    >(null);

    useImperativeHandle(ref, () => ({
      show: (msg, confirm = true) => {
        setMessage(msg);
        setConfirmOnly(confirm);
        modal.current?.present();
        return new Promise<boolean>((resolve) => {
          setResolvePromise(() => resolve);
        });
      },
    }));

    const handleConfirm = () => {
      modal.current?.dismiss();
      resolvePromise?.(true);
    };

    const handleCancel = () => {
      modal.current?.dismiss();
      resolvePromise?.(false);
    };

    return (
      <IonModal ref={modal}>
        <IonHeader>
          <IonToolbar>
            <IonTitle>{title}</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent className="ion-padding">
          <p>{message}</p>
          <IonButton expand="block" onClick={handleConfirm}>
            OK
          </IonButton>
          {!confirmOnly && (
            <IonButton expand="block" color="medium" onClick={handleCancel}>
              Cancel
            </IonButton>
          )}
        </IonContent>
      </IonModal>
    );
  }
);

export default ModalPrompt;
