import Joi from "joi";

export const validation = async (schema: Joi.ObjectSchema<any>, args: any) => {
  const { error } = schema.validate(args, { abortEarly: false });

  if (error) {
    return error.details;
  }

  return true;
};
