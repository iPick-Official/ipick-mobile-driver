// utils/fetchRiderDistances.ts
export interface RiderDistance {
  riderId: string;
  distance: number;
}

export interface RiderPickup {
  riderId: string;
  coordinates: [number, number];
}

export interface FetchRiderDistancesParams {
  currentLocation: { lat: number; lng: number } | [number, number];
  ridersPickupCoordinates: RiderPickup[];
  distanceLimit: number;
  callback: (distances: RiderDistance[]) => void;
}

export const fetchRiderDistances = ({
  currentLocation,
  ridersPickupCoordinates,
  distanceLimit,
  callback,
}: FetchRiderDistancesParams) => {
  if (!window.google || !google.maps) {
    console.error("Google Maps JS API not loaded.");
    return;
  }

  const origin =
    Array.isArray(currentLocation)
      ? new google.maps.LatLng(currentLocation[0], currentLocation[1])
      : new google.maps.LatLng(currentLocation.lat, currentLocation.lng);

  const destinations = ridersPickupCoordinates.map(
    (r) => new google.maps.LatLng(r.coordinates[0], r.coordinates[1])
  );

  const service = new google.maps.DistanceMatrixService();

  service.getDistanceMatrix(
    {
      origins: [origin],
      destinations,
      travelMode: google.maps.TravelMode.DRIVING,
    },
    (response, status) => {
      if (status !== "OK" || !response?.rows?.length) {
        console.error("❌ DistanceMatrix request failed:", status);
        callback([]);
        return;
      }

      const elements = response.rows[0].elements;
      const distances: RiderDistance[] = ridersPickupCoordinates.map(
        (rider, idx) => {
          const element = elements[idx];
          const numericDistance = element?.distance
            ? parseFloat(element.distance.text.replace(/[^\d.]/g, ""))
            : 0;
          return { riderId: rider.riderId, distance: numericDistance };
        }
      );

      const filtered = distances
        .sort((a, b) => a.distance - b.distance)
        .filter((d) => d.distance <= distanceLimit);

      console.log(`✅ Riders within ${distanceLimit} km:`, filtered);
      callback(filtered);
    }
  );
};
