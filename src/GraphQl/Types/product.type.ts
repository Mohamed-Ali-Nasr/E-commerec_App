import {
  GraphQLEnumType,
  GraphQLFloat,
  GraphQLID,
  GraphQLInt,
  GraphQLList,
  GraphQLObjectType,
  GraphQLString,
} from "graphql";
import { Badges, DiscountType } from "../../Utils";
import { CategoryType } from "./category.type";
import {
  BrandModel,
  CategoryModel,
  SubCategoryModel,
} from "../../../DB/Models";
import { SubCategoryType } from "./sub-category.type";
import { BrandType } from "./brand.type";

const ImageType = new GraphQLObjectType({
  name: "ImageTypes",
  description: "This is The Image Type",
  fields: {
    customId: { type: GraphQLString },
    URLs: {
      type: new GraphQLList(
        new GraphQLObjectType({
          name: "URLType",
          description: "This is The URL Type",
          fields: {
            _id: { type: GraphQLID },
            secure_url: { type: GraphQLString },
            public_id: { type: GraphQLString },
          },
        })
      ),
    },
  },
});

const AppliedDiscountType = new GraphQLObjectType({
  name: "AppliedDiscountType",
  description: "This is The Applied Discount Type",
  fields: {
    amount: { type: GraphQLFloat },
    type: {
      type: new GraphQLEnumType({
        name: "DiscountTypeEnum",
        description: "This is The Discount Type Enum",
        values: {
          percentage: { value: DiscountType.PERCENTAGE },
          fixed: { value: DiscountType.FIXED },
        },
      }),
    },
  },
});

const BadgeType = new GraphQLEnumType({
  name: "BadgeEnum",
  values: {
    new: { value: Badges.NEW },
    sale: { value: Badges.SALE },
    bestSeller: { value: Badges.BEST_SELLER },
  },
});

export const ProductType = new GraphQLObjectType({
  name: "ProductType",
  description: "This is The Product Type",
  fields: {
    _id: { type: GraphQLID },
    title: { type: GraphQLString },
    slug: { type: GraphQLString },
    overview: { type: GraphQLString },
    price: { type: GraphQLFloat },
    appliedPrice: { type: GraphQLFloat },
    stock: { type: GraphQLInt },
    rating: { type: GraphQLFloat },
    categoryId: { type: GraphQLID },
    categoryData: {
      type: CategoryType,
      resolve: async (parent) =>
        await CategoryModel.findById(parent.categoryId),
    },
    subcategoryId: { type: GraphQLID },
    subcategoryData: {
      type: SubCategoryType,
      resolve: async (parent) =>
        await SubCategoryModel.findById(parent.subcategoryId),
    },
    brandId: { type: GraphQLID },
    BrandData: {
      type: BrandType,
      resolve: async (parent) => await BrandModel.findById(parent.brandId),
    },
    createdBy: { type: GraphQLID },
    Images: { type: ImageType },
    appliedDiscount: { type: AppliedDiscountType },
    badge: { type: BadgeType },
  },
});
