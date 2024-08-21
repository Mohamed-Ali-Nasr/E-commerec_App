import { NextFunction, RequestHandler, Response } from "express";
import createHttpError from "http-errors";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
// utils
import { env, generateOTP, generateTokens, sendEmail } from "../../Utils";
// models
import { AddressModel, UserModel } from "../../../DB/Models";
// types
import { IRequest } from "../../../types";

/**
 * @api {POST} /user/signup  Register a new User
 */
export const signup: RequestHandler = async (req, res, next) => {
  const {
    username,
    email,
    password,
    userType,
    age,
    gender,
    phone,
    country,
    city,
    postalCode,
    buildingNumber,
    floorNumber,
    addressLabel,
  } = req.body;
  try {
    // Check If Email Exists In Database =>
    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      throw createHttpError(
        400,
        "User Already Exists. Please Choose a Different Or Log In Instead."
      );
    }

    // create new user instance
    const newUser = new UserModel({
      username,
      email,
      password,
      userType,
      age,
      gender,
      phone,
    });

    // create new Address instance
    const newAddress = new AddressModel({
      userId: newUser._id,
      country,
      city,
      postalCode,
      buildingNumber,
      floorNumber,
      addressLabel,
      isDefault: true,
    });

    // Generate Token For New User =>
    const token = jwt.sign({ userId: newUser._id }, env.JWT_VERIFIED_EMAIL, {
      expiresIn: "10m",
    });

    // Generate Email Confirmation Link =>
    const confirmationLink = `${req.protocol}://${req.headers.host}/users/verify-email/${token}`;

    // Sending Email To Verify If Email Is Valid =>
    const isEmailSent = await sendEmail({
      to: email as string,
      subject: "Welcome To E-commerce App, Verify Your Email Address",
      textMessage: "Please Verify Your Email Address",
      htmlMessage: `<a href=${confirmationLink}>Please Verify Your Email Address</a>`,
    });
    if (isEmailSent.rejected.length) {
      throw createHttpError(500, "Verification Email Sending Is Failed");
    }

    // Save New User To Database =>
    await newUser.save();

    // Save New Address To Database =>
    await newAddress.save();

    // send the response
    res.status(201).json({
      status: "success",
      message:
        "user created successfully, Please Verify your email First And Then Login Again",
      user: newUser,
      address: newAddress,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @api {GET} /users/verify-email/:token  verify email added when user signed up
 */
export const verifyEmail: RequestHandler = async (req, res, next) => {
  const { token } = req.params;

  try {
    // Verify Token Param To Get The data
    const data = jwt.verify(token, env.JWT_VERIFIED_EMAIL);

    // Find The User Account And Update isEmailVerified State =>
    const confirmedUser = await UserModel.findOneAndUpdate(
      { _id: (data as any)?.userId, isEmailVerified: false },
      { isEmailVerified: true },
      { new: true }
    ).select("_id username email isEmailVerified");

    // Check If The User Account Not Exist =>
    if (!confirmedUser) {
      throw createHttpError(404, "No Users Found By This Id");
    }

    // send the response
    res.status(201).json({
      status: "success",
      message: "User Verified Successfully",
      data: confirmedUser,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @api {POST} /users/signin  signin user account
 */
export const signin: RequestHandler = async (req, res, next) => {
  const { email, password } = req.body;

  try {
    // Find User By Email =>
    const user = await UserModel.findOne({ email });
    if (!user) {
      throw createHttpError(400, "Invalid Email Or Password.");
    }

    // compare password =>
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw createHttpError(400, "Invalid Email Or Password.");
    }

    // Ensure User Email Is Already Verified =>
    if (!user.isEmailVerified) {
      throw createHttpError(
        400,
        "Your Email Address Is Not Verified Yet, Please Verify It First And Then Login Again"
      );
    }

    // Generate Token For Existing User =>
    const { accessToken } = await generateTokens(user);

    // send the response
    res.status(201).json({
      status: "success",
      message: "user logged in Successfully",
      data: user,
      token: accessToken,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @api {PATCH} /users/update-password  update password
 */
export const updatePassword = async (
  req: IRequest,
  res: Response,
  next: NextFunction
) => {
  const { authUser } = req;
  const { password } = req.body;

  try {
    // Update The Old Password With New Password =>
    if (password) {
      authUser!.password = password;
    }

    // Save New Password Account To Database =>
    await authUser?.save();

    // send the response
    res.status(201).json({
      status: "success",
      message: "Password Updated Successfully",
      data: authUser,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @api {POST} /users/forget-password  forget password
 */
export const forgetPassword: RequestHandler = async (req, res, next) => {
  const { email } = req.body;

  try {
    // Find User By Email =>
    const user = await UserModel.findOne({ email });
    if (!user) {
      throw createHttpError(400, "No User Account Found By This Email");
    }

    // Generate OTP =>
    const otp = generateOTP();

    // Hashed Otp =>
    const hashedOtp = crypto.createHash("sha256").update(otp).digest("hex");

    // Save OTP To Database With Expiration Time =>
    await UserModel.findOneAndUpdate(
      { email },
      { otp: hashedOtp, otpExpires: new Date(Date.now() + 300000) } // OTP expires in 5 minutes
    );

    // Send OTP To User's Email =>
    const isEmailSent = await sendEmail({
      to: email as string,
      subject: "Password Reset Instructions",
      textMessage: "Reset Your Password",
      htmlMessage: `Your OTP is: ${otp}`,
    });
    if (isEmailSent.rejected.length) {
      throw createHttpError(500, "Verification Email Sending Is Failed");
    }

    // send the response
    res.status(201).json({
      status: "success",
      message: "OTP Sent To Your Email Successfully, Please Reset Password",
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @api {POST} /users/reset-password  reset password
 */
export const resetPassword: RequestHandler = async (req, res, next) => {
  const { email, otp, newPassword } = req.body;

  try {
    // Find User By Email In Database =>
    const user = await UserModel.findOne({ email });
    // Check If The User Account Not Exist =>
    if (!user) {
      throw createHttpError(404, "No Users Found By This Id");
    }

    // Hashed Otp =>
    const hashedOtp = crypto.createHash("sha256").update(otp).digest("hex");

    // Check If OTP Is Correct And Not Expired =>
    if (user.otp !== hashedOtp || user.otpExpires! < new Date()) {
      throw createHttpError(400, "Invalid or expired OTP");
    }

    // Update The Old Password With The New Password =>
    user.password = newPassword;
    user.otp = null;
    user.otpExpires = null;

    await user.save();

    // send the response
    res.status(201).json({
      status: "success",
      message: "New Password Is Updated Successfully, You Can Signin Now",
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @api {GET} /users/user-info  information data of logged in user
 */
export const getUserAccountData = async (
  req: IRequest,
  res: Response,
  next: NextFunction
) => {
  const { userId } = req;

  try {
    // Find User Account By Id =>
    const userAccount = await UserModel.findById(userId).select(
      "_id username email userType age gender phone"
    );

    // Check If User Account Not Exists In Database =>
    if (!userAccount) {
      throw createHttpError(404, "No User Account Found By This Id");
    }

    // send the response
    res.status(201).json({
      status: "success",
      message: "user account found",
      data: userAccount,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @api {PUT} /users/update-user  update data of logged in user
 */
export const updateUser = async (
  req: IRequest,
  res: Response,
  next: NextFunction
) => {
  const { userId } = req;
  const { username, email, age, phone } = req.body;

  try {
    // Find User Account By Id =>
    const user = await UserModel.findById(userId).select(
      "_id username email userType age gender phone"
    );

    // Check If User Account Not Exists In Database =>
    if (!user) {
      throw createHttpError(404, "No User Account Found By This Id");
    }

    // Verify User Account Email Address If You Updated It =>
    if (email) {
      // Check If updated Email Exists In Database =>
      const existingEmail = await UserModel.findOne({ email });
      if (existingEmail) {
        throw createHttpError(
          400,
          "Email Already Exists. Please Choose a Different email"
        );
      }

      // Change Email verification Of Account  =>
      user.isEmailVerified = false;
      await user.save();

      // Generate Token For Updated User Account =>
      const token = jwt.sign({ userId }, env.JWT_VERIFIED_EMAIL, {
        expiresIn: "5m",
      });

      // Generate Email Confirmation Link =>
      const confirmationLink = `${req.protocol}://${req.headers.host}/users/verify-email/${token}`;
      // Sending Email To Verify If Email Is Valid =>
      const isEmailSent = await sendEmail({
        to: email as string,
        subject: "Welcome To Job Search App, Verify Your Email Address",
        textMessage: "Please Verify Your Email Address",
        htmlMessage: `<a href=${confirmationLink}>Please Verify Your Email Address</a>`,
      });
      if (isEmailSent.rejected.length) {
        throw createHttpError(500, "Verification Email Sending Is Failed");
      }

      // send the response
      res.status(201).json({
        status: "success",
        message:
          "You May Want To Update Your Email Address Please Verify It First And Then Login Again",
      });

      user.email = email;
      await user.save();
    }

    // Check If Username Is Updated =>
    if (username) {
      user.username = username;
    }

    // Check If age Is Updated =>
    if (age) {
      user.age = age;
    }

    // Check If phone Is Updated =>
    if (phone) {
      user.phone = phone;
    }

    // Save Updated User Account To Database =>
    await user.save();

    // send the response
    res.status(201).json({
      status: "success",
      message: "user updated successfully",
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @api {PATCH} /users/soft-delete-user  soft delete of logged in user
 */
export const softDeleteUser = async (
  req: IRequest,
  res: Response,
  next: NextFunction
) => {
  const { authUser } = req;

  try {
    // Change isMarkedAsDeleted state Of user Account =>
    authUser!.isMarkedAsDeleted = true;

    // Save New isMarkedAsDeleted state of user Account To Database =>
    await authUser?.save();

    // send the response
    res.status(201).json({
      status: "success",
      message: "Account Is Soft Deleted Successfully",
      data: authUser,
    });
  } catch (error) {
    next(error);
  }
};
