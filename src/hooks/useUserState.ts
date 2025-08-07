// hooks/useUserState.ts
import { useState } from "react";

export const useUserState = (initialState: any) => {
  const [userId, _setUserId] = useState<string>(initialState.userId ?? "");
  const [driverId, _setDriverId] = useState<string>(initialState.driverId ?? "");
  const [driverName, _setDriverName] = useState<string>(initialState.driverName ?? "");
  const [accessToken, _setAccessToken] = useState<string>(initialState.accessToken ?? "");
  const [userType, _setUserType] = useState<string>(initialState.userType ?? "");
  const [status, _setStatus] = useState<string>(initialState.status ?? "");
  const [accountStatus, _setAccountStatus] = useState<string>(initialState.accountStatus ?? "");
  const [profilePicture, _setProfilePicture] = useState<string>(initialState.profilePicture ?? "");
  const [userCarType, _setUserCarType] = useState<string>(initialState.useCarType ?? "");

  return {
    userId, _setUserId,
    driverId, _setDriverId,
    driverName, _setDriverName,
    accessToken, _setAccessToken,
    userType, _setUserType,
    status, _setStatus,
    accountStatus, _setAccountStatus,
    profilePicture, _setProfilePicture,
    userCarType, _setUserCarType,
  };
};
