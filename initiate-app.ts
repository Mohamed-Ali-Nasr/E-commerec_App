import "dotenv/config";
import express from "express";
import http from "http";
import { env } from "./src/Utils";
import db_connection from "./DB/connection";
import { routerHandler } from "./routers-handler";
import { cronHandler } from "./crons-handler";
import { socket_Connection } from "./socket_connection";

export const main = () => {
  /* Creating Server */
  const app = express();
  const PORT = env.PORT || 8080;
  const server = http.createServer(app);

  /* Routers Handling */
  routerHandler(app);

  /* Mongoose Connection */
  db_connection();

  /* Socket Connection */
  socket_Connection(server);

  /* Cron Jobs Handler */
  cronHandler();

  server.listen(PORT, () => {
    console.log(`Server running on port: ${PORT}`);
  });
  app.get("/", (req, res) => res.send("Hello World"));
};
