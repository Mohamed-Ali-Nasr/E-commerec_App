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
  if (err instanceof MulterError) {
    if (err.code === "LIMIT_UNEXPECTED_FILE" && err.field === "image") {
      // Handle the file count limit error
      next(createHttpError(400, "Too many files were uploaded"));
    } else if (err.code === "LIMIT_FILE_SIZE") {
      // Handle the file size limit error
      next(createHttpError(400, "Files size exceeds the limit"));
    } else {
      // Handle other Multer errors
      next(
        createHttpError(
          500,
          "An unexpected error occurred during the file upload."
        )
      );
    }
  } else {
    next(err);
  }
};
