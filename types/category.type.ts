import { Document } from "mongoose";
import { ISubCategory } from "./sub-category.type";
import { IUser } from "./user.type";

export interface ICategory extends Document {
  _id: string;
  name: string;
  slug: string;
  createdBy: string | IUser;
  Images: {
    secure_url: string;
    public_id: string;
  };
  customId: string;
  subcategoriesId: string[] | ISubCategory[];
}
