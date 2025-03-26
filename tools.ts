/**
 * Este archivo define las herramientas disponibles para el agente ReAct.
 * Las herramientas son funciones que el agente puede usar para interactuar con sistemas externos o realizar tareas específicas.
 */
import { tool } from "@langchain/core/tools";
import { TavilySearchResults } from "@langchain/community/tools/tavily_search";
import { number, object } from "zod";

/**
 * Configuración de la herramienta de búsqueda Tavily
 * Esta herramienta permite al agente realizar búsquedas web utilizando la API de Tavily.
 */
const mathSchema = object({
  num1: number(),
  num2: number(),
});

const multiply = tool(({ num1, num2 }: { num1: number; num2: number }): number => {
  /**
   * Multiplica dos números
   */
  return num1 * num2;
}, {
  name: "multiply",
  description: "Multiplica dos números",
  schema: mathSchema,
});

const add = tool(({ num1, num2 }: { num1: number; num2: number }): number => {
  /**
   * Suma dos números
   */
  return num1 + num2;
}, {
  name: "add",
  description: "Suma dos números",
  schema: mathSchema,
});

const subtract = tool(({ num1, num2 }: { num1: number; num2: number }): number => {
  /**
   * Resta dos números
   */
  return num1 - num2;
}, {
  name: "subtract",
  description: "Resta dos números",
  schema: mathSchema,
});

const divide = tool(({ num1, num2 }: { num1: number; num2: number }): number => {
  /**
   * Divide dos números
   */
  return num1 / num2;
}, {
  name: "divide",
  description: "Divide dos números",
  schema: mathSchema,
});

const modulo = tool(({ num1, num2 }: { num1: number; num2: number }): number => {
  /**
   * Calcula el módulo de dos números
   */
  return num1 % num2;
}, {
  name: "modulo",
  description: "Calcula el módulo de dos números",
  schema: mathSchema,
});

/**
 * Crea y devuelve todas las herramientas disponibles para el agente
 * Esta función debe ser llamada después de que las variables de entorno sean cargadas
 */
export function createTools() {
  const searchTavily = new TavilySearchResults({
    maxResults: 3,
  });

  /**
   * Devuelve un array de todas las herramientas disponibles
   */
  return [searchTavily, multiply, add, subtract, divide, modulo];
}
