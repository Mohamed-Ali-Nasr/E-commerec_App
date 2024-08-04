import { Document, ObjectId } from "mongoose";
import { ICategory } from "./category.type";
import { ISubCategory } from "./sub-category.type";

export interface IBrand extends Document {
  _id: string;
  name: string;
  slug: string;
  createdBy: ObjectId;
  logo: {
    secure_url: string;
    public_id: string;
  };
  customId: string;
  categoryId: ObjectId | ICategory;
  subcategoryId: ObjectId | ISubCategory;
}
