// types.ts

export interface LatLng {
  lat: number;
  lng: number;
}

export interface LocationPoint {
  name: string;
  type: string;
  coordinates: [number, number]; 
}

export interface Computations {
  baseFare: number;
  serviceFee: number;
  fareDistanceInKM: number;
  fareDurationInMins: number;
  costPerKM: number;
  [key: string]: number; 
}

export interface BookingData {
  _id: string;
  tripStatus: number;
  status: string;
  driverLoc: LatLng;
  driverId: string;
  driverRating: number[];
  riderId: string;
  travelFare: number;
  computations: Computations;
  origin: LocationPoint;
  destination: LocationPoint;
}

export interface RideStatusData {
  status: number;
  // Add more fields if necessary
}

