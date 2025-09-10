import { PGVectorStore } from "@langchain/community/vectorstores/pgvector";

import { PostgresRecordManager } from "@langchain/community/indexes/postgres";
import { GigaChatEmbeddings } from "langchain-gigachat";
import { index } from "langchain/indexes";
import { Agent } from "node:https";
import { v4 as uuidv4 } from "uuid";
const httpsAgent = new Agent({
  rejectUnauthorized: false,
});

const model = new GigaChatEmbeddings({
  httpsAgent,
  credentials: process.env.GIGACHAT_API_KEY,
});

const tableName = "test_langchain";

const config = {
  postgresConnectionOptions: {
    connectionString: process.env.PG_CONNECTION,
  },
  tableName: tableName,
  columns: {
    idColumnName: "id",
    vectorColumnName: "vector",
    contentColumnName: "content",
    metadataColumnName: "metadata",
  },
};

const vectorStore = await PGVectorStore.initialize(model, config);

// Create a new record manager
const recordManagerConfig = {
  postgresConnectionOptions: {
    connectionString: process.env.PG_CONNECTION,
  },
  tableName: "upsertion_records",
};
const recordManager = new PostgresRecordManager(
  "test_namespace",
  recordManagerConfig
);

// Create the schema if it doesn't exist
await recordManager.createSchema();

const docs = [
  {
    pageContent: "there are cats in the pond",
    metadata: { id: uuidv4(), source: "cats.txt" },
  },
  {
    pageContent: "ducks are also found in the pond",
    metadata: { id: uuidv4(), source: "ducks.txt" },
  },
];

// the first attempt will index both documents
const index_attempt_1 = await index({
  docsSource: docs,
  recordManager,
  vectorStore,
  options: {
    // prevent duplicate documents by id from being indexed
    cleanup: "incremental",
    // the key in the metadata that will be used to identify the document
    sourceIdKey: "source",
  },
});

console.log(index_attempt_1);

// the second attempt will skip indexing because the identical documents
// already exist
const index_attempt_2 = await index({
  docsSource: docs,
  recordManager,
  vectorStore,
  options: {
    cleanup: "incremental",
    sourceIdKey: "source",
  },
});

console.log(index_attempt_2);

// If we mutate a document, the new version will be written and all old
// versions sharing the same source will be deleted.
docs[0]!.pageContent = "I modified the first document content";
const index_attempt_3 = await index({
  docsSource: docs,
  recordManager,
  vectorStore,
  options: {
    cleanup: "incremental",
    sourceIdKey: "source",
  },
});

console.log(index_attempt_3);
