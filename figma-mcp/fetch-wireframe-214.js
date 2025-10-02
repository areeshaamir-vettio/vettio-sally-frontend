import * as Figma from 'figma-js';
import dotenv from 'dotenv';
dotenv.config();

const FIGMA_TOKEN = process.env.FIGMA_TOKEN;
const FIGMA_FILE_ID = process.env.FIGMA_FILE_ID;
const WIREFRAME_NODE_ID = "1575:53384";

if (!FIGMA_TOKEN || !FIGMA_FILE_ID) {
  console.error('❌ Missing FIGMA_TOKEN or FIGMA_FILE_ID');
  process.exit(1);
}

const client = Figma.Client({ personalAccessToken: FIGMA_TOKEN });

async function fetchWireframe214() {
  try {
    console.log('📐 Fetching Wireframe 214');
    console.log('=' .repeat(30));
    console.log(`Node ID: ${WIREFRAME_NODE_ID}`);
    console.log(`File ID: ${FIGMA_FILE_ID}`);
    
    // Fetch the specific wireframe node
    console.log('\n📡 Fetching wireframe data...');
    const response = await client.fileNodes(FIGMA_FILE_ID, { ids: [WIREFRAME_NODE_ID] });
    
    const node = response.data.nodes[WIREFRAME_NODE_ID];
    if (!node) {
      console.error("❌ Wireframe 214 not found in the file.");
      return;
    }
    
    const document = node.document;
    
    console.log('\n✅ Wireframe 214 Details:');
    console.log(`Name: "${document.name}"`);
    console.log(`Type: ${document.type}`);
    console.log(`ID: ${document.id}`);
    console.log(`Visible: ${document.visible !== false ? 'Yes' : 'No'}`);
    
    // Dimensions and positioning
    if (document.absoluteBoundingBox) {
      const bbox = document.absoluteBoundingBox;
      console.log('\n📐 Wireframe Dimensions:');
      console.log(`Width: ${bbox.width}px`);
      console.log(`Height: ${bbox.height}px`);
      console.log(`Position: (${bbox.x}, ${bbox.y})`);
    }
    
    // Background and styling
    if (document.backgroundColor) {
      const bg = document.backgroundColor;
      console.log('\n🎨 Background:');
      console.log(`RGB: (${Math.round(bg.r * 255)}, ${Math.round(bg.g * 255)}, ${Math.round(bg.b * 255)})`);
      console.log(`Alpha: ${bg.a || 1}`);
    }
    
    // Fills
    if (document.fills && document.fills.length > 0) {
      console.log('\n🖌️  Fills:');
      document.fills.forEach((fill, index) => {
        console.log(`  ${index + 1}. Type: ${fill.type}`);
        if (fill.color) {
          const c = fill.color;
          console.log(`     Color: RGB(${Math.round(c.r * 255)}, ${Math.round(c.g * 255)}, ${Math.round(c.b * 255)})`);
        }
        console.log(`     Opacity: ${fill.opacity || 1}`);
        console.log(`     Visible: ${fill.visible !== false ? 'Yes' : 'No'}`);
      });
    }
    
    // Strokes/Borders
    if (document.strokes && document.strokes.length > 0) {
      console.log('\n🖊️  Strokes:');
      document.strokes.forEach((stroke, index) => {
        console.log(`  ${index + 1}. Type: ${stroke.type}`);
        if (stroke.color) {
          const c = stroke.color;
          console.log(`     Color: RGB(${Math.round(c.r * 255)}, ${Math.round(c.g * 255)}, ${Math.round(c.b * 255)})`);
        }
      });
      if (document.strokeWeight) {
        console.log(`Stroke Weight: ${document.strokeWeight}px`);
      }
    }
    
    // Corner radius
    if (document.cornerRadius !== undefined) {
      console.log(`\n📐 Corner Radius: ${document.cornerRadius}px`);
    }
    
    // Children analysis
    console.log(`\n👶 Child Elements: ${document.children?.length || 0}`);
    if (document.children && document.children.length > 0) {
      console.log('\nWireframe Components:');
      
      function analyzeChild(child, depth = 0) {
        const indent = '  '.repeat(depth + 1);
        console.log(`${indent}- "${child.name}" (${child.type}) [${child.id}]`);
        
        if (child.absoluteBoundingBox) {
          const bbox = child.absoluteBoundingBox;
          console.log(`${indent}  Size: ${bbox.width}×${bbox.height}px at (${bbox.x}, ${bbox.y})`);
        }
        
        // Show text content if it's a text node
        if (child.type === 'TEXT' && child.characters) {
          console.log(`${indent}  Text: "${child.characters}"`);
        }
        
        // Recursively analyze children (limit depth to avoid too much output)
        if (child.children && depth < 2) {
          child.children.forEach(grandchild => analyzeChild(grandchild, depth + 1));
        } else if (child.children && child.children.length > 0) {
          console.log(`${indent}  ... ${child.children.length} more nested elements`);
        }
      }
      
      document.children.forEach(child => analyzeChild(child));
    }
    
    // Layout properties
    if (document.layoutMode) {
      console.log('\n📏 Layout Properties:');
      console.log(`Layout Mode: ${document.layoutMode}`);
      if (document.primaryAxisSizingMode) {
        console.log(`Primary Axis: ${document.primaryAxisSizingMode}`);
      }
      if (document.counterAxisSizingMode) {
        console.log(`Counter Axis: ${document.counterAxisSizingMode}`);
      }
      if (document.itemSpacing !== undefined) {
        console.log(`Item Spacing: ${document.itemSpacing}px`);
      }
    }
    
    // Constraints
    if (document.constraints) {
      console.log('\n🔗 Constraints:');
      console.log(`Horizontal: ${document.constraints.horizontal}`);
      console.log(`Vertical: ${document.constraints.vertical}`);
    }
    
    // Create structured wireframe data
    const wireframeData = {
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
      styling: {
        backgroundColor: document.backgroundColor,
        fills: document.fills || [],
        strokes: document.strokes || [],
        strokeWeight: document.strokeWeight,
        cornerRadius: document.cornerRadius
      },
      layout: {
        layoutMode: document.layoutMode,
        primaryAxisSizingMode: document.primaryAxisSizingMode,
        counterAxisSizingMode: document.counterAxisSizingMode,
        itemSpacing: document.itemSpacing
      },
      constraints: document.constraints,
      children: document.children ? document.children.map(child => ({
        id: child.id,
        name: child.name,
        type: child.type,
        dimensions: child.absoluteBoundingBox,
        text: child.characters || null,
        childCount: child.children?.length || 0
      })) : [],
      metadata: {
        fetchedAt: new Date().toISOString(),
        nodeId: WIREFRAME_NODE_ID,
        fileId: FIGMA_FILE_ID
      }
    };
    
    console.log('\n💾 Saving wireframe data to wireframe-214.json...');
    
    // Save to file
    import('fs').then(fs => {
      fs.writeFileSync('wireframe-214.json', JSON.stringify(wireframeData, null, 2));
      console.log('✅ Wireframe 214 data saved to wireframe-214.json');
    });
    
    return wireframeData;
    
  } catch (error) {
    console.error('\n❌ Error fetching Wireframe 214:', error.message);
    if (error.response) {
      console.error(`HTTP Status: ${error.response.status}`);
      console.error('Response:', error.response.data);
    }
    throw error;
  }
}

// Run the wireframe fetch
fetchWireframe214()
  .then(() => {
    console.log('\n🎉 Wireframe 214 fetch completed successfully!');
  })
  .catch(error => {
    console.error('\n💥 Failed to fetch Wireframe 214:', error.message);
    process.exit(1);
  });
