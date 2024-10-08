import { Document } from "mongoose";
import { ICategory } from "./category.type";
import { ISubCategory } from "./sub-category.type";
import { IProduct } from "./product.type";
import { IUser } from "./user.type";

export interface IBrand extends Document {
  _id: string;
  name: string;
  slug: string;
  createdBy: string | IUser;
  logo: {
    secure_url: string;
    public_id: string;
  };
  customId: string;
  categoryId: string | ICategory;
  subcategoryId: string | ISubCategory;
  productsId: string[] | IProduct[];
}
