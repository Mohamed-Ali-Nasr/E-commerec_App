import mongoose from "../global-setup";
import slugify from "slugify";
import { IProduct } from "../../types";
import { Badges, calculateProductPrice, DiscountType } from "../../src/Utils";

const { Schema, model } = mongoose;

const ProductSchema = new Schema<IProduct>(
  {
    // Strings Section
    title: { type: String, required: true, trim: true },
    slug: {
      type: String,
      required: true,
      lowercase: true,
      default: function () {
        return slugify(this.title, { lower: true, replacement: "_" });
      },
    },
    overview: String,
    specs: Object, // Map of Strings
    badge: { type: String, enum: Object.values(Badges) },

    // Numbers Section
    price: { type: Number, required: true, min: 50 },
    appliedDiscount: {
      amount: { type: Number, min: 0, default: 0 },
      type: {
        type: String,
        enum: Object.values(DiscountType),
        default: DiscountType.PERCENTAGE,
      },
    },
    appliedPrice: {
      type: Number,
      required: true,
      default: function () {
        return calculateProductPrice(this.price, this.appliedDiscount);
      },
    }, // price , price - discount
    stock: { type: Number, required: true, min: 10 },
    rating: { type: Number, min: 0, max: 5, default: 0 },

    // Images Section
    Images: {
      URLs: [
        {
          secure_url: { type: String, required: true },
          public_id: { type: String, required: true, unique: true },
        },
      ],
      customId: { type: String, required: true, unique: true },
    },

    // Ids sections
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    categoryId: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    subcategoryId: {
      type: Schema.Types.ObjectId,
      ref: "SubCategory",
      required: true,
    },
    brandId: {
      type: Schema.Types.ObjectId,
      ref: "Brand",
      required: true,
    },
  },
  { timestamps: true }
);

export type IProductSchema = mongoose.Document & IProduct;

export const ProductModel =
  model<IProductSchema, mongoose.PaginateModel<IProductSchema>>(
    "Product",
    ProductSchema
  ) || mongoose.models.Product;
