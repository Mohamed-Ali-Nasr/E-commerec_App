import Joi from "joi";
import { gender, userRole } from "../../Utils";

export const signupSchema = {
  body: Joi.object({
    username: Joi.string()
      .pattern(/^([A-Z]|[a-z]){3,}((\s+|\W|_)\w+)*$/)
      .required()
      .messages({
        "string.pattern.base":
          "username Must Start With At Least Three Alphabet Letters",
      }),
    email: Joi.string().email().required(),
    password: Joi.string()
      .pattern(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*])[A-Za-z\d@$!%*]{8,}$/
      )
      .required()
      .messages({
        "string.pattern.base":
          "Password Must Be At Least 8 characters long. ensures there is at least one lowercase letter, at least one uppercase letter, at least one digit and at least one special character from the set @$!%*?&.",
      }),
    phone: Joi.string()
      .pattern(/^01[0-2,5]\d{1,8}$/)
      .required()
      .messages({
        "string.pattern.base":
          "Invalid mobile number. Must be an 11-digit number.",
      }),
    age: Joi.string()
      .pattern(/^([3-9]|[1-8][0-9])$/)
      .required()
      .messages({
        "string.pattern.base": "Invalid age. please enter a valid age",
      }),
    userType: Joi.string()
      .valid(...Object.values(userRole))
      .required(),
    gender: Joi.string()
      .valid(...Object.values(gender))
      .required(),
  }),
};

export const verifyEmailSchema = {
  params: Joi.object({
    token: Joi.string().required(),
  }),
};

export const signinSchema = {
  body: Joi.object({
    email: Joi.string().email().required(),

    password: Joi.string().required(),
  }),
};

export const updatePasswordSchema = {
  body: Joi.object({
    password: Joi.string()
      .pattern(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*])[A-Za-z\d@$!%*]{8,}$/
      )
      .required()
      .messages({
        "string.pattern.base":
          "Password Must Be At Least 8 characters long. ensures there is at least one lowercase letter, at least one uppercase letter, at least one digit and at least one special character from the set @$!%*?&.",
      }),
  }),
};

export const forgetPasswordSchema = {
  body: Joi.object({
    email: Joi.string().email().required(),
  }),
};

export const resetPasswordSchema = {
  body: Joi.object({
    newPassword: Joi.string()
      .pattern(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*])[A-Za-z\d@$!%*]{8,}$/
      )
      .required()
      .messages({
        "string.pattern.base":
          "Password Must Be At Least 8 characters long. ensures there is at least one lowercase letter, at least one uppercase letter, at least one digit and at least one special character from the set @$!%*?&.",
      }),

    email: Joi.string().email().required(),

    otp: Joi.string()
      .required()
      .pattern(/^\d{6}$/)
      .messages({
        "string.pattern.base": "otp Must Be 6 digits long.",
      }),
  }),
};

export const updateUserSchema = {
  body: Joi.object({
    username: Joi.string()
      .pattern(/^([A-Z]|[a-z]){3,}((\s+|\W|_)\w+)*$/)
      .messages({
        "string.pattern.base":
          "username Must Start With At Least Three Alphabet Letters",
      }),
    email: Joi.string().email(),
    phone: Joi.string()
      .pattern(/^01[0-2,5]\d{1,8}$/)
      .messages({
        "string.pattern.base":
          "Invalid mobile number. Must be an 11-digit number.",
      }),
    age: Joi.string()
      .pattern(/^([3-9]|[1-8][0-9])$/)
      .messages({
        "string.pattern.base": "Invalid age. please enter a valid age",
      }),
  }).optional(),
};
