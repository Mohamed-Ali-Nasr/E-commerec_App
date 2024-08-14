import slugify from "slugify";
import { NextFunction, RequestHandler, Response } from "express";
import createHttpError from "http-errors";
import { nanoid } from "nanoid";
// utils
import { cloudinaryConfig, env, uploadFile } from "../../Utils";
// models
import { BrandModel, SubCategoryModel } from "../../../DB/Models";
// types
import { ICategory, IRequest, ISubCategory } from "../../../types";

/**
 * @api {post} /brands/create  Create a brand
 */
export const createBrand = async (
  req: IRequest,
  res: Response,
  next: NextFunction
) => {
  // destructuring the request body
  const { name } = req.body;
  const { categoryId, subcategoryId } = req.query;
  const { userId } = req;
  try {
    // check if the category and subcategory are exist
    const subcategory = await SubCategoryModel.findOne({
      _id: subcategoryId,
      categoryId,
    }).populate([
      {
        path: "categoryId",
        select: "_id name slug customId",
      },
    ]);
    if (!subcategory) {
      throw createHttpError(404, "Subcategory not found");
    }

    // Image
    if (!req.file) {
      throw createHttpError(400, "Please upload an image");
    }

    // upload the image to cloudinary
    const customId = nanoid(4);
    const { secure_url, public_id } = await uploadFile({
      file: req.file.path,
      folder: `${env.UPLOADS_FOLDER}/Categories/${
        (subcategory.categoryId as ICategory).customId
      }/SubCategories/${subcategory.customId}/Brands/${customId}`,
    });

    // prepare brand object
    const brand = {
      name,
      logo: {
        secure_url,
        public_id,
      },
      customId,
      createdBy: userId,
      categoryId: (subcategory.categoryId as ICategory)._id,
      subcategoryId: subcategory._id,
    };

    // create the category in db
    const newBrand = await BrandModel.create(brand);

    // Push the id of new brand to brands id Array in SubCategory Model
    (subcategory?.brandsId as string[]).push(newBrand._id);
    await subcategory?.save();

    // send the response
    res.status(201).json({
      status: "success",
      message: "Brand created successfully",
      data: newBrand,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @api {GET} /brands  Get brand by name or id or slug
 */
export const getBrand: RequestHandler = async (req, res, next) => {
  const { id, name, slug } = req.query;

  try {
    const queryFilter: any = {};

    // check if the query params are present
    if (id) queryFilter._id = id;
    if (slug) queryFilter.slug = new RegExp(slug as string, "i");
    if (name) queryFilter.name = new RegExp(name as string, "i");

    // find the brand
    const brand = await BrandModel.findOne(queryFilter);

    if (!brand) {
      throw createHttpError(404, "Brand not found");
    }

    res.status(200).json({
      status: "success",
      message: "Brand found",
      data: brand,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @api {PUT} /brands/update/:_id  Update a brand
 */
export const updateBrand: RequestHandler = async (req, res, next) => {
  // get the brand id
  const { _id } = req.params;
  // destructuring the request body
  const { name } = req.body;

  try {
    // find the brand by id
    const brand = await BrandModel.findById(_id).populate([
      { path: "categoryId", select: "_id name slug customId" },
      { path: "subcategoryId", select: "_id name slug customId" },
    ]);
    if (!brand) {
      throw createHttpError(404, "Brand not found");
    }

    // Update name and slug of the subcategory
    if (name) {
      brand.name = name;
      brand.slug = slugify(name, {
        replacement: "_",
        lower: true,
      });
    }

    // Update Image
    if (req.file) {
      const splittedPublicId = brand.logo.public_id.split(
        `${brand.customId}/`
      )[1];

      const { secure_url } = await uploadFile({
        file: req.file.path,
        folder: `${env.UPLOADS_FOLDER}/Categories/${
          (brand.categoryId as ICategory).customId
        }/SubCategories/${
          (brand.subcategoryId as ISubCategory).customId
        }/Brands/${brand.customId}`,
        publicId: splittedPublicId,
      });
      brand.logo.secure_url = secure_url;
    }

    // save the Brand with the new changes
    await brand.save();

    res.status(200).json({
      status: "success",
      message: "Brand updated successfully",
      data: brand,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @api {DELETE} /brands/delete/:_id  Delete a brand
 */
export const deleteBrand: RequestHandler = async (req, res, next) => {
  const { _id } = req.params;

  try {
    // find brand and delete
    const brand = await BrandModel.findOneAndDelete({ _id }).populate([
      { path: "categoryId", select: "_id name slug customId" },
      { path: "subcategoryId", select: "_id name slug customId" },
    ]);

    // check if deleted brand exists in the database
    if (!brand) {
      throw createHttpError(404, "Brand not found");
    }

    // delete related images from cloudinary
    const brandPath = `${env.UPLOADS_FOLDER}/Categories/${
      (brand.categoryId as ICategory).customId
    }/SubCategories/${(brand.subcategoryId as ISubCategory).customId}/Brands/${
      brand.customId
    }`;
    await cloudinaryConfig().api.delete_resources_by_prefix(brandPath);
    await cloudinaryConfig().api.delete_folder(brandPath);

    // Delete This Brands From brandsId Array In subcategory Model =>
    const subcategory = await SubCategoryModel.findById(
      (brand.subcategoryId as ISubCategory)._id
    );
    subcategory!.brandsId = (subcategory?.brandsId as string[]).filter(
      (id) => id.toString() !== _id
    );
    await subcategory?.save();

    res.status(200).json({
      status: "success",
      message: "Brand deleted successfully",
      data: brand,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @api {GET} /brands/relevant  Get brands for specific subCategory or category
 */
export const relevantBrands: RequestHandler = async (req, res, next) => {
  const { categoryId, subcategoryId } = req.query;

  try {
    // find all brands related to category or subCategory
    const brands = await BrandModel.find({
      $or: [{ categoryId }, { subcategoryId }],
    }).select("_id name slug customId");

    // check if brands Array is existing in db
    if (brands.length < 1) {
      throw createHttpError(404, "Brands not found");
    }

    res.status(200).json({
      status: "success",
      message: "Brands found ",
      data: brands,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @api {get} /brands/list  List all brands with its products
 */
export const listAllBrands: RequestHandler = async (req, res, next) => {
  try {
    const brands = await BrandModel.find()
      .select("_id name slug customId logo")
      .populate([
        {
          path: "productsId",
          select:
            "-Images --specs -categoryId -subcategoryId -brandId -overview",
        },
      ]);

    // send the response
    res.status(200).json({
      status: "success",
      message: "brands list",
      data: brands,
    });
  } catch (error) {
    next(error);
  }
};
