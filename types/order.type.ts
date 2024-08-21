import { Document } from "mongoose";
import { IUser } from "./user.type";
import { IProduct } from "./product.type";
import { IAddress } from "./address.type";
import { ICoupon } from "./coupon.type";

export interface IOrder extends Document {
  _id: string;
  userId: string | IUser;
  products: {
    productId: string | IProduct;
    quantity: number;
    price: number;
  }[];
  fromCart: boolean;
  address: string;
  addressId: string | IAddress;
  contactNumber: string;
  subTotal: number;
  shippingFee: number;
  VAT: number;
  couponId: string | ICoupon;
  total: number;
  estimatedDeliveryDate: Date;
  paymentMethod: "stripe" | "paymob" | "cash";
  orderStatus:
    | string
    | "pending"
    | "placed"
    | "confirmed"
    | "canceled"
    | "refunded"
    | "delivered"
    | "returned"
    | "dropped"
    | "on_way";

  deliveredBy: string | IUser;
  canceledBy: string | IUser;
  deliveredAt: Date;
  canceledAt: Date;
  createdAt: Date;
}
