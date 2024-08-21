import { Router } from "express";
// middlewares
import * as middleware from "../../Middlewares";
// utils
import { roles } from "../../Utils";
// controllers
import * as controller from "./coupons.controller";
// validations
import * as schema from "./coupons.validation";

// destruct all used middleware
const { validationMiddleware, authMiddleware, authorization } = middleware;

const couponRouter = Router();

// routes
couponRouter.post(
  "/create",
  authMiddleware,
  authorization(roles.ADMIN),
  validationMiddleware(schema.createCoupon),
  controller.createCoupon
);

couponRouter.get(
  "/",
  authMiddleware,
  authorization(roles.ADMIN),
  validationMiddleware(schema.getAllCoupons),
  controller.getAllCoupons
);

couponRouter.get(
  "/details/:couponId",
  authMiddleware,
  authorization(roles.ADMIN),
  validationMiddleware(schema.getCouponById),
  controller.getCouponById
);

couponRouter.put(
  "/update/:couponId",
  authMiddleware,
  authorization(roles.ADMIN),
  validationMiddleware(schema.updateCoupon),
  controller.updateCoupon
);

couponRouter.patch(
  "/enable/:couponId",
  authMiddleware,
  authorization(roles.ADMIN),
  validationMiddleware(schema.disableEnableCoupon),
  controller.disableEnableCoupon
);

export { couponRouter };
