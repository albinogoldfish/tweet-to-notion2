export default async function handler(req, res) {
  console.log('🔐 NOTION_API_KEY:', process.env.NOTION_API_KEY); // REMOVE in production

  const allowedOrigin = 'chrome-extension://nmeacjjdjgaobpilmbdpeeihmbhjobik';

  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', allowedOrigin);
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Only POST allowed' });
  }

  const {
    tweetText,
    tweetUrl,
    author,
    handle,
    date,
    time,
    location,
    views,
    comments,
    likes,
    shares
  } = req.body;

  if (!tweetText || !tweetUrl) {
    return res.status(400).json({ error: 'Missing tweetText or tweetUrl' });
  }

  try {
    const { Client } = await import('@notionhq/client');
    const notion = new Client({ auth: process.env.NOTION_API_KEY });

    await notion.pages.create({
      parent: { database_id: process.env.NOTION_DB_ID },
      properties: {
        Name: {
          title: [{ text: { content: tweetText.slice(0, 100) } }]
        },
        Tweet: {
          rich_text: [{ text: { content: tweetText } }]
        },
        Author: {
          rich_text: [{ text: { content: author || '' } }]
        },
        Handle: {
          rich_text: [{ text: { content: handle || '' } }]
        },
        Time: {
          rich_text: [{ text: { content: time || '' } }]
        },
        Date: {
          rich_text: [{ text: { content: date || '' } }]
        },
        Location: {
          rich_text: [{ text: { content: location || '' } }]
        },
        Views: {
          number: views ? parseInt(views) : 0
        },
        Comments: {
          number: comments ? parseInt(comments) : 0
        },
        Likes: {
          number: likes ? parseInt(likes) : 0
        },
        Shares: {
          number: shares ? parseInt(shares) : 0
        },
        URL: {
          url: tweetUrl
        }
      }
    });

    return res.status(200).json({ message: 'Saved to Notion' });
  } catch (error) {
    console.error('Notion API failed:', error);
    return res.status(500).json({
      error: 'Notion API failed',
      detail: error.message
    });
  }
}
