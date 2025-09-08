import pkg from "pg";
const { Client } = pkg;

const client = new Client({
  connectionString: process.env.PG_CONNECTION,
});

await client.connect();
console.log("Connected to Postgres!");
await client.end();
