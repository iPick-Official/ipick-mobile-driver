import React, { useRef } from "react";
import { IonAvatar, IonImg, IonIcon } from "@ionic/react";
import { cameraOutline } from "ionicons/icons";

interface ProfileUploadProps {
    profilePic: string | null;
    onFileChange: (file: File) => void;
}

const ProfileUpload: React.FC<ProfileUploadProps> = ({ profilePic, onFileChange }) => {
    const profilePicRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            onFileChange(e.target.files[0]);
        }
    };

    const handleClick = () => {
        profilePicRef.current?.click();
    };

    return (
        <div className="profile-upload-container" onClick={handleClick}>
            <IonAvatar className="profile-avatar">
                <IonImg src={profilePic || "/favicon.png"} alt="Profile" />
            </IonAvatar>

            <div className="upload-text-container">
                <IonIcon icon={cameraOutline} className="upload-icon" />
                <span className="upload-text">
                    {profilePic ? "Change Photo" : "Take a Selfie"}
                </span>
            </div>

            <input
                type="file"
                accept="image/*"
                capture="user"
                ref={profilePicRef}
                onChange={handleFileChange}
                className="hidden-file-input"
            />
        </div>
    );
};

export default ProfileUpload;
