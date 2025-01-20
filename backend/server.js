const express = require('express');
const cors = require('cors');
const axios = require('axios');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan('dev')); 

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 100,
  message: 'Too many requests from this IP, please try again later.'
});
app.use(limiter);

const HUGGING_FACE_API_KEY = process.env.HUGGING_FACE_API_KEY;
const UNSPLASH_ACCESS_KEY = process.env.UNSPLASH_ACCESS_KEY;
const PORT = process.env.PORT || 3001;

const MAX_RETRIES = 3;
const RETRY_DELAY = 2000;

const platformPrompts = {
  twitter: {
    prefix: "Write a concise, engaging tweet (max 280 characters) about:",
    maxLength: 280
  },
  linkedin: {
    prefix: "Write a professional LinkedIn post about:",
    maxLength: 3000
  },
  instagram: {
    prefix: "Write an engaging Instagram caption about:",
    maxLength: 2500
  }
};

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

app.post('/api/generate', async (req, res) => {
  const { prompt, platform } = req.body;

  if (!prompt || !platform) {
    return res.status(400).json({ error: 'Prompt and platform are required' });
  }

  if (!platformPrompts[platform]) {
    return res.status(400).json({ error: 'Invalid platform specified' });
  }

  try {
    const { prefix, maxLength } = platformPrompts[platform];
    const response = await axios.post(
      "https://api-inference.huggingface.co/models/HuggingFaceH4/zephyr-7b-beta",
      {
        inputs: `${prefix} ${prompt}\n\nContent:`,
        parameters: {
          max_new_tokens: Math.min(maxLength, 200),
          temperature: 0.7,
          top_p: 0.9,
          do_sample: true,
        },
      },
      {
        headers: {
          "Authorization": `Bearer ${HUGGING_FACE_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    let generatedText = response.data[0].generated_text;
    generatedText = generatedText.split('Content:')[1]?.trim() || generatedText;

    if (generatedText.length > maxLength) {
      generatedText = generatedText.substring(0, maxLength - 3) + '...';
    }

    res.json({ content: generatedText });
  } catch (error) {
    console.error('Generation error:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to generate content' });
  }
});

app.get('/api/images/search', async (req, res) => {
  const { query } = req.query;

  if (!query) {
    return res.status(400).json({ error: 'Search query is required' });
  }

  try {
    const response = await axios.get('https://api.unsplash.com/search/photos', {
      params: {
        query,
        page: 1,
        per_page: 12,
        orientation: 'landscape',
      },
      headers: {
        Authorization: `Client-ID ${UNSPLASH_ACCESS_KEY}`,
      },
    });

    const images = response.data.results.map(image => ({
      id: image.id,
      urls: {
        small: image.urls.small,
        regular: image.urls.regular,
      },
      alt_description: image.alt_description,
      user: {
        name: image.user.name,
        links: {
          html: image.user.links.html,
        },
      },
    }));

    res.json({
      images,
      total: response.data.total,
      total_pages: response.data.total_pages
    });
  } catch (error) {
    console.error('Image search error:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to fetch images' });
  }
});

app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});