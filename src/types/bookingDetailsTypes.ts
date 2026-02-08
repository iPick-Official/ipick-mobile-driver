export interface BookingComputations {
  baseFare: number;
  serviceFee: number;
  fareDistanceInKM: number;
  fareDurationInMins: number;
  costPerKM: number;
  costPerMin: number;
}

export interface BookingDetail {
  _id: string;
  ReferenceNumber: string;
  Driver: string;
  Passenger: string;
  Cartype: string;
  CreatedAt: string;
  TotalFare: number;
  Origin: string;
  Destination: string;
  PaymentType: string;
  Computations: BookingComputations;
  PickupFare: number;
  Discount: number;
}

export interface Trip {
  _id: string;
  [key: string]: any;
}

interface PaymentType {
  _id: string;
  paymentType: string;
  description: string;
  isActive: boolean;
}

interface CarType {
  _id: string;
  vehicleType: string;
  description: string;
  isActive: boolean;
  seats: number;
}

export interface BookingDetails {
  _id: string;
  paymentType: PaymentType;
  carType: CarType;
  travelFare: number;
  systemShare: number;
  requiredDriverBalance: boolean;
  referenceNumber: string;
  __v: number;
}
