import { NextFunction, Response } from "express";
import createHttpError from "http-errors";
// models
import { CartModel } from "../../../DB/Models";
// types
import { IRequest } from "../../../types";
import { checkProductStock } from "./carts.util";

/**
 * @api {POST} /carts/add/:productId  add to address
 */
export const addToCart = async (
  req: IRequest,
  res: Response,
  next: NextFunction
) => {
  // destructuring the request body
  const { quantity } = req.body;
  const { productId } = req.params;
  const { userId } = req;
  try {
    // find the product you want to add to cart by productId and quantity
    const product = await checkProductStock(productId, quantity);

    // check if the product not exist in database
    if (!product) {
      throw createHttpError(404, "Product not available");
    }

    // find cart by userId
    const cart = await CartModel.findOne({ userId });

    // if cart not exist create a new cart then add product to it
    if (!cart) {
      const newCart = new CartModel({
        userId,
        products: [
          { productId: product._id, quantity, price: product.appliedPrice },
        ],
      });

      // Save New Cart To Database =>
      await newCart.save();

      // send the response
      res.status(201).json({
        status: "success",
        message: "Product added To Cart successfully",
        data: newCart,
      });
    }

    // check if the product is already exist in products list in the cart
    const isProductExist = cart?.products.find(
      (p) => p.productId.toString() === productId
    );
    if (isProductExist) {
      throw createHttpError(400, "Product is already added to the cart");
    }

    // if product not exits in the products list in the cart push it
    cart?.products.push({
      productId: product._id,
      quantity,
      price: product.appliedPrice,
    });

    // Save New Cart To Database =>
    await cart?.save();

    // send the response
    res.status(200).json({
      status: "success",
      message: "product added to cart successfully",
      data: cart,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @api {PUT} /carts/remove/:productId  remove product from cart by productId
 */
export const removeFromCart = async (
  req: IRequest,
  res: Response,
  next: NextFunction
) => {
  const { productId } = req.params;
  const { userId } = req;

  try {
    // find cart by userId and productId
    const cart = await CartModel.findOne({
      userId,
      "products.productId": productId,
    });

    // check if product not found in cart
    if (!cart) {
      throw createHttpError(404, "Product not found in cart");
    }

    // if product found in cart remove it from products list
    cart.products = cart.products.filter(
      (p) => p.productId.toString() !== productId
    );

    // Save Cart To Database =>
    await cart?.save();

    // send the response
    res.status(200).json({
      status: "success",
      message: "product removed from cart successfully",
      data: cart,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @api {PUT} /carts/update:productId  update cart
 */
export const updateCart = async (
  req: IRequest,
  res: Response,
  next: NextFunction
) => {
  // destructuring the request body
  const { quantity } = req.body;
  const { productId } = req.params;
  const { userId } = req;

  try {
    // find cart by userId and productId
    const cart = await CartModel.findOne({
      userId,
      "products.productId": productId,
    });

    // check if product not found in cart
    if (!cart) {
      throw createHttpError(404, "Product not found in cart");
    }

    // find the product you want to add to cart by productId and quantity
    const product = await checkProductStock(productId, quantity);

    // check if the product not exist in database
    if (!product) {
      throw createHttpError(404, "Product not available");
    }

    // find the index of the product yow want to update it's quantity
    const productIndex = cart.products.findIndex(
      (p) => p.productId.toString() === product._id.toString()
    );

    // update the quantity of the product with the new quantity
    cart.products[productIndex].quantity = quantity;

    // Save Cart To Database =>
    await cart?.save();

    // send the response
    res.status(200).json({
      status: "success",
      message: "cart update successfully",
      data: cart,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @api {GET} /carts  get cart
 */
export const getCart = async (
  req: IRequest,
  res: Response,
  next: NextFunction
) => {
  const { userId } = req;

  try {
    // find cart by userId
    const cart = await CartModel.findOne({ userId });

    // check if cart exists in database
    if (!cart) {
      throw createHttpError(404, "cart not found");
    }

    // send the response
    res.status(200).json({
      status: "success",
      message: "cart found successfully",
      data: cart,
    });
  } catch (error) {
    next(error);
  }
};
