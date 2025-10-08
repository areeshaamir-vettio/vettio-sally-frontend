import { NextRequest, NextResponse } from 'next/server';
import * as Figma from 'figma-js';

const FIGMA_TOKEN = process.env.FIGMA_TOKEN;
const FIGMA_FILE_ID = process.env.FIGMA_FILE_ID;

if (!FIGMA_TOKEN || !FIGMA_FILE_ID) {
  console.error('Missing Figma environment variables');
}

const figmaClient = FIGMA_TOKEN ? Figma.Client({ personalAccessToken: FIGMA_TOKEN }) : null;

export async function GET(request: NextRequest) {
  try {
    if (!figmaClient || !FIGMA_FILE_ID) {
      return NextResponse.json(
        { error: 'Figma configuration missing' },
        { status: 500 }
      );
    }

    const { searchParams } = new URL(request.url);
    const nodeId = searchParams.get('nodeId');
    const component = searchParams.get('component');

    if (nodeId) {
      // Fetch specific node
      const response = await figmaClient.fileNodes(FIGMA_FILE_ID, { ids: [nodeId] });
      const node = response.data.nodes[nodeId]?.document;
      
      return NextResponse.json({
        success: true,
        data: node,
        type: 'node'
      });
    } else {
      // Fetch entire file
      const file = await figmaClient.file(FIGMA_FILE_ID);
      
      // If component filter is specified, try to find it
      if (component) {
        const findComponent = (node: any): any => {
          if (node.name && node.name.toLowerCase().includes(component.toLowerCase())) {
            return node;
          }
          if (node.children) {
            for (const child of node.children) {
              const found = findComponent(child);
              if (found) return found;
            }
          }
          return null;
        };

        const foundComponent = findComponent(file.data.document);
        if (foundComponent) {
          return NextResponse.json({
            success: true,
            data: foundComponent,
            type: 'component',
            filter: component
          });
        }
      }

      return NextResponse.json({
        success: true,
        data: file.data.document,
        type: 'file',
        metadata: {
          name: file.data.name,
          lastModified: file.data.lastModified,
          version: file.data.version
        }
      });
    }
  } catch (error) {
    console.error('Figma API error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch Figma data',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!figmaClient || !FIGMA_FILE_ID) {
      return NextResponse.json(
        { error: 'Figma configuration missing' },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { nodeIds, component } = body;

    if (nodeIds && Array.isArray(nodeIds)) {
      // Fetch multiple nodes
      const response = await figmaClient.fileNodes(FIGMA_FILE_ID, { ids: nodeIds });
      
      return NextResponse.json({
        success: true,
        data: response.data.nodes,
        type: 'nodes'
      });
    }

    return NextResponse.json(
      { error: 'Invalid request body' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Figma API error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch Figma data',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
