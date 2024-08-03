import { Schema, Document, model } from "mongoose";
import slugify from "slugify";
import { ISubCategory } from "../../types";

const SubCategorySchema = new Schema<ISubCategory>(
  {
    name: { type: String, required: true, trim: true, unique: true },

    slug: {
      type: String,
      required: true,
      lowercase: true,
      default: function () {
        return slugify(this.name, { lower: true, replacement: "_" });
      },
    },

    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: false, // TODO: Change to true after adding authentication
    },

    Images: {
      secure_url: { type: String, required: true },
      public_id: { type: String, required: true, unique: true },
    },

    customId: { type: String, required: true, unique: true },

    categoryId: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
  },
  { timestamps: true }
);

export type ISubCategorySchema = Document & ISubCategory;

export const SubCategoryModel = model<ISubCategorySchema>(
  "SubCategory",
  SubCategorySchema
);
