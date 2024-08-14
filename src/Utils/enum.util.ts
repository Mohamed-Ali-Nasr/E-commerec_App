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
