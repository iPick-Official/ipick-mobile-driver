import React, { useEffect, useState } from "react";
import { DirectionsRenderer, Marker } from "@react-google-maps/api";

interface DirectionsProps {
  origin: google.maps.LatLngLiteral;
  destination: google.maps.LatLngLiteral;
}

const Directions: React.FC<DirectionsProps> = ({ origin, destination }) => {
  const [directions, setDirections] =
    useState<google.maps.DirectionsResult | null>(null);

  useEffect(() => {
    if (!origin || !destination) return;

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
    <>
      <DirectionsRenderer
        directions={directions}
        options={{
          suppressMarkers: true,
          polylineOptions: {
            strokeColor: "#008000",
            strokeWeight: 4,
          },
        }}
      />
      <Marker
        position={origin}
        icon={{
          url: "/assets/icons/car.svg", // must be in public folder
          scaledSize: new google.maps.Size(30, 30),
          anchor: new google.maps.Point(15, 15),
        }}
      />
      <Marker
        position={destination}
        icon={{
          url: "/assets/icons/destination.gif", // must be in public folder
          scaledSize: new google.maps.Size(40, 40),
          anchor: new google.maps.Point(20, 40),
        }}
      />
    </>
  ) : null;
};

export default Directions;
