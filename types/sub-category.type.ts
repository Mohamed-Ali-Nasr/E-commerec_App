import { Document, ObjectId } from "mongoose";
import { ICategory } from "./category.type";

export interface ISubCategory extends Document {
  _id: string;
  name: string;
  slug: string;
  createdBy: ObjectId;
  Images: {
    secure_url: string;
    public_id: string;
  };
  customId: string;
  categoryId: ObjectId | ICategory;
}
