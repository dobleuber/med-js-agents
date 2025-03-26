import { config } from "dotenv";
config();

import { ChatOpenAI } from "@langchain/openai";
import { HumanMessage } from "@langchain/core/messages";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { createTools } from "./tools";
import { saveGraphImage } from "./get_graph";

// Definir las herramientas para el agente
const agentTools = createTools();

// Definir el modelo a utilizar
const agentModel = new ChatOpenAI({ model: "gpt-4o-mini", temperature: 0 });

const agent = createReactAgent({
  prompt: "Eres un asistente útil que habla español. Responde siempre en español y con un tono amigable.",
  llm: agentModel,
  tools: agentTools,
});

// ¡Hora de usar el agente!
const agentFinalState = await agent.invoke(
  { messages: [new HumanMessage("¿Cuál es el clima actual en Medellín?")] },
  { configurable: { thread_id: "42" } },
);

// Save the graph image
await saveGraphImage(agent, "imgs/basic.png");


console.log(
  agentFinalState.messages[agentFinalState.messages.length - 1].content,
);

console.log("\n\n Lista de mensajes:");
console.log(JSON.stringify(agentFinalState.messages, null, 2));
