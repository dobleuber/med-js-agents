import { config } from "dotenv";
config();

import { ChatOpenAI } from "@langchain/openai";

import { StateGraph, Annotation } from "@langchain/langgraph";

import { saveGraphImage } from "./get_graph";

const llm = new ChatOpenAI({
  model: "gpt-4o-mini",
  temperature: 1,
});

// Estado del grafo
const StateAnnotation = Annotation.Root({
  tema: Annotation<string>,
  chiste: Annotation<string>,
  historia: Annotation<string>,
  poema: Annotation<string>,
  salidaCombinada: Annotation<string>,
});

// Nodos
// Primera llamada LLM para generar un chiste inicial
async function callLlm1(state: typeof StateAnnotation.State) {
  const msg = await llm.invoke(`Escribe un chiste sobre ${state.tema} con humor colombiano`);
  return { chiste: msg.content };
}

// Segunda llamada LLM para generar una historia
async function callLlm2(state: typeof StateAnnotation.State) {
  const msg = await llm.invoke(`Escribe una historia corta sobre ${state.tema} ambientada en Colombia`);
  return { historia: msg.content };
}

// Tercera llamada LLM para generar un poema
async function callLlm3(state: typeof StateAnnotation.State) {
  const msg = await llm.invoke(`Escribe un poema sobre ${state.tema} con estilo colombiano`);
  return { poema: msg.content };
}

// Combinar el chiste, la historia y el poema en una sola salida
async function aggregator(state: typeof StateAnnotation.State) {
  const combined = `¡Aquí hay una historia, un chiste y un poema sobre ${state.tema}!\n\n` +
    `HISTORIA:\n${state.historia}\n\n` +
    `CHISTE:\n${state.chiste}\n\n` +
    `POEMA:\n${state.poema}`;
  return { salidaCombinada: combined };
}

// Construir flujo de trabajo 
const parallelWorkflow = new StateGraph(StateAnnotation)
  .addNode("callLlm1", callLlm1)
  .addNode("callLlm2", callLlm2)
  .addNode("callLlm3", callLlm3)
  .addNode("aggregator", aggregator)
  .addEdge("__start__", "callLlm1")
  .addEdge("__start__", "callLlm2")
  .addEdge("__start__", "callLlm3")
  .addEdge("callLlm1", "aggregator")
  .addEdge("callLlm2", "aggregator")
  .addEdge("callLlm3", "aggregator")
  .addEdge("aggregator", "__end__")
  .compile();

// Save the graph image
await saveGraphImage(parallelWorkflow, "imgs/parallelization.png");

// Invocar
const result = await parallelWorkflow.invoke({ tema: "el metro de Medellín" });
console.log(result.salidaCombinada);