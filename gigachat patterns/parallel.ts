import { StringOutputParser } from "@langchain/core/output_parsers";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import {
  RunnableParallel,
  RunnablePassthrough,
  type Runnable,
} from "@langchain/core/runnables";
import { GigaChat } from "langchain-gigachat";
import { Agent } from "node:https";

const httpsAgent = new Agent({
  rejectUnauthorized: false,
});

const llm = new GigaChat({
  httpsAgent,
  credentials: process.env.GIGACHAT_API_KEY,
  temperature: 0.7,
  maxConcurrency: 5,
});

// --- Независимые цепочки ---
// Каждая цепочка выполняет свою задачу

// 1.
const summarizeChain: Runnable = ChatPromptTemplate.fromMessages([
  ["system", "Summarize the following topic concisely:"],
  ["user", "{topic}"],
])
  .pipe(llm!)
  .pipe(new StringOutputParser());
// 2.
const questionsChain: Runnable = ChatPromptTemplate.fromMessages([
  ["system", "Generate three interesting questions about the following topic:"],
  ["user", "{topic}"],
])
  .pipe(llm!)
  .pipe(new StringOutputParser());

// 3.
const termsChain: Runnable = ChatPromptTemplate.fromMessages([
  [
    "system",
    "Identify 5-10 key terms from the following topic, separated by commas:",
  ],
  ["user", "{topic}"],
])
  .pipe(llm!)
  .pipe(new StringOutputParser());

// --- Параллельный блок + финальный синтез ---
const mapChain = new RunnableParallel({
  steps: {
    summary: summarizeChain,
    questions: questionsChain,
    key_terms: termsChain,
    topic: new RunnablePassthrough(), // передаём исходный топик без изменений
  },
});
// Финальный промпт для объединения результатов
const synthesisPrompt = ChatPromptTemplate.fromMessages([
  [
    "system",
    `Based on the following information:
    Summary: {summary}
    Related Questions: {questions}
    Key Terms: {key_terms}
    Synthesize a comprehensive answer.`,
  ],
  ["user", "Original topic: {topic}"],
]);

// Полная цепочка: параллельные задачи → синтез → LLM → парсер
const fullParallelChain = mapChain
  .pipe(synthesisPrompt)
  .pipe(llm!)
  .pipe(new StringOutputParser());

// --- Запуск ---
async function runParallelExample(topic: string) {
  if (!llm) {
    console.log("LLM not initialized. Cannot run example.");
    return;
  }

  console.log(
    `\n--- Running Parallel LangChain Example for Topic: '${topic}' ---`
  );
  try {
    const response = await fullParallelChain.invoke({ topic });
    console.log("\n--- Final Response ---");
    console.log(response);
  } catch (e) {
    console.error("\nAn error occurred during chain execution:", e);
  }
}

const testTopic = "The history of space exploration";
runParallelExample(testTopic);
