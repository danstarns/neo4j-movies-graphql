import { makeAugmentedSchema } from "@neo4j/graphql";
import { ApolloServer } from "apollo-server";
import { driver } from "./neo4j";
import * as config from "../config";
import gql from "graphql-tag";

const typeDefs = gql`
    type Movie {
        movieId: ID!
        budget: Int!
        countries: [String]!
        imdbRating: Float!
        genres: [Genre] @relationship(type: "IN_GENRE", direction: "OUT")
    }

    type Genre {
        name: String!
    }
`;

const neoSchema = makeAugmentedSchema({
    typeDefs,
    debug: config.NODE_ENV === "development",
});

export const server: ApolloServer = new ApolloServer({
    schema: neoSchema.schema,
    context: ({ req }) => ({ driver, req }),
});
