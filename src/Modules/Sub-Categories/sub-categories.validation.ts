import Joi from "joi";
import { objectIdRule } from "../../Utils";

export const createSubCategory = {
  body: Joi.object({
    name: Joi.string()
      .pattern(/^([A-Z]|[a-z]){3,}((\s+|\W|_)\w+)*$/)
      .required()
      .messages({
        "string.pattern.base":
          "Category Name Must Start With At Least Three Alphabet Letters",
      }),
  }),

  query: Joi.object({
    categoryId: Joi.string().custom(objectIdRule).required(),
  }),
};

export const getSubCategory = {
  query: Joi.object({
    name: Joi.string(),

    slug: Joi.string(),

    id: Joi.string().custom(objectIdRule),
  }).optional(),
};

export const updateSubCategory = {
  body: Joi.object({
    name: Joi.string()
      .pattern(/^([A-Z]|[a-z]){3,}((\s+|\W|_)\w+)*$/)
      .messages({
        "string.pattern.base":
          "Category Name Must Start With At Least Three Alphabet Letters",
      })
      .optional(),
  }),

  params: Joi.object({
    _id: Joi.string().custom(objectIdRule).required(),
  }),
};

export const deleteSubCategory = {
  params: updateSubCategory.params,
};
