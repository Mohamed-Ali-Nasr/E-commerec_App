import { NextFunction, RequestHandler, Response } from "express";
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
// stripe payment
import * as stripe from "../../payment-handler/stripe";
import Stripe from "stripe";

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

/**
 * @api {POST} /orders/stripe-pay/:orderId  payment with stripe
 */
export const paymentWithStripe = async (
  req: IRequest,
  res: Response,
  next: NextFunction
) => {
  const { userId } = req;
  const { orderId } = req.params;

  try {
    // get order data by orderId
    const order = await OrderModel.findOne({
      _id: orderId,
      userId,
      orderStatus: OrderStatus.PENDING,
    });
    if (!order) {
      throw createHttpError(404, "Order not found");
    }

    // create tax rate
    const taxRate = await stripe.createTaxRate({ percentage: order.VAT });

    // prepare payment object
    const paymentObject = {
      customer_email: req.authUser?.email,
      metadata: { orderId: order._id.toString() } as Stripe.MetadataParam,
      discounts: [] as Stripe.Checkout.SessionCreateParams.Discount[],
      line_items: order.products.map((product) => {
        return {
          price_data: {
            currency: "egp",
            unit_amount: product.price * 100, // in cents
            product_data: {
              name: req.authUser?.username,
            },
          },

          quantity: product.quantity,
          tax_rates: [taxRate.id],
        };
      }) as Stripe.Checkout.SessionCreateParams.LineItem[],

      shipping_options: [
        {
          shipping_rate_data: {
            type: "fixed_amount",
            fixed_amount: {
              amount: 0,
              currency: "egp",
            },
            display_name: "Free shipping",
            delivery_estimate: {
              minimum: {
                unit: "business_day",
                value: 5,
              },
              maximum: {
                unit: "business_day",
                value: 7,
              },
            },
          },
        },
        {
          shipping_rate_data: {
            type: "fixed_amount",
            fixed_amount: {
              amount: order.shippingFee * 100,
              currency: "egp",
            },
            display_name: "Next day air",
            delivery_estimate: {
              minimum: {
                unit: "business_day",
                value: 1,
              },
              maximum: {
                unit: "business_day",
                value: 1,
              },
            },
          },
        },
      ] as Stripe.Checkout.SessionCreateParams.ShippingOption[],
    };

    // check if the order has coupon code
    if (order.couponId) {
      const stripeCoupon = await stripe.createStripeCoupon({
        couponId: order.couponId as string,
      });

      if (!stripeCoupon.valid) {
        throw createHttpError(400, "unknown stripe error");
      }

      paymentObject.discounts.push({ coupon: stripeCoupon.id });
    }

    // create checkout session
    const session = await stripe.createCheckoutSession(paymentObject);

    // create payment intent
    const paymentIntent = await stripe.createPaymentIntent({
      amount: session.amount_total as number,
      currency: "egp",
    });

    // update payment intent
    order.payment_intent = paymentIntent.id;

    // save order model
    await order.save();

    // send the response
    res.status(200).json({
      status: "success",
      message: "payment session created successfully",
      data: { session, paymentIntent },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @api {POST} /orders/webhook  stripe webhook if payment success
 */
export const localStripeWebhook: RequestHandler = async (req, res, next) => {
  try {
    // get the orderId from body of request after payment completion event
    const orderId = req.body.data.object.metadata.orderId;
    if (!orderId) {
      throw createHttpError(
        400,
        "unknown error occurred durning confirm payment with stripe"
      );
    }

    // update order status after payment completion
    const confirmOrder = await OrderModel.findByIdAndUpdate(
      orderId,
      {
        orderStatus: OrderStatus.CONFIRMED,
      },
      { new: true }
    );

    // confirm payment intent
    const confirmPayment = await stripe.confirmPaymentIntent({
      paymentIntentId: confirmOrder?.payment_intent as string,
    });

    // send the response
    res.status(200).json({
      status: "success",
      message: "payment confirmed successfully",
      data: confirmOrder,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @api {POST} /orders/refund/:orderId  refund payment with stripe
 */
export const refundPaymentData = async (
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
      orderStatus: OrderStatus.CONFIRMED,
    });
    if (!order) {
      throw createHttpError(404, "Order not found");
    }

    // refund payment data
    const refund = await stripe.refundPayment({
      paymentIntentId: order.payment_intent,
    });

    if (refund.status === "failed") {
      throw createHttpError(
        400,
        "unknown error occurred durning refund payment with stripe"
      );
    }

    // update order status
    order.orderStatus = OrderStatus.REFUNDED;

    // save order model
    await order.save();

    // send the response
    res.status(200).json({
      status: "success",
      message: "payment refund successfully",
      data: { order },
    });
  } catch (error) {
    next(error);
  }
};
