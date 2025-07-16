// utils/fetchRiderDistances.ts

export const fetchRiderDistances = ({
  currentLocation,
  ridersPickupCoordinates,
  distanceLimit,
  callback,
}: {
  currentLocation: { lat: number; lng: number };
  ridersPickupCoordinates: { riderId: string; coordinates: [number, number] }[];
  distanceLimit: number;
  callback: (distances: { riderId: string; distance: number }[]) => void;
}) => {
  if (!window.google || !google.maps) {
    console.error("Google Maps JS API not loaded.");
    return;
  }

  const service = new google.maps.DistanceMatrixService();

  const origin = new google.maps.LatLng(
    currentLocation.lat,
    currentLocation.lng
  );
  const destinations = ridersPickupCoordinates.map(
    (r) => new google.maps.LatLng(r.coordinates[0], r.coordinates[1])
  );

  service.getDistanceMatrix(
    {
      origins: [origin],
      destinations,
      travelMode: google.maps.TravelMode.DRIVING,
    },
    (response, status) => {
      if (status !== "OK" || !response?.rows?.length) {
        console.error("❌ DistanceMatrix request failed:", status);
        return;
      }

      const elements = response.rows[0].elements;
      const distances = ridersPickupCoordinates.map((rider, idx) => {
        const element = elements[idx];
        const distanceText = element?.distance?.text ?? "0 km";
        const numericDistance = parseFloat(distanceText.replace(/[^\d.]/g, ""));
        return {
          riderId: rider.riderId,
          distance: numericDistance,
        };
      });

      const filtered = distances
        .sort((a, b) => a.distance - b.distance)
        .filter((d) => d.distance <= Number(distanceLimit));

      console.log(`✅ Riders within ${distanceLimit} km:`, filtered);
      callback(filtered);
    }
  );
};
