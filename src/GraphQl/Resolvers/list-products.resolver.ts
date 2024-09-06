import { ProductModel } from "../../../DB/Models";

export const listProductsResolver = async () => {
  return await ProductModel.find();
};
