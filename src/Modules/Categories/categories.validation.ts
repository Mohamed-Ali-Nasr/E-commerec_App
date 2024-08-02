import Joi from "joi";
import { objectIdRule } from "../../Utils";

export const createCategorySchema = {
  body: Joi.object({
    name: Joi.string()
      .pattern(/^([A-Z]|[a-z]){3,}((\s+|\W|_)\w+)*$/)
      .required()
      .messages({
        "string.pattern.base":
          "Category Name Must Start With At Least Three Alphabet Letters",
      }),
  }),
};

export const getCategorySchema = {
  query: Joi.object({
    name: Joi.string()
      .pattern(/^([A-Z]|[a-z]){3,}((\s+|\W|_)\w+)*$/)
      .messages({
        "string.pattern.base":
          "Category Name Must Start With At Least Three Alphabet Letters",
      }),

    slug: Joi.string(),

    id: Joi.string().custom(objectIdRule),
  }).optional(),
};

export const updateCategorySchema = {
  body: Joi.object({
    name: Joi.string()
      .pattern(/^([A-Z]|[a-z]){3,}((\s+|\W|_)\w+)*$/)
      .messages({
        "string.pattern.base":
          "Category Name Must Start With At Least Three Alphabet Letters",
      }),
  }),

  params: Joi.object({
    _id: Joi.string().custom(objectIdRule).required(),
  }),
};

export const deletedCategorySchema = {
  params: updateCategorySchema.params,
};
