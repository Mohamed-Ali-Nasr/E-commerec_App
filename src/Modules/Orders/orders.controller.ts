import { NextFunction, Response } from "express";
import createHttpError from "http-errors";
// utils
import { calculateCartSubTotal } from "../Carts/carts.util";
import { applyCoupon, validateCoupon } from "./orders.util";
import { ApiFeatures, OrderStatus, PaymentMethod } from "../../Utils";
// models
import { AddressModel, CartModel, OrderModel } from "../../../DB/Models";
// types
import { IProduct, IRequest } from "../../../types";
import { DateTime } from "luxon";

/**
 * @api {POST} /orders/create  create a new order
 */
export const createOrder = async (
  req: IRequest,
  res: Response,
  next: NextFunction
) => {
  // destructuring the request body
  const {
    address,
    addressId,
    contactNumber,
    shippingFee,
    VAT,
    paymentMethod,
    couponCode,
  } = req.body;
  const { userId } = req;

  try {
    // find logged in user's cart with products
    const cart = await CartModel.findOne({ userId }).populate([
      {
        path: "products.productId",
        select: "_id appliedDiscount title stock rating",
      },
    ]);
    if (!cart || !cart.products.length) {
      throw createHttpError(400, "cart is empty");
    }

    // check if any product is sold out
    const isSoldOut = cart.products.find(
      (p) => (p.productId as IProduct).stock < p.quantity
    );
    if (isSoldOut) {
      throw createHttpError(
        400,
        `product ${(isSoldOut.productId as IProduct).title} is already sold out`
      );
    }

    // calculate the new subTotal if any product price is changed
    const subTotal = calculateCartSubTotal(cart.products);
    let total: number = subTotal + shippingFee + VAT;

    // coupon validation
    let coupon;
    if (couponCode) {
      const isCouponValid = await validateCoupon(couponCode, userId!);
      if (isCouponValid?.error) {
        throw createHttpError(400, isCouponValid.message);
      }

      // apply coupon if is valid
      coupon = isCouponValid?.coupon;
      total = applyCoupon(subTotal, coupon!, shippingFee, VAT);
    }

    // check if not address and addressId with request body
    if (!address && !addressId) {
      throw createHttpError(400, "address is required");
    }

    // check if addressId is valid
    if (addressId) {
      const addressInfo = await AddressModel.findOne({
        _id: addressId,
        userId,
      });

      if (!addressInfo) {
        throw createHttpError(400, "Invalid address");
      }
    }

    // apply Order Status
    let orderStatus = OrderStatus.PENDING;
    if (paymentMethod === PaymentMethod.CASH) {
      orderStatus = OrderStatus.PLACED;
    }

    // create new Order instance
    const newOrder = new OrderModel({
      userId,
      products: cart.products,
      address,
      addressId,
      contactNumber,
      shippingFee,
      VAT,
      subTotal,
      total,
      couponId: coupon?._id,
      paymentMethod,
      orderStatus,
      estimatedDeliveryDate: DateTime.now()
        .plus({ days: 3 })
        .toFormat("yyyy-MM-dd"),
    });

    // Save New Order To Database =>
    await newOrder.save();

    // clear cart after make the order
    cart.products = [];
    await cart.save();

    // send the response
    res.status(201).json({
      status: "success",
      message: "Order is created successfully",
      data: newOrder,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @api {PUT} /orders/canceled/:orderId  cancel order
 */
export const canceledOrder = async (
  req: IRequest,
  res: Response,
  next: NextFunction
) => {
  const { orderId } = req.params;
  const { userId } = req;

  try {
    // get order data by orderId
    const order = await OrderModel.findOne({
      _id: orderId,
      userId,
      orderStatus: {
        $in: [OrderStatus.PENDING, OrderStatus.PLACED, OrderStatus.CONFIRMED],
      },
    });
    if (!order) {
      throw createHttpError(404, "Order not found");
    }

    // check if the order bought before Three days
    const orderDate = DateTime.fromJSDate(order.createdAt);
    const currentDate = DateTime.now();
    const diff = Math.ceil(
      +Number(currentDate.diff(orderDate, "days").toObject().days).toFixed(2)
    );
    if (diff > 3) {
      throw createHttpError(400, "can not cancel order after 3 days");
    }

    // update order status before canceled completed
    order.orderStatus = OrderStatus.CANCELED;
    order.canceledAt = DateTime.now() as any;
    order.canceledBy = userId as string;
    await order.save();

    // send the response
    res.status(200).json({
      status: "success",
      message: "Order is canceled successfully",
      data: order,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @api {PUT} /orders/delivered/:orderId  deliver order
 */
export const deliveredOrder = async (
  req: IRequest,
  res: Response,
  next: NextFunction
) => {
  const { orderId } = req.params;
  const { userId } = req;

  try {
    // get order data by orderId
    const order = await OrderModel.findOne({
      _id: orderId,
      userId,
      orderStatus: { $in: [OrderStatus.PLACED, OrderStatus.CONFIRMED] },
    });
    if (!order) {
      throw createHttpError(404, "Order not found");
    }

    // update order status before delivered completed
    order.orderStatus = OrderStatus.DELIVERED;
    order.deliveredAt = DateTime.now() as any;
    order.deliveredBy = userId as string;
    await order.save();

    // send the response
    res.status(200).json({
      status: "success",
      message: "Order is delivered successfully",
      data: order,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @api {GET} /orders  get all orders
 */
export const listOrders = async (
  req: IRequest,
  res: Response,
  next: NextFunction
) => {
  const { userId } = req;

  try {
    const query = { userId, ...req.query };

    const populatedArray = [
      {
        path: "products.productId",
        select: "_id appliedDiscount title stock rating Images",
      },
    ];

    const ApiFeaturesInstance = new ApiFeatures(
      OrderModel,
      query,
      populatedArray
    )
      .pagination()
      .sort()
      .filters();

    const orders = await ApiFeaturesInstance.mongooseQuery;

    // send the response
    res.status(200).json({
      status: "success",
      message: "Orders list",
      data: orders,
    });
  } catch (error) {
    next(error);
  }
};
