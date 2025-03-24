import { config } from "dotenv";
config();

import { ChatOpenAI } from "@langchain/openai";
import { Annotation, StateGraph, Send } from "@langchain/langgraph";

import { z } from "zod";

// Schema for structured output to use in planning
const sectionSchema = z.object({
  name: z.string().describe("Name for this section of the report."),
  description: z.string().describe(
    "Brief overview of the main topics and concepts to be covered in this section."
  ),
});

const sectionsSchema = z.object({
  sections: z.array(sectionSchema).describe("Sections of the report."),
});

const llm = new ChatOpenAI({
  model: "gpt-4o-mini",
  temperature: 1,
});

// Augment the LLM with schema for structured output
const planner = llm.withStructuredOutput(sectionsSchema);

// Graph state
const StateAnnotation = Annotation.Root({
  topic: Annotation<string>,
  sections: Annotation<Array<z.infer<typeof sectionSchema>>>,
  completedSections: Annotation<string[]>({
    default: () => [],
    reducer: (a, b) => a.concat(b),
  }),
  finalReport: Annotation<string>,
});

// Worker state
const WorkerStateAnnotation = Annotation.Root({
  section: Annotation<z.infer<typeof sectionSchema>>,
  completedSections: Annotation<string[]>({
    default: () => [],
    reducer: (a, b) => a.concat(b),
  }),
});

// Nodes
async function orchestrator(state: typeof StateAnnotation.State) {
  // Generate queries
  const reportSections = await planner.invoke([
    { role: "system", content: "Generate a plan for the report." },
    { role: "user", content: `Here is the report topic: ${state.topic}` },
  ]);

  return { sections: reportSections.sections };
}

async function llmCall(state: typeof WorkerStateAnnotation.State) {
  // Generate section
  const section = await llm.invoke([
    {
      role: "system",
      content: "Write a report section following the provided name and description. Include no preamble for each section. Use markdown formatting.",
    },
    {
      role: "user",
      content: `Here is the section name: ${state.section.name} and description: ${state.section.description}`,
    },
  ]);

  // Write the updated section to completed sections
  return { completedSections: [section.content] };
}

async function synthesizer(state: typeof StateAnnotation.State) {
  // List of completed sections
  const completedSections = state.completedSections;

  // Format completed section to str to use as context for final sections
  const completedReportSections = completedSections.join("\n\n---\n\n");

  return { finalReport: completedReportSections };
}

// Conditional edge function to create llm_call workers that each write a section of the report
function assignWorkers(state: typeof StateAnnotation.State) {
  // Kick off section writing in parallel via Send() API
  return state.sections.map((section) =>
    new Send("llmCall", { section })
  );
}

// Build workflow
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

// Invoke
const state = await orchestratorWorker.invoke({
  topic: "Create a report on LLM scaling laws"
});
console.log(state.finalReport);