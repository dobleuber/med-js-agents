/**
 * This file defines the tools available to the ReAct agent.
 * Tools are functions that the agent can use to interact with external systems or perform specific tasks.
 */
import { tool } from "@langchain/core/tools";
import { TavilySearchResults } from "@langchain/community/tools/tavily_search";
import { number, object } from "zod";

/**
 * Tavily search tool configuration
 * This tool allows the agent to perform web searches using the Tavily API.
 */
const mathSchema = object({
  num1: number(),
  num2: number(),
});

const multiply = tool(({ num1, num2 }: { num1: number; num2: number }): number => {
  /**
   * Multiplies two numbers
   */
  return num1 * num2;
}, {
  name: "multiply",
  description: "Multiplies two numbers",
  schema: mathSchema,
});

const add = tool(({ num1, num2 }: { num1: number; num2: number }): number => {
  /**
   * Adds two numbers
   */
  return num1 + num2;
}, {
  name: "add",
  description: "Adds two numbers",
  schema: mathSchema,
});

const subtract = tool(({ num1, num2 }: { num1: number; num2: number }): number => {
  /**
   * Subtracts two numbers
   */
  return num1 - num2;
}, {
  name: "subtract",
  description: "Subtracts two numbers",
  schema: mathSchema,
});

const divide = tool(({ num1, num2 }: { num1: number; num2: number }): number => {
  /**
   * Divides two numbers
   */
  return num1 / num2;
}, {
  name: "divide",
  description: "Divides two numbers",
  schema: mathSchema,
});

const modulo = tool(({ num1, num2 }: { num1: number; num2: number }): number => {
  /**
   * Modulo two numbers
   */
  return num1 % num2;
}, {
  name: "modulo",
  description: "Modulo two numbers",
  schema: mathSchema,
});

/**
 * Creates and returns all available tools for the agent
 * This function should be called after environment variables are loaded
 */
export function createTools() {
  const searchTavily = new TavilySearchResults({
    maxResults: 3,
  });

  /**
   * Return an array of all available tools
   */
  return [searchTavily, multiply, add, subtract, divide, modulo];
}
