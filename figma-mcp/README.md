# Figma MCP Tool

This directory contains a Figma integration tool that allows you to fetch design data from Figma files using the Model Context Protocol (MCP).

## Setup

### 1. Environment Variables

Create a `.env` file in this directory with:

```env
FIGMA_TOKEN=your_figma_personal_access_token
FIGMA_FILE_ID=your_figma_file_id
MCP_PORT=3000
```

### 2. Getting Your Figma Token

1. Go to [Figma Settings > Personal Access Tokens](https://www.figma.com/settings)
2. Click "Create new token"
3. Give it a name and copy the token
4. Replace `your_figma_personal_access_token` in `.env`

### 3. Getting Your Figma File ID

From a Figma file URL like:
`https://www.figma.com/file/dYO2jJ2sNSwygjUX4HaFyL/Your-File-Name`

The file ID is: `dYO2jJ2sNSwygjUX4HaFyL`

## Usage

### Option 1: MCP Server (Recommended)

Start the MCP server:
```bash
node figma-mcp-server.js
```

The server provides a `figma` tool that can be called with optional parameters:
- `component` (optional): Specific component to fetch

### Option 2: Direct Fetch Script

Run the standalone fetch script:
```bash
node figma-fetch.js
```

### Option 3: Test Connection

Test your setup:
```bash
node test-figma-tool.js
```

## Available Tools

### `figma` Tool

**Parameters:**
- `component` (string, optional): Name of specific component to fetch

**Returns:**
- Complete Figma file data as JSON
- Includes document structure, pages, frames, and all design elements

## Example Usage

```javascript
// Using the MCP tool (when server is running)
const result = await figma({ component: "Button" });

// The result contains the full Figma file structure:
// - file.data.name: File name
// - file.data.document.children: Pages
// - file.data.lastModified: Last modification date
// - file.data.version: File version
```

## Troubleshooting

### Connection Timeout
- Check internet connectivity
- Verify Figma token is valid
- Ensure file ID is correct
- Try accessing the file in Figma web app first

### 403 Forbidden
- Token doesn't have access to the file
- File might be private
- Token might be expired

### 404 Not Found
- File ID is incorrect
- File might have been deleted
- Check the URL format

## File Structure

- `figma-mcp-server.js`: MCP server implementation
- `figma-fetch.js`: Standalone fetch script
- `test-figma-tool.js`: Connection test script
- `package.json`: Dependencies
- `.env`: Environment configuration (create this)

## Dependencies

- `@modelcontextprotocol/sdk`: MCP framework
- `figma-js`: Figma API client
- `zod`: Schema validation
- `dotenv`: Environment variable loading
