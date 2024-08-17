import { Document } from "mongoose";
import { IUser } from "./user.type";
import { IProduct } from "./product.type";

export interface ICart extends Document {
  _id: string;
  userId: string | IUser;
  products: {
    productId: string | IProduct;
    quantity: number;
    price: number;
  }[];
  subTotal: number;
}
