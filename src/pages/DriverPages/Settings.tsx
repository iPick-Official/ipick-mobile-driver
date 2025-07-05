import React, { useEffect, useState } from "react";
import {
  IonButtons,
  IonContent,
  IonHeader,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonPage,
  IonTitle,
  IonToggle,
  IonToolbar,
} from "@ionic/react";
import BackButton from "../../components/BackButton";
import { chevronForward } from "ionicons/icons";
import { Preferences } from "@capacitor/preferences";

const Settings: React.FC = () => {
  const [ringtoneEnabled, setRingtoneEnabled] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [darkModeEnabled, setDarkModeEnabled] = useState(false);

  const STORAGE_KEYS = {
    ringtone: "settings_ringtone",
    notifications: "settings_notifications",
    darkMode: "settings_dark_mode",
  };

  // Load saved preferences on mount
  useEffect(() => {
    const loadPreferences = async () => {
      const ringtone = await Preferences.get({ key: STORAGE_KEYS.ringtone });
      const notifications = await Preferences.get({
        key: STORAGE_KEYS.notifications,
      });
      const darkMode = await Preferences.get({ key: STORAGE_KEYS.darkMode });

      if (ringtone.value !== null)
        setRingtoneEnabled(ringtone.value === "true");
      if (notifications.value !== null)
        setNotificationsEnabled(notifications.value === "true");
      if (darkMode.value !== null)
        setDarkModeEnabled(darkMode.value === "true");
    };

    loadPreferences();
  }, []);

  // Save preferences when values change
  useEffect(() => {
    Preferences.set({
      key: STORAGE_KEYS.ringtone,
      value: ringtoneEnabled.toString(),
    });
  }, [ringtoneEnabled]);

  useEffect(() => {
    Preferences.set({
      key: STORAGE_KEYS.notifications,
      value: notificationsEnabled.toString(),
    });
  }, [notificationsEnabled]);

  useEffect(() => {
    Preferences.set({
      key: STORAGE_KEYS.darkMode,
      value: darkModeEnabled.toString(),
    });
  }, [darkModeEnabled]);

  const links = [
    { label: "Privacy Policy", url: "https://ipickph.com/privacy-policy" },
    { label: "Code of Conduct", url: "https://ipickph.com/code-of-conduct" },
    {
      label: "Terms of Condition",
      url: "https://ipickph.com/terms-of-service",
    },
    {
      label: "Safety Center",
      url: "https://e911.gov.ph/emergency-hotline-numbers/",
    },
    {
      label: "Account Deletion",
      url: "https://docs.google.com/forms/d/1AH302t6VRm1R6268U9nYdeaIknpY7zuKuaMXu8BQ6AQ/edit",
    },
  ];

  return (
    <IonPage>
      <IonHeader collapse="fade" className="ion-no-border">
        <IonToolbar>
          <IonButtons slot="start">
            <BackButton />
          </IonButtons>
          <IonTitle>Settings</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding" fullscreen>
        <IonList className="profile-text">
          <IonItem>
            <IonLabel>Ringtone</IonLabel>
            <IonToggle
              slot="end"
              checked={ringtoneEnabled}
              onIonChange={(e) => setRingtoneEnabled(e.detail.checked)}
            />
          </IonItem>

          <IonItem>
            <IonLabel>Notifications</IonLabel>
            <IonToggle
              slot="end"
              checked={notificationsEnabled}
              onIonChange={(e) => setNotificationsEnabled(e.detail.checked)}
            />
          </IonItem>

          <IonItem>
            <IonLabel>Dark Mode</IonLabel>
            <IonToggle
              slot="end"
              checked={darkModeEnabled}
              onIonChange={(e) => setDarkModeEnabled(e.detail.checked)}
            />
          </IonItem>

          {links.map(({ label, url }) => (
            <IonItem
              key={label}
              button
              onClick={() => window.open(url, "_blank")}
            >
              <IonLabel>{label}</IonLabel>
            </IonItem>
          ))}
          <IonItem lines="none">
            <IonLabel>
              <h2>About</h2>
              <p>Version {import.meta.env.VITE_CURRENT_VERSION}</p>
            </IonLabel>
          </IonItem>
        </IonList>
      </IonContent>
    </IonPage>
  );
};

export default Settings;
