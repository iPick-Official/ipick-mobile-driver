import React, { useEffect, useRef, useState } from "react";
import {
  Circle,
  GoogleMap,
  Marker,
  useJsApiLoader,
} from "@react-google-maps/api";
import customMapStyle from "../theme/MapStyle.json";
import Directions from "./Directions";
import { useLocationContext } from "../contexts/LocationContext";
import { philippinesBounds } from "../utils/bounds";

interface MapProps {
  onIdle?: () => void;
  onMapLoad?: (map: google.maps.Map) => void;
  isHomeScreen?: boolean;
  zoom?: number;
}

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
    latLngBounds: philippinesBounds,
    strictBounds: true,
  },
};

const fallbackLocation: google.maps.LatLngLiteral = {
  lat: 14.5995,
  lng: 120.9842,
};

const Map: React.FC<MapProps> = ({
  onIdle,
  onMapLoad,
  isHomeScreen = false,
  zoom,
}) => {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_APP_GOOGLE_MAP_KEY,
    region: "PH",
    language: "en",
    version: "weekly",
  });

  const mapRef = useRef<google.maps.Map | null>(null);
  const { currentLocation } = useLocationContext();
  const [radius, setRadius] = useState(50);
  const [growing, setGrowing] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setRadius((prevRadius) => {
        if (prevRadius >= 100) {
          setGrowing(false);
          return prevRadius - 1;
        } else if (prevRadius <= 50) {
          setGrowing(true);
          return prevRadius + 1;
        }
        return growing ? prevRadius + 1 : prevRadius - 1;
      });
    }, 30);

    return () => clearInterval(interval);
  }, [growing]);

  if (!isLoaded) {
    return <div style={{ textAlign: "center", marginTop: "2rem" }}>Loading Map...</div>;
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
      center={currentLocation ?? fallbackLocation}
      zoom={zoom ?? 15}
      options={mapOptions}
      onIdle={onIdle}
      onLoad={(map) => {
        mapRef.current = map;
        onMapLoad?.(map);
      }}
    >
      {isHomeScreen && (
        <>
          <Marker position={currentLocation ?? fallbackLocation} icon={blueDotIcon} />
          <Circle
            center={currentLocation ?? fallbackLocation}
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
        </>
      )}

      {!isHomeScreen && (<Directions map={mapRef.current} />)}
    </GoogleMap>
  );
};

export default Map;
