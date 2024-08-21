import { DateTime } from "luxon";
import { CouponModel, ICouponSchema } from "../../../DB/Models";
import { CouponType } from "../../Utils";

/**
 * @param {*} couponCode
 * @param {*} userId
 * @returns { message: String, error: Boolean, coupon: Object }
 */
export const validateCoupon = async (
  couponCode: string,
  userId: string
): Promise<
  | {
      message: string;
      error: boolean;
      coupon?: ICouponSchema;
    }
  | undefined
> => {
  // get coupon by couponCode
  const coupon = await CouponModel.findOne({ couponCode });

  // check if coupon is not existing in database
  if (!coupon) {
    return { message: "Invalid coupon code", error: true };
  }

  // check if coupon is enable or not
  if (!coupon.isEnable || DateTime.now() > DateTime.fromJSDate(coupon.till)) {
    return { message: "coupon is expired", error: true };
  }

  // check if coupon is not started yet
  if (DateTime.now() < DateTime.fromJSDate(coupon.from)) {
    return {
      message: `coupon is not started yet, coupon will start on ${DateTime.fromJSDate(
        coupon.from
      ).toFormat("yyyy-MM-dd")}`,
      error: true,
    };
  }

  // check if user is not eligible to use coupon
  const isUserNotEligible = coupon.users.some(
    (u) =>
      u.userId.toString() !== userId.toString() ||
      (u.userId.toString() === userId.toString() && u.maxCount <= u.usageCount)
  );
  if (isUserNotEligible) {
    return {
      message:
        "user is not eligible to use this coupon or you redeem all your tries",
      error: true,
    };
  }

  return { message: "coupon is valid", error: false, coupon };
};

/**
 *
 * @param {number} subTotal  - number
 * @param {number} shippingFee  - number
 * @param {number} VAT  - number
 * @param {object} coupon  - object
 * @returns {number} total - number
 * @description  calculate the total price based on the coupon type and amount
 */
export const applyCoupon = (
  subTotal: number,
  coupon: ICouponSchema,
  shippingFee: number,
  VAT: number
): number => {
  let total = subTotal;
  const { couponAmount, couponType } = coupon;

  if (couponAmount && couponType) {
    if (couponType === CouponType.PERCENTAGE) {
      total = subTotal - (subTotal * couponAmount) / 100;
    } else if (couponType === CouponType.Amount) {
      if (couponAmount > subTotal) {
        return total;
      }
      total = subTotal - couponAmount;
    }
  }

  return total + shippingFee + VAT;
};
