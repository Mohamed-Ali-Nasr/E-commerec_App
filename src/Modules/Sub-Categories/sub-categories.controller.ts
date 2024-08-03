import slugify from "slugify";
import { RequestHandler } from "express";
import createHttpError from "http-errors";
import { nanoid } from "nanoid";
// utils
import { cloudinaryConfig, env, uploadFile } from "../../Utils";
// models
import { CategoryModel, SubCategoryModel } from "../../../DB/Models";
// types
import { ICategory } from "../../../types";

/**
 * @api {POST} /sub-categories/create create a new subCategory
 */
export const createSubCategory: RequestHandler = async (req, res, next) => {
  // destructuring the request body
  const { name } = req.body;
  const { categoryId } = req.query;
  try {
    // find the category by id
    const category = await CategoryModel.findById(categoryId);
    if (!category) {
      throw createHttpError(404, "Category not found");
    }

    // Image
    if (!req.file) {
      throw createHttpError(400, "Please upload an image");
    }

    // upload the image to cloudinary
    const customId = nanoid(4);
    const { secure_url, public_id } = await uploadFile({
      file: req.file.path,
      folder: `${env.UPLOADS_FOLDER}/Categories/${category.customId}/SubCategories/${customId}`,
    });

    // prepare category object
    const subCategory = {
      name,
      Images: {
        secure_url,
        public_id,
      },
      customId,
      categoryId: category._id,
    };

    // create the category in db
    const newSubCategory = await SubCategoryModel.create(subCategory);

    // send the response
    res.status(201).json({
      status: "success",
      message: "Sub-Category created successfully",
      data: newSubCategory,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @api {GET} /sub-categories Get subcategory of specific category by name or id or slug
 */
export const getSubCategory: RequestHandler = async (req, res, next) => {
  const { id, name, slug } = req.query;

  try {
    const queryFilter: any = {};

    // check if the query params are present
    if (id) queryFilter._id = id;
    if (slug) queryFilter.slug = new RegExp(slug as string, "i");
    if (name) queryFilter.name = new RegExp(name as string, "i");

    // find the sub category
    const subCategory = await SubCategoryModel.findOne(queryFilter);

    if (!subCategory) {
      throw createHttpError(404, "SubCategory not found");
    }

    res.status(200).json({
      status: "success",
      message: "SubCategory found",
      data: subCategory,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @api {PUT} /sub-categories/update/:_id  Update a subcategory
 */
export const updateSubCategory: RequestHandler = async (req, res, next) => {
  // get the sub-category id
  const { _id } = req.params;
  // destructuring the request body
  const { name } = req.body;

  try {
    // find the sub-category by id
    const subcategory = await SubCategoryModel.findById(_id).populate([
      {
        path: "categoryId",
        model: CategoryModel,
        select: "_id name customId",
      },
    ]);
    if (!subcategory) {
      throw createHttpError(404, "SubCategory not found");
    }

    // Update name and slug of the subcategory
    if (name) {
      subcategory.name = name;
      subcategory.slug = slugify(name, {
        replacement: "_",
        lower: true,
      });
    }

    // Update Image
    if (req.file) {
      const splittedPublicId = subcategory.Images.public_id.split(
        `${subcategory.customId}/`
      )[1];

      const { secure_url } = await uploadFile({
        file: req.file.path,
        folder: `${env.UPLOADS_FOLDER}/Categories/${
          (subcategory.categoryId as ICategory).customId
        }/SubCategories/${subcategory.customId}`,
        publicId: splittedPublicId,
      });
      subcategory.Images.secure_url = secure_url;
    }

    // save the subcategory with the new changes
    await subcategory.save();

    res.status(200).json({
      status: "success",
      message: "Category updated successfully",
      data: subcategory,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @api {DELETE} /sub-categories/delete/:_id  Delete a subcategory
 */
export const deleteSubCategory: RequestHandler = async (req, res, next) => {
  const { _id } = req.params;

  try {
    // find subcategory and delete
    const subcategory = await SubCategoryModel.findByIdAndDelete(_id).populate([
      {
        path: "categoryId",
        model: CategoryModel,
        select: "_id name customId",
      },
    ]);

    // check if deleted subcategory exists in the database
    if (!subcategory) {
      throw createHttpError(404, "SubCategory not found");
    }

    // delete related images from cloudinary
    const categoryPath = `${env.UPLOADS_FOLDER}/Categories/${
      (subcategory.categoryId as ICategory).customId
    }/SubCategories/${subcategory.customId}`;
    await cloudinaryConfig().api.delete_resources_by_prefix(categoryPath);
    await cloudinaryConfig().api.delete_folder(categoryPath);

    res.status(200).json({
      status: "success",
      message: "SubCategory deleted successfully",
      data: subcategory,
    });
  } catch (error) {
    next(error);
  }
};