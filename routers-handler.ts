import { json, Express } from "express";
import cors from "cors";
import { corsOptions } from "./src/config/corsOptions";
import * as router from "./src/Modules";
import { authMiddleware, globalResponse } from "./src/Middlewares";
import createHttpError from "http-errors";
import morgan from "morgan";
import { createHandler } from "graphql-http/lib/use/express";
import { mainSchema } from "./src/GraphQl/Schema";

export const routerHandler = (app: Express) => {
  app.use(morgan("dev"));
  app.use(cors(corsOptions));
  app.use(json());

  // GraphQL Routes
  app.use("/graphql", createHandler({ schema: mainSchema }));

  // Rest API Routes
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
};
