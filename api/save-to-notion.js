// This is your Vercel backend API route file (e.g., pages/api/save-to-notion.js)

export default async function handler(req, res) {
  // IMPORTANT: Replace 'nmeacjjdjgaobpilmbdpeeihmbhjobik' with your actual Chrome Extension ID.
  // You can find your extension ID by going to chrome://extensions in your browser
  // and enabling "Developer mode".
  const allowedOrigin = 'chrome-extension://nmeacjjdjgaobpilmbdpeeihmbhjobik';

  // Set CORS headers to allow requests from your Chrome Extension
  res.setHeader('Access-Control-Allow-Origin', allowedOrigin);
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS'); // Ensure all methods your frontend might use are allowed
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type'); // Allow the Content-Type header

  // Handle preflight OPTIONS requests. Browsers send these before actual POST requests.
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only allow POST requests for saving data
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Only POST allowed' });
  }

  const { tweetText, tweetUrl } = req.body;

  // Validate incoming data
  if (!tweetText || !tweetUrl) {
    return res.status(400).json({ error: 'Missing tweetText or tweetUrl' });
  }

  try {
    // Dynamically import the Notion client to minimize cold start time if not always used
    const { Client } = await import('@notionhq/client');
    const notion = new Client({ auth: process.env.NOTION_API_KEY }); // Ensure NOTION_API_KEY is set in Vercel environment variables

    // Create a new page in your Notion database
    await notion.pages.create({
      parent: { database_id: process.env.NOTION_DB_ID }, // Ensure NOTION_DB_ID is set in Vercel environment variables
      properties: {
        // 'Name' property for the tweet text (truncated to 100 chars for Notion title)
        Name: {
          title: [{ text: { content: tweetText.slice(0, 100) } }]
        },
        // 'URL' property for the tweet URL
        URL: {
          url: tweetUrl
        }
      }
    });

    // Send a success response
    return res.status(200).json({ message: 'Saved to Notion' });
  } catch (error) {
    // Log and send an error response if Notion API fails
    console.error('Notion API failed:', error);
    return res.status(500).json({ error: 'Notion API failed', detail: error.message });
  }
}
