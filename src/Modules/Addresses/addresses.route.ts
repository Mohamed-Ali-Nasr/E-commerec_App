import { Router } from "express";
// middlewares
import * as middleware from "../../Middlewares";
// utils
import { roles } from "../../Utils";
// controllers
import * as controller from "./addresses.controller";
// validations
import * as schema from "./addresses.validation";

// destruct all used middleware
const { validationMiddleware, authMiddleware, authorization } = middleware;

const addressRouter = Router();

// routes
addressRouter.post(
  "/add",
  authMiddleware,
  authorization(roles.BUYER),
  validationMiddleware(schema.addAddress),
  controller.addAddress
);

addressRouter.put(
  "/edit/:addressId",
  authMiddleware,
  authorization(roles.BUYER),
  validationMiddleware(schema.editAddress),
  controller.editAddress
);

addressRouter.get(
  "/",
  authMiddleware,
  authorization(roles.BUYER),
  controller.getAllAddresses
);

addressRouter.patch(
  "/soft-delete/:addressId",
  authMiddleware,
  authorization(roles.BUYER),
  validationMiddleware(schema.removeAddress),
  controller.removeAddress
);

export { addressRouter };
