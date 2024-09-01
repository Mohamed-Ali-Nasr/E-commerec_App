import { Router } from "express";
// middlewares
import * as middleware from "../../Middlewares";
// utils
import { roles } from "../../Utils";
// controllers
import * as controller from "./users.controller";
// validations
import * as schema from "./users.validation";

// destruct all used middleware
const { validationMiddleware, authMiddleware, authorization } = middleware;

const userRouter = Router();

// routes
userRouter.post(
  "/signup",
  validationMiddleware(schema.signup),
  controller.signup
);

userRouter.get(
  "/verify-email/:token",
  validationMiddleware(schema.verifyEmail),
  controller.verifyEmail
);

userRouter.post(
  "/signin",
  validationMiddleware(schema.signin),
  controller.signin
);

userRouter.patch(
  "/update-password",
  authMiddleware,
  validationMiddleware(schema.updatePassword),
  controller.updatePassword
);

userRouter.post(
  "/forget-password",
  validationMiddleware(schema.forgetPassword),
  controller.forgetPassword
);

userRouter.post(
  "/reset-password",
  validationMiddleware(schema.resetPassword),
  controller.resetPassword
);

userRouter.get("/user-info", authMiddleware, controller.getUserAccountData);

userRouter.put(
  "/update-user",
  authMiddleware,
  validationMiddleware(schema.updateUser),
  controller.updateUser
);

userRouter.patch("/soft-delete", authMiddleware, controller.softDeleteUser);

userRouter.post(
  "/loginWithGoogle",
  validationMiddleware(schema.loginWithGoogle),
  controller.loginWithGoogle
);

export { userRouter };
