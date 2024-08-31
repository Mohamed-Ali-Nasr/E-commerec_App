import http from "http";
import { Server } from "socket.io";
import { allowedOrigins } from "../config/allowedOrigins";

let io: Server;

// establish socket.io connection
export const establishSocketConnection = (server: http.Server) => {
  io = new Server(server, {
    pingTimeout: 6000,
    cors: {
      origin: allowedOrigins,
      credentials: true,
    },
  });

  return io;
};

// return io parameter
export const getSocketIO = () => {
  return io;
};
