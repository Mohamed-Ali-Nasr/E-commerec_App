import { v2 as cloudinary, UploadApiOptions } from "cloudinary";
import { env } from "./validateEnv.util";
import createHttpError from "http-errors";

export const cloudinaryConfig = () => {
  // Configuration
  cloudinary.config({
    cloud_name: env.CLOUD_NAME,
    api_key: env.API_KEY,
    api_secret: env.API_SECRET,
  });

  return cloudinary;
};

/**
 * @param {File} file
 * @param {String} folder
 * @returns {Object}
 * @description Uploads a file to cloudinary
 */

export const uploadFile = async ({
  file,
  folder = "General",
  publicId,
}: {
  file: string;
  folder: string;
  publicId?: string;
}): Promise<{ secure_url: string; public_id: string }> => {
  if (!file) {
    throw createHttpError(400, "Please upload an image");
  }

  let options: UploadApiOptions = { folder };

  if (publicId) {
    options.public_id = publicId;
  }

  const { secure_url, public_id } = await cloudinaryConfig().uploader.upload(
    file,
    options
  );

  return { secure_url, public_id };
};
