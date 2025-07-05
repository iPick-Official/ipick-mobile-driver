// Directions.tsx
import React, { useEffect, useState } from "react";
import { DirectionsRenderer } from "@react-google-maps/api";

interface DirectionsProps {
  origin: google.maps.LatLngLiteral;
  destination: google.maps.LatLngLiteral;
}

const Directions: React.FC<DirectionsProps> = ({ origin, destination }) => {
  const [directions, setDirections] =
    useState<google.maps.DirectionsResult | null>(null);

  useEffect(() => {
    const directionsService = new google.maps.DirectionsService();

    directionsService.route(
      {
        origin,
        destination,
        travelMode: google.maps.TravelMode.DRIVING,
      },
      (result, status) => {
        if (status === google.maps.DirectionsStatus.OK && result) {
          setDirections(result);
        } else {
          console.error("Directions request failed:", status);
        }
      }
    );
  }, [origin, destination]);

  return directions ? (
    <DirectionsRenderer
      directions={directions}
      options={{
        polylineOptions: {
          strokeColor: "#008000", // Set the color of the direction line to green
          strokeWeight: 7, // Line thickness
        },
      }}
    />
  ) : null;
};

export default Directions;
