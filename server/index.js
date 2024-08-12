const express = require('express');
const cors = require('cors');
const Anthropic = require('@anthropic-ai/sdk');
const app = express();

app.use(cors());
app.use(express.json());

const anthropic = new Anthropic({
  apiKey: process.env.API_KEY
});

app.post('/api/claude', async (req, res) => {
  try {
    const message = await anthropic.messages.create({
      model: 'claude-3-sonnet-20240229',
      max_tokens: 1000,
      messages: [
        { role: 'user', content: req.body.prompt }
      ],
      temperature: 0.2,
    });

    res.json(message.content[0].text);
  } catch (error) {
    console.error('Error calling Claude:', error);
    res.status(500).json({ error: 'An error occurred while processing your request' });
  }
});

app.listen(3000, () => console.log('Server running on port 3000'));