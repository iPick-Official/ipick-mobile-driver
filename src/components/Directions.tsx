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
  const lastRequestedOrigin = useRef<google.maps.LatLngLiteral | null>(null);
  const lastRequestedDestination = useRef<google.maps.LatLngLiteral | null>(
    null
  );

  // Haversine formula to calculate distance between two points (in meters)
  const calculateDistance = (
    a: google.maps.LatLngLiteral,
    b: google.maps.LatLngLiteral
  ) => {
    const toRad = (value: number) => (value * Math.PI) / 180;
    const R = 6371000; // Radius of Earth in meters
    const dLat = toRad(b.lat - a.lat);
    const dLng = toRad(b.lng - a.lng);
    const lat1 = toRad(a.lat);
    const lat2 = toRad(b.lat);

    const aComp =
      Math.sin(dLat / 2) ** 2 +
      Math.sin(dLng / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2);
    const c = 2 * Math.atan2(Math.sqrt(aComp), Math.sqrt(1 - aComp));

    return R * c;
  };

  // Watch user location and set it as origin
  useEffect(() => {
    const id = watchLocation(
      (position) => {
        const newOrigin = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        setOrigin(newOrigin);
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

  // Debounced route fetching
  useEffect(() => {
    if (!origin || !destination || !window.google?.maps) return;

    const originChanged =
      !lastRequestedOrigin.current ||
      calculateDistance(origin, lastRequestedOrigin.current) >= 500;

    const destinationChanged =
      !lastRequestedDestination.current ||
      destination.lat !== lastRequestedDestination.current.lat ||
      destination.lng !== lastRequestedDestination.current.lng;

    if (!originChanged && !destinationChanged) {
      console.log("📏 No significant changes, skipping route fetch.");
      return;
    }

    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(() => {
      console.log("📡 Requesting directions...");

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
            console.log("✅ Directions fetched");
            setDirections(result);
            lastRequestedOrigin.current = origin;
            lastRequestedDestination.current = destination;
          } else {
            console.error("❌ Directions request failed:", status);
            setError("Failed to load route.");
          }
        }
      );
    }, 2000);

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
