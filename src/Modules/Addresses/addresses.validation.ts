import Joi from "joi";
import { objectIdRule } from "../../Utils";

export const addAddress = {
  body: Joi.object({
    country: Joi.string().required(),
    city: Joi.string().required(),
    postalCode: Joi.number().required(),
    buildingNumber: Joi.number().required(),
    floorNumber: Joi.number().required(),
    addressLabel: Joi.string().optional(),
    setAsDefault: Joi.boolean().optional(),
  }),
};

export const editAddress = {
  body: Joi.object({
    country: Joi.string(),
    city: Joi.string(),
    postalCode: Joi.number(),
    buildingNumber: Joi.number(),
    floorNumber: Joi.number(),
    addressLabel: Joi.string(),
    setAsDefault: Joi.boolean(),
  }).optional(),

  params: Joi.object({
    addressId: Joi.string().custom(objectIdRule).required(),
  }),
};

export const removeAddress = {
  params: editAddress.params,
};
