import { TextLoader } from "langchain/document_loaders/fs/text";
import path from "node:path";

const loader = new TextLoader(path.join(import.meta.dir, "./test.txt"));
const docs = await loader.load();
console.log(docs);
