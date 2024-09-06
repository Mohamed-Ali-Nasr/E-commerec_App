import { CouponModel } from "../../../DB/Models";
import { roles } from "../../Utils";
import { isAuthQl, validation } from "../Middlewares";
import { createCouponValidator } from "../Validators";

export const createCouponResolver = async (parent: any, args: any) => {
  const { couponCode, couponAmount, couponType, from, till, users, token } =
    args;

  // authentication and authorization
  const user = await isAuthQl(token, roles.ADMIN);

  if (user instanceof Error) {
    return user;
  }

  // validation for coupon
  const isArgsValid = await validation(createCouponValidator, args);

  if (isArgsValid !== true) {
    return new Error(JSON.stringify(isArgsValid));
  }

  const newCoupon = await CouponModel.create({
    couponCode,
    couponAmount,
    couponType,
    from,
    till,
    users,
    createdBy: user?.isUserExist._id,
  });

  return newCoupon;
};
