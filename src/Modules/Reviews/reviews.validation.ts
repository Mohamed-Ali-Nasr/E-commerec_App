import Joi from "joi";
import { objectIdRule, ReviewStatus } from "../../Utils";

export const addReview = {
  body: Joi.object({
    productId: Joi.string().custom(objectIdRule).required(),

    rate: Joi.number().min(1).max(5).required(),

    content: Joi.number().optional(),
  }),
};

export const acceptRejectReview = {
  body: Joi.object({
    accept: Joi.string().valid(ReviewStatus.ACCEPTED).optional(),

    reject: Joi.string().valid(ReviewStatus.REJECTED).optional(),
  }),

  params: Joi.object({
    reviewId: Joi.string().custom(objectIdRule).required(),
  }),
};
