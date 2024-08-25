import { Router } from "express";
// middlewares
import * as middleware from "../../Middlewares";
// utils
import { roles } from "../../Utils";
// controllers
import * as controller from "./reviews.controller";
// validations
import * as schema from "./reviews.validation";

// destruct all used middleware
const { validationMiddleware, authMiddleware, authorization } = middleware;

const reviewRouter = Router();

// routes
reviewRouter.post(
  "/add",
  authMiddleware,
  authorization(roles.BUYER),
  validationMiddleware(schema.addReview),
  controller.addReview
);

reviewRouter.get(
  "/",
  authMiddleware,
  authorization(roles.BUYER_ADMIN),
  controller.listReviews
);

reviewRouter.put(
  "/accept-reject/:reviewId",
  authMiddleware,
  authorization(roles.ADMIN),
  validationMiddleware(schema.acceptRejectReview),
  controller.acceptRejectReview
);

export { reviewRouter };
