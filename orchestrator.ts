import { config } from "dotenv";
config();

import { ChatOpenAI } from "@langchain/openai";
import { Annotation, StateGraph, Send } from "@langchain/langgraph";

import { z } from "zod";
import { saveGraphImage } from "./get_graph";

// Esquema para salida estructurada a usar en la planificación
const sectionSchema = z.object({
  nombre: z.string().describe("Nombre para esta sección del informe."),
  descripcion: z.string().describe(
    "Breve descripción de los principales temas y conceptos que se cubrirán en esta sección."
  ),
});

const sectionsSchema = z.object({
  secciones: z.array(sectionSchema).describe("Secciones del informe."),
});

const llm = new ChatOpenAI({
  model: "gpt-4o-mini",
  temperature: 1,
});

// Aumentar el LLM con esquema para salida estructurada
const planner = llm.withStructuredOutput(sectionsSchema);

// Estado del grafo
const StateAnnotation = Annotation.Root({
  tema: Annotation<string>,
  secciones: Annotation<Array<z.infer<typeof sectionSchema>>>,
  seccionesCompletadas: Annotation<string[]>({
    default: () => [],
    reducer: (a, b) => a.concat(b),
  }),
  informeFinal: Annotation<string>,
});

// Estado del trabajador
const WorkerStateAnnotation = Annotation.Root({
  seccion: Annotation<z.infer<typeof sectionSchema>>,
  seccionesCompletadas: Annotation<string[]>({
    default: () => [],
    reducer: (a, b) => a.concat(b),
  }),
});

// Nodos
async function orchestrator(state: typeof StateAnnotation.State) {
  // Generar consultas
  const seccionesInforme = await planner.invoke([
    { role: "system", content: "Genera un plan para el informe en español." },
    { role: "user", content: `Aquí está el tema del informe: ${state.tema}` },
  ]);

  return { secciones: seccionesInforme.secciones };
}

async function llmCall(state: typeof WorkerStateAnnotation.State) {
  // Generar sección
  const seccion = await llm.invoke([
    {
      role: "system",
      content: "Escribe una sección de informe siguiendo el nombre y descripción proporcionados. No incluyas preámbulo para cada sección. Usa formato markdown. Escribe en español.",
    },
    {
      role: "user",
      content: `Aquí está el nombre de la sección: ${state.seccion.nombre} y la descripción: ${state.seccion.descripcion}`,
    },
  ]);

  // Escribir la sección actualizada a secciones completadas
  return { seccionesCompletadas: [seccion.content] };
}

async function synthesizer(state: typeof StateAnnotation.State) {
  // Lista de secciones completadas
  const seccionesCompletadas = state.seccionesCompletadas;

  // Formatear sección completada a str para usar como contexto para secciones finales
  const seccionesInformeCompletadas = seccionesCompletadas.join("\n\n---\n\n");

  return { informeFinal: seccionesInformeCompletadas };
}

// Función de borde condicional para crear trabajadores llm_call que escriban cada sección del informe
function assignWorkers(state: typeof StateAnnotation.State) {
  // Iniciar la escritura de secciones en paralelo a través de la API Send()
  return state.secciones.map((seccion) =>
    new Send("llmCall", { seccion })
  );
}

// Construir flujo de trabajo
const orchestratorWorker = new StateGraph(StateAnnotation)
  .addNode("orchestrator", orchestrator)
  .addNode("llmCall", llmCall)
  .addNode("synthesizer", synthesizer)
  .addEdge("__start__", "orchestrator")
  .addConditionalEdges(
    "orchestrator",
    assignWorkers,
    ["llmCall"]
  )
  .addEdge("llmCall", "synthesizer")
  .addEdge("synthesizer", "__end__")
  .compile();

// Save the graph image
await saveGraphImage(orchestratorWorker, "imgs/orchestrator.png");

// Invocar
const state = await orchestratorWorker.invoke({
  tema: "Crear un informe sobre el sistema de transporte público en Medellín"
});
console.log(state.informeFinal);