// backgroundLocation.ts
import { registerPlugin } from "@capacitor/core";
import type { BackgroundGeolocationPlugin } from "@capacitor-community/background-geolocation";

const BackgroundGeolocation = registerPlugin<BackgroundGeolocationPlugin>(
  "BackgroundGeolocation"
);

export const startBackgroundDriverLocation = (bookingId: string) => {
  const userId = localStorage.getItem("userId");
  const accessToken = localStorage.getItem("accessToken");
  const apiEndpoint = import.meta.env.VITE_API_ENDPOINT;

  if (!userId || !accessToken || !apiEndpoint) {
    console.error("Missing required data.");
    return;
  }

  BackgroundGeolocation.addWatcher(
    {
      backgroundMessage: "Tracking your location…",
      backgroundTitle: "Driver Tracking Enabled",
      requestPermissions: true,
      stale: false,
      distanceFilter: 1,
    },
    async (location, err) => {
      if (err) {
        console.error("BG error:", err);
        return;
      }

      if (!location) return;

      const { latitude, longitude } = location;

      const reqBody = {
        bookingId,
        id: userId,
        location: { lat: latitude, lng: longitude },
      };

      try {
        const response = await fetch(
          `${apiEndpoint}/ride-hail/driverLocation`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${accessToken}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify(reqBody),
          }
        );

        if (!response.ok) {
          console.error("Failed:", await response.json());
        } else {
          console.log("Background location sent:", await response.json());
        }
      } catch (err) {
        console.error("Send error:", err);
      }
    }
  ).then((id: string) => {
    console.log("Background watcher started:", id);
  });
};
