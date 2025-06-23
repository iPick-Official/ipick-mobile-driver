// components/SkeletonInputField.tsx
import { IonItem, IonInput, IonSkeletonText } from "@ionic/react";
import React from "react";

interface SkeletonInputFieldProps {
  loading: boolean;
  label: string;
  value: string;
  onChange: (e: CustomEvent) => void;
  placeholder?: string;
}

const SkeletonInputField: React.FC<SkeletonInputFieldProps> = ({
  loading,
  label,
  value,
  onChange,
  placeholder = "",
}) => {
  return (
    <IonItem lines="none" className="input-field">
      {loading ? (
        <IonSkeletonText animated style={{ width: "100%", height: "40px" }} />
      ) : (
        <IonInput
          color="dark"
          inputMode="text"
          placeholder={placeholder}
          label={label}
          labelPlacement="floating"
          value={value}
          type="text"
          onIonChange={onChange}
          className="floating-label-dark"
        />
      )}
    </IonItem>
  );
};

export default SkeletonInputField;
