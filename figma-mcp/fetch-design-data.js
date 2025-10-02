import * as Figma from 'figma-js';
import dotenv from 'dotenv';
dotenv.config();

const FIGMA_TOKEN = process.env.FIGMA_TOKEN;
const FIGMA_FILE_ID = process.env.FIGMA_FILE_ID;

if (!FIGMA_TOKEN || !FIGMA_FILE_ID) {
  console.error('❌ Missing FIGMA_TOKEN or FIGMA_FILE_ID');
  process.exit(1);
}

const client = Figma.Client({ personalAccessToken: FIGMA_TOKEN });

async function fetchCompleteDesignData() {
  try {
    console.log('🎨 Fetching Complete Design Data from Figma');
    console.log('=' .repeat(50));

    // 1. Fetch file with limited depth to avoid memory issues
    console.log('\n📄 Fetching file information...');
    const file = await client.file(FIGMA_FILE_ID, { depth: 2 });

    console.log(`✅ File: "${file.data.name}"`);
    console.log(`📅 Last Modified: ${file.data.lastModified}`);
    console.log(`🔢 Version: ${file.data.version}`);
    console.log(`🔗 Thumbnail: ${file.data.thumbnailUrl || 'N/A'}`);

    // 2. Fetch specific wireframe node
    console.log('\n📐 Fetching Wireframe 214...');
    const wireframeResponse = await client.fileNodes(FIGMA_FILE_ID, { ids: ['1575:53384'] });
    const wireframeNode = wireframeResponse.data.nodes['1575:53384'];

    // 3. Analyze document structure
    console.log('\n📋 Document Structure:');
    const document = file.data.document;
    console.log(`Document ID: ${document.id}`);
    console.log(`Document Type: ${document.type}`);
    console.log(`Pages Count: ${document.children?.length || 0}`);

    // 4. Collect design tokens from wireframe
    const designTokens = {
      colors: new Set(),
      fonts: new Set(),
      spacing: new Set(),
      borderRadius: new Set()
    };

    function extractDesignTokens(node) {
      // Extract colors
      if (node.backgroundColor) {
        const bg = node.backgroundColor;
        designTokens.colors.add(`rgb(${Math.round(bg.r * 255)}, ${Math.round(bg.g * 255)}, ${Math.round(bg.b * 255)})`);
      }

      if (node.fills) {
        node.fills.forEach(fill => {
          if (fill.color) {
            const c = fill.color;
            designTokens.colors.add(`rgb(${Math.round(c.r * 255)}, ${Math.round(c.g * 255)}, ${Math.round(c.b * 255)})`);
          }
        });
      }

      if (node.strokes) {
        node.strokes.forEach(stroke => {
          if (stroke.color) {
            const c = stroke.color;
            designTokens.colors.add(`rgb(${Math.round(c.r * 255)}, ${Math.round(c.g * 255)}, ${Math.round(c.b * 255)})`);
          }
        });
      }

      // Extract typography
      if (node.style) {
        designTokens.fonts.add(`${node.style.fontFamily}-${node.style.fontWeight}-${node.style.fontSize}`);
      }

      // Extract spacing and dimensions
      if (node.absoluteBoundingBox) {
        designTokens.spacing.add(node.absoluteBoundingBox.width);
        designTokens.spacing.add(node.absoluteBoundingBox.height);
      }

      // Extract border radius
      if (node.cornerRadius !== undefined) {
        designTokens.borderRadius.add(node.cornerRadius);
      }

      // Recursively process children
      if (node.children) {
        node.children.forEach(child => extractDesignTokens(child));
      }
    }

    if (wireframeNode && wireframeNode.document) {
      extractDesignTokens(wireframeNode.document);
    }

    // 5. Analyze pages for components and frames
    const allNodes = [];
    const components = [];
    const frames = [];

    if (document.children) {
      document.children.forEach((page, pageIndex) => {
        console.log(`\n📄 Page ${pageIndex + 1}: "${page.name}"`);
        console.log(`  - ID: ${page.id}`);
        console.log(`  - Type: ${page.type}`);
        console.log(`  - Children: ${page.children?.length || 0}`);

        // Collect top-level nodes only to avoid memory issues
        if (page.children) {
          page.children.forEach(child => {
            allNodes.push({
              id: child.id,
              name: child.name,
              type: child.type,
              page: page.name
            });

            if (child.type === 'COMPONENT') {
              components.push(child);
            } else if (child.type === 'FRAME') {
              frames.push(child);
            }
          });
        }
      });
    }
    
    // 6. Summary statistics
    console.log('\n📊 Design Data Summary:');
    console.log(`Total Nodes: ${allNodes.length}`);
    console.log(`Components: ${components.length}`);
    console.log(`Frames: ${frames.length}`);

    // 7. Display extracted design tokens
    console.log('\n🎨 Design Tokens Extracted:');
    console.log(`Colors: ${designTokens.colors.size}`);
    Array.from(designTokens.colors).slice(0, 10).forEach(color => {
      console.log(`  - ${color}`);
    });

    console.log(`Fonts: ${designTokens.fonts.size}`);
    Array.from(designTokens.fonts).slice(0, 5).forEach(font => {
      console.log(`  - ${font}`);
    });

    console.log(`Border Radius Values: ${designTokens.borderRadius.size}`);
    Array.from(designTokens.borderRadius).forEach(radius => {
      console.log(`  - ${radius}px`);
    });

    // 8. Fetch styles if available
    console.log('\n🎨 Fetching File Styles...');
    let fileStyles = null;
    try {
      const styles = await client.fileStyles(FIGMA_FILE_ID);
      if (styles.data && styles.data.meta) {
        console.log(`Text Styles: ${styles.data.meta.styles?.filter(s => s.style_type === 'TEXT')?.length || 0}`);
        console.log(`Fill Styles: ${styles.data.meta.styles?.filter(s => s.style_type === 'FILL')?.length || 0}`);
        console.log(`Effect Styles: ${styles.data.meta.styles?.filter(s => s.style_type === 'EFFECT')?.length || 0}`);
        fileStyles = styles.data.meta.styles;
      }
    } catch (styleError) {
      console.log('⚠️  Could not fetch styles:', styleError.message);
    }

    // 9. Return structured data with design tokens
    return {
      file: {
        name: file.data.name,
        id: FIGMA_FILE_ID,
        lastModified: file.data.lastModified,
        version: file.data.version,
        thumbnailUrl: file.data.thumbnailUrl
      },
      wireframe: wireframeNode ? wireframeNode.document : null,
      designTokens: {
        colors: Array.from(designTokens.colors),
        fonts: Array.from(designTokens.fonts),
        spacing: Array.from(designTokens.spacing),
        borderRadius: Array.from(designTokens.borderRadius)
      },
      styles: fileStyles,
      structure: {
        totalNodes: allNodes.length,
        components: components.length,
        frames: frames.length,
        pages: document.children?.length || 0
      },
      nodes: allNodes,
      components: components.map(c => ({ id: c.id, name: c.name, type: c.type })),
      frames: frames.map(f => ({ id: f.id, name: f.name, type: f.type }))
    };
    
  } catch (error) {
    console.error('\n❌ Error fetching design data:', error.message);
    if (error.response) {
      console.error(`HTTP Status: ${error.response.status}`);
      console.error('Response:', error.response.data);
    }
    throw error;
  }
}

// Run the fetch
fetchCompleteDesignData()
  .then(data => {
    console.log('\n🎉 Design data fetch completed successfully!');
    console.log('\n💾 Saving data to design-data.json...');
    
    // Save to file for later use
    import('fs').then(fs => {
      fs.writeFileSync('design-data.json', JSON.stringify(data, null, 2));
      console.log('✅ Data saved to design-data.json');
    });
  })
  .catch(error => {
    console.error('\n💥 Failed to fetch design data:', error.message);
    process.exit(1);
  });
