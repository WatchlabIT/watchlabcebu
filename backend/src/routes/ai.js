const express = require('express');
const router = express.Router();

// POST /api/ai/chat - Backend proxy endpoint for Groq AI / Gemini / OpenAI
router.post('/ai/chat', async (req, res) => {
  try {
    const { messages, systemInstruction } = req.body;
    
    const groqKey = process.env.GROQ_API_KEY || process.env.VITE_GROQ_API_KEY;
    const geminiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
    const openAiKey = process.env.OPENAI_API_KEY || process.env.VITE_OPENAI_API_KEY;

    if (!groqKey && !geminiKey && !openAiKey) {
      return res.status(400).json({ error: 'No AI API Key configured on server.' });
    }

    if (groqKey) {
      const models = ['llama-3.3-70b-versatile', 'llama-3.1-8b-instant', 'llama3-70b-8192', 'mixtral-8x7b-32768'];
      const formattedMessages = [
        { role: 'system', content: systemInstruction || 'You are WatchLab Cebu AI Concierge.' },
        ...(Array.isArray(messages) ? messages : [])
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

          if (apiRes.ok) {
            const data = await apiRes.json();
            const reply = data.choices?.[0]?.message?.content;
            if (reply) return res.json({ reply, provider: 'groq' });
          }
        } catch (e) {
          console.warn(`Backend Groq model ${model} error:`, e);
        }
      }
    }

    if (geminiKey) {
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
    }

    return res.status(500).json({ error: 'Failed to generate response from AI providers.' });
  } catch (err) {
    console.error('Backend AI Chat Error:', err);
    res.status(500).json({ error: 'Server error processing AI request.' });
  }
});

module.exports = router;
