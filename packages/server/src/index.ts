import * as graphql from "./graphql";
import * as neo4j from "./neo4j";
import * as config from "../config";

async function main() {
    console.log("Starting Server");

    await neo4j.connect();

    await graphql.server.listen(config.HTTP_PORT);

    console.log("Started Server");
}

main();
