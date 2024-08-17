import Joi from "joi";
import { objectIdRule } from "../../Utils";

export const editCart = {
  body: Joi.object({
    quantity: Joi.number().required(),
  }),

  params: Joi.object({
    productId: Joi.string().custom(objectIdRule).required(),
  }),
};

export const removeFromCart = {
  params: editCart.params,
};
