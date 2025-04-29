import { StateGraph, Annotation, START, END, interrupt, MemorySaver, Command } from "@langchain/langgraph";
import * as readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';

import { saveGraphImage } from "./get_graph";

const StateAnnotation = Annotation.Root({
  input: Annotation<string>,
  userFeedback: Annotation<string>
});

const step1 = (_state: typeof StateAnnotation.State) => {
  console.log("---Step 1---");
  return {};
}

const humanFeedback = (_state: typeof StateAnnotation.State) => {
  console.log("--- humanFeedback ---");
  const feedback: string = interrupt("Please provide feedback");
  return {
    userFeedback: feedback
  };
}

// Nuevo nodo: Imprime "¿Qué pasa?"
const sayHello = (_state: typeof StateAnnotation.State) => {
  console.log("--- What's up?---");
  return {};
}

// Nuevo nodo: Imprime el feedback del usuario
const echoFeedback = (state: typeof StateAnnotation.State) => {
  console.log(`--- User Feedback: ${state.userFeedback} ---`);
  return {};
}

// Función condicional
const checkFeedback = (state: typeof StateAnnotation.State) => {
  console.log("--- Checking Feedback ---");
  if (state.userFeedback?.toLowerCase() === "hola") {
    return "sayHello";
  } else {
    return "echoFeedback";
  }
}

const builder = new StateGraph(StateAnnotation)
  .addNode("step1", step1)
  .addNode("humanFeedback", humanFeedback)
  .addNode("sayHello", sayHello) // Añadir nuevo nodo
  .addNode("echoFeedback", echoFeedback) // Añadir nuevo nodo
  .addEdge(START, "step1")
  .addEdge("step1", "humanFeedback")
  // Añadir borde condicional desde humanFeedback
  .addConditionalEdges("humanFeedback", checkFeedback, {
    "sayHello": "sayHello",
    "echoFeedback": "echoFeedback",
  })
  // Añadir bordes desde nodos condicionales a step3
  .addEdge("sayHello", END)
  .addEdge("echoFeedback", END)

// Configurar memoria
const memory = new MemorySaver()

// Compilar
const graph = builder.compile({
  checkpointer: memory,
});

// Guardar la imagen del grafo
await saveGraphImage(graph, "imgs/human.png");

// Entrada inicial
const initialInput = { input: "hello world" };

// Hilo (Thread)
const config = { configurable: { thread_id: "1" } };

// Ejecutar el grafo hasta la primera interrupción
for await (const event of await graph.stream(initialInput, config)) {
  console.log(event);
}

// Se registrará cuando el grafo se interrumpa (después de humanFeedback).
console.log("--- GRAPH INTERRUPTED ---");

// Crear interfaz readline para obtener la entrada del usuario
const rl = readline.createInterface({ input, output });
const userFeedback = await rl.question('Please provide feedback: '); // Mantener el prompt en inglés por claridad de la librería
rl.close();

// Continuar la ejecución del grafo con el feedback del usuario
// Continuar la ejecución del grafo, pasando el feedback del usuario recolectado mediante el comando resume.
// Este feedback se convertirá en la salida resuelta del nodo 'humanFeedback' y actualizará el estado.
for await (const event of await graph.stream(
  new Command({ resume: userFeedback }), // Pasar el feedback real del usuario aquí
  config,
)) {
  console.log(event);
  console.log("\n====\n");
}
