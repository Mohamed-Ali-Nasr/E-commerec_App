import Joi from "joi";
import { objectIdRule } from "../../Utils";

export const createBrand = {
  query: Joi.object({
    subcategoryId: Joi.string().custom(objectIdRule).required(),
    categoryId: Joi.string().custom(objectIdRule).required(),
  }),

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

export const getBrand = {
  query: Joi.object({
    name: Joi.string(),

    slug: Joi.string(),

    id: Joi.string().custom(objectIdRule),
  }).optional(),
};

export const updateBrand = {
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

export const deleteBrand = {
  params: updateBrand.params,
};

export const relevantBrands = {
  query: Joi.object({
    subcategoryId: Joi.string().custom(objectIdRule),
    categoryId: Joi.string().custom(objectIdRule),
  }).optional(),
};
