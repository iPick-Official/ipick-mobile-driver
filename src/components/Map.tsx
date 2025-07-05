import React, { useEffect, useRef, useState } from "react";
import {
  Circle,
  GoogleMap,
  Marker,
  useJsApiLoader,
} from "@react-google-maps/api";
import customMapStyle from "./MapStyle.json";
import Directions from "./Directions";

const containerStyle = {
  width: "100vw",
  height: "100vh",
};

const mapOptions = {
  disableDefaultUI: true,
  zoomControl: false,
  mapTypeControl: false,
  scaleControl: false,
  streetViewControl: false,
  rotateControl: false,
  fullscreenControl: false,
  styles: customMapStyle,
  restriction: {
    latLngBounds: {
      north: 19.45,
      south: 5.0,
      west: 119.0,
      east: 126.0,
    },
    strictBounds: true,
  },
};

const Map: React.FC = () => {
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_APP_GOOGLE_MAP_KEY,
  });

  const [currentLocation, setCurrentLocation] =
    useState<google.maps.LatLngLiteral | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const storedDestination = localStorage.getItem("destination");
  let destination = null;

  if (storedDestination) {
    try {
      const parsed = JSON.parse(storedDestination);
      // Check if parsed is an object with lat and lng or adjust based on your data shape
      if (
        parsed &&
        typeof parsed.lat === "number" &&
        typeof parsed.lng === "number"
      ) {
        destination = parsed;
      } else if (Array.isArray(parsed) && parsed.length === 2) {
        // If coordinates come as [lat, lng] array
        destination = { lat: parsed[0], lng: parsed[1] };
      }
    } catch (e) {
      console.error("Failed to parse destination from localStorage:", e);
    }
  }

  useEffect(() => {
    let watchId: number;

    if ("geolocation" in navigator) {
      watchId = navigator.geolocation.watchPosition(
        (position) => {
          const updatedLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setCurrentLocation(updatedLocation);

          // Optional: Center only if map isn't moved manually (flag-based logic possible here)
          if (mapRef.current) {
            mapRef.current.panTo(updatedLocation);
          }
        },
        (error) => {
          setLocationError("Unable to retrieve your location.");
          console.error("Geolocation error:", error);
        },
        {
          enableHighAccuracy: true,
          maximumAge: 1000,
          timeout: 10000,
        }
      );
    } else {
      setLocationError("Geolocation is not supported by this browser.");
    }

    return () => {
      if (watchId !== undefined) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, []);

  const onMapIdle = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Auto center back to user after 5 seconds
    timeoutRef.current = setTimeout(() => {
      if (currentLocation && mapRef.current) {
        mapRef.current.panTo(currentLocation);
      }
    }, 5000);
  };

  if (loadError) {
    return <div>Error loading maps: {loadError.message}</div>;
  }

  if (!isLoaded) {
    return <div>Loading Map...</div>;
  }

  if (locationError) {
    return <div>{locationError}</div>;
  }

  if (!currentLocation) {
    return <div>Getting your location...</div>;
  }

  const blueDotIcon = {
    path: google.maps.SymbolPath.CIRCLE,
    fillColor: "#4285F4",
    fillOpacity: 1,
    strokeColor: "white",
    strokeWeight: 2,
    scale: 8,
  };

  return (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={currentLocation}
      zoom={13}
      options={mapOptions}
      onDragEnd={onMapIdle}
      onZoomChanged={onMapIdle}
      onLoad={(map) => {
        mapRef.current = map;
      }}
    >
      <Marker position={currentLocation} icon={blueDotIcon} />
      {!destination && (
        <Circle
          center={currentLocation}
          radius={4000} // radius in meters
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
      )}
      {destination && (
        <Directions origin={currentLocation} destination={destination} />
      )}
    </GoogleMap>
  );
};

export default Map;
