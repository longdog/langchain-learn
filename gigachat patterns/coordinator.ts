import { StringOutputParser } from "@langchain/core/output_parsers";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import {
  RunnableBranch,
  RunnableLambda,
  RunnablePassthrough,
} from "@langchain/core/runnables";
import { GigaChat } from "langchain-gigachat";
import { Agent } from "node:https";

const httpsAgent = new Agent({
  rejectUnauthorized: false,
});

const llm = new GigaChat({
  httpsAgent,
  credentials: process.env.GIGACHAT_API_KEY,
});

const booking = (request: string) => {
  console.log("DELEGATING TO BOOKING HANDLER");
  return `Booking Handler processed request: '${request}'. Result: Simulated booking action.`;
};

const info = (request: string) => {
  console.log("DELEGATING TO INFO HANDLER");
  return `Info Handler processed request: '${request}'. Result: Simulated info action.`;
};

const unclear = (request: string) => {
  console.log("DELEGATING TO UNCLEAR HANDLER");
  return `Unclear Handler processed request: '${request}'. Result: Need more info.`;
};

const coordinatorRouterPrompt = ChatPromptTemplate.fromMessages([
  [
    "system",
    `Analyze the user's request and determine which specialist handler should process it.
     - If the request is related to booking flights or hotels,
        output 'booker'.
     - For all other general information questions, output 'info'.
     - If the request is unclear or doesn't fit either category,
        output 'unclear'.
     ONLY output one word: 'booker', 'info', or 'unclear'.`,
  ],
  ["user", "{request}"],
]);

const coordinatorRouterChain = coordinatorRouterPrompt
  .pipe(llm)
  .pipe(new StringOutputParser());

const branches = {
  booker: RunnablePassthrough.assign({
    output: (x) => booking(x.request.request),
  }),
  info: RunnablePassthrough.assign({
    output: (x) => info(x.request.request),
  }),

  unclear: RunnablePassthrough.assign({
    output: (x) => unclear(x.request.request),
  }),
};
const delegationBranch = RunnableBranch.from([
  [(x: any) => x.decision.trim() === "booker", branches.booker],
  [(x: any) => x.decision.trim() === "info", branches.info],
  branches.unclear,
]);

const coordinatorAgent =
  coordinatorRouterChain &&
  new RunnablePassthrough()
    .assign({
      decision: coordinatorRouterChain,
      request: new RunnablePassthrough(),
    })
    .pipe(delegationBranch)
    .pipe(
      new RunnableLambda({
        func: (x: any) => x.output,
      })
    );

async function main() {
  if (!coordinatorAgent) {
    console.log("\nSkipping execution due to LLM initialization failure.");
    return;
  }

  console.log("--- Running with a booking request ---");
  const resultA = await coordinatorAgent.invoke({
    request: "Book me a flight to London.",
  });
  console.log(`Final Result A: ${resultA}`);

  console.log("\n--- Running with an info request ---");
  const resultB = await coordinatorAgent.invoke({
    request: "What is the capital of Italy?",
  });
  console.log(`Final Result B: ${resultB}`);

  console.log("\n--- Running with an unclear request ---");
  const resultC = await coordinatorAgent.invoke({
    request: "Tell me about quantum physics.",
  });
  console.log(`Final Result C: ${resultC}`);
}

main().catch(console.error);
