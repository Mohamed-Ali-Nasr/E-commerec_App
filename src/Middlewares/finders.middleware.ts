import { RequestHandler } from "express";
import createHttpError from "http-errors";

export const getDocumentByName = (model: any): RequestHandler => {
  return async (req, res, next) => {
    const { name } = req.body;
    if (name) {
      const document = await model.findOne({ name });

      if (document) {
        next(createHttpError(400, "this name is already exist"));
      }
    }

    next();
  };
};
