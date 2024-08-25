import mongoose, { Schema, model } from "mongoose";
import { IOrder, IProduct } from "../../types";
import { OrderStatus, PaymentMethod } from "../../src/Utils";
import { CouponModel } from "./coupon.model";
import { ProductModel } from "./product.model";

const OrderSchema = new Schema<IOrder>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    products: [
      {
        productId: {
          type: Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        quantity: { type: Number, required: true, default: 1, min: 1 },
        price: { type: Number, required: true },
      },
    ],

    fromCart: { type: Boolean, default: true },

    address: { type: String },

    addressId: { type: Schema.Types.ObjectId, ref: "Address" },

    contactNumber: { type: String, required: true },

    subTotal: { type: Number, required: true },

    shippingFee: { type: Number, required: true },

    VAT: { type: Number, required: true },

    couponId: { type: Schema.Types.ObjectId, ref: "Coupon" },

    total: { type: Number, required: true },

    estimatedDeliveryDate: { type: Date, required: true },

    paymentMethod: {
      type: String,
      required: true,
      enum: Object.values(PaymentMethod),
    },

    orderStatus: {
      type: String,
      required: true,
      enum: Object.values(OrderStatus),
    },

    deliveredBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },

    canceledBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },

    deliveredAt: { type: Date },

    canceledAt: { type: Date },

    payment_intent: { type: String },
  },
  { timestamps: true }
);

// apply document middleware on order model after save in database
OrderSchema.post("save", async function (doc, next) {
  if (
    doc.orderStatus === OrderStatus.PENDING ||
    doc.orderStatus === OrderStatus.CONFIRMED ||
    doc.orderStatus === OrderStatus.PLACED
  ) {
    // decrement the stock of th product
    for (const product of doc.products) {
      await ProductModel.updateOne(
        { _id: (product.productId as IProduct)._id },
        { $inc: { stock: -product.quantity } }
      );
    }

    // increment the usage count of coupon if the user has a coupon
    if (doc.couponId) {
      const coupon = await CouponModel.findById(doc.couponId);

      const userCoupon = coupon?.users.find(
        (u) => u.userId.toString() === doc.userId.toString()
      );
      userCoupon!.usageCount++;

      await coupon?.save();
    }
  }

  if (doc.orderStatus === OrderStatus.CANCELED) {
    // increment the stock of th product
    for (const product of doc.products) {
      await ProductModel.updateOne(
        { _id: product.productId },
        { $inc: { stock: product.quantity } }
      );
    }

    // decrement the usage count of coupon if the user has a coupon
    if (doc.couponId) {
      const coupon = await CouponModel.findById(doc.couponId);

      const userCoupon = coupon?.users.find(
        (u) => u.userId.toString() === doc.userId.toString()
      );
      userCoupon!.usageCount--;

      await coupon?.save();
    }
  }

  next();
});

export type IOrderSchema = mongoose.Document & IOrder;

export const OrderModel =
  model<IOrderSchema>("Order", OrderSchema) || mongoose.models.Order;
