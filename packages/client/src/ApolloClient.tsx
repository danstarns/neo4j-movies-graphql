import React from "react";
import { ApolloClient } from "apollo-client";
import { InMemoryCache } from "apollo-cache-inmemory";
import { DocumentNode } from "graphql";
import { ApolloProvider } from "@apollo/react-hooks";
import { createHttpLink } from "apollo-link-http";
import { API_URL } from "../config";

type ContextType = { [k: string]: any } & { client: ApolloClient<any> } & {
    query: (args: { query: DocumentNode; variables: any }) => Promise<any>;
};

// @ts-ignore
export const Context = React.createContext<ContextType>({});

const client = new ApolloClient({
    link: createHttpLink({
        uri: `${API_URL}/graphql`,
        headers: {
            "keep-alive": "true",
        },
    }),
    cache: new InMemoryCache({
        dataIdFromObject: (object: any) => object._id || null,
    }),
});

async function query(args: { query: DocumentNode; variables: any }) {
    const response = await client.query({
        query: args.query,
        variables: args.variables,
        fetchPolicy: "no-cache",
    });

    if (response.errors && response.errors.length) {
        throw new Error(response.errors[0].message);
    }

    return response.data;
}

export function Provider(props: any) {
    return (
        // @ts-ignore
        <ApolloProvider client={client}>
            <Context.Provider value={{ client, query }}>
                {props.children}
            </Context.Provider>
        </ApolloProvider>
    );
}
