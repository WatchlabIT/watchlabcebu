const express = require('express');
const router = express.Router();

// POST /api/ai/chat - Backend proxy endpoint for Groq AI
router.post('/ai/chat', async (req, res) => {
  try {
    const { messages, systemInstruction } = req.body;
    
    const rawGroqKey = process.env.GROQ_API_KEY || process.env.VITE_GROQ_API_KEY;
    const rawGeminiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
    const rawOpenAiKey = process.env.OPENAI_API_KEY || process.env.VITE_OPENAI_API_KEY;

    const groqKey = rawGroqKey ? rawGroqKey.trim() : null;
    const geminiKey = rawGeminiKey ? rawGeminiKey.trim() : null;
    const openAiKey = rawOpenAiKey ? rawOpenAiKey.trim() : null;

    if (!groqKey && !geminiKey && !openAiKey) {
      return res.status(400).json({ 
        error: 'No AI API Key configured on server.',
        message: 'Please add GROQ_API_KEY to your Railway Environment Variables.'
      });
    }

    let lastGroqError = null;

    if (groqKey) {
      // Official Groq production free-tier models (Llama 3.3 70B & Llama 3.1 8B Instant)
      const models = ['llama-3.3-70b-versatile', 'llama-3.1-8b-instant'];

      const formattedMessages = [
        { role: 'system', content: systemInstruction || 'You are WatchLab Cebu AI Concierge.' },
        ...(Array.isArray(messages) ? messages.map(m => ({
          role: m.role === 'user' ? 'user' : 'assistant',
          content: m.content
        })) : [])
      ];

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
          } else {
            console.error(`Groq API (${model}) HTTP ${apiRes.status}:`, resData.error || resData);
            const msg = resData.error?.message || `HTTP ${apiRes.status}`;
            lastGroqError = msg;

            // If API key is invalid or unauthorized, stop retrying other models
            if (apiRes.status === 401 || apiRes.status === 403) {
              return res.status(401).json({
                error: 'Invalid Groq API Key',
                message: `Groq Authentication Failed (${msg}). Please verify GROQ_API_KEY in Railway.`
              });
            }
          }
        } catch (e) {
          console.error(`Groq request error on model ${model}:`, e);
          lastGroqError = e.message;
        }
      }
    }

    if (geminiKey) {
      try {
        const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`;
        const contents = (messages || []).map(m => ({
          role: m.role === 'user' ? 'user' : 'model',
          parts: [{ text: m.content }]
        }));

        const apiRes = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            system_instruction: { parts: [{ text: systemInstruction || '' }] },
            contents,
            generationConfig: { temperature: 0.7, maxOutputTokens: 1000 }
          })
        });

        if (apiRes.ok) {
          const data = await apiRes.json();
          const reply = data.candidates?.[0]?.content?.parts?.[0]?.text;
          if (reply) return res.json({ reply, provider: 'gemini' });
        }
      } catch (e) {
        console.error('Gemini fallback failed:', e);
      }
    }

    return res.status(502).json({ 
      error: 'Groq AI Request Failed',
      message: lastGroqError || 'Failed to generate response from Groq AI.'
    });
  } catch (err) {
    console.error('Backend AI Chat Error:', err);
    res.status(500).json({ error: 'Server error processing AI request.' });
  }
});

module.exports = router;
