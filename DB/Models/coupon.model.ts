import mongoose, { Schema, model } from "mongoose";
import { ICoupon, ICouponLogs } from "../../types";
import { CouponType } from "../../src/Utils";

// Create Coupon Schema object
const CouponSchema = new Schema<ICoupon>(
  {
    couponCode: { type: String, required: true, unique: true },

    couponAmount: { type: Number, required: true },

    couponType: {
      type: String,
      required: true,
      enum: Object.values(CouponType),
    },

    from: { type: Date, required: true },

    till: { type: Date, required: true },

    users: [
      {
        userId: {
          type: Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        maxCount: { type: Number, required: true, min: 1 },
        usageCount: { type: Number, default: 0 },
      },
    ],

    isEnable: { type: Boolean, default: true },

    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

export type ICouponSchema = mongoose.Document & ICoupon;

export const CouponModel =
  model<ICouponSchema>("Coupon", CouponSchema) || mongoose.models.Coupon;

// Create Coupon Change Log Table
const CouponLogsSchema = new Schema<ICouponLogs>(
  {
    couponId: {
      type: Schema.Types.ObjectId,
      ref: "Coupon",
      required: true,
    },

    updatedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    changes: { type: Object, required: true },
  },
  { timestamps: true }
);

export type ICouponLogsSchema = mongoose.Document & ICouponLogs;

export const CouponLogsModel =
  model<ICouponLogsSchema>("CouponLogs", CouponLogsSchema) ||
  mongoose.models.CouponLogs;
