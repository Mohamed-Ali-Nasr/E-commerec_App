import { Router } from "express";
// middlewares
import {
  authMiddleware,
  authorization,
  validationMiddleware,
} from "../../Middlewares";
// utils
import { roles } from "../../Utils";
// controllers
import {
  forgetPassword,
  getUserAccountData,
  hardDeleteUser,
  resetPassword,
  signin,
  signup,
  softDeleteUser,
  updatePassword,
  updateUser,
  verifyEmail,
} from "./users.controller";
// validations
import {
  forgetPasswordSchema,
  resetPasswordSchema,
  signinSchema,
  signupSchema,
  updatePasswordSchema,
  updateUserSchema,
  verifyEmailSchema,
} from "./users.validation";

const userRouter = Router();

// routes
userRouter.post("/signup", validationMiddleware(signupSchema), signup);

userRouter.get(
  "/verify-email/:token",
  validationMiddleware(verifyEmailSchema),
  verifyEmail
);

userRouter.post("/signin", validationMiddleware(signinSchema), signin);

userRouter.patch(
  "/update-password",
  authMiddleware,
  validationMiddleware(updatePasswordSchema),
  updatePassword
);

userRouter.post(
  "/forget-password",
  validationMiddleware(forgetPasswordSchema),
  forgetPassword
);

userRouter.post(
  "/reset-password",
  validationMiddleware(resetPasswordSchema),
  resetPassword
);

userRouter.get("/user-info", authMiddleware, getUserAccountData);

userRouter.put(
  "/update-user",
  authMiddleware,
  validationMiddleware(updateUserSchema),
  updateUser
);

userRouter.patch("/soft-delete", authMiddleware, softDeleteUser);

userRouter.delete(
  "/hard-delete",
  authMiddleware,
  authorization(roles.ADMIN),
  hardDeleteUser
);

export { userRouter };
