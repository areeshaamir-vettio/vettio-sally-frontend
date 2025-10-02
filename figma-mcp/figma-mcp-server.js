import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import * as Figma from 'figma-js';
import { z } from 'zod';
import dotenv from 'dotenv';
dotenv.config();

const FIGMA_TOKEN   = process.env.FIGMA_TOKEN;
const FIGMA_FILE_ID = process.env.FIGMA_FILE_ID;
const MCP_PORT      = process.env.MCP_PORT || 3000;

const figmaClient = Figma.Client({ personalAccessToken: FIGMA_TOKEN });
const server      = new McpServer({ name: 'figma-designs', version: '1.0.0' });

server.tool(
  'figma',
  {
    component: z.string().optional(),
    nodeId: z.string().optional()   // 👈 add this
  },
  async ({ nodeId }) => {
    try {
      if (nodeId) {
        const res = await figmaClient.fileNodes(FIGMA_FILE_ID, { ids: [nodeId] });
        const node = res.data.nodes[nodeId]?.document;
        return {
          content: [{ type: 'text', text: JSON.stringify(node, null, 2) }]
        };
      } else {
        const file = await figmaClient.file(FIGMA_FILE_ID);
        return {
          content: [{ type: 'text', text: JSON.stringify(file.data.document, null, 2) }]
        };
      }
    } catch (error) {
      return {
        content: [{ type: 'text', text: `Error: ${error.message}` }]
      };
    }
  }
);
