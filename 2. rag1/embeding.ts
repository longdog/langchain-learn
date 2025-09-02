import { GigaChatEmbeddings } from "langchain-gigachat";
import { Agent } from "node:https";

const httpsAgent = new Agent({
  rejectUnauthorized: false,
});

const model = new GigaChatEmbeddings({
  httpsAgent,
  credentials: process.env.GIGACHAT_API_KEY,
});
const embeddings = await model.embedDocuments([
  "Шла Саша по шоссе",
  "И сосала сушку",
]);
console.log(embeddings);
