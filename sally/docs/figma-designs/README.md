# Figma Designs

This directory contains Figma design data fetched from the Figma API.

## Directory Structure

Each page design is saved as a separate JSON file:
- `landing-page-design.json` - Landing page design data
- `[page-name]-design.json` - Other page designs

## Fetching Designs

Use the `fetch-landing-page.js` script to fetch and save designs:

### Fetch All Pages
```bash
node scripts/fetch-landing-page.js
```

### Fetch Specific Pages
```bash
node scripts/fetch-landing-page.js landing-page
node scripts/fetch-landing-page.js landing-page dashboard
```

## Adding New Pages

To add a new page to fetch:

1. Open `scripts/fetch-landing-page.js`
2. Add a new entry to the `PAGES` array:

```javascript
const PAGES = [
  {
    name: 'landing-page',
    nodeId: '705-4484',
    description: 'Landing Page'
  },
  {
    name: 'your-page-name',
    nodeId: 'YOUR_NODE_ID',
    description: 'Your Page Description'
  },
];
```

3. Run the script to fetch the new page design

## Finding Node IDs

To find the node ID for a Figma page:

1. Open your Figma file
2. Select the frame/component you want to fetch
3. Right-click and select "Copy/Paste as" → "Copy link"
4. The URL will look like: `https://www.figma.com/file/FILE_ID/...?node-id=XXX-YYYY`
5. The node ID is `XXX-YYYY` (replace the hyphen with a colon if needed: `XXX:YYYY`)

## Environment Variables

You can override the default Figma credentials:

```bash
export FIGMA_TOKEN=your_figma_token
export FIGMA_FILE_ID=your_file_id
node scripts/fetch-landing-page.js
```

## Design Data Structure

Each JSON file contains the complete Figma node structure including:
- Layout and positioning
- Text content and styles
- Colors and fills
- Component hierarchy
- Design tokens

This data can be used for:
- Automated component generation
- Design-to-code workflows
- Design system documentation
- Visual regression testing

