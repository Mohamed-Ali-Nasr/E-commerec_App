import mongoose from "../global-setup";
import slugify from "slugify";
import { ICategory } from "../../types";

const { Schema, model } = mongoose;

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
      required: true,
    },

    Images: {
      secure_url: { type: String, required: true },
      public_id: { type: String, required: true, unique: true },
    },

    customId: { type: String, required: true, unique: true },

    subcategoriesId: [{ type: Schema.Types.ObjectId, ref: "SubCategory" }],
  },
  { timestamps: true }
);

// apply query middleware on category model after delete operation to delete all related models
CategorySchema.post("findOneAndDelete", async function (_, next) {
  const _id = this.getQuery()._id;

  // delete related subcategories from db
  const deletedSubCategories = await mongoose.models.SubCategory.deleteMany({
    categoryId: _id,
  });

  // check if subcategories are deleted already
  if (deletedSubCategories.deletedCount) {
    // delete the related brands from db
    const deletedBrands = await mongoose.models.Brand.deleteMany({
      categoryId: _id,
    });
    if (deletedBrands.deletedCount) {
      // delete the related products from db
      await mongoose.models.Product.deleteMany({ categoryId: _id });
    }
  }

  next();
});

export type ICategorySchema = mongoose.Document & ICategory;

export const CategoryModel =
  model<ICategorySchema, mongoose.PaginateModel<ICategorySchema>>(
    "Category",
    CategorySchema
  ) || mongoose.models.Category;
