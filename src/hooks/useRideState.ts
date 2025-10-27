// hooks/useRideState.ts
import { useState } from "react";
import { LatLng } from "../types/locationContextTypes";

export const useRideState = (initialState: any) => {
  const [currentLocation, _setCurrentLocation] = useState<LatLng | null>(
    initialState.currentLocation ?? null
  );
  const [destination, _setDestination] = useState<LatLng | null>(
    initialState.currentLocation ?? null
  );
  const [pickupAddress, _setPickupAddress] = useState<string>(
    initialState.pickupAddress ?? ""
  );
  const [dropoffAddress, _setDropoffAddress] = useState<string>(
    initialState.dropoffAddress ?? ""
  );
  const [pickupCoords, _setPickupCoords] = useState<LatLng | null>(
    initialState.pickupCoords ?? null
  );
  const [dropoffCoords, _setDropoffCoords] = useState<LatLng | null>(
    initialState.dropoffCoords ?? null
  );
  const [confirmed, _setConfirmed] = useState<boolean>(
    initialState.confirmed ?? false
  );
  const [carType, _setCarType] = useState<string>(initialState.carType ?? "");
  const [distance, _setDistance] = useState<number | undefined>(
    initialState.distance
  );
  const [eta, _setEta] = useState<number | undefined>(initialState.eta);
  const [seats, _setSeats] = useState<number | undefined>(initialState.seats);
  const [durationInTraffic, _setDurationInTraffic] = useState<
    number | undefined
  >(initialState.durationInTraffic);
  const [tripStatus, _setTripStatus] = useState<number | undefined>(
    initialState.tripStatus ?? 0
  );
  const [driverPicked, _setDriverPicked] = useState<boolean>(
    initialState.driverPicked ?? false
  );
  const [riderName, _setRiderName] = useState<string>(
    initialState.riderName ?? ""
  );
  const [plateNum, _setPlateNum] = useState<string>(
    initialState.plateNum ?? ""
  );
  const [carColor, _setCarColor] = useState<string>(
    initialState.carColor ?? ""
  );
  const [carBrand, _setCarBrand] = useState<string>(
    initialState.carBrand ?? ""
  );
  const [carModel, _setCarModel] = useState<string>(
    initialState.carModel ?? ""
  );
  const [riderMobile, _setRiderMobile] = useState<number | undefined>(
    initialState.riderMobile ?? undefined
  );
  const [riderRatings, _setRiderRatings] = useState<number | undefined>(
    initialState.riderRatings ?? 5
  );
  const [bookingId, _setBookingId] = useState<string>(
    initialState.bookingId ?? ""
  );
  const [bookingRef, _setBookingRef] = useState<string>(
    initialState.bookingRef ?? ""
  );
  const [riderId, _setRiderId] = useState<string>(initialState.riderId ?? "");
  const [notes, _setNotes] = useState<string>(initialState.notes ?? "");
  const [finalFare, _setFinalFare] = useState<number | undefined>(
    initialState.finalFare ?? 0
  );
  const [systemShare, _setSystemShare] = useState<number | undefined>(
    initialState.systemShare ?? 0
  );
  const [incentives, _setIncentives] = useState<number | undefined>(
    initialState.incentives ?? 0
  );

  const [walletBalance, _setWalletBalance] = useState<number | undefined>(
    initialState.walletBalance ?? 0
  );

  return {
    currentLocation,
    _setCurrentLocation,
    destination,
    _setDestination,
    pickupAddress,
    _setPickupAddress,
    dropoffAddress,
    _setDropoffAddress,
    pickupCoords,
    _setPickupCoords,
    dropoffCoords,
    _setDropoffCoords,
    confirmed,
    _setConfirmed,
    carType,
    _setCarType,
    distance,
    _setDistance,
    eta,
    _setEta,
    seats,
    _setSeats,
    durationInTraffic,
    _setDurationInTraffic,
    tripStatus,
    _setTripStatus,
    driverPicked,
    _setDriverPicked,
    riderName,
    _setRiderName,
    plateNum,
    _setPlateNum,
    carColor,
    _setCarColor,
    carBrand,
    _setCarBrand,
    carModel,
    _setCarModel,
    riderMobile,
    _setRiderMobile,
    riderRatings,
    _setRiderRatings,
    bookingId,
    _setBookingId,
    bookingRef,
    _setBookingRef,
    riderId,
    _setRiderId,
    notes,
    _setNotes,
    finalFare,
    _setFinalFare,
    systemShare,
    _setSystemShare,
    incentives,
    _setIncentives,
    walletBalance,
    _setWalletBalance,
  };
};
