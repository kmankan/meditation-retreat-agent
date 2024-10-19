import { extractSiteStructure } from "./extractDOM";

// Step 0: Setup
const dotenv = require("dotenv");
const { Julep } = require("@julep/sdk");
const yaml = require("yaml");

dotenv.config();

const client = new Julep({
  apiKey: "eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE3MzQ1NTEyODAsImlhdCI6MTcyOTM2NzI4MCwic3ViIjoiNDRlNmQ1M2UtYzcxOC01NWM5LWI4YTctODkyZDMwZjlmYzBjIn0.REK897Uc56UqtelT9IMxSeRRQZL3oVERCu4lObvLDGd5-wvauIR68IAhjbpZTLbwo82GgG6-Qk7KkDQxLSakXw",
  environment: process.env.JULEP_ENVIRONMENT || "dev",
});

const url = 'https://meditatewithtucker.com/';

async function createAgent() {
  const agent = await client.agents.create({
    name: "DOM Parsing and Navigation Agent",
    model: "claude-3.5-sonnet",
    about: "You are an expert at navigating site trees and structures and finding the right pages for the information the user wants."
  });
  return agent;
}

const taskYaml = `
name: Site Structure Navigator
description: Extract the relevant link from the site structure

main:
- prompt:
  - role: system
    content: >-
      Given the following JSON object {{inputs[0].site_structure}} containing the site structure please analyze this website site structure and determine the most likely location (i.e. url link) for where meditation retreats and their dates would be listed. 
        Consider the following: 
        1. Look for links containing words like "retreat", "events", "calendar", "schedule", or similar terms. 
        2. If no direct events link is found, suggest the most logical place where retreat dates might be listed (e.g., under "About", "Community", etc.) 
        3. If you can't find a likely location for events, return null.
        Your response should be strictly be an array containing a single or multiple urls that are your best approximation of the links to the page(s) that contains the meditation retreat events OR null.
        here is an example of what your output should look like: ["https://example.com"]. Do not give any other text in your response.
    
  unwrap: true
`;

async function createTask(agentId) {
  const task = await client.tasks.create(agentId, yaml.parse(taskYaml));
  return task;
}

async function executeTask(taskId, siteStructure) {
  const execution = await client.executions.create(taskId, {
    input: { site_structure: siteStructure },
  });

  while (true) {
    const result = await client.executions.get(execution.id);
    console.log(result.status, result.output);

    if (result.status === "succeeded" || result.status === "failed") {
      if (result.status === "succeeded") {
        console.log(result.output);
        return result.output;
      } else {
        throw new Error(result.error);
      }
    }

    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
}

async function main() {
  try {
    // Step 1: Extract the site structure
    console.log("Extracting site structure...");
    const siteStructure = await extractSiteStructure(url);
    console.log("Site structure extracted:", siteStructure);

    // Step 2: Create an agent
    console.log("Creating agent...");
    const agent = await createAgent();
    console.log("Agent created:", agent.id);

    // Step 3: Create a task
    console.log("Creating task...");
    const task = await createTask(agent.id);
    console.log("Task created:", task.id);

    // Step 4: Execute the task with the extracted site structure
    console.log("Executing task...");
    const result = await executeTask(task.id, siteStructure);
    console.log("Task execution completed. Result:", result);

  } catch (error) {
    console.error("An error occurred:", error);
  }
}

main()
  .then(() => console.log("Done"))
  .catch(console.error);
