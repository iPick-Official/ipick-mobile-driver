export const fetchActiveJobs = async (logout: () => void) => {
  const token = localStorage.getItem("accessToken");
  const userId = localStorage.getItem("userId");

  if (!token || !userId) return;

  try {
    const response = await fetch(
      `${
        import.meta.env.VITE_API_ENDPOINT
      }/ride-hail/activeJobs?driverId=${userId}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    const data = await response.json();

    if (response.status === 401 || data.statusCode === 401) {
      console.warn("401 Unauthorized — logging out.");
      logout();
      return;
    }

    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`);
    }
  } catch (error) {
    console.error("Error fetching active jobs:", error);
  }
};

import { connectSocket, fetchAllUserIds } from "../utils/useSocket";

export const fetchBookingDetails = async (): Promise<any | null> => {
  const userId = localStorage.getItem("userId");
  if (!userId) return null;

  try {
    connectSocket(userId); // ensures socket is connected
    const id = await fetchAllUserIds(); // fetch latest all_users IDs

    const response = await fetch(
      `${import.meta.env.VITE_API_BOOKING_ENDPOINT}/GetBookingDetails`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id }),
      }
    );

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching booking details:", error);
    return null;
  }
};

export const fetchRideHistory = async () => {
  const token = localStorage.getItem("accessToken");
  const userId = localStorage.getItem("userId");
  const type = localStorage.getItem("userType");

  if (!token || !userId || !type) return [];

  try {
    // await new Promise((resolve) => setTimeout(resolve, 2000));
    const response = await fetch(
      `${
        import.meta.env.VITE_API_ENDPOINT
      }/ride-hail/history/${userId}?type=${type}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`);
    }

    return data;
  } catch (error) {
    console.error("Error fetching ride history:", error);
    return [];
  }
};
