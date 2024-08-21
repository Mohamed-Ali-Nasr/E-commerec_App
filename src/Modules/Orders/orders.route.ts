import { Router } from "express";
// middlewares
import * as middleware from "../../Middlewares";
// utils
import { roles } from "../../Utils";
// controllers
import * as controller from "./orders.controller";
// validations
import * as schema from "./orders.validation";

// destruct all used middleware
const { validationMiddleware, authMiddleware, authorization } = middleware;

const orderRouter = Router();

// routes
orderRouter.post(
  "/create",
  authMiddleware,
  authorization(roles.BUYER),
  validationMiddleware(schema.createOrder),
  controller.createOrder
);

orderRouter.put(
  "/canceled/:orderId",
  authMiddleware,
  authorization(roles.BUYER),
  validationMiddleware(schema.canceledOrder),
  controller.canceledOrder
);

orderRouter.put(
  "/delivered/:orderId",
  authMiddleware,
  authorization(roles.BUYER),
  validationMiddleware(schema.deliveredOrder),
  controller.deliveredOrder
);

orderRouter.get(
  "/",
  authMiddleware,
  authorization(roles.BUYER),
  controller.listOrders
);

export { orderRouter };
