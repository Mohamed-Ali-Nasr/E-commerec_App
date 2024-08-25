import Joi from "joi";
import { objectIdRule, PaymentMethod } from "../../Utils";

export const createOrder = {
  body: Joi.object({
    address: Joi.string().optional(),

    addressId: Joi.string().custom(objectIdRule).optional(),

    contactNumber: Joi.string()
      .pattern(/^01[0-2,5]\d{1,8}$/)
      .required()
      .messages({
        "string.pattern.base":
          "Invalid contact number. Must be an 11-digit number.",
      }),

    shippingFee: Joi.number().required(),

    VAT: Joi.number().required(),

    paymentMethod: Joi.string()
      .valid(...Object.values(PaymentMethod))
      .required(),

    couponCode: Joi.string().optional(),
  }),
};

export const canceledOrder = {
  params: Joi.object({
    orderId: Joi.string().custom(objectIdRule).required(),
  }),
};

export const deliveredOrder = {
  params: canceledOrder.params,
};

export const paymentWithStripe = {
  params: canceledOrder.params,
};
