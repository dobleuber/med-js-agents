# med-js-agents

Este proyecto es un conjunto de agentes y utilidades escritos en TypeScript para la orquestación y ejecución de flujos de trabajo inteligentes, usando la librería LangChain y otras herramientas de IA. Está orientado a experimentos y desarrollos en el ámbito de agentes autónomos y flujos de decisión.

## Características principales
- Implementación de agentes personalizados y humanos
- Orquestación y paralelización de tareas
- Enrutamiento de flujos según contexto
- Ejecución de scripts de ejemplo para distintos flujos y agentes

## Estructura del proyecto
- `basic.ts`: Ejemplo básico de agente
- `custom_agent.ts`: Ejemplo de agente personalizado
- `structured_output.ts`: Ejemplo de salida estructurada
- `parallelization.ts`: Ejemplo de paralelización de tareas
- `routing.ts`: Ejemplo de enrutamiento de flujos
- `orchestrator.ts`: Orquestador de agentes y tareas
- `human.ts`: Ejemplo de agente humano
- `tools.ts`: Utilidades y herramientas auxiliares
- `imgs/`: Carpeta para imágenes relacionadas

## Instalación
1. Clona el repositorio
2. Instala las dependencias usando [pnpm](https://pnpm.io/):
   ```bash
   pnpm install
   ```
3. Crea un archivo `.env` basado en `.env.example` y ajusta las variables necesarias (por ejemplo, claves de API de OpenAI).

## Uso
Puedes ejecutar los distintos ejemplos con los siguientes comandos:

```bash
pnpm run basic
pnpm run custom
pnpm run structured
pnpm run parallel
pnpm run routing
pnpm run orchestrator
pnpm run human
```

## Dependencias principales
- [LangChain](https://js.langchain.com/)
- [OpenAI](https://platform.openai.com/docs/api-reference)
- [dotenv](https://www.npmjs.com/package/dotenv)
- [zod](https://zod.dev/)

## Licencia
ISC

---

Si tienes dudas o quieres contribuir, abre un issue o un pull request.
