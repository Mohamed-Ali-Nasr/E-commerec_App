import { Router } from "express";
// middlewares
import * as middleware from "../../Middlewares";
// utils
import { roles } from "../../Utils";
// controllers
import * as controller from "./carts.controller";
// validations
import * as schema from "./carts.validation";

// destruct all used middleware
const { validationMiddleware, authMiddleware, authorization } = middleware;

const cartRouter = Router();

// routes
cartRouter.post(
  "/add/:productId",
  authMiddleware,
  authorization(roles.BUYER),
  validationMiddleware(schema.editCart),
  controller.addToCart
);

cartRouter.put(
  "/remove/:productId",
  authMiddleware,
  authorization(roles.BUYER),
  validationMiddleware(schema.removeFromCart),
  controller.removeFromCart
);

cartRouter.put(
  "/update/:productId",
  authMiddleware,
  authorization(roles.BUYER),
  validationMiddleware(schema.editCart),
  controller.updateCart
);

cartRouter.get(
  "/",
  authMiddleware,
  authorization(roles.BUYER),
  controller.getCart
);

export { cartRouter };
