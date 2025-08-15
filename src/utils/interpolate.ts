export const interpolatePosition = (
  start: google.maps.LatLngLiteral,
  end: google.maps.LatLngLiteral,
  factor: number
): google.maps.LatLngLiteral => {
  return {
    lat: start.lat + (end.lat - start.lat) * factor,
    lng: start.lng + (end.lng - start.lng) * factor,
  };
};

export const calculateHeading = (
  from: google.maps.LatLngLiteral,
  to: google.maps.LatLngLiteral
): number => {
  const lat1 = (from.lat * Math.PI) / 180;
  const lat2 = (to.lat * Math.PI) / 180;
  const dLng = ((to.lng - from.lng) * Math.PI) / 180;

  const y = Math.sin(dLng) * Math.cos(lat2);
  const x =
    Math.cos(lat1) * Math.sin(lat2) -
    Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLng);
  const heading = (Math.atan2(y, x) * 180) / Math.PI;
  return (heading + 360) % 360;
};
