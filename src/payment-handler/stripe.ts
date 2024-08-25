import createHttpError from "http-errors";
import Stripe from "stripe";
import { CouponType, env } from "../Utils";
import { CouponModel } from "../../DB/Models";

// create checkout session
export const createCheckoutSession = async ({
  customer_email,
  metadata,
  discounts,
  line_items,
  shipping_options,
}: {
  customer_email: string | undefined;
  metadata: Stripe.MetadataParam;
  discounts?: Stripe.Checkout.SessionCreateParams.Discount[];
  line_items: Stripe.Checkout.SessionCreateParams.LineItem[];
  shipping_options: Stripe.Checkout.SessionCreateParams.ShippingOption[];
}) => {
  const stripe = new Stripe(env.STRIPE_SECRET_KEY);

  const paymentData = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    mode: "payment",
    customer_email,
    metadata,
    success_url: env.SUCCESS_URL,
    cancel_url: env.CANCEL_URL,
    discounts,
    line_items,
    shipping_options,
  });

  return paymentData;
};

// create stripe coupon
export const createStripeCoupon = async ({
  couponId,
}: {
  couponId: string;
}) => {
  // check if coupon is already exists in the database
  const coupon = await CouponModel.findById(couponId);
  if (!coupon) {
    throw createHttpError(404, "Coupon not found");
  }

  let couponObject = {};
  if (coupon.couponType === CouponType.Amount) {
    couponObject = {
      name: coupon.couponCode,
      amount_off: coupon.couponAmount * 100, // in cents
      currency: "egp",
    };
  }

  if (coupon.couponType === CouponType.PERCENTAGE) {
    couponObject = {
      name: coupon.couponCode,
      percent_off: coupon.couponAmount,
    };
  }

  const stripe = new Stripe(env.STRIPE_SECRET_KEY);

  const stripeCoupon = await stripe.coupons.create(couponObject);

  return stripeCoupon;
};

// create payment method
export const createPaymentMethod = async ({ token }: { token: string }) => {
  const stripe = new Stripe(env.STRIPE_SECRET_KEY);

  const paymentMethod = await stripe.paymentMethods.create({
    type: "card",
    card: {
      token,
    },
  });

  return paymentMethod;
};

// create payment intent
export const createPaymentIntent = async ({
  amount,
  currency,
}: {
  amount: number;
  currency: string;
}) => {
  const stripe = new Stripe(env.STRIPE_SECRET_KEY);

  const paymentMethod = await createPaymentMethod({ token: "tok_visa" });

  const paymentIntent = await stripe.paymentIntents.create({
    amount: amount * 100, // in cents
    currency,
    automatic_payment_methods: { enabled: true, allow_redirects: "never" },
    payment_method: paymentMethod.id,
  });

  return paymentIntent;
};

// retrieve payment intent
export const retrievePaymentIntent = async ({
  paymentIntentId,
}: {
  paymentIntentId: string;
}) => {
  const stripe = new Stripe(env.STRIPE_SECRET_KEY);

  const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

  return paymentIntent;
};

// confirm payment intent
export const confirmPaymentIntent = async ({
  paymentIntentId,
}: {
  paymentIntentId: string;
}) => {
  const stripe = new Stripe(env.STRIPE_SECRET_KEY);

  const paymentDetails = await retrievePaymentIntent({ paymentIntentId });

  const paymentIntent = await stripe.paymentIntents.confirm(paymentIntentId, {
    payment_method: paymentDetails.payment_method as string,
  });

  return paymentIntent;
};

// refund payment data
export const refundPayment = async ({
  paymentIntentId,
}: {
  paymentIntentId: string;
}) => {
  const stripe = new Stripe(env.STRIPE_SECRET_KEY);

  const refund = await stripe.refunds.create({
    payment_intent: paymentIntentId,
  });

  return refund;
};

// create tax rate
export const createTaxRate = async ({ percentage }: { percentage: number }) => {
  const stripe = new Stripe(env.STRIPE_SECRET_KEY);

  const taxRate = await stripe.taxRates.create({
    display_name: "VAT",
    percentage,
    inclusive: false,
  });

  return taxRate;
};
