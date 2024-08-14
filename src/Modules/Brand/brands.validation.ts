import Joi from "joi";
import { objectIdRule } from "../../Utils";

export const createBrandSchema = {
  query: Joi.object({
    subcategoryId: Joi.string().custom(objectIdRule),
    categoryId: Joi.string().custom(objectIdRule),
  }).required(),

  body: Joi.object({
    name: Joi.string()
      .pattern(/^([A-Z]|[a-z]){3,}((\s+|\W|_)\w+)*$/)
      .required()
      .messages({
        "string.pattern.base":
          "Brand Name Must Start With At Least Three Alphabet Letters",
      }),
  }),
};

export const getBrandSchema = {
  query: Joi.object({
    name: Joi.string(),

    slug: Joi.string(),

    id: Joi.string().custom(objectIdRule),
  }).optional(),
};

export const updateBrandSchema = {
  body: Joi.object({
    name: Joi.string()
      .pattern(/^([A-Z]|[a-z]){3,}((\s+|\W|_)\w+)*$/)
      .messages({
        "string.pattern.base":
          "Brand Name Must Start With At Least Three Alphabet Letters",
      })
      .optional(),
  }),

  params: Joi.object({
    _id: Joi.string().custom(objectIdRule).required(),
  }),
};

export const deleteBrandSchema = {
  params: updateBrandSchema.params,
};

export const relevantBrandsSchema = {
  query: Joi.object({
    subcategoryId: Joi.string().custom(objectIdRule),
    categoryId: Joi.string().custom(objectIdRule),
  }).optional(),
};
