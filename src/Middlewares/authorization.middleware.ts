import { NextFunction, Response } from "express";
import createHttpError from "http-errors";
import { IRequest } from "../../types";

export const authorization = (allowedRoles: string[]) => {
  return (req: IRequest, res: Response, next: NextFunction) => {
    const user = req.authUser;

    if (!user) {
      next(createHttpError(401, "User Not Authenticated"));
    }

    if (!allowedRoles.includes(user!.userType)) {
      next(
        createHttpError(
          403,
          "Authorization Error, You Are Not Allowed To Access This Route"
        )
      );
    }

    next();
  };
};
