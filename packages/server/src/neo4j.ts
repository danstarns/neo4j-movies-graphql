import * as neo4j from "neo4j-driver";
import * as config from "../config";

export const driver = neo4j.driver(
    config.NEO_URL,
    neo4j.auth.basic(config.NEO_USER, config.NEO_PASSWORD)
);

export async function connect() {
    console.log("Connecting to Neo4j");

    await driver.verifyConnectivity();

    console.log("Connected to Neo4j");
}

export function disconnect() {
    return driver.close();
}
