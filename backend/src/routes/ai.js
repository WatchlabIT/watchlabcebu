const express = require('express');
const router = express.Router();

// POST /api/ai/chat - Backend proxy endpoint for Groq AI (llama-3.3-70b-versatile)
router.post('/ai/chat', async (req, res) => {
  try {
    const { messages, systemInstruction } = req.body;
    
    const rawGroqKey = process.env.GROQ_API_KEY || process.env.VITE_GROQ_API_KEY;
    const rawGeminiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
    const rawOpenAiKey = process.env.OPENAI_API_KEY || process.env.VITE_OPENAI_API_KEY;

    // Sanitize API Key by removing quotes, whitespace, or newlines
    const groqKey = rawGroqKey ? rawGroqKey.trim().replace(/^["']|["']$/g, '') : null;
    const geminiKey = rawGeminiKey ? rawGeminiKey.trim().replace(/^["']|["']$/g, '') : null;
    const openAiKey = rawOpenAiKey ? rawOpenAiKey.trim().replace(/^["']|["']$/g, '') : null;

    if (!groqKey && !geminiKey && !openAiKey) {
      return res.status(400).json({ 
        error: 'No AI API Key configured on server.',
        message: 'Please set GROQ_API_KEY in your Railway environment variables.'
      });
    }

    if (groqKey) {
      const model = 'llama-3.3-70b-versatile';

      const formattedMessages = [
        { role: 'system', content: systemInstruction || 'You are WatchLab Cebu AI Concierge.' },
        ...(Array.isArray(messages) ? messages.map(m => ({
          role: m.role === 'user' ? 'user' : 'assistant',
          content: m.content
        })) : [])
      ];

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

        console.error(`Groq API Error (${model}) HTTP ${apiRes.status}:`, resData.error || resData);
        const errMsg = resData.error?.message || `Groq API returned HTTP ${apiRes.status}`;
        
        return res.status(apiRes.status || 500).json({
          error: 'Groq API Error',
          message: `Groq (${model}): ${errMsg}`
        });
      } catch (e) {
        console.error(`Groq fetch failed:`, e);
        return res.status(500).json({
          error: 'Groq Connection Error',
          message: e.message || 'Failed to connect to Groq server.'
        });
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
      error: 'Groq AI Service Request Failed',
      message: 'Failed to generate response from Groq AI.'
    });
  } catch (err) {
    console.error('Backend AI Chat Error:', err);
    res.status(500).json({ error: 'Server error processing AI request.' });
  }
});

module.exports = router;
