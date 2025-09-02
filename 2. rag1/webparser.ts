import { CheerioWebBaseLoader } from "@langchain/community/document_loaders/web/cheerio";
const loader = new CheerioWebBaseLoader("https://langchain.com/");
const docs = await loader.load();
console.log(docs);
