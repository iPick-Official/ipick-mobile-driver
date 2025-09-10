import React, { useEffect, useRef, useState } from "react";
import { DirectionsRenderer, Marker, OverlayView } from "@react-google-maps/api";
import { useLocationContext } from "../contexts/LocationContext";
import { postDriverLocation } from "../services/apiService";
import { calculateHeading, interpolatePosition } from "../utils/interpolate";

interface DirectionsProps {
  map: google.maps.Map | null;
  autoZoom?: boolean;
}

const Directions: React.FC<DirectionsProps> = ({ map, autoZoom = true }) => {
  const [directions, setDirections] =
    useState<google.maps.DirectionsResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const lastRequestedOrigin = useRef<google.maps.LatLngLiteral | null>(null);
  const lastRequestedDestination = useRef<google.maps.LatLngLiteral | null>(
    null
  );
  const previousLocationRef = useRef<google.maps.LatLngLiteral | null>(null);
  const [animatedCarPosition, setAnimatedCarPosition] =
    useState<google.maps.LatLngLiteral | null>(null);
  const [carHeading, setCarHeading] = useState<number>(0);
  const hasZoomedOnce = useRef(false);

  const {
    bookingId,
    tripStatus,
    currentLocation, setCurrentLocation,
    pickupCoords,
    dropoffCoords,
    setDistance: _setDistance,
    setEta: _setEta,
    setDurationInTraffic: _setDurationInTraffic,
  } = useLocationContext();

  const setDistanceRef = useRef(_setDistance);
  const setEtaRef = useRef(_setEta);
  const setDurationInTrafficRef = useRef(_setDurationInTraffic);

  const tripStatusRef = useRef(tripStatus);
  const currentLocationRef = useRef(currentLocation);

  useEffect(() => {
    if (!currentLocation) return;

    const prev = previousLocationRef.current;
    previousLocationRef.current = currentLocation;

    if (!prev) {
      setAnimatedCarPosition(currentLocation);
      return;
    }

    const heading = calculateHeading(prev, currentLocation);
    setCarHeading(heading);

    let frame = 0;
    const totalFrames = 30;

    const animate = () => {
      frame++;
      const progress = frame / totalFrames;
      const newPos = interpolatePosition(prev, currentLocation, progress);
      setAnimatedCarPosition(newPos);

      if (frame < totalFrames) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [currentLocation]);

  useEffect(() => {
    const id = navigator.geolocation.watchPosition(
      (position) => {
        const loc = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        setCurrentLocation(loc);
      },
      (error) => {
        console.error("Geolocation error:", error);
      }
    );

    return () => {
      navigator.geolocation.clearWatch(id);
    };
  }, []);

  useEffect(() => {
    setDistanceRef.current = _setDistance;
    setEtaRef.current = _setEta;
    setDurationInTrafficRef.current = _setDurationInTraffic;
  }, [_setDistance, _setEta, _setDurationInTraffic]);

  useEffect(() => {
    tripStatusRef.current = tripStatus;
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
    if (!pickupCoords || !dropoffCoords || !window.google?.maps || !map) return;

    let origin: google.maps.LatLngLiteral;
    let destination: google.maps.LatLngLiteral;

    if ((tripStatus === 1 || tripStatus === 2) && currentLocation) {
      origin = currentLocation;
      destination = pickupCoords;
    } else if (tripStatus === 3 && currentLocation) {
      origin = currentLocation;
      destination = dropoffCoords;
    } else {
      origin = pickupCoords;
      destination = dropoffCoords;
    }

    // Auto-zoom only the first time
    if (autoZoom && !hasZoomedOnce.current && map) {
      const bounds = new google.maps.LatLngBounds();
      bounds.extend(origin);
      bounds.extend(destination);
      map.fitBounds(bounds);
      hasZoomedOnce.current = true;
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
      postDriverLocation(bookingId, {
        latitude: currentLocation!.lat,
        longitude: currentLocation!.lng,
      });
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
            // Auto-zoom only first time after getting directions
            if (autoZoom && !hasZoomedOnce.current && map) {
              const bounds = new google.maps.LatLngBounds();
              bounds.extend(origin);
              bounds.extend(destination);
              map.fitBounds(bounds);
              hasZoomedOnce.current = true;
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
  }, [pickupCoords, dropoffCoords, tripStatus]);

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
              strokeColor: "#008000",
              strokeWeight: 6,
              strokeOpacity: 1,
              zIndex: 10,
            },
          }}
        />

        {/* Outline layer for shadow effect */}
        <DirectionsRenderer
          directions={directions}
          options={{
            suppressMarkers: true,
            polylineOptions: {
              strokeColor: "#000000",
              strokeWeight: 8,
              strokeOpacity: 0.8,
              zIndex: 5,
            },
          }}
        />
        <Marker
          position={pickupCoords!}
          icon={{
            url: "/assets/markers/user.png",
            scaledSize: new google.maps.Size(30, 30),
            anchor: new google.maps.Point(20, 30),
          }}
        />
        <Marker
          position={dropoffCoords!}
          icon={{
            url: "/assets/markers/placeholder.png",
            scaledSize: new google.maps.Size(30, 30),
            anchor: new google.maps.Point(20, 30),
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
              strokeWeight: 6,
              strokeOpacity: 1,
              zIndex: 10,
            },
          }}
        />

        {/* Outline layer for shadow effect */}
        <DirectionsRenderer
          directions={directions}
          options={{
            suppressMarkers: true,
            polylineOptions: {
              strokeColor: "#000000",
              strokeWeight: 8,
              strokeOpacity: 0.8,
              zIndex: 5,
            },
          }}
        />
        {animatedCarPosition && (
          <OverlayView
            position={animatedCarPosition}
            mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
          >
            <div
              style={{
                transform: `rotate(${carHeading}deg)`,
                transformOrigin: "center",
                width: "40px",
                height: "40px",
                transition: "transform 0.2s linear",
              }}
            >
              <img
                src="/assets/markers/hood.png"
                alt="Car"
                style={{
                  width: "100%",
                  height: "100%",
                }}
              />
            </div>
          </OverlayView>
        )}
        <Marker
          position={pickupCoords!}
          icon={{
            url: "/assets/markers/user.png",
            scaledSize: new google.maps.Size(30, 30),
            anchor: new google.maps.Point(20, 30),
          }}
        />
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
              strokeColor: "#008000",
              strokeWeight: 6,
              strokeOpacity: 1,
              zIndex: 10,
            },
          }}
        />

        {/* Outline layer for shadow effect */}
        <DirectionsRenderer
          directions={directions}
          options={{
            suppressMarkers: true,
            polylineOptions: {
              strokeColor: "#000000",
              strokeWeight: 8,
              strokeOpacity: 0.8,
              zIndex: 5,
            },
          }}
        />
        {animatedCarPosition && (
          <OverlayView
            position={animatedCarPosition}
            mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
          >
            <div
              style={{
                transform: `rotate(${carHeading}deg)`,
                transformOrigin: "center",
                width: "40px",
                height: "40px",
                transition: "transform 0.2s linear",
              }}
            >
              <img
                src="/assets/markers/hood.png"
                alt="Car"
                style={{
                  width: "100%",
                  height: "100%",
                }}
              />
            </div>
          </OverlayView>
        )}
        <Marker
          position={dropoffCoords!}
          icon={{
            url: "/assets/markers/placeholder.png",
            scaledSize: new google.maps.Size(30, 30),
            anchor: new google.maps.Point(20, 30),
          }}
        />
      </>
    );
  }

  return null;
};

export default Directions;
