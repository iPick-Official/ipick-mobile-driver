export const watchLocation = (
  onSuccess: (position: GeolocationPosition) => void,
  onError?: (error: GeolocationPositionError) => void
): number | null => {
  if (!navigator.geolocation) {
    console.error("Geolocation is not supported by this browser.");
    return null;
  }

  navigator.geolocation.getCurrentPosition(
    (position) => {
      onSuccess(position);
      // Then start watching
      navigator.geolocation.watchPosition(
        onSuccess,
        onError || ((error) => console.error("Geolocation error:", error.message)),
        {
          enableHighAccuracy: true,
          timeout: 30000,
          maximumAge: 0,
        }
      );
    },
    onError || ((error) => console.error("Geolocation error:", error.message)),
    {
      enableHighAccuracy: false, // Relaxed for faster first fix
      timeout: 10000,
      maximumAge: Infinity,
    }
  );

  return null; // Return watchId here if needed
};
