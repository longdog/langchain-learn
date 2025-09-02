import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { TextLoader } from "langchain/document_loaders/fs/text";
import path from "node:path";

const loader = new TextLoader(path.join(import.meta.dir, "./test.txt"));
const docs = await loader.load();
const splitter = new RecursiveCharacterTextSplitter({
  chunkSize: 1000,
  chunkOverlap: 200,
});
const splitted = await splitter.splitDocuments(docs);
console.log(JSON.stringify(splitted, null, 2));
