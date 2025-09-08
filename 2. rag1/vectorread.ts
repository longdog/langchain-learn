import { PGVectorStore } from "@langchain/community/vectorstores/pgvector";

import { GigaChatEmbeddings } from "langchain-gigachat";
import { Agent } from "node:https";

const httpsAgent = new Agent({
  rejectUnauthorized: false,
});

const model = new GigaChatEmbeddings({
  httpsAgent,
  credentials: process.env.GIGACHAT_API_KEY,
});
const db = await PGVectorStore.initialize(model, {
  postgresConnectionOptions: {
    connectionString: process.env.PG_CONNECTION,
  },
  tableName: "bible",
});
const res = await db.similaritySearch("god", 4);
console.log(res);
