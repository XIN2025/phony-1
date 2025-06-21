import { experimental_createMCPClient } from 'ai';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';

export const getLightsailDeploymentMCPTools = async () => {
  const url = new URL('http://localhost:5001/mcp'); // TODO: Update URL
  const transport = new StreamableHTTPClientTransport(url);

  const mcpClient = await experimental_createMCPClient({
    transport,
  });

  const tools = await mcpClient.tools();
  return tools;
};
