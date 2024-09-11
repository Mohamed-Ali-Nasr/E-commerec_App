import {
  GraphQLBoolean,
  GraphQLEnumType,
  GraphQLFloat,
  GraphQLID,
  GraphQLInputObjectType,
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

const couponUserType = new GraphQLObjectType({
  name: "couponUserType",
  description: "This is The Coupon User Type",
  fields: {
    userId: { type: GraphQLID },
    maxCount: { type: GraphQLInt },
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
    isEnable: { type: GraphQLBoolean },
    createdBy: { type: GraphQLID },
    users: { type: new GraphQLList(couponUserType) },
  },
});

const couponUserInput = new GraphQLInputObjectType({
  name: "couponUserInput",
  description: "This is The Coupon User Input",
  fields: {
    userId: { type: GraphQLID },
    maxCount: { type: GraphQLInt },
  },
});

export const CreateCouponArgs = {
  couponCode: { type: GraphQLString },
  couponAmount: { type: GraphQLFloat },
  couponType: { type: CouponTypeEnum },
  from: { type: GraphQLString },
  till: { type: GraphQLString },
  token: { type: GraphQLString },
  users: { type: new GraphQLList(couponUserInput) },
};
