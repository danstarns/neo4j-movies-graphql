import { makeAugmentedSchema } from "@neo4j/graphql";
import { ApolloServer } from "apollo-server";
import { driver } from "./neo4j";
import * as config from "../config";
import gql from "graphql-tag";

const typeDefs = gql`
    type Movie {
        movieId: ID!
        title: String
        poster: String
        plot: String
        imdbRating: Float
        genres: [Genre] @relationship(type: "IN_GENRE", direction: "OUT")
        similar(skip: Int!, limit: Int!): [Movie]
            @cypher(
                statement: """
                MATCH (this)-[:IN_GENRE]->(:Genre)<-[:IN_GENRE]-(m:Movie)
                WITH m
                ORDER BY m.poster ASC, m.imdbRating DESC
                RETURN m
                SKIP $skip
                LIMIT $limit
                """
            )
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
