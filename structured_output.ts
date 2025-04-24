import { config } from "dotenv";
config();

import { ChatOpenAI } from "@langchain/openai";
import { z } from "zod";

const llm = new ChatOpenAI({
  model: "gpt-4o-mini",
  temperature: 1,
});

const joke = z.object({
  setup: z.string().describe("La premisa del chiste"),
  punchline: z.string().describe("El remate del chiste"),
  rating: z.number().optional().describe("La calificación del chiste, de 1 a 10"),
});

const structuredLlm = llm.withStructuredOutput(joke);

// Invocar el LLM aumentado
const output = await structuredLlm.invoke("Dime un chiste sobre gatos");

console.log(output);