import { experimental_createMCPClient } from 'ai';
import { Experimental_StdioMCPTransport } from 'ai/mcp-stdio';

export const getDocumentationMCPTools = async () => {
  let mcpClient: any;

  try {
    const transport = new Experimental_StdioMCPTransport({
      command: 'npx',
      args: ['-y', '@upstash/context7-mcp'],
      env: {
        DEFAULT_MINIMUM_TOKENS: '5000',
      },
    });

    mcpClient = await experimental_createMCPClient({
      transport,
    });

    const tools = await mcpClient.tools();

    return tools;
  } catch (error) {
    console.error('Error fetching MCP documentation tools:', error);
    return [];
  } finally {
    // await mcpClient?.close();
    console.log('MCP transport closed');
  }
};
