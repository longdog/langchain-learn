import {
  AIMessageChunk,
  HumanMessage,
  SystemMessage,
} from "@langchain/core/messages";
import { GigaChat } from "langchain-gigachat";
import { Agent } from "node:https";

const httpsAgent = new Agent({
  rejectUnauthorized: false,
});

const llm = new GigaChat({
  httpsAgent,
  credentials: process.env.GIGACHAT_API_KEY,
  temperature: 0.1,
});

const reflectionLoop = async () => {
  const taskPrompt = `
    Your task is to create a Python function named "calculate_factorial".
    This function should do the following:
    1.  Accept a single integer "n" as input.
    2.  Calculate its factorial (n!).
    3.  Include a clear docstring explaining what the function does.
    4.  Handle edge cases: The factorial of 0 is 1.
    5.  Handle invalid input: Raise a ValueError if the input is a negative number.
  `;

  // --- The Reflection Loop ---
  const maxIterations = 3;
  let current_code = "";
  let response: AIMessageChunk | undefined = undefined;
  // We will build a conversation history to provide context in each step.
  const message_history = [new HumanMessage({ content: taskPrompt })];

  for (let i = 0; i < maxIterations; i++) {
    console.log(`REFLECTION LOOP: ITERATION ${i + 1}`);

    // --- 1. GENERATE / REFINE STAGE ---
    // In the first iteration, it generates. In subsequent iterations, it refines.
    if (i == 0) {
      console.log("\n>>> STAGE 1: GENERATING initial code...");
      //The first message is just the task prompt.
      response = await llm.invoke(message_history);
      current_code = String(response.content);
    } else {
      console.log("\n>>> STAGE 1: REFINING code based on previous critique...");
      // The message history now contains the task,
      // the last code, and the last critique.
      //  We instruct the model to apply the critiques.
      message_history.push(
        new HumanMessage({
          content: "Please refine the code using the critiques provided.",
        })
      );
      response = await llm.invoke(message_history);
      current_code = String(response.content);
    }
    console.log(
      "--- Generated Code (v" + String(i + 1) + ") ---\n" + current_code
    );
    message_history.push(response); //Add the generated code to history

    // --- 2. REFLECT STAGE ---
    console.log(">>> STAGE 2: REFLECTING on the generated code...");

    //Create a specific prompt for the reflector agent.
    //This asks the model to act as a senior code reviewer.
    const reflector_prompt = [
      new SystemMessage({
        content: `
                You are a senior software engineer and an expert
                 in Python.
                Your role is to perform a meticulous code review.
                Critically evaluate the provided Python code based
                 on the original task requirements.
                Look for bugs, style issues, missing edge cases,
                 and areas for improvement.
                If the code is perfect and meets all requirements,
                respond with the single phrase 'CODE_IS_PERFECT'.
                Otherwise, provide a bulleted list of your critiques.
            `,
      }),
      new HumanMessage({
        content: `Original Task:\n${taskPrompt}\n\nCode to Review:\n${current_code}`,
      }),
    ];

    const critique_response = await llm.invoke(reflector_prompt);
    const critique = String(critique_response.content);

    // --- 3. STOPPING CONDITION ---
    if (critique.includes("CODE_IS_PERFECT")) {
      console.log(
        "\n--- Critique ---\nNo further critiques found. The code is satisfactory."
      );
      break;
    }

    console.log("\n--- Critique ---\n" + critique);

    //Add the critique to the history for the next refinement loop.
    message_history.push(
      new HumanMessage({
        content: `Critique of the previous code:\n${critique}`,
      })
    );
  }
  console.log(" FINAL RESULT ");
  console.log("\nFinal refined code after the reflection process:\n");
  console.log(current_code);
};

await reflectionLoop();
