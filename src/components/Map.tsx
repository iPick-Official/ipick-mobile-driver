import React, { useEffect, useState } from "react";
import {
  Circle,
  GoogleMap,
  Marker,
  useJsApiLoader,
} from "@react-google-maps/api";
import customMapStyle from "./MapStyle.json";

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
};

const Map: React.FC = () => {
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_APP_GOOGLE_MAP_KEY,
  });

  const [currentLocation, setCurrentLocation] =
    useState<google.maps.LatLngLiteral | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          setLocationError("Unable to retrieve your location.");
          console.error(error);
        }
      );
    } else {
      setLocationError("Geolocation is not supported by this browser.");
    }
  }, []);

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
      options={mapOptions} // disables all controls
    >
      <Marker position={currentLocation} icon={blueDotIcon} />
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
    </GoogleMap>
  );
};

export default Map;
