import { useState, useEffect, useCallback } from 'react';

interface FigmaNode {
  id: string;
  name: string;
  type: string;
  children?: FigmaNode[];
  [key: string]: any;
}

interface FigmaResponse {
  success: boolean;
  data: FigmaNode | FigmaNode[] | any;
  type: 'file' | 'node' | 'nodes' | 'component';
  metadata?: {
    name: string;
    lastModified: string;
    version: string;
  };
  filter?: string;
  error?: string;
  details?: string;
}

interface UseFigmaOptions {
  nodeId?: string;
  component?: string;
  autoFetch?: boolean;
}

interface UseFigmaReturn {
  data: FigmaNode | FigmaNode[] | null;
  loading: boolean;
  error: string | null;
  metadata: FigmaResponse['metadata'] | null;
  refetch: () => Promise<void>;
  fetchNode: (nodeId: string) => Promise<void>;
  fetchComponent: (componentName: string) => Promise<void>;
  fetchMultipleNodes: (nodeIds: string[]) => Promise<void>;
}

export function useFigma(options: UseFigmaOptions = {}): UseFigmaReturn {
  const { nodeId, component, autoFetch = true } = options;
  
  const [data, setData] = useState<FigmaNode | FigmaNode[] | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [metadata, setMetadata] = useState<FigmaResponse['metadata'] | null>(null);

  const fetchFigmaData = useCallback(async (params: { nodeId?: string; component?: string } = {}) => {
    setLoading(true);
    setError(null);

    try {
      const searchParams = new URLSearchParams();
      if (params.nodeId) searchParams.append('nodeId', params.nodeId);
      if (params.component) searchParams.append('component', params.component);

      const response = await fetch(`/api/figma?${searchParams.toString()}`);
      const result: FigmaResponse = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch Figma data');
      }

      if (result.success) {
        setData(result.data);
        setMetadata(result.metadata || null);
      } else {
        throw new Error(result.error || 'Unknown error occurred');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      console.error('Figma fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchNode = useCallback(async (nodeId: string) => {
    await fetchFigmaData({ nodeId });
  }, [fetchFigmaData]);

  const fetchComponent = useCallback(async (componentName: string) => {
    await fetchFigmaData({ component: componentName });
  }, [fetchFigmaData]);

  const fetchMultipleNodes = useCallback(async (nodeIds: string[]) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/figma', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ nodeIds }),
      });

      const result: FigmaResponse = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch Figma data');
      }

      if (result.success) {
        setData(result.data);
        setMetadata(result.metadata || null);
      } else {
        throw new Error(result.error || 'Unknown error occurred');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      console.error('Figma fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const refetch = useCallback(async () => {
    await fetchFigmaData({ nodeId, component });
  }, [fetchFigmaData, nodeId, component]);

  // Auto-fetch on mount if enabled
  useEffect(() => {
    if (autoFetch) {
      fetchFigmaData({ nodeId, component });
    }
  }, [autoFetch, nodeId, component, fetchFigmaData]);

  return {
    data,
    loading,
    error,
    metadata,
    refetch,
    fetchNode,
    fetchComponent,
    fetchMultipleNodes,
  };
}

// Helper function to find nodes by name in Figma data
export function findNodeByName(node: FigmaNode, name: string): FigmaNode | null {
  if (node.name && node.name.toLowerCase().includes(name.toLowerCase())) {
    return node;
  }
  
  if (node.children) {
    for (const child of node.children) {
      const found = findNodeByName(child, name);
      if (found) return found;
    }
  }
  
  return null;
}

// Helper function to find nodes by type in Figma data
export function findNodesByType(node: FigmaNode, type: string): FigmaNode[] {
  const results: FigmaNode[] = [];
  
  if (node.type === type) {
    results.push(node);
  }
  
  if (node.children) {
    for (const child of node.children) {
      results.push(...findNodesByType(child, type));
    }
  }
  
  return results;
}

// Helper function to extract design tokens from Figma data
export function extractDesignTokens(node: FigmaNode): Record<string, any> {
  const tokens: Record<string, any> = {};
  
  // Extract colors
  if (node.fills && Array.isArray(node.fills)) {
    node.fills.forEach((fill: any, index: number) => {
      if (fill.type === 'SOLID' && fill.color) {
        const { r, g, b } = fill.color;
        tokens[`color-${index}`] = `rgb(${Math.round(r * 255)}, ${Math.round(g * 255)}, ${Math.round(b * 255)})`;
      }
    });
  }
  
  // Extract typography
  if (node.style) {
    if (node.style.fontSize) tokens.fontSize = `${node.style.fontSize}px`;
    if (node.style.fontFamily) tokens.fontFamily = node.style.fontFamily;
    if (node.style.fontWeight) tokens.fontWeight = node.style.fontWeight;
    if (node.style.lineHeight) tokens.lineHeight = node.style.lineHeight;
  }
  
  // Extract spacing
  if (node.paddingLeft !== undefined) tokens.paddingLeft = `${node.paddingLeft}px`;
  if (node.paddingRight !== undefined) tokens.paddingRight = `${node.paddingRight}px`;
  if (node.paddingTop !== undefined) tokens.paddingTop = `${node.paddingTop}px`;
  if (node.paddingBottom !== undefined) tokens.paddingBottom = `${node.paddingBottom}px`;
  
  return tokens;
}
