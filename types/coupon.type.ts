import { Document } from "mongoose";
import { IUser } from "./user.type";

export interface ICoupon extends Document {
  _id: string;
  couponCode: string;
  couponAmount: number;
  couponType: "Percentage" | "Amount";
  from: Date;
  till: Date;
  users: {
    userId: string | IUser;
    maxCount: number;
    usageCount: number;
  }[];
  isEnable: boolean;
  createdBy: string | IUser;
}

export interface ICouponLogs extends Document {
  _id: string;
  couponId: string | ICoupon;
  updatedBy: string | IUser;
  changes: Object;
}
