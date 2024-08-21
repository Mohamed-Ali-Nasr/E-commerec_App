import Joi from "joi";
import { CouponType, EnableCoupon, objectIdRule } from "../../Utils";

export const createCoupon = {
  body: Joi.object({
    couponCode: Joi.string().required(),

    couponAmount: Joi.number()
      .when("couponType", {
        is: Joi.string().valid(CouponType.PERCENTAGE),
        then: Joi.number().max(100).required(),
      })
      .min(1)
      .messages({
        "number.min": "Coupon amount must be greater than 1",
        "number.max": "Coupon amount must be less than 100",
      })
      .required(),

    couponType: Joi.string()
      .valid(...Object.values(CouponType))
      .required(),

    from: Joi.date().greater(Date.now()).required(),

    till: Joi.date().greater(Joi.ref("from")).required(),

    users: Joi.array()
      .items(
        Joi.object({
          userId: Joi.string().custom(objectIdRule).required(),
          maxCount: Joi.number().min(1).required(),
        }).required()
      )
      .required(),
  }),
};

export const getAllCoupons = {
  query: Joi.object({
    isEnable: Joi.string()
      .valid(...Object.values(EnableCoupon))
      .optional(),
  }),
};

export const getCouponById = {
  params: Joi.object({
    couponId: Joi.string().custom(objectIdRule).required(),
  }),
};

export const updateCoupon = {
  body: Joi.object({
    couponCode: Joi.string(),

    couponAmount: Joi.number()
      .when("couponType", {
        is: Joi.string().valid(CouponType.PERCENTAGE),
        then: Joi.number().max(100),
      })
      .min(1)
      .messages({
        "number.min": "Coupon amount must be greater than 1",
        "number.max": "Coupon amount must be less than 100",
      }),

    couponType: Joi.string().valid(...Object.values(CouponType)),

    from: Joi.date().greater(Date.now()),

    till: Joi.date().greater(Joi.ref("from")),

    users: Joi.array().items(
      Joi.object({
        userId: Joi.string().custom(objectIdRule).required(),
        maxCount: Joi.number().min(1).required(),
      })
    ),
  }).optional(),

  params: getCouponById.params,
};

export const disableEnableCoupon = {
  body: Joi.object({
    enable: Joi.boolean().required(),
  }),

  params: getCouponById.params,
};
