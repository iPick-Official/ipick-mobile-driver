import {
  IonAvatar,
  IonContent,
  IonFooter,
  IonImg,
  IonItem,
  IonLabel,
  IonList,
  IonMenu,
  IonMenuToggle,
  IonText,
} from "@ionic/react";
import "../theme/Menu.css";
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useLocationContext } from "../contexts/LocationContext";
import { getFileUrlIfAvailable } from "../utils/fileUrl";

const appPages = [
  {
    title: "My Account",
    url: "/my-profile",
    icon: "assets/icons/png/driver.svg",
  },
  { title: "Earnings", url: "/earnings", icon: "assets/icons/png/peso.svg" },
  { title: "Wallet", url: "/wallet", icon: "assets/icons/png/e-wallet.svg" },
  // { title: "Messages", url: "/messages", icon: "assets/icons/png/chat.svg" },
  {
    title: "Help Center",
    url: "/help-center",
    icon: "assets/icons/png/help.svg",
  },
  {
    title: "Settings",
    url: "/settings",
    icon: "assets/icons/png/settings.svg",
  },
  { title: "Sign Out", icon: "assets/icons/png/logout.svg", action: "logout" },
];

const Menu: React.FC = () => {
  const {
    driverName,
    profilePicture,
    plateNum
  } = useLocationContext();

  const location = useLocation();
  const { logout } = useAuth();
  const [profilePic, setProfilePic] = useState("");

  useEffect(() => {
    const loadProfilePicture = async () => {
      const url = await getFileUrlIfAvailable(profilePicture);
      setProfilePic(url);
    };
    loadProfilePicture();
  }, [profilePicture]);

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
                {driverName}
              </span>
              <span className="profile-plate">{plateNum}</span>
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
                style={{ fontWeight: "600" }}
                lines="none"
                detail={false}
              >
                <IonImg
                  slot="start"
                  src={icon}
                  style={{ width: 25, height: 25 }}
                />
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