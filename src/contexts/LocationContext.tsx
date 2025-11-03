import React, {
  createContext,
  useContext,
  ReactNode,
} from "react";
import { LocationContextType } from "../types/locationContextTypes";
import { useUserState } from "../hooks/useUserState";
import { useRideState } from "../hooks/useRideState";

const LOCAL_STORAGE_KEY = "locationContext";

const LocationContext = createContext<LocationContextType | undefined>(undefined);

const getInitialState = () => {
  const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      return {};
    }
  }
  return {};
};

export const LocationProvider = ({ children }: { children: ReactNode }) => {
  const initialState = getInitialState();

  // User Details
  const {
    userId, _setUserId,
    driverId, _setDriverId,
    driverName, _setDriverName,
    accessToken, _setAccessToken,
    userType, _setUserType,
    status, _setStatus,
    accountStatus, _setAccountStatus,
    profilePicture, _setProfilePicture,
    userCarType, _setUserCarType
  } = useUserState(initialState);

  // Ride Details
  const {
    destination, _setDestination,
    currentLocation, _setCurrentLocation,
    pickupAddress, _setPickupAddress,
    dropoffAddress, _setDropoffAddress,
    pickupCoords, _setPickupCoords,
    dropoffCoords, _setDropoffCoords,
    confirmed, _setConfirmed,
    carType, _setCarType,
    distance, _setDistance,
    eta, _setEta,
    seats, _setSeats,
    durationInTraffic, _setDurationInTraffic,
    tripStatus, _setTripStatus,
    driverPicked, _setDriverPicked,
    riderName, _setRiderName,
    plateNum, _setPlateNum,
    carColor, _setCarColor,
    carBrand, _setCarBrand,
    carModel, _setCarModel,
    riderMobile, _setRiderMobile,
    riderRatings, _setRiderRatings,
    bookingId, _setBookingId,
    bookingRef, _setBookingRef,
    riderId, _setRiderId,
    notes, _setNotes,
    finalFare, _setFinalFare,
    systemShare, _setSystemShare,
    incentives, _setIncentives,
    walletBalance, _setWalletBalance,
    riderBalance, _setRiderBalance
  } = useRideState(initialState);

  const updateStorage = (key: string, value: any) => {
    const existing = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) || "{}");
    const updated = { ...existing, [key]: value };
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
  };

  const resetAll = () => {
    localStorage.removeItem(LOCAL_STORAGE_KEY);
    _setCurrentLocation(null);
    _setDestination(null);
    _setPickupAddress("");
    _setDropoffAddress("");
    _setPickupCoords(null);
    _setDropoffCoords(null);
    _setConfirmed(false);
    _setCarType("");
    _setDistance(undefined);
    _setEta(undefined);
    _setSeats(undefined);
    _setDurationInTraffic(undefined);
    _setTripStatus(0);
    _setDriverPicked(false);
    _setRiderName("");
    _setRiderMobile(undefined);
    _setRiderRatings(5);
    _setBookingId("");
    _setBookingRef("");
    _setRiderId("");
    _setNotes("");
    _setFinalFare(0);
    _setSystemShare(0);
    _setIncentives(0);
    _setWalletBalance(0);
    _setRiderBalance(0);
  };

  const withStorage = (key: string, setter: React.Dispatch<any>) => {
    return (val: any) => {
      setter(val);
      updateStorage(key, val);
    };
  };

  return (
    <LocationContext.Provider
      value={{
        userId,
        setUserId: withStorage("userId", _setUserId),
        driverId,
        setDriverId: withStorage("driverId", _setDriverId),
        driverName,
        setDriverName: withStorage("driverName", _setDriverName),
        accessToken,
        setAccessToken: withStorage("accessToken", _setAccessToken),
        userType,
        setUserType: withStorage("userType", _setUserType),
        status,
        setStatus: withStorage("status", _setStatus),
        accountStatus,
        setAccountStatus: withStorage("accountStatus", _setAccountStatus),
        profilePicture,
        setProfilePicture: withStorage("profilePicture", _setProfilePicture),
        userCarType,
        setUserCarType: withStorage("userCarType", _setUserCarType),

        currentLocation,
        setCurrentLocation: withStorage("currentLocation", _setCurrentLocation),
        destination,
        setDestination: withStorage("destination", _setDestination),
        pickupAddress,
        setPickupAddress: withStorage("pickupAddress", _setPickupAddress),
        dropoffAddress,
        setDropoffAddress: withStorage("dropoffAddress", _setDropoffAddress),
        pickupCoords,
        setPickupCoords: withStorage("pickupCoords", _setPickupCoords),
        dropoffCoords,
        setDropoffCoords: withStorage("dropoffCoords", _setDropoffCoords),
        confirmed,
        setConfirmed: withStorage("confirmed", _setConfirmed),
        carType,
        setCarType: withStorage("carType", _setCarType),
        distance,
        setDistance: withStorage("distance", _setDistance),
        eta,
        setEta: withStorage("eta", _setEta),
        seats,
        setSeats: withStorage("seats", _setSeats),
        durationInTraffic,
        setDurationInTraffic: withStorage("durationInTraffic", _setDurationInTraffic),
        tripStatus,
        setTripStatus: withStorage("tripStatus", _setTripStatus),
        driverPicked,
        setDriverPicked: withStorage("driverPicked", _setDriverPicked),
        riderName,
        setRiderName: withStorage("riderName", _setRiderName),
        plateNum,
        setPlateNum: withStorage("plateNum", _setPlateNum),
        carColor,
        setCarColor: withStorage("carColor", _setCarColor),
        carBrand,
        setCarBrand: withStorage("carBrand", _setCarBrand),
        carModel,
        setCarModel: withStorage("carModel", _setCarModel),
        riderMobile,
        setRiderMobile: withStorage("riderMobile", _setRiderMobile),
        riderRatings,
        setRiderRatings: withStorage("riderRatings", _setRiderRatings),
        bookingId,
        setBookingId: withStorage("bookingId", _setBookingId),
        bookingRef,
        setBookingRef: withStorage("bookingRef", _setBookingRef),
        riderId,
        setRiderId: withStorage("riderId", _setRiderId),
        notes,
        setNotes: withStorage("notes", _setNotes),
        finalFare,
        setFinalFare: withStorage("finalFare", _setFinalFare),
        systemShare,
        setSystemShare: withStorage("systemShare", _setSystemShare),
        incentives,
        setIncentives: withStorage("incentives", _setIncentives),
        walletBalance,
        setWalletBalance: withStorage("walletBalance", _setWalletBalance),
        riderBalance,
        setRiderBalance: withStorage("riderBalance", _setRiderBalance),
        resetAll,
      }}
    >
      {children}
    </LocationContext.Provider>
  );
};

export const useLocationContext = () => {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error("useLocationContext must be used within a LocationProvider");
  }
  return context;
};
