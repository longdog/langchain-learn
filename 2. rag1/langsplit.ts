import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { TextLoader } from "langchain/document_loaders/fs/text";
import path from "node:path";

const loader = new TextLoader(path.join(import.meta.dir, "./test.rs"));
const docs = await loader.load();
const splitter = RecursiveCharacterTextSplitter.fromLanguage("rust", {
  chunkSize: 100,
  chunkOverlap: 0,
});
const splitted = await splitter.splitDocuments(docs);
console.log(JSON.stringify(splitted, null, 2));
