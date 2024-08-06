import { NextFunction, Request, Response } from "express";
import multer, { FileFilterCallback, MulterError } from "multer";
import { extensions } from "../Utils";
import createHttpError from "http-errors";

export const multerHost = ({ allowedExtensions = extensions.Images }) => {
  const storage = multer.diskStorage({});

  // fileFilter
  const fileFilter = (
    req: Request,
    file: Express.Multer.File,
    cb: FileFilterCallback
  ) => {
    if (!allowedExtensions.includes(file.mimetype)) {
      cb(null, false);
      return cb(
        createHttpError(
          400,
          `Invalid file type, only ${allowedExtensions} images are allowed`
        )
      );
    }

    return cb(null, true);
  };

  return multer({
    fileFilter,
    storage,
    limits: { fileSize: 1024 * 1024 * 5 }, // 5MB
  });
};

export const handleMulterError = (
  err: MulterError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (err.code === "LIMIT_UNEXPECTED_FILE" && err.field === "image") {
    // Handle the file count limit error
    throw createHttpError(
      400,
      "Too many files were uploaded, please upload only 5 images at a time."
    );
  } else if (err.code === "LIMIT_FILE_SIZE") {
    // Handle the file size limit error
    throw createHttpError(
      400,
      "File size exceeds the limit, please upload files smaller than 5MB."
    );
  } else {
    // Handle other Multer errors
    throw createHttpError(
      500,
      "An unexpected error occurred during the file upload."
    );
  }
};
