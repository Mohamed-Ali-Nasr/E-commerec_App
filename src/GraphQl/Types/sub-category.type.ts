import { GraphQLID, GraphQLObjectType, GraphQLString } from "graphql";

const ImageType = new GraphQLObjectType({
  name: "SubCategoryImageType",
  description: "This is The Image Type for sub category",
  fields: {
    secure_url: { type: GraphQLString },
    public_id: { type: GraphQLString },
  },
});

export const SubCategoryType = new GraphQLObjectType({
  name: "SubCategoryType",
  description: "This is The Sub Category Type",
  fields: {
    _id: { type: GraphQLID },
    name: { type: GraphQLString },
    slug: { type: GraphQLString },
    createdBy: { type: GraphQLID },
    Images: { type: ImageType },
    customId: { type: GraphQLString },
  },
});
