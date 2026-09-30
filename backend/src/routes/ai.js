const express = require('express');
const router = express.Router();

// POST /api/ai/chat - Pure Groq AI backend proxy endpoint
router.post('/ai/chat', async (req, res) => {
  try {
    const { messages, systemInstruction } = req.body;
    
    const rawGroqKey = process.env.GROQ_API_KEY || process.env.VITE_GROQ_API_KEY;
    const groqKey = rawGroqKey ? rawGroqKey.trim().replace(/^["']|["']$/g, '') : null;

    if (!groqKey) {
      return res.status(400).json({ 
        error: 'Groq API Key missing',
        message: 'Please set GROQ_API_KEY in your Railway environment variables to enable free Groq AI.'
      });
    }

    const models = [
      'openai/gpt-oss-120b',
      'openai/gpt-oss-20b'
    ];

    const formattedMessages = [
      { role: 'system', content: systemInstruction || 'You are WatchLab Cebu AI Concierge.' },
      ...(Array.isArray(messages) ? messages.map(m => ({
        role: m.role === 'user' ? 'user' : 'assistant',
        content: m.content
      })) : [])
    ];

    let lastGroqError = null;

    for (const model of models) {
      try {
        const apiRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${groqKey}`
          },
          body: JSON.stringify({
            model,
            messages: formattedMessages,
            temperature: 0.7,
            max_tokens: 1000
          })
        });

        const resData = await apiRes.json().catch(() => ({}));

        if (apiRes.ok) {
          const reply = resData.choices?.[0]?.message?.content;
          if (reply) {
            return res.json({ reply, provider: 'groq', model });
          }
        }

        const errMsg = resData.error?.message || `HTTP ${apiRes.status}`;
        console.warn(`Groq API (${model}) failed:`, errMsg);
        lastGroqError = errMsg;

        // If authentication error, return immediately
        if (apiRes.status === 401 || apiRes.status === 403) {
          return res.status(401).json({
            error: 'Invalid Groq API Key',
            message: `Groq Authentication Failed (${errMsg}). Please check GROQ_API_KEY in Railway.`
          });
        }
      } catch (e) {
        console.error(`Groq fetch failed for ${model}:`, e);
        lastGroqError = e.message;
      }
    }

    return res.status(502).json({
      error: 'Groq AI Service Unavailable',
      message: `Groq AI Error: ${lastGroqError || 'Failed to fetch response.'}`
    });
  } catch (err) {
    console.error('Backend AI Chat Error:', err);
    res.status(500).json({ error: 'Server error processing AI request.' });
  }
});

module.exports = router;
