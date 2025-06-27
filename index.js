const Parser = require('rss-parser');
const fs = require('fs-extra');
const config = require('./config.json'); // CommonJS handles JSON imports directly

const parser = new Parser();

async function fetchFeedItems(feedUrl) {
  try {
    const feed = await parser.parseURL(feedUrl);
    return feed.items.map(item => ({
      title: item.title,
      link: item.link,
      pubDate: item.pubDate,
      feedTitle: feed.title
    }));
  } catch (error) {
    console.error(`Error fetching feed from ${feedUrl}:`, error);
    return []; // Return empty array on error
  }
}

async function generateHtmlPage() {
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

  let htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>My RSS Feed Aggregator</title>
  <style>
    body { font-family: sans-serif; line-height: 1.6; padding: 20px; background-color: #f4f4f4; color: #333; }
    .container { max-width: 800px; margin: auto; background: #fff; padding: 20px; border-radius: 8px; box-shadow: 0 0 10px rgba(0,0,0,0.1); }
    h1 { color: #333; text-align: center; }
    .feed-item { margin-bottom: 20px; padding-bottom: 20px; border-bottom: 1px solid #eee; }
    .feed-item:last-child { border-bottom: none; }
    .feed-item h2 { margin: 0 0 5px 0; }
    .feed-item h2 a { color: #007bff; text-decoration: none; }
    .feed-item h2 a:hover { text-decoration: underline; }
    .feed-item p { margin: 5px 0; font-size: 0.9em; }
    .feed-item .meta { font-size: 0.8em; color: #666; }
  </style>
</head>
<body>
  <div class="container">
    <h1>Aggregated RSS Feeds</h1>
`;

  if (allItems.length === 0) {
    htmlContent += '<p>No items to display. Check console for errors if feeds are configured, or if feeds returned no items.</p>';
  } else {
    allItems.forEach(item => {
      const pubDate = item.pubDate ? new Date(item.pubDate).toLocaleString() : 'N/A';
      const title = item.title || 'No title';
      const link = item.link || '#';
      const feedTitle = item.feedTitle || 'N/A';

      htmlContent += `
      <div class="feed-item">
        <h2><a href="${link}" target="_blank" rel="noopener noreferrer">${title}</a></h2>
        <p class="meta">From: ${feedTitle}</p>
        <p class="meta">Published: ${pubDate}</p>
      </div>
`;
    });
  }

  htmlContent += `
  </div>
</body>
</html>
`;

  try {
    await fs.writeFile('public/index.html', htmlContent);
    console.log('Successfully generated public/index.html');
  } catch (error) {
    console.error('Error writing HTML file:', error);
  }
}

// Create public directory if it doesn't exist
fs.ensureDir('public')
  .then(() => {
    generateHtmlPage();
  })
  .catch(err => {
    console.error('Error creating public directory:', err);
  });
