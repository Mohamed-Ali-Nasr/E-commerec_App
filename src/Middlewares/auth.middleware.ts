import { Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import createHttpError from "http-errors";
import { env } from "../Utils";
import { UserModel } from "../../DB/Models";
import { IRequest } from "../../types";

export const authMiddleware = (
  req: IRequest,
  res: Response,
  next: NextFunction
) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (token) {
    jwt.verify(token, env.JWT_SIGNIN, async (error, decode) => {
      if (error) {
        return res.status(404).json({
          message: error,
          error,
        });
      } else {
        const user = await UserModel.findById({
          _id: (decode as any).id,
        });

        req.userId = (decode as any).id;

        req.authUser = user!;

        if (!user || !req.userId) {
          next(createHttpError(401, "Invalid token."));
        }

        next();
      }
    });
  } else {
    next(createHttpError(401, "User not authenticated"));
  }
};