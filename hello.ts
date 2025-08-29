import {ChatGroq} from "@langchain/groq"
import {HumanMessage, SystemMessage} from "@langchain/core/messages"

const model = new ChatGroq({
  model: "meta-llama/llama-4-scout-17b-16e-instruct",
  temperature: 0,
});
const prompt = [
  new SystemMessage(`You are a helpful assistant that responds to questions with three exclamation marks.`),
  new HumanMessage("What is the capital of france?")
]
const res = await model.invoke(prompt)
console.log(res.content)

