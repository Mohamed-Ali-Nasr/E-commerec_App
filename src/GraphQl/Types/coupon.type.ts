import {
  GraphQLBoolean,
  GraphQLEnumType,
  GraphQLFloat,
  GraphQLID,
  GraphQLInt,
  GraphQLList,
  GraphQLObjectType,
  GraphQLString,
} from "graphql";
import { CouponType as couponEnum } from "../../Utils";

const CouponTypeEnum = new GraphQLEnumType({
  name: "CouponTypeEnum",
  description: "This is The Coupon Type Enum",
  values: {
    percentage: { value: couponEnum.PERCENTAGE },
    amount: { value: couponEnum.Amount },
  },
});

export const CouponType = new GraphQLObjectType({
  name: "CouponType",
  description: "This is The Coupon Type",
  fields: {
    _id: { type: GraphQLID },
    couponCode: { type: GraphQLString },
    couponAmount: { type: GraphQLFloat },
    couponType: { type: CouponTypeEnum },
    from: { type: GraphQLString },
    till: { type: GraphQLString },
    stock: { type: GraphQLInt },
    isEnable: { type: GraphQLBoolean },
    createdBy: { type: GraphQLID },
  },
});

export const CreateCouponArgs = {
  couponCode: { type: GraphQLString },
  couponAmount: { type: GraphQLFloat },
  couponType: { type: CouponTypeEnum },
  from: { type: GraphQLString },
  till: { type: GraphQLString },
  stock: { type: GraphQLInt },
  token: { type: GraphQLString },
};
