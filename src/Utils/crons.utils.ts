import { scheduleJob } from "node-schedule";
import { CouponModel } from "../../DB/Models";
import { DateTime } from "luxon";

export const disableCouponsCron = () => {
  scheduleJob("0 59 23 * * *", async () => {
    console.log("cron job to disable coupons disableCouponsCron()");

    const enableCoupons = await CouponModel.find({ isEnable: true });

    if (enableCoupons.length) {
      for (const coupon of enableCoupons) {
        if (DateTime.now() > DateTime.fromJSDate(coupon.till)) {
          coupon.isEnable = false;
          await coupon.save();
        }
      }
    }
  });
};
