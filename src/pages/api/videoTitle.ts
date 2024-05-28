import type { NextApiRequest, NextApiResponse } from 'next';
import fetch from 'node-fetch';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { videoId } = req.query;

  if (!videoId || typeof videoId !== 'string') {
    return res.status(400).json({ error: 'Video ID is required and must be a string' });
  }

  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'API key is missing' });
  }

  const apiUrl = `https://www.googleapis.com/youtube/v3/videos?id=${videoId}&key=${apiKey}&part=snippet`;

  try {
    const response = await fetch(apiUrl);
    if (!response.ok) {
      return res.status(response.status).json({ error: `YouTube API request failed with status ${response.status}` });
    }

    const data = await response.json();

    if (data.items && data.items.length > 0) {
      const videoTitle = data.items[0].snippet.title;
      return res.status(200).json({ title: videoTitle });
    } else {
      return res.status(404).json({ error: 'Video not found' });
    }
  } catch (error) {
    return res.status(500).json({ error: `Failed to fetch video title: ${error.message}` });
  }
}
