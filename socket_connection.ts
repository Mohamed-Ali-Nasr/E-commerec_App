import { establishSocketConnection } from "./src/Utils/socket.io.util";
import http from "http";

export const socket_Connection = (server: http.Server) => {
  const io = establishSocketConnection(server);
  io.on("connection", (socket) => {
    socket.removeAllListeners();
    console.log("User Connected to socket.io");
  });
};
