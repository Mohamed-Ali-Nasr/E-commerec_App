import Joi from "joi";
import { Badges, DiscountType, objectIdRule } from "../../Utils";

export const addProduct = {
  query: Joi.object({
    categoryId: Joi.string().custom(objectIdRule),
    subcategoryId: Joi.string().custom(objectIdRule),
    brandId: Joi.string().custom(objectIdRule),
  }).required(),

  body: Joi.object({
    title: Joi.string().required(),
    overview: Joi.string().optional(),
    specs: Joi.string().optional(),
    price: Joi.number().required(),
    discountAmount: Joi.number().optional(),
    discountType: Joi.string()
      .valid(...Object.values(DiscountType))
      .optional(),
    stock: Joi.number().required(),
  }),
};

export const updateProduct = {
  params: Joi.object({
    productId: Joi.string().custom(objectIdRule).required(),
  }),

  body: Joi.object({
    title: Joi.string(),
    overview: Joi.string(),
    specs: Joi.string(),
    price: Joi.number(),
    discountAmount: Joi.number(),
    discountType: Joi.string().valid(...Object.values(DiscountType)),
    badge: Joi.string().valid(...Object.values(Badges)),
    stock: Joi.number(),
    publicImageIds: Joi.string(),
  }).optional(),
};

export const deleteProduct = {
  params: updateProduct.params,
};
