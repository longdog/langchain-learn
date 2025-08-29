import {ChatGroq} from "@langchain/groq"

const model = new ChatGroq({
  model: "meta-llama/llama-4-scout-17b-16e-instruct",
  temperature: 0,
});

const res = await model.invoke("The sky is ")
console.log(res.result)

