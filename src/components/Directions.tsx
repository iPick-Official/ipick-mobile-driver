import React, { useEffect, useRef, useState } from "react";
import { DirectionsRenderer, Marker } from "@react-google-maps/api";
import { watchLocation } from "../utils/locationHelpers";

interface DirectionsProps {
  destination: google.maps.LatLngLiteral;
}

const Directions: React.FC<DirectionsProps> = ({ destination }) => {
  const [origin, setOrigin] = useState<google.maps.LatLngLiteral | null>(null);
  const [directions, setDirections] =
    useState<google.maps.DirectionsResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // Watch user location and set it as origin
  useEffect(() => {
    const id = watchLocation(
      (position) => {
        setOrigin({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      },
      (err) => {
        console.error("Geolocation error:", err);
        setError("Unable to retrieve location.");
      }
    );

    return () => {
      if (id !== null) {
        navigator.geolocation.clearWatch(id);
      }
    };
  }, []);

  // Fetch directions whenever origin or destination changes
  useEffect(() => {
    if (!origin || !destination || !window.google?.maps) return;

    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(() => {
      const directionsService = new google.maps.DirectionsService();

      setLoading(true);
      setError(null);

      directionsService.route(
        {
          origin,
          destination,
          travelMode: google.maps.TravelMode.DRIVING,
        },
        (result, status) => {
          setLoading(false);
          if (status === google.maps.DirectionsStatus.OK && result) {
            setDirections(result);
          } else {
            console.error("❌ Directions request failed:", status);
            setError("Failed to load route.");
          }
        }
      );
    }, 300);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [origin, destination]);

  if (error) return <div style={{ color: "red" }}>{error}</div>;
  if (loading && !directions) return <div>Loading route...</div>;

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
      {origin && (
        <Marker
          position={origin}
          icon={{
            url: "/assets/icons/car.svg",
            scaledSize: new google.maps.Size(30, 30),
            anchor: new google.maps.Point(15, 15),
          }}
        />
      )}
      <Marker
        position={destination}
        icon={{
          url: "/assets/icons/destination.gif",
          scaledSize: new google.maps.Size(40, 40),
          anchor: new google.maps.Point(20, 40),
        }}
      />
    </>
  ) : null;
};

export default Directions;
