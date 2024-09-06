import Joi from "joi";
import { CouponType } from "../../Utils";

export const createCouponValidator = Joi.object({
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

  token: Joi.string().required(),
});
