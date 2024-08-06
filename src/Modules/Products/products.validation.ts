import Joi from "joi";
import { objectIdRule } from "../../Utils";

export const addProductSchema = {
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
    discountType: Joi.string().valid("Percentage", "Fixed").optional(),
    stock: Joi.number().required(),
  }),
};

export const updateProductSchema = {
  params: Joi.object({
    productId: Joi.string().custom(objectIdRule).required(),
  }),

  body: Joi.object({
    title: Joi.string(),
    overview: Joi.string(),
    specs: Joi.string(),
    price: Joi.number(),
    discountAmount: Joi.number(),
    discountType: Joi.string().valid("Percentage", "Fixed"),
    badge: Joi.string().valid("New", "Sale", "Best Seller"),
    stock: Joi.number(),
    publicImageIds: Joi.string(),
  }).optional(),
};

export const deleteProductSchema = {
  params: updateProductSchema.params,
};
