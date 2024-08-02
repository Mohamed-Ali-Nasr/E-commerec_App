import { Schema, Document, model } from "mongoose";
import slugify from "slugify";
import { ICategory } from "../../types";

const CategorySchema = new Schema<ICategory>(
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
  },
  { timestamps: true }
);

export type ICategorySchema = Document & ICategory;

export const CategoryModel = model<ICategorySchema>("Category", CategorySchema);
