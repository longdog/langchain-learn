import { HumanMessage } from "@langchain/core/messages";
import { ChatGroq } from "@langchain/groq";
import { z } from "zod";

const answerSchema = z.object({
  answer: z.string().describe("The answer to the user's question"),
  justification: z.string().describe(`Justification for the 
      answer`),
}).describe(`An answer to the user's question along with justification for 
    the answer.`);

const model = new ChatGroq({
  model: "meta-llama/llama-4-scout-17b-16e-instruct",
  temperature: 0,
}).withStructuredOutput(answerSchema);
const prompt = [
  new HumanMessage(
    "What weighs more, a pound of bricks or a pound of feathers"
  ),
];
const res = await model.invoke(prompt);
console.log(res);
