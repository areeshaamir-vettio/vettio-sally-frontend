// test-figma-tool.js
import * as Figma from 'figma-js';
import dotenv from 'dotenv';
dotenv.config();

const FIGMA_TOKEN   = process.env.FIGMA_TOKEN;
const FIGMA_FILE_ID = process.env.FIGMA_FILE_ID;

if (!FIGMA_TOKEN || !FIGMA_FILE_ID) {
  console.error('❌ Missing FIGMA_TOKEN or FIGMA_FILE_ID. Provide them in .env or env variables.');
  process.exit(1);
}

async function run() {
  try {
    const client = Figma.Client({ personalAccessToken: FIGMA_TOKEN });

    const nodeId = "1011:67054"; // replace with the node ID you want
    console.log(`Requesting node ${nodeId} from Figma file ${FIGMA_FILE_ID}...`);

    const nodes = await client.fileNodes(FIGMA_FILE_ID, { ids: [nodeId] });

    const node = nodes.data.nodes[nodeId];
    if (!node) {
      console.error("❌ Node not found in the file.");
      return;
    }

    console.log("✅ Node fetched successfully!");
    console.log("Node name:", node.document?.name);
    console.log("Node type:", node.document?.type);

    // If you want to see the structure:
    console.log("Child count:", node.document?.children?.length || 0);

  } catch (err) {
    console.error('❌ Figma fetch failed — full error follows:');
    console.error(err);
    if (err.response) {
      console.error('response status:', err.response.status);
      console.error('response data:', err.response.data);
    }
  }
}

run();
