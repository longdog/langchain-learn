import { ChatPromptTemplate, PromptTemplate } from "@langchain/core/prompts";
import { ChatGroq } from "@langchain/groq";

const model = new ChatGroq({
  model: "meta-llama/llama-4-scout-17b-16e-instruct",
  temperature: 0,
});
const template = PromptTemplate.fromTemplate(`Answer the question based on the 
  context below. If the question cannot be answered using the information 
  provided, answer with "I don't know".

Context: {context}

Question: {question}

Answer: `);

const prompt = await template.invoke({
  context: `The most recent advancements in NLP are being driven by Large 
    Language Models (LLMs). These models outperform their smaller 
    counterparts and have become invaluable for developers who are creating 
    applications with NLP capabilities. Developers can tap into these models 
    through Hugging Face's \`transformers\` library, or by utilizing OpenAI 
    and Cohere's offerings through the \`openai\` and \`cohere\` libraries, 
    respectively.`,
  question: `Which model providers offer LLMs?`,
});
const res = await model.invoke(prompt);
console.log(res.content);

const chatTemplate = ChatPromptTemplate.fromMessages([
  [
    "system",
    `nswer the question based on the context below. If the question 
    cannot be answered using the information provided, answer with "I 
    don\'t know".`,
  ],
  ["human", `Context: {context}`],
  ["human", `Question: {question}`],
]);

const chatPrompt = await chatTemplate.invoke({
  context: `The most recent advancements in NLP are being driven by Large 
    Language Models (LLMs). These models outperform their smaller 
    counterparts and have become invaluable for developers who are creating 
    applications with NLP capabilities. Developers can tap into these models 
    through Hugging Face's \`transformers\` library, or by utilizing OpenAI 
    and Cohere's offerings through the \`openai\` and \`cohere\` libraries, 
    respectively.`,
  question: `Which model providers offer LLMs?`,
});

const chatRes = await model.invoke(chatPrompt);
console.log(chatRes.content);
