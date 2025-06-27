# Simple RSS Feed Aggregator

This Node.js application fetches items from a list of specified RSS feeds and generates a single static HTML page (`public/index.html`) displaying the aggregated items, sorted by publication date. Each item includes its title, source, publication date, and a short content snippet if available.

## Setup

1.  **Clone the repository (or ensure you have the files).**
2.  **Install dependencies:**
    ```bash
    npm install
    ```
    This will install `rss-parser` (for fetching and parsing RSS feeds), `fs-extra` (for file system operations), and `handlebars` (for HTML templating).
3.  **Configure Feeds (Optional):**
    Edit `config.json` to add or change the RSS feed URLs you want to aggregate.
    ```json
    {
      "feeds": [
        "https://www.example.com/rss-feed-1.xml",
        "https://www.another-site.org/feed.rss"
      ]
    }
    ```

## Running the Application

To fetch the feeds and generate the `public/index.html` page, run:

```bash
node index.js
```

After the script runs successfully, you can open `public/index.html` in your web browser to view the aggregated feeds.

## Features

-   Fetches multiple RSS feeds.
-   Aggregates items into a single HTML page.
-   Sorts items by publication date (newest first).
-   Displays title, link, source feed, and publication date for each item.
-   Includes a short preview snippet (up to 200 characters) from the item's content if available.
-   Uses Handlebars.js for HTML templating, separating presentation from logic.
-   Basic responsive styling for readability.
-   Ensures the output directory `public/` is created if it doesn't exist.

## Troubleshooting

-   **`MODULE_NOT_FOUND` error:** If you see this error when running `node index.js`, ensure that you have run `npm install` successfully and that the `node_modules` directory is present in the project root. This was an issue during development in the sandbox, so if it persists, local environment configuration or a fresh `npm install` might be needed.
-   **No items displayed:**
    -   Check that your `config.json` contains valid RSS feed URLs.
    -   Verify that the RSS feeds themselves are active and contain items.
    -   Look for any error messages in the console output when running `node index.js`.
-   **HTML file not generated:** Check for error messages in the console. Ensure the script has write permissions for the `public` directory.
