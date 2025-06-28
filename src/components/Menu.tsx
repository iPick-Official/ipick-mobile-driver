import {
  IonAvatar,
  IonContent,
  IonFooter,
  IonIcon,
  IonImg,
  IonItem,
  IonLabel,
  IonList,
  IonMenu,
  IonMenuToggle,
  IonText,
} from "@ionic/react";
import "./Menu.css";
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { UploadService } from "../services/uploadService";
import {
  logOutOutline,
  cashOutline,
  walletOutline,
  timeOutline,
  chatboxEllipsesOutline,
  helpCircleOutline,
  medicalOutline,
  settingsOutline,
  personOutline,
} from "ionicons/icons";

const appPages = [
  { title: "My Account", url: "/my-profile", icon: personOutline },
  { title: "Earnings", url: "/earnings", icon: cashOutline },
  { title: "Wallet", url: "/wallet", icon: walletOutline },
  { title: "Messages", url: "/messages", icon: chatboxEllipsesOutline },
  { title: "Help Center", url: "/help-center", icon: helpCircleOutline },
  {
    title: "Settings",
    url: "/settings",
    icon: settingsOutline,
  },
  { title: "Sign Out", icon: logOutOutline, action: "logout" },
];

const uploadService = new UploadService(
  import.meta.env.VITE_AWS_ACCESS_KEY,
  import.meta.env.VITE_AWS_SECRET_KEY,
  import.meta.env.VITE_REGION,
  import.meta.env.VITE_BUCKET
);

const Menu: React.FC = () => {
  const location = useLocation();
  const { logout } = useAuth();
  const rawProfile = localStorage.getItem("profilePicture");
  const profile = rawProfile ?? undefined;
  const [profilePic, setProfilePic] = useState("");

  useEffect(() => {
    const loadProfilePicture = async () => {
      const url = await getFileUrlIfAvailable(profile);
      setProfilePic(url);
    };

    loadProfilePicture();
  }, [profile]);

  const getFileUrlIfAvailable = async (
    fileObj: { name?: string; url?: string } | string | undefined
  ): Promise<string> => {
    const key = typeof fileObj === "string" ? fileObj : fileObj?.url || "";
    return key ? await uploadService.getFileUrl(key) : "/favicon.png";
  };

  return (
    <IonMenu contentId="main" type="overlay">
      <IonContent>
        <IonList>
          <IonItem lines="none" className="profile-item">
            <IonAvatar className="profile-avatar">
              <IonImg src={profilePic} alt="Profile" />
            </IonAvatar>

            <div className="profile-details">
              <span className="profile-name">
                {localStorage.getItem("name") ?? "Driver"}
              </span>
            </div>
          </IonItem>

          {appPages.map(({ title, url, icon, action }, index) => (
            <IonMenuToggle key={index} autoHide={false}>
              <IonItem
                button
                onClick={
                  action === "logout"
                    ? async () => {
                        await logout();
                        window.location.href = "/login";
                      }
                    : undefined
                }
                routerLink={action ? undefined : url}
                className={location.pathname === url ? "selected" : ""}
                lines="none"
                detail={false}
              >
                <IonIcon slot="start" icon={icon} />
                <IonLabel>{title}</IonLabel>
              </IonItem>
            </IonMenuToggle>
          ))}
        </IonList>
      </IonContent>
      <IonFooter
        className="ion-no-border ion-text-center ion-padding"
        style={{ bottom: "20px" }}
      >
        <IonText>
          <IonLabel>
            &copy; {new Date().getFullYear()} All rights reserved.
          </IonLabel>
        </IonText>
      </IonFooter>
    </IonMenu>
  );
};

export default Menu;
