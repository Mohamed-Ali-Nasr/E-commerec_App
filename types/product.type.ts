import { Document } from "mongoose";
import { ICategory } from "./category.type";
import { ISubCategory } from "./sub-category.type";
import { IBrand } from "./brand.type";
import { IUser } from "./user.type";

export interface IProduct extends Document {
  _id: string;
  title: string;
  slug: string;
  overview: string;
  specs: Object;
  badge: "New" | "Sale" | "Best Seller";
  price: number;
  appliedDiscount: {
    amount: number;
    type: string;
  };
  appliedPrice: number;
  stock: number;
  rating: number;
  Images: {
    URLs: { secure_url: string; public_id: string }[];
    customId: string;
  };
  createdBy: string | IUser;
  categoryId: string | ICategory;
  subcategoryId: string | ISubCategory;
  brandId: string | IBrand;
}
