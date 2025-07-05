import { io, Socket } from "socket.io-client";

const URL = import.meta.env.VITE_API_ENDPOINT;
let socket: Socket | null = null;

const eventList = [
  "alerts",
  "all_users",
  "ride_updated",
  "booking_data",
  "driver_data",
  "rider_data",
  "booking_expired",
];

const logEvent = (event: string) => () => console.log(`Socket ${event}`);

export const connectSocket = (userId: string): void => {
  if (socket) return; // Reuse existing connection

  socket = io(URL);

  socket.on("connect", () => {
    console.log("Socket connected:", socket?.id);
    socket?.emit("iAmDriver", userId);
  });

  socket.on("disconnect", logEvent("disconnected"));

  eventList.forEach((event) => {
    socket?.off(event);

    socket?.on(event, logEvent(event)); // fallback listener
  });
};

export const fetchAllUserIds = (): Promise<string[]> => {
  return new Promise((resolve) => {
    if (!socket) return resolve([]);

    socket.once("all_users", (data) => {
      const ids = data?.users?.map((user: any) => user._id) || [];
      // console.log("User IDs from all_users:", ids);
      // console.log("All User Data Socket:", data);
      resolve(ids);
    });
  });
};

export const disconnectSocket = () => {
  if (socket) {
    socket.off();
    socket.disconnect();
    socket = null;
  }
};

export { socket };
