import React from "react";
import {
    IonHeader,
    IonToolbar,
    IonButtons,
    IonSegment,
    IonSegmentButton,
    IonLabel,
    IonTitle,
} from "@ionic/react";
import BackButton from "../BackButton";

type Tab = {
    value: string;
    label: string;
};

type Size = "small" | "medium" | "large";

interface HeaderWithTabsProps {
    activeTab: string;
    onTabChange: (value: string) => void;
    tabs?: Tab[];
    size?: Size; // optional size prop
    title?: string; // optional title prop
}

const sizeStyles: Record<Size, React.CSSProperties> = {
    small: { fontSize: "0.8rem", padding: "0 6px" },
    medium: { fontSize: "1rem", padding: "0 12px" },
    large: { fontSize: "1.2rem", padding: "0 16px" },
};

const HeaderWithTabs: React.FC<HeaderWithTabsProps> = ({
    activeTab,
    onTabChange,
    tabs = [],
    size = "medium",
    title = "Header Title", // default title
}) => {
    return (
        <IonHeader translucent={true} className="ion-no-border">
            {/* Top toolbar with back button and title */}
            <IonToolbar>
                <IonButtons slot="start">
                    <BackButton />
                </IonButtons>
                <IonTitle>{title}</IonTitle>
            </IonToolbar>

            {/* Tabs toolbar */}
            <IonToolbar>
                <IonSegment
                    value={activeTab}
                    onIonChange={(e) => onTabChange(e.detail.value as string)}
                    scrollable
                    className="no-scrollbar" // hides scrollbar
                >
                    {tabs.map((tab) => (
                        <IonSegmentButton
                            key={tab.value}
                            value={tab.value}
                            style={sizeStyles[size]}
                        >
                            <IonLabel>{tab.label}</IonLabel>
                        </IonSegmentButton>
                    ))}
                </IonSegment>
            </IonToolbar>
        </IonHeader>
    );
};

export default HeaderWithTabs;
