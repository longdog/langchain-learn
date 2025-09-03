import { PGVectorStore } from "@langchain/community/vectorstores/pgvector";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { TextLoader } from "langchain/document_loaders/fs/text";

import { GigaChatEmbeddings } from "langchain-gigachat";
import { Agent } from "node:https";
import path from "node:path";

const httpsAgent = new Agent({
  rejectUnauthorized: false,
});

const model = new GigaChatEmbeddings({
  httpsAgent,
  credentials: process.env.GIGACHAT_API_KEY,
});

// Load the document, split it into chunks
const loader = new TextLoader(path.join(import.meta.dir, "./test.txt"));
const raw_docs = await loader.load();
const splitter = new RecursiveCharacterTextSplitter({
  chunkSize: 1000,
  chunkOverlap: 200,
});
const docs = await splitter.splitDocuments(raw_docs);

const db = await PGVectorStore.fromDocuments(docs, model, {
  postgresConnectionOptions: {
    connectionString: process.env["PG_CONNECTION"],
  },
  tableName: "bible",
});
