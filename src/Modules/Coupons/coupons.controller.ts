import { NextFunction, RequestHandler, Response } from "express";
import createHttpError from "http-errors";
// models
import { CouponLogsModel, CouponModel, UserModel } from "../../../DB/Models";
// types
import { ICoupon, IRequest } from "../../../types";
// utils
import { getSocketIO } from "../../Utils";

/**
 * @api {POST} /coupons/create  create a new coupon
 */
export const createCoupon = async (
  req: IRequest,
  res: Response,
  next: NextFunction
) => {
  // destructuring the request body
  const { couponCode, couponAmount, couponType, from, till, users } = req.body;
  const { userId } = req;

  try {
    // check if coupon code is exist in database
    const isCouponCodeExist = await CouponModel.findOne({ couponCode });
    if (isCouponCodeExist) {
      throw createHttpError(400, "coupon code already exists");
    }

    // check if userIds in users list are include in user model
    const userIds = users.map((u: { userId: string }) => u.userId);
    const validUsers = await UserModel.find({ _id: { $in: userIds } });
    if (userIds.length !== validUsers.length) {
      throw createHttpError(400, "invalid users");
    }

    // create new Coupon instance
    const newCoupon = new CouponModel({
      couponCode,
      couponAmount,
      couponType,
      from,
      till,
      users,
      createdBy: userId,
    });

    // Save New Coupon To Database =>
    await newCoupon.save();

    // socket event to notify client when coupon is added
    getSocketIO().on("new coupon", (coupon: ICoupon) => {
      coupon.users.forEach((u) => {
        users.forEach((user: any) => {
          if (u.userId.toString() === user.userId.toString()) {
            getSocketIO().to(user.userId).emit("coupon added", {
              message: "new coupon is added",
              maxCount: user.maxCount,
            });
          }
        });
      });
    });

    // send the response
    res.status(201).json({
      status: "success",
      message: "Coupon created successfully",
      data: newCoupon,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @api {GET} /coupons  get all coupons
 */
export const getAllCoupons: RequestHandler = async (req, res, next) => {
  const { isEnable } = req.query;

  try {
    // check if isEnable query is true or false then add it to queryFilter object
    const queryFilter: any = {};
    if (isEnable) queryFilter.isEnable = isEnable === "true" ? true : false;

    // find coupons that match the query filter criteria
    const coupons = await CouponModel.find(queryFilter);

    // check if coupons list is empty
    if (coupons.length < 1) {
      throw createHttpError(404, "no coupons found yet");
    }

    // send the response
    res.status(201).json({
      status: "success",
      message: "Coupons found successfully",
      data: coupons,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @api {GET} /coupons/details/:couponId  get coupon by couponId
 */
export const getCouponById: RequestHandler = async (req, res, next) => {
  const { couponId } = req.params;

  try {
    // find coupon by couponId in database
    const coupon = await CouponModel.findById(couponId);

    // check if coupon not found in database
    if (!coupon) {
      throw createHttpError(404, "Coupon not found");
    }

    // send the response
    res.status(201).json({
      status: "success",
      message: "Coupon found successfully",
      data: coupon,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @api {PUT} /coupons/update/:couponId  update coupon by couponId
 */
export const updateCoupon = async (
  req: IRequest,
  res: Response,
  next: NextFunction
) => {
  // destructuring the request body
  const { couponCode, couponAmount, couponType, from, till, users } = req.body;
  const { userId } = req;
  const { couponId } = req.params;

  try {
    // find coupon by couponId in database
    const coupon = await CouponModel.findById(couponId);

    // check if coupon not found in database
    if (!coupon) {
      throw createHttpError(404, "Coupon not found");
    }

    // create log updated object with fields you want to update
    const logUpdatedObject = {
      couponId,
      updatedBy: userId,
      changes: {} as any,
    };

    if (couponCode) {
      // check if coupon code is exist in database
      const isCouponCodeExist = await CouponModel.findOne({ couponCode });
      if (isCouponCodeExist) {
        throw createHttpError(400, "coupon code already exists");
      }

      // if coupon not exist in database, update it
      coupon.couponCode = couponCode;

      // save updated coupon code in log updated object
      logUpdatedObject.changes.couponCode = couponCode;
    }

    if (couponAmount) {
      coupon.couponAmount = couponAmount;
      logUpdatedObject.changes.couponAmount = couponAmount;
    }

    if (couponType) {
      coupon.couponType = couponType;
      logUpdatedObject.changes.couponType = couponType;
    }

    if (from) {
      coupon.from = from;
      logUpdatedObject.changes.from = from;
    }

    if (till) {
      coupon.till = till;
      logUpdatedObject.changes.till = till;
    }

    if (users) {
      // check if userIds in users list are include in user model
      const userIds = users.map((u: { userId: string }) => u.userId);
      const validUsers = await UserModel.find({ _id: { $in: userIds } });
      if (userIds.length !== validUsers.length) {
        throw createHttpError(400, "invalid users");
      }

      coupon.users = users;
      logUpdatedObject.changes.users = users;
    }

    // Save Updated Coupon To Database =>
    await coupon.save();

    // create new log instance
    const couponLogs = new CouponLogsModel(logUpdatedObject);

    // Save Coupon Change Log To Database =>
    await couponLogs.save();

    // send the response
    res.status(201).json({
      status: "success",
      message: "Coupon Updated successfully",
      data: { coupon, couponLogs },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @api {PATCH} /coupons/enable/:couponId  disable or enable coupon
 */
export const disableEnableCoupon = async (
  req: IRequest,
  res: Response,
  next: NextFunction
) => {
  const { enable } = req.body;
  const { userId } = req;
  const { couponId } = req.params;

  try {
    // find coupon by couponId in database
    const coupon = await CouponModel.findById(couponId);

    // check if coupon not found in database
    if (!coupon) {
      throw createHttpError(404, "Coupon not found");
    }

    // create log updated object with fields you want to update
    const logUpdatedObject = {
      couponId,
      updatedBy: userId,
      changes: {} as any,
    };

    if (enable === true) {
      coupon.isEnable = true;
      logUpdatedObject.changes.isEnable = true;
    }

    if (enable === false) {
      coupon.isEnable = false;
      logUpdatedObject.changes.isEnable = false;
    }

    // Save Updated Coupon To Database =>
    await coupon.save();

    // create new log instance
    const couponLogs = new CouponLogsModel(logUpdatedObject);

    // Save Coupon Change Log To Database =>
    await couponLogs.save();

    // send the response
    res.status(201).json({
      status: "success",
      message: "Coupon Updated successfully",
      data: { coupon, couponLogs },
    });
  } catch (error) {
    next(error);
  }
};
