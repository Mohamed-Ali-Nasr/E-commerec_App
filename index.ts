import "dotenv/config";
import express from "express";
import http from "http";
import createHttpError from "http-errors";
import morgan from "morgan";
import { env } from "./src/Utils";
import db_connection from "./DB/connection";
import { globalResponse } from "./src/Middlewares";
import * as router from "./src/Modules";

/* Configuration and Middlewares */
const app = express();
app.use(express.json());
app.use(morgan("dev"));

/* Creating Server */
const PORT = env.PORT || 8080;
const server = http.createServer(app);
server.listen(PORT, () => {
  console.log(`Server running on port: ${PORT}`);
});
app.get("/", (req, res) => res.send("Hello World"));

/* Mongoose Connection */
db_connection();

/* Routes */
app.use("/categories", router.categoryRouter);
app.use("/sub-categories", router.subCategoryRouter);
app.use("/brands", router.brandRouter);
app.use("/products", router.productRouter);
app.use("/users", router.userRouter);
app.use("/addresses", router.addressRouter);
app.use("/carts", router.cartRouter);

/* Error Handling */
app.use((req, res, next) => {
  next(createHttpError(404, "Endpoint not found"));
});
app.use(globalResponse);
