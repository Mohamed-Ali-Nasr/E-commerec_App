import { GraphQLList, GraphQLObjectType, GraphQLSchema } from "graphql";
import { createCouponResolver, listProductsResolver } from "../Resolvers";
import { ProductType, CouponType, CreateCouponArgs } from "../Types";

export const mainSchema = new GraphQLSchema({
  query: new GraphQLObjectType({
    name: "RootQuery",
    description: "This is the root query",
    fields: {
      listProducts: {
        description: "This will return 'Product List Array'",
        type: new GraphQLList(ProductType),
        resolve: listProductsResolver,
      },
    },
  }),

  mutation: new GraphQLObjectType({
    name: "RootMutation",
    description: "This is the root mutation",
    fields: {
      createCoupon: {
        description: "a simple mutation to create a coupon",
        type: CouponType,
        args: CreateCouponArgs,
        resolve: createCouponResolver,
      },
    },
  }),
});
