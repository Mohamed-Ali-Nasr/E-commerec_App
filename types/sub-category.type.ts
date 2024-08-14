import { Document } from "mongoose";
import { ICategory } from "./category.type";
import { IBrand } from "./brand.type";
import { IUser } from "./user.type";

export interface ISubCategory extends Document {
  _id: string;
  name: string;
  slug: string;
  createdBy: string | IUser;
  Images: {
    secure_url: string;
    public_id: string;
  };
  customId: string;
  categoryId: string | ICategory;
  brandsId: string[] | IBrand[];
}
