export interface Message {
  _id?: string;
  bookingId: string;
  driverId: string;
  riderId: string;
  sender: "driver" | "rider";
  msg: string;
  createdAt?: string;
}

export interface ChatPageProps {
  riderId: string;
  driverId: string;
  bookingId: string;
  sender: "driver";
}
