import mongoose, { Schema, model } from "mongoose";
import { IReview } from "../../types";
import { ReviewStatus } from "../../src/Utils";

const ReviewSchema = new Schema<IReview>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    productId: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },

    reviewRating: { type: Number, required: true, min: 1, max: 5 },

    reviewContent: { type: String },

    reviewStatus: {
      type: String,
      required: true,
      enum: Object.values(ReviewStatus),
      default: ReviewStatus.PENDING,
    },

    actionDoneBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

export type IReviewSchema = mongoose.Document & IReview;

export const ReviewModel =
  model<IReviewSchema>("Review", ReviewSchema) || mongoose.models.Review;
