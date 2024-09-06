import { GraphQLID, GraphQLObjectType, GraphQLString } from "graphql";

const ImageType = new GraphQLObjectType({
  name: "ImageType",
  description: "This is The Image Type",
  fields: {
    secure_url: { type: GraphQLString },
    public_id: { type: GraphQLString },
  },
});

export const CategoryType = new GraphQLObjectType({
  name: "CategoryType",
  description: "This is The Category Type",
  fields: {
    _id: { type: GraphQLID },
    name: { type: GraphQLString },
    slug: { type: GraphQLString },
    createdBy: { type: GraphQLID },
    Images: { type: ImageType },
    customId: { type: GraphQLString },
  },
});
