// agent.ts

// IMPORTANTE - Agrega tus claves API aquí. Ten cuidado de no publicarlas.
import { config } from "dotenv";
config();


import { ChatOpenAI } from "@langchain/openai";
import { HumanMessage, AIMessage } from "@langchain/core/messages";
import { ToolNode } from "@langchain/langgraph/prebuilt";
import { StateGraph, MessagesAnnotation } from "@langchain/langgraph";
import { saveGraphImage } from "./get_graph";

import { createTools } from "./tools";

// Define las herramientas para que el agente las use
const tools = createTools();
const toolNode = new ToolNode(tools);

// Crea un modelo y dale acceso a las herramientas
const model = new ChatOpenAI({
  model: "gpt-4o-mini",
  temperature: 0,
}).bindTools(tools);

// Define la función que determina si continuar o no
function shouldContinue({ messages }: typeof MessagesAnnotation.State) {
  const lastMessage = messages[messages.length - 1] as AIMessage;

  // Si el LLM hace una llamada a herramienta, entonces enrutamos al nodo "tools"
  if (lastMessage.tool_calls?.length) {
    return "tools";
  }
  // De lo contrario, nos detenemos (respondemos al usuario) usando el nodo especial "__end__"
  return "__end__";
}

// Define la función que llama al modelo
async function callModel(state: typeof MessagesAnnotation.State) {
  const response = await model.invoke(state.messages);

  // Devolvemos una lista, porque esto se agregará a la lista existente
  return { messages: [response] };
}

// Define un nuevo grafo
const workflow = new StateGraph(MessagesAnnotation)
  .addNode("agent", callModel)
  .addEdge("__start__", "agent") // __start__ es un nombre especial para el punto de entrada
  .addNode("tools", toolNode)
  .addEdge("tools", "agent")
  .addConditionalEdges("agent", shouldContinue);

// Finalmente, lo compilamos en un Runnable de LangChain.
const app = workflow.compile();

// Usa el agente
const finalState = await app.invoke({
  messages: [new HumanMessage("¿cómo está el clima en Medellín hoy?")],
});
console.log(finalState.messages[finalState.messages.length - 1].content);

// Save the graph image
await saveGraphImage(app, "imgs/custom.png");

const nextState = await app.invoke({
  // Incluir los mensajes de la ejecución anterior le da contexto al LLM.
  // De esta manera sabe que estamos preguntando sobre el clima en Bogotá
  messages: [...finalState.messages, new HumanMessage("¿y qué tal en Bogotá?")],
});
console.log(nextState.messages[nextState.messages.length - 1].content);

console.log("\n\n Lista de mensajes:");
console.log(JSON.stringify(nextState.messages, null, 2));