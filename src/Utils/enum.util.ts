export const Badges = {
  NEW: "New",
  SALE: "Sale",
  BEST_SELLER: "Best Seller",
};

export const DiscountType = {
  PERCENTAGE: "Percentage",
  FIXED: "Fixed",
};

export const gender = {
  MALE: "Male",
  FEMALE: "Female",
};

export const CouponType = {
  PERCENTAGE: "Percentage",
  Amount: "Amount",
};

export const EnableCoupon = {
  TRUE: "true",
  FALSE: "false",
};

export const PaymentMethod = {
  STRIPE: "stripe",
  PAYMOB: "paymob",
  CASH: "cash",
};

export const OrderStatus = {
  PENDING: "pending",
  PLACED: "placed",
  CONFIRMED: "confirmed",
  CANCELED: "canceled",
  REFUNDED: "refunded",
  DELIVERED: "delivered",
  RETURNED: "returned",
  DROPPED: "dropped",
  ON_WAY: "on_way",
};

// Handle System Roles For Authorizations =>
export const userRole = {
  BUYER: "Buyer",
  ADMIN: "Admin",
};

const { BUYER, ADMIN } = userRole;

export const roles = {
  BUYER: [BUYER],
  ADMIN: [ADMIN],
  BUYER_ADMIN: [ADMIN, BUYER],
};
