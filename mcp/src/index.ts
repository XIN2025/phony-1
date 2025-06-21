import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import express from "express";
import cors from "cors";
import { z } from "zod";

const app = express();
app.use(cors());

// Create an MCP server instance
const server = new McpServer({
  name: "mcp-tools",
  version: "1.0.0",
});

// Register a simple Hello tool
server.tool(
  "Hello",
  "Get a greeting with your name",
  {
    name: z.string().describe("Your name"),
  },
  async ({ name }) => {
    return {
      content: [
        {
          type: "text",
          text: `Hello, ${name}! Welcome to MCP Tools.`,
        },
      ],
    };
  }
);

// Create Express app for SSE
let transport: SSEServerTransport | null = null;

app.get("/sse", (req, res) => {
  transport = new SSEServerTransport("/messages", res);
  server.connect(transport);
});

app.post("/messages", (req, res) => {
  if (transport) {
    transport.handlePostMessage(req, res);
  }
});

app.listen(3000, () => {
  console.log("Server started at http://localhost:3000");
});
