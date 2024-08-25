import { NextFunction, RequestHandler, Response } from "express";
import createHttpError from "http-errors";
// models
import { OrderModel, ProductModel, ReviewModel } from "../../../DB/Models";
// types
import { IRequest } from "../../../types";
// utils
import { OrderStatus, ReviewStatus } from "../../Utils";

/**
 * @api {POST} /reviews/add  add a new review
 */
export const addReview = async (
  req: IRequest,
  res: Response,
  next: NextFunction
) => {
  // destructuring the request body
  const { productId, rate, content } = req.body;
  const { userId } = req;

  try {
    // check if this product exists
    const product = await ProductModel.findById(productId);
    if (!product) {
      throw createHttpError(404, "Product not found");
    }

    // check if user already reviewed this product
    const isReviewed = await ReviewModel.findOne({ userId, productId });
    if (isReviewed) {
      throw createHttpError(400, "product is already reviewed");
    }

    // check if user already bought this product
    const isBought = await OrderModel.findOne({
      userId,
      "products.productId": productId,
      orderStatus: OrderStatus.DELIVERED,
    });
    if (!isBought) {
      throw createHttpError(400, "you need to buy this product first");
    }

    // create new Review instance
    const newReview = new ReviewModel({
      userId,
      productId,
      reviewRating: rate,
      reviewContent: content,
    });

    // Save New Review To Database =>
    await newReview.save();

    // send the response
    res.status(201).json({
      status: "success",
      message: "Review added successfully",
      data: newReview,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @api {GET} /reviews  get all reviews
 */
export const listReviews: RequestHandler = async (req, res, next) => {
  try {
    // get all the reviews with product info and user data
    const reviews = await ReviewModel.find().populate([
      { path: "userId", select: "-_id username email" },
      { path: "productId", select: "title rating" },
    ]);

    // send the response
    res.status(200).json({
      status: "success",
      message: "Reviews list",
      data: reviews,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @api {PUT} /reviews/accept-reject/:reviewId  accept or reject the review
 */
export const acceptRejectReview = async (
  req: IRequest,
  res: Response,
  next: NextFunction
) => {
  const { reviewId } = req.params;
  const { accept, reject } = req.body;
  const { userId } = req;

  try {
    // check if the user select one property in the body request, accept or reject
    if (accept && reject) {
      throw createHttpError(
        400,
        "please select one of accept or reject the review"
      );
    }

    // check if review find by id
    const review = await ReviewModel.findById(reviewId);
    if (!review) {
      throw createHttpError(404, "review not found");
    }

    // update the review status in case of accept or reject
    if (accept) {
      review.reviewStatus = ReviewStatus.ACCEPTED;
      review.actionDoneBy = userId!;
    }
    if (reject) {
      review.reviewStatus = ReviewStatus.REJECTED;
      review.actionDoneBy = userId!;
    }

    // Save updated Review To Database =>
    await review.save();

    // get info of user who update the review status
    await review.populate([{ path: "actionDoneBy", select: "username email" }]);

    // send the response
    res.status(201).json({
      status: "success",
      message: "Review status updated successfully",
      data: review,
    });
  } catch (error) {
    next(error);
  }
};
