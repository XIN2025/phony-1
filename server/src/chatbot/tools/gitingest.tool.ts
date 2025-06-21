import { experimental_createMCPClient } from 'ai';
import { Experimental_StdioMCPTransport } from 'ai/mcp-stdio';

export const getGitIngestMCPTools = async () => {
  let mcpClient: any;
  try {
    const transport = new Experimental_StdioMCPTransport({
      command: 'uvx',
      args: [
        '--from',
        'git+https://github.com/opengig/gitingest-mcp-server.git',
        'gitingest-mcp',
      ],
      env: {
        GITHUB_TOKEN: process.env.GITHUB_REPO_TOKEN || '',
      },
    });

    mcpClient = await experimental_createMCPClient({
      transport,
    });

    const tools = await mcpClient.tools();

    return tools;
  } catch (error) {
    console.error('Error fetching Gitingest tools documentation tools:', error);
    return [];
  } finally {
    // await mcpClient?.close();
    console.log('MCP transport for gitingest tools closed');
  }
};
