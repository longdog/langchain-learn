import { CommaSeparatedListOutputParser } from "@langchain/core/output_parsers";

const parser = new CommaSeparatedListOutputParser();
const res = await parser.invoke("a,b,c ");
console.log(parser.getFormatInstructions());
console.log(res);
