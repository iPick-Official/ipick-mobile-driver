import React, { useEffect, useRef, useState } from "react";
import { Circle, DirectionsRenderer, Marker } from "@react-google-maps/api";
import { useLocationContext } from "../contexts/LocationContext";
import { postDriverLocation } from "../services/apiService";

interface DirectionsProps {
  map: google.maps.Map | null;
}

const Directions: React.FC<DirectionsProps> = ({ map }) => {
  const [directions, setDirections] =
    useState<google.maps.DirectionsResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [radius, setRadius] = useState(70);
  const [growing, setGrowing] = useState(true);

  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const lastRequestedOrigin = useRef<google.maps.LatLngLiteral | null>(null);
  const lastRequestedDestination = useRef<google.maps.LatLngLiteral | null>(
    null
  );

  const {
    bookingId,
    tripStatus,
    currentLocation,
    pickupCoords,
    dropoffCoords,
    setDistance: _setDistance,
    setEta: _setEta,
    setDurationInTraffic: _setDurationInTraffic,
  } = useLocationContext();

  const setDistanceRef = useRef(_setDistance);
  const setEtaRef = useRef(_setEta);
  const setDurationInTrafficRef = useRef(_setDurationInTraffic);

  const inTransitRef = useRef(tripStatus);
  const currentLocationRef = useRef(currentLocation);

  useEffect(() => {
    const interval = setInterval(() => {
      setRadius((prevRadius) => {
        if (prevRadius >= 70) {
          setGrowing(false);
          return prevRadius - 1;
        } else if (prevRadius <= 20) {
          setGrowing(true);
          return prevRadius + 1;
        }
        return growing ? prevRadius + 1 : prevRadius - 1;
      });
    }, 30);

    return () => clearInterval(interval);
  }, [growing]);

  useEffect(() => {
    setDistanceRef.current = _setDistance;
    setEtaRef.current = _setEta;
    setDurationInTrafficRef.current = _setDurationInTraffic;
  }, [_setDistance, _setEta, _setDurationInTraffic]);

  useEffect(() => {
    inTransitRef.current = tripStatus;
    currentLocationRef.current = currentLocation;
  }, [tripStatus, currentLocation]);

  const calculateDistance = (
    a: google.maps.LatLngLiteral,
    b: google.maps.LatLngLiteral
  ): number => {
    const toRad = (value: number) => (value * Math.PI) / 180;
    const R = 6371000;
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

  useEffect(() => {
    if (!pickupCoords || !dropoffCoords || !window.google?.maps) return;

    let origin: google.maps.LatLngLiteral;
    let destination: google.maps.LatLngLiteral;

    if ((tripStatus === 1 || tripStatus === 2) && currentLocation) {
      origin = currentLocation;
      destination = pickupCoords!;
    } else if (tripStatus === 3 && currentLocation) {
      origin = currentLocation;
      destination = dropoffCoords!;
    } else {
      origin = pickupCoords!;
      destination = dropoffCoords!;
    }

    if (map) {
      const bounds = new google.maps.LatLngBounds();
      bounds.extend(origin);
      bounds.extend(destination);
      map.fitBounds(bounds);
    }

    const originChanged =
      !lastRequestedOrigin.current ||
      calculateDistance(origin, lastRequestedOrigin.current) >= 500;

    const destinationChanged =
      !lastRequestedDestination.current ||
      destination.lat !== lastRequestedDestination.current.lat ||
      destination.lng !== lastRequestedDestination.current.lng;

    if (!originChanged && !destinationChanged) return;

    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(() => {
      const directionsService = new google.maps.DirectionsService();
      postDriverLocation(bookingId);
      setLoading(true);
      setError(null);

      directionsService.route(
        {
          origin,
          destination,
          travelMode: google.maps.TravelMode.DRIVING,
          drivingOptions: {
            departureTime: new Date(),
            trafficModel: google.maps.TrafficModel.BEST_GUESS,
          },
        },
        (result, status) => {
          setLoading(false);
          if (status === google.maps.DirectionsStatus.OK && result) {
            setDirections(result);
            lastRequestedOrigin.current = origin;
            lastRequestedDestination.current = destination;

            const leg = result.routes[0]?.legs[0];
            if (leg) {
              setDistanceRef.current(leg.distance?.value || 0);
              setEtaRef.current(leg.duration?.value || 0);
              if (leg.duration_in_traffic?.value) {
                setDurationInTrafficRef.current(leg.duration_in_traffic.value);
              }
            }

            if (map) {
              const bounds = new google.maps.LatLngBounds();
              bounds.extend(origin);
              bounds.extend(destination);
              map.fitBounds(bounds);
            }
          } else {
            setError("Failed to fetch directions.");
          }
        }
      );
    }, 1000);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [pickupCoords, dropoffCoords, currentLocation, tripStatus]);

  const blueDotIcon = {
    path: google.maps.SymbolPath.CIRCLE,
    fillColor: "#4285F4",
    fillOpacity: 1,
    strokeColor: "white",
    strokeWeight: 2,
    scale: 8,
  };

  if (error) return <div style={{ color: "red" }}>{error}</div>;
  if (loading && !directions) return <div>Loading route...</div>;

  // ==== IN TRANSIT === 0 ====
  if (directions && tripStatus === 0) {
    return (
      <>
        <DirectionsRenderer
          directions={directions}
          options={{
            suppressMarkers: true,
            polylineOptions: {
              strokeColor: "#008000", // green
              strokeWeight: 4,
            },
          }}
        />
        <Marker position={pickupCoords!} icon={blueDotIcon} />
        <Circle
          center={pickupCoords!}
          radius={radius}
          options={{
            strokeColor: "#4285F4",
            strokeOpacity: 0.6,
            strokeWeight: 2,
            fillColor: "#4285F4",
            fillOpacity: 0.2,
            clickable: false,
            draggable: false,
            editable: false,
            visible: true,
            zIndex: 1,
          }}
        />
        <Marker
          position={dropoffCoords!}
          icon={{
            url: "/assets/icons/destination.gif",
            scaledSize: new google.maps.Size(40, 40),
            anchor: new google.maps.Point(20, 40),
          }}
        />
      </>
    );
  }

  else if (directions && (tripStatus === 1 || tripStatus === 2) && currentLocation) {
    return (
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
          position={currentLocation}
          icon={{
            url: "/assets/icons/car.svg",
            scaledSize: new google.maps.Size(30, 30),
            anchor: new google.maps.Point(20, 30),
          }}
        />
        <Marker position={pickupCoords!} icon={blueDotIcon} />
      </>
    );
  }

  else if (directions && tripStatus === 3 && currentLocation) {
    return (
      <>
        <DirectionsRenderer
          directions={directions}
          options={{
            suppressMarkers: true,
            polylineOptions: {
              strokeColor: "#008000", // orange
              strokeWeight: 4,
            },
          }}
        />
        <Marker
          position={currentLocation!}
          icon={{
            url: "/assets/icons/car.svg",
            scaledSize: new google.maps.Size(30, 30),
            anchor: new google.maps.Point(20, 30),
          }}
        />
        <Marker
          position={dropoffCoords!}
          icon={{
            url: "/assets/icons/destination.gif",
            scaledSize: new google.maps.Size(40, 40),
            anchor: new google.maps.Point(20, 40),
          }}
        />
      </>
    );
  }

  return null;
};

export default Directions;
