import { useEffect, useState } from "react";
import { getFileUrlIfAvailable } from "../utils/fileUrl";

export const useProfilePicture = () => {
  const [profilePictureKey, setProfilePictureKey] = useState<string>("");
  const [profilePictureUrl, setProfilePictureUrl] = useState<string>("");

  // Load key from localStorage
  useEffect(() => {
    const stored = localStorage.getItem("driverData");
    if (!stored) return;

    try {
      const parsed = JSON.parse(stored);
      const pictureKey = parsed?.personalRequirements?.profilePicture ?? "";

      setProfilePictureKey(pictureKey);
    } catch (error) {
      console.error("Failed to parse driverData:", error);
    }
  }, []);

  // Resolve URL when key changes
  useEffect(() => {
    if (!profilePictureKey) return;

    const loadProfilePicture = async () => {
      try {
        const url = await getFileUrlIfAvailable(profilePictureKey);
        setProfilePictureUrl(url);
      } catch (error) {
        console.error("Failed to load profile picture:", error);
      }
    };

    loadProfilePicture();
  }, [profilePictureKey]);

  return {
    profilePictureKey,
    profilePictureUrl,
    setProfilePictureKey,
  };
};
