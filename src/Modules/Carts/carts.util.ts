import { ProductModel } from "../../../DB/Models";

export const checkProductStock = async (
  productId: string,
  quantity: number
) => {
  return await ProductModel.findOne({
    _id: productId,
    stock: { $gte: quantity },
  });
};

export const calculateCartSubTotal = (
  products: {
    quantity: number;
    price: number;
  }[]
) => {
  let subTotal = 0;

  products.forEach((p) => {
    subTotal += p.price * p.quantity;
  });

  return subTotal;
};
