import React, { useEffect, useState } from "react";
import { IonAlert, IonContent, IonPage, isPlatform } from "@ionic/react";

const VersionCheck: React.FC = () => {
  const [latestVersion, setLatestVersion] = useState<string>("");
  const [showAlert, setShowAlert] = useState<boolean>(false);
  const currentVersion = import.meta.env.VITE_CURRENT_VERSION;
  const token = localStorage.getItem("accessToken");
  const checkForUpdates = async () => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_ENDPOINT}/versions`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
        }
      );
      const data = await res.json();

      const item = data.find((v: any) => v._id === "684551b4740e9657a42cabe0");
      if (!item) return;

      const serverVersion = item.latestVersion;
      setLatestVersion(serverVersion);

      if (
        serverVersion?.localeCompare(currentVersion, undefined, { numeric: true }) > 0
      ) {
        setShowAlert(true);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    checkForUpdates();
  }, []);

  const handleUpdateNow = () => {
    if (isPlatform("android")) {
      window.open(
        "https://play.google.com/store/apps/details?id=com.ipick.starter&pcampaignid=web_share",
        "_blank"
      );
    } else if (isPlatform("ios")) {
      window.open(
        "https://apps.apple.com/ph/app/ipick-booking-services/id6738897138",
        "_blank"
      );
    } else {
      alert(
        "Please update your app from the App Store (iOS) or Google Play Store (Android)."
      );
    }
  };

  return (
    <IonPage>
      <IonContent>
        <IonAlert
          isOpen={showAlert}
          backdropDismiss={false}
          header="Update Available!"
          message={`A new version (${latestVersion}) is available. Please update to continue.`}
          buttons={[
            {
              text: "Update Now",
              handler: handleUpdateNow,
            },
          ]}
        />
      </IonContent>
    </IonPage>
  );
};

export default VersionCheck;