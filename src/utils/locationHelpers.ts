// locationHelpers.ts
export const watchLocation = (
  onSuccess: (position: GeolocationPosition) => void,
  onError?: (error: GeolocationPositionError) => void
): number | null => {
  if (!navigator.geolocation) {
    console.error("Geolocation is not supported by this browser.");
    return null;
  }

  const watchId = navigator.geolocation.watchPosition(
    onSuccess,
    onError || ((error) => console.error("Geolocation error:", error.message)),
    {
      enableHighAccuracy: true,
      timeout: 30000,
      maximumAge: 0,
    }
  );

  return watchId;
};
