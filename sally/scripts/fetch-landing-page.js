const https = require('https');
const fs = require('fs');
const path = require('path');

const FIGMA_TOKEN = process.env.FIGMA_TOKEN || '';
const FIGMA_FILE_ID = process.env.FIGMA_FILE_ID || '';

// Directory to save designs
const DESIGNS_DIR = path.join(__dirname, '..', 'docs', 'figma-designs');

// Page configurations - add more pages here
const PAGES = [
  {
    name: 'landing-page',
    nodeId: '705-4484',
    description: 'Landing Page'
  },
  // Add more pages here as needed
  // {
  //   name: 'dashboard',
  //   nodeId: 'YOUR_NODE_ID',
  //   description: 'Dashboard Page'
  // },
];

// Create designs directory if it doesn't exist
if (!fs.existsSync(DESIGNS_DIR)) {
  fs.mkdirSync(DESIGNS_DIR, { recursive: true });
  console.log(`📁 Created directory: ${DESIGNS_DIR}\n`);
}

// Function to find a node by name recursively
function findNodeByName(node, searchName) {
  if (node.name && node.name.toLowerCase().includes(searchName.toLowerCase())) {
    return node;
  }
  if (node.children) {
    for (const child of node.children) {
      const found = findNodeByName(child, searchName);
      if (found) return found;
    }
  }
  return null;
}

// Function to extract text content from a node
function extractTextContent(node, depth = 0) {
  const indent = '  '.repeat(depth);
  let result = '';
  
  if (node.type === 'TEXT' && node.characters) {
    result += `${indent}TEXT: "${node.characters}"\n`;
    if (node.style) {
      result += `${indent}  Font: ${node.style.fontFamily || 'N/A'}, Size: ${node.style.fontSize || 'N/A'}, Weight: ${node.style.fontWeight || 'N/A'}\n`;
    }
  }
  
  if (node.name && node.type !== 'TEXT') {
    result += `${indent}${node.type}: ${node.name}\n`;
  }
  
  if (node.children) {
    for (const child of node.children) {
      result += extractTextContent(child, depth + 1);
    }
  }
  
  return result;
}

// Function to extract design tokens
function extractDesignTokens(node) {
  const tokens = {};
  
  if (node.absoluteBoundingBox) {
    tokens.width = node.absoluteBoundingBox.width;
    tokens.height = node.absoluteBoundingBox.height;
  }
  
  if (node.fills && node.fills.length > 0) {
    const fill = node.fills[0];
    if (fill.type === 'SOLID' && fill.color) {
      const r = Math.round(fill.color.r * 255);
      const g = Math.round(fill.color.g * 255);
      const b = Math.round(fill.color.b * 255);
      tokens.backgroundColor = `rgb(${r}, ${g}, ${b})`;
    }
  }
  
  if (node.style) {
    tokens.fontSize = node.style.fontSize;
    tokens.fontFamily = node.style.fontFamily;
    tokens.fontWeight = node.style.fontWeight;
    tokens.lineHeight = node.style.lineHeightPx;
  }
  
  if (node.paddingLeft !== undefined) {
    tokens.padding = {
      left: node.paddingLeft,
      right: node.paddingRight,
      top: node.paddingTop,
      bottom: node.paddingBottom
    };
  }
  
  return tokens;
}

