import React from "react";
import { IonButton, IonIcon } from "@ionic/react";
import { chevronBackOutline, colorFill } from "ionicons/icons";
import { useHistory } from "react-router-dom";

type BackButtonProps = {
  onClick?: () => void;
  label?: string;
  className?: string;
};

const BackButton: React.FC<BackButtonProps> = ({ onClick }) => {
  const history = useHistory();

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      history.goBack();
    }
  };

  return (
    <IonButton
      style={{
        backgroundColor: "#008000",
        borderRadius: "50%",
        color: "#fff",
        minWidth: "40px",
        minHeight: "40px",
        padding: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        margin: "10px 15px",
      }}
      onClick={handleClick}
      fill="clear"
      size="default"
      aria-label="Go back"
    >
      <IonIcon
        slot="start"
        icon={chevronBackOutline}
        style={{ color: "#fff" }}
      />
    </IonButton>
  );
};

export default BackButton;
