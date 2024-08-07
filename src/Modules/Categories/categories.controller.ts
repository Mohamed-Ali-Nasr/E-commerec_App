import slugify from "slugify";
import { RequestHandler } from "express";
import createHttpError from "http-errors";
import { nanoid } from "nanoid";
// utils
import { cloudinaryConfig, env, uploadFile } from "../../Utils";
// models
import {
  BrandModel,
  CategoryModel,
  ProductModel,
  SubCategoryModel,
} from "../../../DB/Models";

/**
 * @api {POST} /categories/create  create a new category
 */
export const createCategory: RequestHandler = async (req, res, next) => {
  // destructuring the request body
  const { name } = req.body;
  try {
    // Image
    if (!req.file) {
      throw createHttpError(400, "Please upload an image");
    }

    // upload the image to cloudinary
    const customId = nanoid(4);
    const { secure_url, public_id } = await uploadFile({
      file: req.file.path,
      folder: `${env.UPLOADS_FOLDER}/Categories/${customId}`,
    });

    // prepare category object
    const category = {
      name,
      Images: {
        secure_url,
        public_id,
      },
      customId,
    };

    // create the category in db
    const newCategory = await CategoryModel.create(category);

    // send the response
    res.status(201).json({
      status: "success",
      message: "Category created successfully",
      data: newCategory,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @api {GET} /categories  Get category by name or id or slug
 */
export const getCategory: RequestHandler = async (req, res, next) => {
  const { id, name, slug } = req.query;

  try {
    const queryFilter: any = {};

    // check if the query params are present
    if (id) queryFilter._id = id;
    if (slug) queryFilter.slug = new RegExp(slug as string, "i");
    if (name) queryFilter.name = new RegExp(name as string, "i");

    // find the category
    const category = await CategoryModel.findOne(queryFilter);

    if (!category) {
      throw createHttpError(404, "Category not found");
    }

    res.status(200).json({
      status: "success",
      message: "Category found",
      data: category,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @api {PUT} /categories/update/:_id  Update a specific category
 */
export const updateCategory: RequestHandler = async (req, res, next) => {
  // get the category id
  const { _id } = req.params;
  const { name } = req.body;

  try {
    // find the category by id
    const category = await CategoryModel.findById(_id);
    if (!category) {
      throw createHttpError(404, "Category not found");
    }

    // Update name and slug of the category
    if (name) {
      category.name = name;
      category.slug = slugify(name, {
        replacement: "_",
        lower: true,
      });
    }

    // Update Image
    if (req.file) {
      const splittedPublicId = category.Images.public_id.split(
        `${category.customId}/`
      )[1];

      const { secure_url } = await uploadFile({
        file: req.file.path,
        folder: `${env.UPLOADS_FOLDER}/Categories/${category.customId}`,
        publicId: splittedPublicId,
      });
      category.Images.secure_url = secure_url;
    }

    // save the category with the new changes
    await category.save();

    res.status(200).json({
      status: "success",
      message: "Category updated successfully",
      data: category,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @api {DELETE} /categories/delete/:_id  delete a specific category
 */
export const deleteCategory: RequestHandler = async (req, res, next) => {
  const { _id } = req.params;

  try {
    // find category and delete
    const category = await CategoryModel.findByIdAndDelete(_id);

    // check if deleted category exists in the database
    if (!category) {
      throw createHttpError(404, "Category not found");
    }

    // delete related images from cloudinary
    const categoryPath = `${env.UPLOADS_FOLDER}/Categories/${category?.customId}`;
    await cloudinaryConfig().api.delete_resources_by_prefix(categoryPath);
    await cloudinaryConfig().api.delete_folder(categoryPath);

    // delete related subcategories from db
    const deletedSubCategories = await SubCategoryModel.deleteMany({
      categoryId: _id,
    });
    // check if subcategories are deleted already
    if (deletedSubCategories.deletedCount) {
      // delete the related brands from db
      await BrandModel.deleteMany({ categoryId: _id });
      const deletedBrands = await BrandModel.deleteMany({ categoryId: _id });
      if (deletedBrands.deletedCount) {
        // delete the related products from db
        await ProductModel.deleteMany({ categoryId: _id });
      }
    }

    res.status(200).json({
      status: "success",
      message: "Category deleted successfully",
      data: category,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @api {get} /categories/list  list all categories paginated with its subcategories
 */
export const listAllCategories: RequestHandler = async (req, res, next) => {
  const limit = parseInt(req.query.limit as string) || 4;
  const page = parseInt(req.query.page as string) || 1;
  const skip = (page - 1) * limit;
  try {
    const categories = await CategoryModel.paginate(
      {},
      {
        page,
        limit,
        skip,
        select: "_id name slug customId",
        populate: {
          path: "subCategoriesId",
          select: "_id name slug customId",
        },
      }
    );

    // send the response
    res.status(200).json({
      status: "success",
      message: "categories list",
      data: categories,
    });
  } catch (error) {
    next(error);
  }
};