// Function to fetch a single page design
function fetchPageDesign(page) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.figma.com',
      path: `/v1/files/${FIGMA_FILE_ID}/nodes?ids=${page.nodeId}`,
      method: 'GET',
      headers: {
        'X-Figma-Token': FIGMA_TOKEN
      }
    };

    console.log(`\n${'='.repeat(60)}`);
    console.log(`📥 Fetching ${page.description} from Figma...`);
    console.log(`Node ID: ${page.nodeId}`);
    console.log(`File ID: ${FIGMA_FILE_ID}`);
    console.log('='.repeat(60));

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          const json = JSON.parse(data);

          if (json.err) {
            console.error(`❌ Figma API Error for ${page.name}:`, json.err);
            reject(new Error(json.err));
            return;
          }

          const pageNode = json.nodes[page.nodeId]?.document;

          if (!pageNode) {
            console.error(`❌ ${page.description} node not found`);
            console.log('Response:', JSON.stringify(json, null, 2).substring(0, 500));
            reject(new Error(`Node not found for ${page.name}`));
            return;
          }

          console.log(`\n✅ ${page.description.toUpperCase()} FOUND`);
          console.log(`Node ID: ${pageNode.id}`);
          console.log(`Name: ${pageNode.name}`);
          console.log(`Type: ${pageNode.type}`);

          // List all child frames/components
          console.log('\n=== CHILD FRAMES ===');
          function listFrames(node, depth = 0) {
            const indent = '  '.repeat(depth);
            if (node.type === 'FRAME' || node.type === 'COMPONENT' || node.type === 'INSTANCE') {
              console.log(`${indent}- ${node.name} (${node.type}, ID: ${node.id})`);
              if (node.absoluteBoundingBox) {
                console.log(`${indent}  Size: ${node.absoluteBoundingBox.width}x${node.absoluteBoundingBox.height}`);
              }
            }
            if (node.children) {
              node.children.forEach(child => listFrames(child, depth + 1));
            }
          }
          listFrames(pageNode);

          console.log('\n=== TEXT CONTENT ===');
          console.log(extractTextContent(pageNode));

          // Save the full page data to a file
          const outputPath = path.join(DESIGNS_DIR, `${page.name}-design.json`);
          fs.writeFileSync(
            outputPath,
            JSON.stringify(pageNode, null, 2)
          );
          console.log(`\n✅ Full design data saved to ${outputPath}`);

          resolve({ page, pageNode, outputPath });
        } catch (e) {
          console.error(`❌ Parse error for ${page.name}:`, e.message);
          reject(e);
        }
      });
    });

    req.on('error', (e) => {
      console.error(`❌ Request error for ${page.name}:`, e.message);
      reject(e);
    });

    req.end();
  });
}

// Main function to fetch all pages
async function fetchAllPages(pagesToFetch = PAGES) {
  console.log(`\n🚀 Starting Figma design fetch for ${pagesToFetch.length} page(s)...`);
  console.log(`📁 Designs will be saved to: ${DESIGNS_DIR}\n`);

  const results = [];
  const errors = [];

  for (const page of pagesToFetch) {
    try {
      const result = await fetchPageDesign(page);
      results.push(result);
    } catch (error) {
      errors.push({ page, error });
    }
  }

  // Summary
  console.log(`\n${'='.repeat(60)}`);
  console.log('📊 SUMMARY');
  console.log('='.repeat(60));
  console.log(`✅ Successfully fetched: ${results.length} page(s)`);
  console.log(`❌ Failed: ${errors.length} page(s)`);

  if (results.length > 0) {
    console.log('\n✅ Successfully fetched pages:');
    results.forEach(({ page, outputPath }) => {
      console.log(`   - ${page.description}: ${path.basename(outputPath)}`);
    });
  }

  if (errors.length > 0) {
    console.log('\n❌ Failed pages:');
    errors.forEach(({ page, error }) => {
      console.log(`   - ${page.description}: ${error.message}`);
    });
  }

  console.log(`\n📁 All designs saved in: ${DESIGNS_DIR}`);
  console.log('='.repeat(60));

  return { results, errors };
}

// Check if specific pages are passed as command line arguments
const args = process.argv.slice(2);
let pagesToFetch = PAGES;

if (args.length > 0) {
  // Filter pages based on command line arguments
  pagesToFetch = PAGES.filter(page => args.includes(page.name));

  if (pagesToFetch.length === 0) {
    console.error('❌ No matching pages found for the provided arguments.');
    console.log('\nAvailable pages:');
    PAGES.forEach(page => console.log(`  - ${page.name}: ${page.description}`));
    console.log('\nUsage: node fetch-landing-page.js [page-name-1] [page-name-2] ...');
    console.log('Example: node fetch-landing-page.js landing-page');
    console.log('Or run without arguments to fetch all pages.');
    process.exit(1);
  }
}

// Run the script
fetchAllPages(pagesToFetch).catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});

