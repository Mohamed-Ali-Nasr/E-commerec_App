import { NextFunction, Request, Response } from "express";
import { isHttpError } from "http-errors";

export const globalResponse = (
  error: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error(error);
  let errorMessage = "An unknown error occurred";
  let statusCode = 500;
  if (isHttpError(error)) {
    statusCode = error.status;
    errorMessage = error.message;
    res.status(statusCode).json({ error: errorMessage });
  } else {
    res.status(statusCode).json({
      error: errorMessage,
      err_stack: error.stack,
    });
  }
};
