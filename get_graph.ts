import * as fs from "fs";
import * as path from "path";

/**
 * Generates a PNG image from an agent's graph and saves it to disk.
 * @param agent - The agent object with a getGraphAsync method
 * @param filePath - Optional file path to save the image (default: imgs/graph.png)
 * @returns The absolute path to the saved image
 */
export async function saveGraphImage(agent: any, filePath: string = "imgs/graph.png"): Promise<string> {
  // Get the graph representation from the agent
  const graph = await agent.getGraphAsync({});

  // Generate a PNG image from the graph
  const image = await graph.drawMermaidPng();

  // Convert the image to an ArrayBuffer
  const arrayBuffer = await image.arrayBuffer();

  // Ensure the directory exists
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  // Save the image to the specified path
  fs.writeFileSync(filePath, Buffer.from(arrayBuffer));

  // Return the absolute path
  const absolutePath = path.resolve(filePath);
  console.log(`Imagen guardada en: ${absolutePath}`);
  return absolutePath;
}
