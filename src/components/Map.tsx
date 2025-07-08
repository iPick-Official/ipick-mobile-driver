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
  const [reloadMapKey, setReloadMapKey] = useState<number>(0);

  const mapRef = useRef<google.maps.Map | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Load destination from localStorage
  const storedDestination = localStorage.getItem("destination");
  let destination: google.maps.LatLngLiteral | null = null;

  if (storedDestination) {
    try {
      const parsed = JSON.parse(storedDestination);
      if (
        parsed &&
        typeof parsed.lat === "number" &&
        typeof parsed.lng === "number"
      ) {
        destination = parsed;
      } else if (Array.isArray(parsed) && parsed.length === 2) {
        destination = { lat: parsed[0], lng: parsed[1] };
      }
    } catch (e) {
      console.error("Failed to parse destination from localStorage:", e);
    }
  }

  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const currentLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setCurrentLocation(currentLocation);

          if (mapRef.current) {
            mapRef.current.panTo(currentLocation);
          }
        },
        (error) => {
          console.error("Geolocation error:", error);
          setLocationError("Unable to retrieve your location.");
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
        }
      );
    } else {
      setLocationError("Geolocation is not supported by this browser.");
    }
  }, [reloadMapKey]); // Re-run when reloading

  const onMapIdle = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      if (currentLocation && mapRef.current) {
        mapRef.current.panTo(currentLocation);
      }
    }, 5000);
  };

  const retryLocation = () => {
    setLocationError(null);
    setCurrentLocation(null);
    setReloadMapKey((prev) => prev + 1);
  };

  if (loadError) {
    retryLocation();
    return (
      <div>
        <p>Error loading maps: {loadError.message}</p>
        <button onClick={retryLocation}>Retry</button>
      </div>
    );
  }

  if (!isLoaded) {
    return <div>Loading Map...</div>;
  }

  if (locationError) {
    return (
      <div style={{ textAlign: "center", marginTop: "2rem" }}>
        <p>{locationError}</p>
        <button onClick={retryLocation}>Retry</button>
      </div>
    );
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
      key={reloadMapKey}
      mapContainerStyle={containerStyle}
      center={currentLocation}
      zoom={13}
      options={mapOptions}
      onDragEnd={destination ? undefined : onMapIdle}
      onZoomChanged={destination ? undefined : onMapIdle}
      onLoad={(map) => {
        mapRef.current = map;
      }}
    >
      {!destination && (
        <>
          <Marker position={currentLocation} icon={blueDotIcon} />
          <Circle
            center={currentLocation}
            radius={4000}
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
        </>
      )}
      {destination && (
        <Directions origin={currentLocation} destination={destination} />
      )}
    </GoogleMap>
  );
};

export default Map;
