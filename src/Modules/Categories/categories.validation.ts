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
    name: Joi.string(),

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
      })
      .optional(),
  }),

  params: Joi.object({
    _id: Joi.string().custom(objectIdRule).required(),
  }),
};

export const deleteCategorySchema = {
  params: updateCategorySchema.params,
};

export const PaginationSchema = {
  query: Joi.object({
    page: Joi.string()
      .pattern(/^(. *[^0-9]|)(1000|[1-9]\d{0,2})([^0-9]. *|)$/)
      .messages({
        "string.pattern.base": "Page Must Be A Valid Number",
        "any.required": "Page Query Is Required",
      }),

    limit: Joi.string()
      .pattern(/^(. *[^0-9]|)(1000|[1-9]\d{0,2})([^0-9]. *|)$/)
      .messages({
        "string.pattern.base": "limit Must Be A Valid Number",
        "any.required": "itemsPerPage Query Is Required",
      }),
  }).optional(),
};
