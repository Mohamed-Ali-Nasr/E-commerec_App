import mongoose, { Schema, model } from "mongoose";
import { ICart } from "../../types";
import { calculateCartSubTotal } from "../../src/Modules/Carts/carts.util";

const CartSchema = new Schema<ICart>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },

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

    subTotal: { type: Number },
  },
  { timestamps: true }
);

// apply document middleware on cart model by calculate cart subTotal before save in database
CartSchema.pre("save", async function (next) {
  this.subTotal = calculateCartSubTotal(this.products);

  next();
});

// apply document middleware on cart model by delete cart if products list is empty after save in database
CartSchema.post("save", async function (doc, next) {
  if (doc.products.length === 0) {
    await CartModel.deleteOne({ userId: doc.userId });
  }

  next();
});

export type ICartSchema = mongoose.Document & ICart;

export const CartModel =
  model<ICartSchema>("Cart", CartSchema) || mongoose.models.Cart;
