import { config } from "dotenv";
config();

import { ChatOpenAI } from "@langchain/openai";
import { HumanMessage } from "@langchain/core/messages";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { createTools } from "./tools";

// Define the tools for the agent to use
const agentTools = createTools();

// Define the model to use
const agentModel = new ChatOpenAI({ model: "gpt-4o-mini", temperature: 0 });

const agent = createReactAgent({
  prompt: "You are a helpful assistant.",
  llm: agentModel,
  tools: agentTools,
});

// Now it's time to use!
const agentFinalState = await agent.invoke(
  { messages: [new HumanMessage("what is the current weather in sf")] },
  { configurable: { thread_id: "42" } },
);

console.log(
  agentFinalState.messages[agentFinalState.messages.length - 1].content,
);

console.log("\n\n Message list:");
console.log(JSON.stringify(agentFinalState.messages, null, 2));

