import mongoose from "../global-setup";
import slugify from "slugify";
import { IBrand } from "../../types";

const { Schema, model } = mongoose;

const BrandSchema = new Schema<IBrand>(
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
      required: true,
    },

    logo: {
      secure_url: { type: String, required: true },
      public_id: { type: String, required: true, unique: true },
    },

    customId: { type: String, required: true, unique: true },

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
    productsId: [{ type: Schema.Types.ObjectId, ref: "Product" }],
  },
  { timestamps: true }
);

// apply query middleware on brand model after delete operation to delete all related models
BrandSchema.post("findOneAndDelete", async function (_, next) {
  const _id = this.getQuery()._id;

  // delete the related product from db
  await mongoose.models.Product.deleteMany({ brandId: _id });

  next();
});

export type IBrandSchema = mongoose.Document & IBrand;

export const BrandModel =
  model<IBrandSchema>("Brand", BrandSchema) || mongoose.models.Brand;
