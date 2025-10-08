'use client';

import React, { useState } from 'react';
import { useFigma, findNodeByName, findNodesByType, extractDesignTokens } from '@/hooks/useFigma';

interface FigmaPreviewProps {
  nodeId?: string;
  component?: string;
  className?: string;
}

export function FigmaPreview({ nodeId, component, className = '' }: FigmaPreviewProps) {
  const { data, loading, error, metadata, refetch, fetchNode, fetchComponent } = useFigma({
    nodeId,
    component,
    autoFetch: true,
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedNodeType, setSelectedNodeType] = useState('');

  const handleSearch = () => {
    if (searchTerm) {
      fetchComponent(searchTerm);
    }
  };

  const handleNodeFetch = () => {
    if (nodeId) {
      fetchNode(nodeId);
    }
  };

  const renderNodeInfo = (node: any, depth = 0) => {
    if (!node) return null;

    const indent = '  '.repeat(depth);
    const tokens = extractDesignTokens(node);

    return (
      <div key={node.id || Math.random()} className="mb-2">
        <div className="font-mono text-sm">
          <span className="text-gray-500">{indent}</span>
          <span className="text-blue-600">{node.type}</span>
          {node.name && (
            <span className="text-green-600 ml-2">"{node.name}"</span>
          )}
          {node.id && (
            <span className="text-gray-400 ml-2 text-xs">({node.id})</span>
          )}
        </div>
        
        {Object.keys(tokens).length > 0 && (
          <div className="ml-4 mt-1 text-xs text-gray-600">
            <span className="font-semibold">Tokens: </span>
            {Object.entries(tokens).map(([key, value]) => (
              <span key={key} className="mr-2">
                {key}: {value}
              </span>
            ))}
          </div>
        )}

        {node.children && node.children.length > 0 && (
          <div className="ml-2">
            {node.children.slice(0, 5).map((child: any) => renderNodeInfo(child, depth + 1))}
            {node.children.length > 5 && (
              <div className="text-gray-400 text-xs ml-4">
                ... and {node.children.length - 5} more children
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  const getNodesByType = () => {
    if (!data || !selectedNodeType) return [];
    return findNodesByType(data as any, selectedNodeType);
  };

  return (
    <div className={`p-6 bg-white rounded-lg shadow-lg ${className}`}>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Figma Design Preview</h2>
        
        {metadata && (
          <div className="bg-gray-50 p-4 rounded-lg mb-4">
            <h3 className="font-semibold text-gray-700 mb-2">File Information</h3>
            <div className="text-sm text-gray-600">
              <p><strong>Name:</strong> {metadata.name}</p>
              <p><strong>Last Modified:</strong> {new Date(metadata.lastModified).toLocaleString()}</p>
              <p><strong>Version:</strong> {metadata.version}</p>
            </div>
          </div>
        )}

        <div className="flex flex-wrap gap-4 mb-4">
          <div className="flex-1 min-w-0">
            <input
              type="text"
              placeholder="Search for component..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
          </div>
          <button
            onClick={handleSearch}
            disabled={!searchTerm || loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Search
          </button>
          <button
            onClick={refetch}
            disabled={loading}
            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Refresh
          </button>
        </div>

        <div className="flex gap-4 mb-4">
          <select
            value={selectedNodeType}
            onChange={(e) => setSelectedNodeType(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Filter by node type...</option>
            <option value="FRAME">Frames</option>
            <option value="TEXT">Text</option>
            <option value="RECTANGLE">Rectangles</option>
            <option value="COMPONENT">Components</option>
            <option value="INSTANCE">Instances</option>
          </select>
        </div>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">Loading Figma data...</span>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
          <h3 className="font-semibold text-red-800 mb-2">Error</h3>
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {data && !loading && (
        <div className="space-y-4">
          {selectedNodeType && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-800 mb-2">
                {selectedNodeType} Nodes ({getNodesByType().length})
              </h3>
              <div className="max-h-64 overflow-y-auto">
                {getNodesByType().map((node) => renderNodeInfo(node))}
              </div>
            </div>
          )}

          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h3 className="font-semibold text-gray-800 mb-2">Design Structure</h3>
            <div className="max-h-96 overflow-y-auto">
              {Array.isArray(data) ? (
                data.map((item) => renderNodeInfo(item))
              ) : (
                renderNodeInfo(data)
              )}
            </div>
          </div>
        </div>
      )}

      {!data && !loading && !error && (
        <div className="text-center py-8 text-gray-500">
          <p>No Figma data loaded. Use the search or refresh button to load design data.</p>
        </div>
      )}
    </div>
  );
}

export default FigmaPreview;
