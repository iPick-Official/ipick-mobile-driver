import {
  IonAvatar,
  IonButtons,
  IonContent,
  IonFab,
  IonFabButton,
  IonFabList,
  IonHeader,
  IonIcon,
  IonImg,
  IonItem,
  IonLabel,
  IonList,
  IonPage,
  IonText,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import React, { useEffect, useState } from "react";
import BackButton from "../../components/BackButton";
import { UploadService } from "../../services/uploadService";
import { useHistory } from "react-router-dom";
import { fetchMyRatings } from "../../services/apiService";
import { useLocationContext } from "../../contexts/LocationContext";
import {
  callOutline,
  carOutline,
  carSportOutline,
  chevronUpCircle,
  documentOutline,
  mailOutline,
  personOutline,
  phonePortraitOutline,
  starSharp,
} from "ionicons/icons";


const uploadService = new UploadService(
  import.meta.env.VITE_AWS_ACCESS_KEY,
  import.meta.env.VITE_AWS_SECRET_KEY,
  import.meta.env.VITE_REGION,
  import.meta.env.VITE_BUCKET
);

const MyProfile: React.FC = () => {
  const {
    driverName,
    profilePicture,
    plateNum,
    carBrand,
    carModel,
    carColor,
  } = useLocationContext();
  const history = useHistory();
  const rawProfile = profilePicture;
  const profile = rawProfile ?? undefined;
  const [profilePic, setProfilePic] = useState("");
  const [myRating, setMyRating] = useState(0);

  const user = JSON.parse(localStorage.getItem("driverData") || "{}");

  const joinedRaw = user?.createdAt || "";
  const joinedDate = new Date(joinedRaw);
  const joinedFormatted = joinedDate.toLocaleString("en-US", {
    month: "long",
    year: "numeric",
  });

  useEffect(() => {
    const loadRating = async () => {
      const rating = await fetchMyRatings();
      setMyRating(rating);
    };

    loadRating();
  }, []);

  useEffect(() => {
    const loadProfilePicture = async () => {
      const url = await getFileUrlIfAvailable(profilePicture);
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

  const profileInfo = [
    { label: "Mobile Number", value: "+63" + user?.mobnum, icon: callOutline },
    { label: "Email", value: user?.email, icon: mailOutline },
    { label: "Service Type", value: user?.carType, icon: carSportOutline },
    {
      label: "Vehicle Information",
      value: carBrand + " " + carModel + " / " + carColor,
      icon: carOutline,
    },
    {
      label: "Emergency Contact",
      value: user?.personalRequirements?.emergencyContactName,
      icon: personOutline,
    },
    {
      label: "Emergency Mobile",
      value: user?.personalRequirements?.emergencyContactMobNum,
      icon: phonePortraitOutline,
    },
  ];

  return (
    <IonPage>
      <IonHeader collapse="fade" className="ion-no-border">
        <IonToolbar>
          <IonButtons slot="start">
            <BackButton />
          </IonButtons>
          <IonTitle>My Account</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding" fullscreen>
        <IonItem lines="none" className="profile-item">
          <IonAvatar className="profile-avatar">
            <IonImg src={profilePic} alt="Profile" />
          </IonAvatar>
          <div className="profile-details">
            <span className="profile-name">
              {driverName}
            </span>
            <span className="profile-plate">
              Joined {joinedFormatted} | {plateNum}
            </span>
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <div style={{ display: "flex", alignItems: "center" }}>
              <IonLabel
                style={{
                  fontSize: "13px",
                  marginRight: "8px",
                  color: "#292929",
                }}
              >
                {myRating.toFixed(1)}
              </IonLabel>
              <IonIcon size="small" icon={starSharp} color="warning" />
            </div>
            <IonLabel style={{ fontSize: "12px", color: "#666" }}>
              Rating
            </IonLabel>
          </div>
        </IonItem>
        {profileInfo.map((item, index) => (
          <IonList key={index} className="profile-text">
            <IonItem lines="full">
              <IonLabel position="stacked">{item.label}</IonLabel>
              <IonText color="medium">
                <p>{item.value}</p>
              </IonText>
              {item.icon && (
                <IonIcon slot="end" icon={item.icon} color="medium" />
              )}
            </IonItem>
          </IonList>
        ))}
        <IonFab slot="fixed" vertical="bottom" horizontal="end">
          <IonFabButton>
            <IonIcon icon={chevronUpCircle} />
          </IonFabButton>
          <IonFabList side="top">
            {[
              { icon: carSportOutline, path: "/transport-req" },
              { icon: documentOutline, path: "/personal-req" },
              { icon: personOutline, path: "/personal-info" },
            ].map((item, index) => (
              <IonFabButton key={index} onClick={() => history.push(item.path)}>
                <IonIcon icon={item.icon} />
              </IonFabButton>
            ))}
          </IonFabList>
        </IonFab>
      </IonContent>
    </IonPage>
  );
};

export default MyProfile;