import React from "react";
import { IonFooter, IonToolbar, IonButton } from "@ionic/react";
import "../../styles/Onboarding.scss";

interface ActionFooterButtonProps {
    text: string;
    onClick?: () => void;
    disabled?: boolean;
    expand?: "full" | "block";
    shape?: "round";
    size?: "small" | "default" | "large";
    className?: string;
}


const ActionFooterButton: React.FC<ActionFooterButtonProps> = ({
    text,
    onClick,
    disabled = false,
    expand = "block",
    shape,
    size = "large",
    className = "",
}) => {
    return (
        <IonFooter
            translucent
            className={`ion-no-border ion-padding action-footer-button ${className}`}
        >
            <IonToolbar>
                <IonButton
                    expand={expand}
                    shape={shape}
                    size={size}
                    onClick={onClick}
                    disabled={disabled}
                >
                    {text}
                </IonButton>
            </IonToolbar>
        </IonFooter>
    );
};


export default ActionFooterButton;
