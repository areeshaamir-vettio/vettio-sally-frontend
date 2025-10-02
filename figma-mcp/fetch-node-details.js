import * as Figma from 'figma-js';
import dotenv from 'dotenv';
dotenv.config();

const FIGMA_TOKEN = process.env.FIGMA_TOKEN;
const FIGMA_FILE_ID = process.env.FIGMA_FILE_ID;
const NODE_ID = "1011:67054";

if (!FIGMA_TOKEN || !FIGMA_FILE_ID) {
  console.error('❌ Missing FIGMA_TOKEN or FIGMA_FILE_ID');
  process.exit(1);
}

const client = Figma.Client({ personalAccessToken: FIGMA_TOKEN });

async function fetchNodeDetails() {
  try {
    console.log('🎯 Fetching Detailed Node Information');
    console.log('=' .repeat(40));
    console.log(`Node ID: ${NODE_ID}`);
    console.log(`File ID: ${FIGMA_FILE_ID}`);
    
    // Fetch the specific node
    console.log('\n📡 Fetching node data...');
    const response = await client.fileNodes(FIGMA_FILE_ID, { ids: [NODE_ID] });
    
    const node = response.data.nodes[NODE_ID];
    if (!node) {
      console.error("❌ Node not found in the file.");
      return;
    }
    
    const document = node.document;
    
    console.log('\n✅ Node Details:');
    console.log(`Name: "${document.name}"`);
    console.log(`Type: ${document.type}`);
    console.log(`ID: ${document.id}`);
    console.log(`Visible: ${document.visible !== false ? 'Yes' : 'No'}`);
    
    // Dimensions and positioning
    if (document.absoluteBoundingBox) {
      const bbox = document.absoluteBoundingBox;
      console.log('\n📐 Dimensions & Position:');
      console.log(`Width: ${bbox.width}px`);
      console.log(`Height: ${bbox.height}px`);
      console.log(`X: ${bbox.x}px`);
      console.log(`Y: ${bbox.y}px`);
    }
    
    // Background and fills
    if (document.backgroundColor) {
      const bg = document.backgroundColor;
      console.log('\n🎨 Background Color:');
      console.log(`R: ${Math.round(bg.r * 255)}, G: ${Math.round(bg.g * 255)}, B: ${Math.round(bg.b * 255)}, A: ${bg.a || 1}`);
    }
    
    if (document.fills && document.fills.length > 0) {
      console.log('\n🖌️  Fills:');
      document.fills.forEach((fill, index) => {
        console.log(`  ${index + 1}. Type: ${fill.type}`);
        if (fill.color) {
          const c = fill.color;
          console.log(`     Color: RGB(${Math.round(c.r * 255)}, ${Math.round(c.g * 255)}, ${Math.round(c.b * 255)})`);
        }
        console.log(`     Opacity: ${fill.opacity || 1}`);
      });
    }
    
    // Effects (shadows, blurs, etc.)
    if (document.effects && document.effects.length > 0) {
      console.log('\n✨ Effects:');
      document.effects.forEach((effect, index) => {
        console.log(`  ${index + 1}. Type: ${effect.type}`);
        console.log(`     Visible: ${effect.visible !== false ? 'Yes' : 'No'}`);
        if (effect.radius) console.log(`     Radius: ${effect.radius}`);
        if (effect.color) {
          const c = effect.color;
          console.log(`     Color: RGB(${Math.round(c.r * 255)}, ${Math.round(c.g * 255)}, ${Math.round(c.b * 255)})`);
        }
      });
    }
    
    // Children analysis
    console.log(`\n👶 Children: ${document.children?.length || 0}`);
    if (document.children && document.children.length > 0) {
      console.log('\nChild Elements:');
      document.children.forEach((child, index) => {
        console.log(`  ${index + 1}. "${child.name}" (${child.type}) [ID: ${child.id}]`);
        if (child.absoluteBoundingBox) {
          const bbox = child.absoluteBoundingBox;
          console.log(`     Size: ${bbox.width}x${bbox.height}px at (${bbox.x}, ${bbox.y})`);
        }
      });
    }
    
    // Export settings
    if (document.exportSettings && document.exportSettings.length > 0) {
      console.log('\n📤 Export Settings:');
      document.exportSettings.forEach((setting, index) => {
        console.log(`  ${index + 1}. Format: ${setting.format}`);
        console.log(`     Suffix: ${setting.suffix || 'none'}`);
        console.log(`     Scale: ${setting.constraint?.value || 1}x`);
      });
    }
    
    // Constraints
    if (document.constraints) {
      console.log('\n🔗 Constraints:');
      console.log(`Horizontal: ${document.constraints.horizontal}`);
      console.log(`Vertical: ${document.constraints.vertical}`);
    }
    
    // Return structured data
    const nodeData = {
      id: document.id,
      name: document.name,
      type: document.type,
      visible: document.visible !== false,
      dimensions: document.absoluteBoundingBox ? {
        width: document.absoluteBoundingBox.width,
        height: document.absoluteBoundingBox.height,
        x: document.absoluteBoundingBox.x,
        y: document.absoluteBoundingBox.y
      } : null,
      backgroundColor: document.backgroundColor,
      fills: document.fills || [],
      effects: document.effects || [],
      children: document.children ? document.children.map(child => ({
        id: child.id,
        name: child.name,
        type: child.type,
        dimensions: child.absoluteBoundingBox
      })) : [],
      exportSettings: document.exportSettings || [],
      constraints: document.constraints
    };
    
    console.log('\n💾 Saving node data to node-data.json...');
    
    // Save to file
    import('fs').then(fs => {
      fs.writeFileSync('node-data.json', JSON.stringify(nodeData, null, 2));
      console.log('✅ Node data saved to node-data.json');
    });
    
    return nodeData;
    
  } catch (error) {
    console.error('\n❌ Error fetching node:', error.message);
    if (error.response) {
      console.error(`HTTP Status: ${error.response.status}`);
      console.error('Response:', error.response.data);
    }
    throw error;
  }
}

// Run the fetch
fetchNodeDetails()
  .then(() => {
    console.log('\n🎉 Node fetch completed successfully!');
  })
  .catch(error => {
    console.error('\n💥 Failed to fetch node:', error.message);
    process.exit(1);
  });
