'use client';

import React from 'react';
import FigmaPreview from '@/components/figma-preview';

export default function FigmaTestPage() {
  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Figma Integration Test</h1>
          <p className="text-gray-600">
            This page demonstrates the Figma MCP integration. You can search for components, 
            view design structure, and extract design tokens from your Figma file.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8">
          {/* Main Figma Preview */}
          <FigmaPreview />

          {/* Example with specific component search */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Quick Component Search</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <FigmaPreview 
                component="Button" 
                className="h-64 overflow-hidden"
              />
              <FigmaPreview 
                component="Input" 
                className="h-64 overflow-hidden"
              />
              <FigmaPreview 
                component="Card" 
                className="h-64 overflow-hidden"
              />
            </div>
          </div>

          {/* Usage Instructions */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">How to Use</h2>
            <div className="prose text-gray-600">
              <ol className="list-decimal list-inside space-y-2">
                <li>
                  <strong>Search Components:</strong> Use the search box to find specific components 
                  by name (e.g., "Button", "Input", "Header").
                </li>
                <li>
                  <strong>Filter by Type:</strong> Use the dropdown to filter nodes by type 
                  (Frame, Text, Rectangle, Component, Instance).
                </li>
                <li>
                  <strong>View Structure:</strong> The design structure shows the hierarchy 
                  of your Figma file with node types and names.
                </li>
                <li>
                  <strong>Extract Tokens:</strong> Design tokens (colors, typography, spacing) 
                  are automatically extracted and displayed.
                </li>
                <li>
                  <strong>Refresh Data:</strong> Click refresh to get the latest version 
                  of your Figma file.
                </li>
              </ol>
            </div>
          </div>

          {/* API Usage Examples */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">API Usage Examples</h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-gray-700 mb-2">React Hook Usage</h3>
                <pre className="bg-gray-100 p-4 rounded-lg text-sm overflow-x-auto">
{`import { useFigma } from '@/hooks/useFigma';

function MyComponent() {
  const { data, loading, error } = useFigma({
    component: 'Button',
    autoFetch: true
  });

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  
  return <div>{/* Use your Figma data */}</div>;
}`}
                </pre>
              </div>

              <div>
                <h3 className="font-semibold text-gray-700 mb-2">Direct API Calls</h3>
                <pre className="bg-gray-100 p-4 rounded-lg text-sm overflow-x-auto">
{`// Get entire file
fetch('/api/figma')

// Get specific component
fetch('/api/figma?component=Button')

// Get specific node
fetch('/api/figma?nodeId=123:456')

// Get multiple nodes (POST)
fetch('/api/figma', {
  method: 'POST',
  body: JSON.stringify({ nodeIds: ['123:456', '789:012'] })
})`}
                </pre>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
