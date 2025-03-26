import { config } from "dotenv";
config();

import { ChatOpenAI } from "@langchain/openai";

import { StateGraph, Annotation } from "@langchain/langgraph";
import { z } from "zod";

import { saveGraphImage } from "./get_graph";

// Esquema para salida estructurada que se usará como lógica de enrutamiento
const routeSchema = z.object({
  step: z.enum(["poema", "historia", "chiste"]).describe(
    "El siguiente paso en el proceso de enrutamiento"
  ),
});

const llm = new ChatOpenAI({
  model: "gpt-4o-mini",
  temperature: 0,
});

// Aumentar el LLM con esquema para salida estructurada
const router = llm.withStructuredOutput(routeSchema);

// Estado del grafo
const StateAnnotation = Annotation.Root({
  input: Annotation<string>,
  decision: Annotation<string>,
  output: Annotation<string>,
});

// Nodos
// Escribir una historia
async function llmCall1(state: typeof StateAnnotation.State) {
  const result = await llm.invoke([{
    role: "system",
    content: "Eres un experto narrador de historias colombianas.",
  }, {
    role: "user",
    content: state.input
  }]);
  return { output: result.content };
}

// Escribir un chiste
async function llmCall2(state: typeof StateAnnotation.State) {
  const result = await llm.invoke([{
    role: "system",
    content: "Eres un experto comediante colombiano.",
  }, {
    role: "user",
    content: state.input
  }]);
  return { output: result.content };
}

// Escribir un poema
async function llmCall3(state: typeof StateAnnotation.State) {
  const result = await llm.invoke([{
    role: "system",
    content: "Eres un experto poeta colombiano.",
  }, {
    role: "user",
    content: state.input
  }]);
  return { output: result.content };
}

async function llmCallRouter(state: typeof StateAnnotation.State) {
  // Enrutar la entrada al nodo apropiado
  const decision = await router.invoke([
    {
      role: "system",
      content: "Enruta la entrada a historia, chiste o poema basado en la solicitud del usuario."
    },
    {
      role: "user",
      content: state.input
    },
  ]);

  return { decision: decision.step };
}

// Función de borde condicional para enrutar al nodo apropiado
function routeDecision(state: typeof StateAnnotation.State) {
  // Devolver el nombre del nodo que quieres visitar a continuación
  if (state.decision === "historia") {
    return "llmCall1";
  } else if (state.decision === "chiste") {
    return "llmCall2";
  } else if (state.decision === "poema") {
    return "llmCall3";
  }
  // Caso por defecto - si ninguna de las condiciones anteriores coincide
  return "llmCall1"; // Por defecto, historia como respaldo
}

// Construir flujo de trabajo
const routerWorkflow = new StateGraph(StateAnnotation)
  .addNode("llmCall1", llmCall1)
  .addNode("llmCall2", llmCall2)
  .addNode("llmCall3", llmCall3)
  .addNode("llmCallRouter", llmCallRouter)
  .addEdge("__start__", "llmCallRouter")
  .addConditionalEdges(
    "llmCallRouter",
    routeDecision,
    ["llmCall1", "llmCall2", "llmCall3"],
  )
  .addEdge("llmCall1", "__end__")
  .addEdge("llmCall2", "__end__")
  .addEdge("llmCall3", "__end__")
  .compile();

// Save the graph image
await saveGraphImage(routerWorkflow, "imgs/routing.png");

// Invocar
const state = await routerWorkflow.invoke({
  input: "Cuéntame un chiste sobre el metro de Medellín"
});
console.log(state.output);