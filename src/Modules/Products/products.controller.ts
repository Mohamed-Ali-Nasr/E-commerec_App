import slugify from "slugify";
import { RequestHandler } from "express";
import createHttpError from "http-errors";
import { nanoid } from "nanoid";
// utils
import {
  calculateProductPrice,
  cloudinaryConfig,
  env,
  uploadFile,
} from "../../Utils";
// models
import { BrandModel, ProductModel } from "../../../DB/Models";
// types
import { IBrand, ICategory, ISubCategory } from "../../../types";

/**
 * @api {post} /products/add  Add Product
 */
export const addProduct: RequestHandler = async (req, res, next) => {
  // destructuring the request body
  const { title, overview, specs, price, discountAmount, discountType, stock } =
    req.body;
  const { categoryId, subcategoryId, brandId } = req.query;

  try {
    // req.files
    const files = req.files as Express.Multer.File[];
    if (!files.length) {
      throw createHttpError(400, "No images uploaded");
    }

    // Ids check
    const brand = await BrandModel.findOne({
      _id: brandId,
      categoryId,
      subcategoryId,
    }).populate([
      { path: "categoryId", select: "_id name slug customId" },
      { path: "subcategoryId", select: "_id name slug customId" },
    ]);
    if (!brand) {
      throw createHttpError(404, "Brand not found");
    }

    // Images section
    // Access the customIds from the brandDocument
    const brandCustomId = brand.customId;
    const categoryCustomId = (brand.categoryId as ICategory).customId;
    const subcategoryCustomId = (brand.subcategoryId as ISubCategory).customId;

    const customId = nanoid(4);
    const folder = `${env.UPLOADS_FOLDER}/Categories/${categoryCustomId}/SubCategories/${subcategoryCustomId}/Brands/${brandCustomId}/Products/${customId}`;

    // upload each file to cloudinary
    const URLs = [];
    for (const file of files) {
      const { secure_url, public_id } = await uploadFile({
        file: file.path,
        folder,
      });
      URLs.push({ secure_url, public_id });
    }

    // prepare product object
    const productObject = {
      title,
      overview,
      specs: JSON.parse(specs || "{}"),
      price,
      appliedDiscount: {
        amount: discountAmount,
        type: discountType,
      },
      stock,
      Images: {
        URLs,
        customId,
      },
      categoryId: (brand.categoryId as ICategory)._id,
      subcategoryId: (brand.subcategoryId as ISubCategory)._id,
      brandId: brand._id,
    };

    // create in db
    const newProduct = await ProductModel.create(productObject);

    // Push the id of new product to products id Array in brand Model
    (brand?.productsId as string[]).push(newProduct._id);
    await brand?.save();

    // send the response
    res.status(201).json({
      status: "success",
      message: "Product created successfully",
      data: newProduct,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @api {put} /products/update/:productId  Update Product
 */
export const updateProduct: RequestHandler = async (req, res, next) => {
  // productId from params
  const { productId } = req.params;
  // destructuring the request body
  const {
    title,
    stock,
    overview,
    badge,
    price,
    discountAmount,
    discountType,
    specs,
    publicImageIds,
  } = req.body;
  try {
    // check if the product is exist
    const product = await ProductModel.findById(productId).populate([
      { path: "categoryId", select: "_id name slug customId" },
      { path: "subcategoryId", select: "_id name slug customId" },
      { path: "brandId", select: "_id name slug customId" },
    ]);
    if (!product) {
      throw createHttpError(404, "Product not found");
    }

    // update the product title and slug
    if (title) {
      product.title = title;
      product.slug = slugify(title, {
        replacement: "_",
        lower: true,
      });
    }

    // update the product stock, overview, badge
    if (stock) product.stock = stock;
    if (overview) product.overview = overview;
    if (badge) product.badge = badge;

    // update the product price and discount
    if (price || discountAmount || discountType) {
      const newPrice = price || product.price;
      const discount = {} as { amount: number; type: string };
      discount.amount = discountAmount || product.appliedDiscount.amount;
      discount.type = discountType || product.appliedDiscount.type;

      product.appliedPrice = calculateProductPrice(newPrice, discount);

      product.price = newPrice;
      product.appliedDiscount = discount;
    }

    // update the product specs
    if (specs) product.specs = JSON.parse(specs);

    // Update Image
    const files = req.files as Express.Multer.File[];
    const folder = `${env.UPLOADS_FOLDER}/Categories/${
      (product.categoryId as ICategory).customId
    }/SubCategories/${
      (product.subcategoryId as ISubCategory).customId
    }/Brands/${(product.brandId as IBrand).customId}/Products/${
      product.Images.customId
    }`;
    const uploadedImages = JSON.parse(publicImageIds);
    if (files?.length && uploadedImages?.length) {
      for (const file of files) {
        product.Images.URLs.forEach((url) => {
          const splittedPublicId = url.public_id.split(
            `${product.Images.customId}/`
          )[1];

          uploadedImages.forEach(async (id: string) => {
            if (splittedPublicId === id) {
              const { secure_url } = await uploadFile({
                file: file.path,
                folder,
                publicId: id,
              });
              url.secure_url = secure_url;
            }
          });
        });
      }
    }

    // save the product changes
    await product.save();

    // send the response
    res.status(200).json({
      status: "success",
      message: "Product updated successfully",
      data: product,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @api {DELETE} /products/delete/:productId  Delete a Product
 */
export const deleteProduct: RequestHandler = async (req, res, next) => {
  const { productId } = req.params;

  try {
    // find brand and delete
    const product = await ProductModel.findByIdAndDelete(productId).populate([
      { path: "categoryId", select: "_id name slug customId" },
      { path: "subcategoryId", select: "_id name slug customId" },
      { path: "brandId", select: "_id name slug customId" },
    ]);

    // check if deleted brand exists in the database
    if (!product) {
      throw createHttpError(404, "product not found");
    }

    // delete related images from cloudinary
    const productPath = `${env.UPLOADS_FOLDER}/Categories/${
      (product.categoryId as ICategory).customId
    }/SubCategories/${
      (product.subcategoryId as ISubCategory).customId
    }/Brands/${(product.brandId as IBrand).customId}/Products/${
      product.Images.customId
    }`;
    await cloudinaryConfig().api.delete_resources_by_prefix(productPath);
    await cloudinaryConfig().api.delete_folder(productPath);

    res.status(200).json({
      status: "success",
      message: "product deleted successfully",
      data: product,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @api {get} /products/list  list all Products
 */
export const listProducts: RequestHandler = async (req, res, next) => {
  const limit = parseInt(req.query.limit as string) || 4;
  const page = parseInt(req.query.page as string) || 1;
  const skip = (page - 1) * limit;
  try {
    const products = await ProductModel.paginate(
      {},
      {
        page,
        limit,
        skip,
        select: "-Images --specs -categoryId -subcategoryId -brandId",
      }
    );

    // send the response
    res.status(200).json({
      status: "success",
      message: "products list",
      data: products,
    });
  } catch (error) {
    next(error);
  }
};
