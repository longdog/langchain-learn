import { StringOutputParser } from "@langchain/core/output_parsers";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { RunnableMap } from "@langchain/core/runnables";
import { type InteropZodType } from "@langchain/core/utils/types";
import { GigaChat } from "langchain-gigachat";
import {
  OutputFixingParser,
  StructuredOutputParser,
} from "langchain/output_parsers";
import { Agent } from "node:https";
import { z } from "zod";

const httpsAgent = new Agent({
  rejectUnauthorized: false,
});

const llm = new GigaChat({
  httpsAgent,
  credentials: process.env.GIGACHAT_API_KEY,
});

// --- Schema + Parser ---
const specSchema = z
  .object({
    cpu: z.string().describe("Central Processor: model, generation, frequency"),
    memory: z.string().describe("RAM"),
    storage: z.string().describe("storage type and size"),
  })
  .describe("Hardware specification");
const jsonParser = StructuredOutputParser.fromZodSchema(
  specSchema as unknown as InteropZodType
);
const fixedJsonParser = OutputFixingParser.fromLLM(llm, jsonParser);

// --- Полная цепочка (одним выражением) ---
const fullChain = ChatPromptTemplate.fromTemplate(
  "Extract the technical specifications from the following text:\n\n{text_input}"
)
  .pipe(llm)
  .pipe(new StringOutputParser())
  .pipe(
    RunnableMap.from({
      specifications: (s: string) => s,
      format_instructions: (_, input: any) => input.format_instructions,
    })
  )
  .pipe(
    ChatPromptTemplate.fromTemplate(
      `Transform the following specifications into a JSON object.

Follow these rules strictly:
- Return ONLY valid JSON.
- Do not include any explanations, labels, or code fences.
- Output must match this schema exactly: 
{format_instructions}

Specifications:
{specifications}
`
    )
  )
  .pipe(llm)
  .pipe(fixedJsonParser);
// --- Запуск ---
(async () => {
  const inputText =
    "The new laptop model features a 3.5 GHz octa-core processor, 16GB of RAM, and a 1TB NVMe SSD.";

  const finalResult = await fullChain.invoke({
    text_input: inputText,
    format_instructions: jsonParser.getFormatInstructions(),
  });

  console.log("\n--- Final JSON Output ---");
  console.log(finalResult);
})();
