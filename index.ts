import "dotenv/config";
import express from "express";
import http from "http";
import createHttpError from "http-errors";
import morgan from "morgan";
import { disableCouponsCron, env } from "./src/Utils";
import db_connection from "./DB/connection";
import { globalResponse } from "./src/Middlewares";
import * as router from "./src/Modules";
import cors from "cors";
import { corsOptions } from "./src/config/corsOptions";
import { establishSocketConnection } from "./src/Utils/socket.io.util";

/* Configuration and Middlewares */
const app = express();
app.use(express.json());
app.use(morgan("dev"));
app.use(cors(corsOptions));

/* Creating Server */
const PORT = env.PORT || 8080;
const server = http.createServer(app);
server.listen(PORT, () => {
  console.log(`Server running on port: ${PORT}`);
});
app.get("/", (req, res) => res.send("Hello World"));

/* Socket Connection */
const io = establishSocketConnection(server);

io.on("connection", (socket) => {
  socket.removeAllListeners();
  console.log("User Connected to socket.io");
});

/* Mongoose Connection */
db_connection();

/* Cron Jobs Handler */
disableCouponsCron();

/* Routes */
app.use("/categories", router.categoryRouter);
app.use("/sub-categories", router.subCategoryRouter);
app.use("/brands", router.brandRouter);
app.use("/products", router.productRouter);
app.use("/users", router.userRouter);
app.use("/addresses", router.addressRouter);
app.use("/carts", router.cartRouter);
app.use("/coupons", router.couponRouter);
app.use("/orders", router.orderRouter);
app.use("/reviews", router.reviewRouter);

/* Handle Any Unknown Route */
app.use("*", (req, res, next) => {
  res.status(404).json({ message: "Route Not Found" });
});

/* Error Handling */
app.use((req, res, next) => {
  next(createHttpError(404, "Endpoint not found"));
});
app.use(globalResponse);
