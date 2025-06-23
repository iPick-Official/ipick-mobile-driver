import { io, Socket } from "socket.io-client";

const URL = import.meta.env.VITE_API_ENDPOINT;
let socket: Socket | null = null;

export const connectSocket = (userId: string) => {
  if (socket) {
    socket.emit("iAmDriver", userId);
    return;
  }

  socket = io(URL);

  socket.on("connect", () => {
    console.log("Socket connected:", socket?.id);
    socket?.emit("iAmDriver", userId);
  });

  socket.on("disconnect", () => {
    console.log("Socket disconnected");
  });
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

// Export socket instance so you can add event listeners in components
export { socket };
