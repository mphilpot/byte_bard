const Parser = require('rss-parser');
const fs = require('fs-extra');
const Handlebars = require('handlebars'); // Added Handlebars
const config = require('./config.json');

const parser = new Parser();
let feedTemplate = null; // To store the compiled template

async function fetchFeedItems(feedUrl) {
  try {
    const feed = await parser.parseURL(feedUrl);
    return feed.items.map(item => ({
      title: item.title,
      link: item.link,
      pubDate: item.pubDate,
      feedTitle: feed.title,
      content: item['content:encoded'] || item.content || item.summary || item.description || ''
    }));
  } catch (error) {
    console.error(`Error fetching feed from ${feedUrl}:`, error);
    return []; // Return empty array on error
  }
}

function createSnippet(htmlContent, maxLength = 200) {
  if (!htmlContent) {
    return '';
  }
  // Strip HTML tags
  const textContent = htmlContent.replace(/<[^>]*>/g, '');
  // Replace multiple spaces/newlines with a single space
  const cleanedText = textContent.replace(/\s+/g, ' ').trim();

  if (cleanedText.length <= maxLength) {
    return cleanedText;
  }
  // Truncate and add ellipsis
  return cleanedText.substring(0, maxLength - 3) + '...';
}

async function generateHtmlPage() {
  if (!feedTemplate) {
    console.error("Feed template not loaded. Cannot generate HTML.");
    return;
  }

  let allItems = [];
  if (config.feeds && Array.isArray(config.feeds)) {
    for (const feedUrl of config.feeds) {
      const items = await fetchFeedItems(feedUrl);
      allItems = allItems.concat(items);
    }
  } else {
    console.error("Error: 'feeds' array not found or is not an array in config.json. Please ensure config.json has a 'feeds' array with URL strings.");
    // Optionally, create an empty index.html or skip HTML generation
  }


  // Sort items by publication date, newest first
  allItems.sort((a, b) => {
    try {
      return new Date(b.pubDate) - new Date(a.pubDate);
    } catch (e) {
      // Handle cases where pubDate might be invalid or missing
      return 0;
    }
  });

  // Prepare data for Handlebars template
  const viewData = {
    items: allItems.map(item => ({
      ...item,
      pubDate: item.pubDate ? new Date(item.pubDate).toLocaleString() : 'N/A',
      title: item.title || 'No title',
      link: item.link || '#',
      feedTitle: item.feedTitle || 'N/A',
      snippet: createSnippet(item.content)
    }))
  };

  const htmlContent = feedTemplate(viewData);

  try {
    await fs.writeFile('public/index.html', htmlContent);
    console.log('Successfully generated public/index.html using Handlebars template.');
  } catch (error) {
    console.error('Error writing HTML file:', error);
  }
}

async function main() {
  try {
    // Load and compile the Handlebars template
    const templateString = await fs.readFile('views/feed-template.hbs', 'utf-8');
    feedTemplate = Handlebars.compile(templateString);
    console.log('Handlebars template loaded and compiled.');

    // Ensure public directory exists
    await fs.ensureDir('public');
    console.log('Public directory ensured.');

    // Generate the HTML page
    await generateHtmlPage();
  } catch (error) {
    console.error('Error during application execution:', error);
    process.exit(1);
  }
}

main();
