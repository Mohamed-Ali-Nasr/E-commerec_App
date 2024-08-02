import { Request } from "express";
import multer, { FileFilterCallback } from "multer";
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

  return multer({ fileFilter, storage });
};
