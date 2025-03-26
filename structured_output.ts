import { config } from "dotenv";
config();

import { ChatOpenAI } from "@langchain/openai";
import { z } from "zod";

const llm = new ChatOpenAI({
  model: "gpt-4o-mini",
  temperature: 0,
});

const searchQuerySchema = z.object({
  consultaBusqueda: z.string().describe("Consulta optimizada para búsqueda web."),
  justificacion: z.string().describe("Por qué esta consulta es relevante para la solicitud del usuario."),
});

// Aumentar el LLM con esquema para salida estructurada
const structuredLlm = llm.withStructuredOutput(searchQuerySchema, {
  name: "consultaBusqueda",
});

// Invocar el LLM aumentado
const output = await structuredLlm.invoke(
  "¿Cómo puedo prevenir el dengue en Medellín durante la temporada de lluvias?"
);

console.log(output);