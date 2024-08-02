import { CustomHelpers } from "joi";
import { Types } from "mongoose";

export const objectIdRule = (value: string, helpers: CustomHelpers) => {
  const isValidObject = Types.ObjectId.isValid(value);

  return isValidObject
    ? value
    : helpers.message({ custom: "Invalid Object Id" });
};


