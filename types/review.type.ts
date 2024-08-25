import { Document } from "mongoose";
import { IUser } from "./user.type";
import { IProduct } from "./product.type";

export interface IReview extends Document {
  _id: string;
  userId: string | IUser;
  productId: string | IProduct;
  reviewRating: number;
  reviewContent: string;
  reviewStatus: string | "pending" | "accepted" | "rejected";
  actionDoneBy: string | IUser;
}
