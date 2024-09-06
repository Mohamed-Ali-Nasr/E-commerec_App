import { GraphQLID, GraphQLObjectType, GraphQLString } from "graphql";

const LogoType = new GraphQLObjectType({
  name: "LogoType",
  description: "This is The Logo Type",
  fields: {
    secure_url: { type: GraphQLString },
    public_id: { type: GraphQLString },
  },
});

export const BrandType = new GraphQLObjectType({
  name: "BrandType",
  description: "This is The Brand Type",
  fields: {
    _id: { type: GraphQLID },
    name: { type: GraphQLString },
    slug: { type: GraphQLString },
    createdBy: { type: GraphQLID },
    logo: { type: LogoType },
    customId: { type: GraphQLString },
  },
});
