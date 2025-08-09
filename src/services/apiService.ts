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

export const fetchDriverWallet = async () => {
  const userId = localStorage.getItem("id");

  if (!userId) return null;

  try {
    // await new Promise((resolve) => setTimeout(resolve, 2000));
    const response = await fetch(
      `${import.meta.env.VITE_API_BOOKING_ENDPOINT}/GetUserWallet`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: userId,
          type: "driver",
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`);
    }

    const data = await response.json();
    return data; // will include _id and walletBalance
  } catch (error) {
    console.error("Error fetching driver wallet:", error);
    return null;
  }
};

export const fetchDriverTransactions = async () => {
  const userId = localStorage.getItem("id");

  if (!userId) return null;

  try {
    // await new Promise((resolve) => setTimeout(resolve, 2000));
    const response = await fetch(
      `${import.meta.env.VITE_API_BOOKING_ENDPOINT}/GetUserTransactions`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: userId,
          type: "driver",
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`);
    }

    const data = await response.json();
    return data; // will include _id and walletBalance
  } catch (error) {
    console.error("Error fetching driver wallet:", error);
    return null;
  }
};

export const fetchMyRatings = async () => {
  const user = JSON.parse(localStorage.getItem("driverData") || "{}");
  const token = localStorage.getItem("accessToken");

  if (!user?.type || !user?.id || !token) {
    console.error("Missing user info or token");
    return 5.0;
  }

  try {
    const response = await fetch(
      `${import.meta.env.VITE_API_ENDPOINT}/ride-hail/${user.type}/rating/${
        user.id
      }`,
      {
        method: "GET",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      console.error("Failed to fetch rating, defaulting to 5.0");
      return 5.0;
    }

    const text = await response.text();
    const parsed = Number(text);

    if (!isNaN(parsed)) {
      return parsed;
    } else {
      console.error("Response is not a number, defaulting to 5.0");
      return 5.0;
    }
  } catch (error) {
    console.error("Error fetching rating:", error);
    return 5.0; // fallback
  }
};

import { watchLocation } from "../utils/locationHelpers";

export const postDriverLocation = async (bookingId: string) => {
  const userId = localStorage.getItem("userId");
  const accessToken = localStorage.getItem("accessToken");
  const apiEndpoint = import.meta.env.VITE_API_ENDPOINT;

  if (!userId || !accessToken || !apiEndpoint) {
    console.error("Missing required data in localStorage or environment.");
    return;
  }

  let lastSentTime = 0; // Timestamp of last successful send

  const watchId = watchLocation(
    async (position: { coords: { latitude: number; longitude: number } }) => {
      const now = Date.now();
      if (now - lastSentTime < 30000) {
        return;
      }

      const { latitude, longitude } = position.coords;
      const reqBody = {
        bookingId,
        id: userId,
        location: {
          lat: latitude,
          lng: longitude,
        },
      };

      try {
        const response = await fetch(
          `${apiEndpoint}/ride-hail/driverLocation`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${accessToken}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify(reqBody),
          }
        );

        if (!response.ok) {
          const error = await response.json().catch(() => ({}));
          console.error(
            "Failed to send location:",
            error || response.statusText
          );
        } else {
          const result = await response.json();
          lastSentTime = now; // Update timestamp on success
          console.log("Driver location sent successfully:", result);
        }
      } catch (err) {
        console.error("Error sending driver location:", err);
      }
    }
  );

  return watchId;
};

export const fetchRiderDetails = async (riderId: any) => {
  if (!riderId) return null;

  try {
    const response = await fetch(
      `${import.meta.env.VITE_API_ENDPOINT}/auth/findUser/${riderId}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching rider details:", error);
    return null;
  }
};

export const fetchVersion = async () => {
  try {
    const response = await fetch(
      `${import.meta.env.VITE_API_ENDPOINT}/api/AppVersion`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching rider details:", error);
    return null;
  }
};

export const sendMsg = async (
  riderId: string,
  bookingId: string,
  driverId: string,
  msg: string,
  sender: string
) => {
  if (msg === "") return;
  const token = localStorage.getItem("accessToken");
  try {
    const response = await fetch(
      `${import.meta.env.VITE_API_ENDPOINT}/ride-hail/newMessage`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          riderId,
          bookingId,
          driverId,
          msg,
          sender,
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error sending message:", error);
    // Optionally return or throw the error depending on your needs
    throw error;
  }
};

export const fetchMsgs = async (riderId: string, driverId: string) => {
  const token = localStorage.getItem("accessToken");

  const url = new URL(
    `${
      import.meta.env.VITE_API_ENDPOINT
    }/ride-hail/userMessages/${riderId}/${driverId}`
  );

  try {
    const response = await fetch(url.toString(), {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching messages:", error);
    throw error;
  }
};
