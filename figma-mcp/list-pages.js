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

async function listPages() {
  try {
    console.log('📄 Listing Pages in Figma File');
    console.log('=' .repeat(35));
    console.log(`File ID: ${FIGMA_FILE_ID}`);
    
    // Fetch file with minimal data to get pages quickly
    console.log('\n📡 Fetching file structure...');
    const file = await client.file(FIGMA_FILE_ID, { depth: 1 });
    
    console.log(`\n✅ File: "${file.data.name}"`);
    console.log(`📅 Last Modified: ${file.data.lastModified}`);
    console.log(`🔢 Version: ${file.data.version}`);
    
    const document = file.data.document;
    const pages = document.children || [];
    
    console.log(`\n📋 Found ${pages.length} page(s):`);
    console.log('-'.repeat(50));
    
    const pageList = [];
    
    pages.forEach((page, index) => {
      console.log(`\n${index + 1}. "${page.name}"`);
      console.log(`   ID: ${page.id}`);
      console.log(`   Type: ${page.type}`);
      console.log(`   Children: ${page.children?.length || 0} elements`);
      
      // Show top-level children if any
      if (page.children && page.children.length > 0) {
        console.log('   Top-level elements:');
        page.children.slice(0, 5).forEach((child, childIndex) => {
          console.log(`     - ${child.name} (${child.type})`);
        });
        if (page.children.length > 5) {
          console.log(`     ... and ${page.children.length - 5} more`);
        }
      }
      
      pageList.push({
        index: index + 1,
        id: page.id,
        name: page.name,
        type: page.type,
        childCount: page.children?.length || 0,
        children: page.children ? page.children.map(child => ({
          id: child.id,
          name: child.name,
          type: child.type
        })) : []
      });
    });
    
    console.log('\n📊 Summary:');
    console.log(`Total Pages: ${pages.length}`);
    console.log(`Total Elements: ${pages.reduce((sum, page) => sum + (page.children?.length || 0), 0)}`);
    
    // Save page list to file
    console.log('\n💾 Saving page list to pages-list.json...');
    
    const pageData = {
      file: {
        name: file.data.name,
        id: FIGMA_FILE_ID,
        lastModified: file.data.lastModified,
        version: file.data.version
      },
      pages: pageList,
      summary: {
        totalPages: pages.length,
        totalElements: pages.reduce((sum, page) => sum + (page.children?.length || 0), 0)
      }
    };
    
    import('fs').then(fs => {
      fs.writeFileSync('pages-list.json', JSON.stringify(pageData, null, 2));
      console.log('✅ Page list saved to pages-list.json');
    });
    
    return pageData;
    
  } catch (error) {
    console.error('\n❌ Error listing pages:', error.message);
    if (error.response) {
      console.error(`HTTP Status: ${error.response.status}`);
      console.error('Response:', error.response.data);
    }
    throw error;
  }
}

// Run the page listing
listPages()
  .then(() => {
    console.log('\n🎉 Page listing completed successfully!');
  })
  .catch(error => {
    console.error('\n💥 Failed to list pages:', error.message);
    process.exit(1);
  });
