import { fetchWatches } from '../utils/api';
import { formatPrice } from '../utils/format';

/**
 * Checks if Vercel AI API key environment variables are set.
 * Strictly reads from Vercel environment variables:
 * - VITE_GROQ_API_KEY (Groq AI)
 * - VITE_GEMINI_API_KEY (Google Gemini)
 * - VITE_OPENAI_API_KEY (OpenAI)
 * - VITE_AI_API_KEY (Generic fallback)
 */
export function getAiApiKeyConfig() {
  const groqKey = import.meta.env.VITE_GROQ_API_KEY;
  const geminiKey = import.meta.env.VITE_GEMINI_API_KEY;
  const openAiKey = import.meta.env.VITE_OPENAI_API_KEY;
  const genericAiKey = import.meta.env.VITE_AI_API_KEY;

  if (groqKey && groqKey.trim() !== '') {
    return { provider: 'groq', apiKey: groqKey.trim() };
  }
  if (geminiKey && geminiKey.trim() !== '') {
    return { provider: 'gemini', apiKey: geminiKey.trim() };
  }
  if (openAiKey && openAiKey.trim() !== '') {
    return { provider: 'openai', apiKey: openAiKey.trim() };
  }
  if (genericAiKey && genericAiKey.trim() !== '') {
    return { provider: 'groq', apiKey: genericAiKey.trim() };
  }

  return { provider: null, apiKey: null };
}

/**
 * Builds system prompt instruction embedding the full active inventory of WatchLab Cebu.
 */
export function buildSystemPrompt(watches = []) {
  const watchCatalogText = watches.length > 0
    ? watches.map((w, i) => {
        return `${i + 1}. [WATCH_ID:${w.id}] ${w.brand} - ${w.name}
   • Price: ${formatPrice(w.price)}
   • Condition: ${w.condition || 'Pre-Owned'}
   • Target/Gender: ${w.gender || 'Unisex'}
   • Stock Availability: ${w.stock > 0 ? `IN STOCK (${w.stock} available)` : 'SOLD OUT'}
   • Description: ${w.description ? w.description.slice(0, 200).replace(/\n/g, ' ') : 'Luxury timepiece'}
   • Direct Link: /watch/${w.id}`;
      }).join('\n\n')
    : 'No watches currently listed in database.';

  return `You are WatchLab Cebu's official Groq AI Luxury Watch Specialist and Concierge.
WatchLab Cebu is a premier dealer of luxury watches in Cebu, Philippines, specializing in Rolex, Patek Philippe, Audemars Piguet, Omega, Tudor, Cartier, and other high-end timepieces.

YOUR MANDATE & KNOWLEDGE:
- You have complete, real-time knowledge of all ${watches.length} watches added inside the WatchLab Cebu system listed below.
- You must answer customer inquiries accurately based strictly on our inventory knowledge base.
- If a customer asks about a watch brand, budget/price range, condition (Brand New vs Pre-Owned), or specific model, check our inventory list below and recommend matching watches.
- Always include exact watch model names, prices, conditions, and stock status when recommending timepieces.
- CRITICAL FORMATTING REQUIREMENT: Whenever you mention or recommend a specific watch from our inventory, include its exact tag format [WATCH_ID:id] (e.g. [WATCH_ID:${watches[0]?.id || 1}]) in your text so the UI can render rich interactive Watch Cards for the user!
- If a user asks for a watch model or brand not in our system inventory, politely state that it's currently not in stock, but suggest similar available models or invite them to contact Bea / WatchLab Cebu on Messenger or WhatsApp for custom sourcing.
- Be elegant, courteous, professional, knowledgeable, and concise. Use bullet points for recommendations.

CURRENT WATCHLAB CEBU SYSTEM INVENTORY CATALOG (${watches.length} watches total):
${watchCatalogText}`;
}

/**
 * Calls Groq AI REST API (OpenAI compatible format)
 */
async function callGroq(apiKey, systemInstructionText, chatHistory) {
  const models = ['llama-3.3-70b-versatile', 'llama-3.1-8b-instant', 'llama3-70b-8192', 'mixtral-8x7b-32768'];
  let lastErr = null;

  const messages = [
    { role: 'system', content: systemInstructionText },
    ...chatHistory.map(msg => ({
      role: msg.role === 'user' ? 'user' : 'assistant',
      content: msg.content
    }))
  ];

  for (const model of models) {
    try {
      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model,
          messages,
          temperature: 0.7,
          max_tokens: 1000
        })
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error?.message || `Groq API HTTP ${res.status} (${model})`);
      }

      const data = await res.json();
      const replyText = data.choices?.[0]?.message?.content;
      if (replyText) return replyText;
    } catch (err) {
      console.warn(`Groq model ${model} error:`, err);
      lastErr = err;
    }
  }

  throw lastErr || new Error('Failed to reach Groq AI service.');
}

/**
 * Calls Gemini REST API
 */
async function callGemini(apiKey, systemInstructionText, chatHistory) {
  const models = ['gemini-2.0-flash', 'gemini-1.5-flash', 'gemini-1.5-pro'];
  let lastErr = null;

  const contents = chatHistory.map(msg => ({
    role: msg.role === 'user' ? 'user' : 'model',
    parts: [{ text: msg.content }]
  }));

  for (const model of models) {
    try {
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system_instruction: {
            parts: [{ text: systemInstructionText }]
          },
          contents,
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 1000
          }
        })
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error?.message || `Gemini API HTTP ${res.status}`);
      }

      const data = await res.json();
      const replyText = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (replyText) return replyText;
    } catch (err) {
      console.warn(`Gemini model ${model} error:`, err);
      lastErr = err;
    }
  }

  throw lastErr || new Error('Failed to reach Google Gemini AI service.');
}

/**
 * Calls OpenAI REST API
 */
async function callOpenAI(apiKey, systemInstructionText, chatHistory) {
  const messages = [
    { role: 'system', content: systemInstructionText },
    ...chatHistory.map(msg => ({
      role: msg.role === 'user' ? 'user' : 'assistant',
      content: msg.content
    }))
  ];

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages,
      temperature: 0.7
    })
  });

  if (!res.ok) {
    const errJson = await res.json().catch(() => ({}));
    throw new Error(errJson.error?.message || `OpenAI API HTTP ${res.status}`);
  }

  const data = await res.json();
  return data.choices?.[0]?.message?.content || 'No response generated.';
}

/**
 * Fallback assistant response generator when Vercel env key is not yet set in Vercel.
 */
function generateFallbackResponse(userMessage, watches = []) {
  const query = userMessage.toLowerCase();
  
  const matches = watches.filter(w => {
    const brandMatch = w.brand && query.includes(w.brand.toLowerCase());
    const nameMatch = w.name && query.includes(w.name.toLowerCase());
    const conditionMatch = w.condition && query.includes(w.condition.toLowerCase());
    return brandMatch || nameMatch || conditionMatch;
  });

  let text = '';

  if (query.includes('rolex')) {
    const rolexes = watches.filter(w => w.brand && w.brand.toLowerCase().includes('rolex'));
    if (rolexes.length > 0) {
      text = `We currently have **${rolexes.length} Rolex timepieces** in stock at WatchLab Cebu!\n\nHere are our available Rolex models:\n` +
        rolexes.map(w => `• **${w.name}** - ${formatPrice(w.price)} (${w.condition || 'Pre-Owned'}) [WATCH_ID:${w.id}]`).join('\n');
    } else {
      text = `We currently don't have any Rolex watches in our immediate online catalog. However, we frequently receive new arrivals or can source specific Rolex models for you! Contact Bea directly on WhatsApp or Messenger for custom sourcing.`;
    }
  } else if (query.includes('brand new') || query.includes('new')) {
    const brandNew = watches.filter(w => w.condition === 'Brand New');
    if (brandNew.length > 0) {
      text = `Here are our **Brand New** luxury watches in stock:\n\n` +
        brandNew.map(w => `• **${w.brand} ${w.name}** - ${formatPrice(w.price)} [WATCH_ID:${w.id}]`).join('\n');
    } else {
      text = `All our current listed watches are high-grade pre-owned pieces. Check back soon for new arrivals or ask us about upcoming inventory!`;
    }
  } else if (query.includes('pre-owned') || query.includes('used')) {
    const preOwned = watches.filter(w => w.condition === 'Pre-Owned');
    if (preOwned.length > 0) {
      text = `Here are our top **Pre-Owned** luxury watches in stock:\n\n` +
        preOwned.map(w => `• **${w.brand} ${w.name}** - ${formatPrice(w.price)} [WATCH_ID:${w.id}]`).join('\n');
    }
  } else if (matches.length > 0) {
    text = `Here are the watches from our inventory matching your query:\n\n` +
      matches.map(w => `• **${w.brand} ${w.name}** - ${formatPrice(w.price)} (${w.condition || 'Pre-Owned'}) [WATCH_ID:${w.id}]`).join('\n');
  } else {
    text = `Welcome to WatchLab Cebu! We currently have **${watches.length} watches** in our system, including top luxury brands like Rolex, Patek Philippe, Audemars Piguet, and Omega.\n\n` +
      `Feel free to ask me about specific brands, prices, or conditions! You can also view our full catalog on the Collection page or contact Bea directly via WhatsApp or Messenger.`;
  }

  return text;
}

/**
 * Main AI Agent messaging handler
 */
export async function sendAiAgentMessage({ userMessage, history, watches = [] }) {
  const { provider, apiKey } = getAiApiKeyConfig();
  const systemInstruction = buildSystemPrompt(watches);

  const updatedHistory = [...history, { role: 'user', content: userMessage }];

  if (apiKey) {
    try {
      if (provider === 'groq') {
        const reply = await callGroq(apiKey, systemInstruction, updatedHistory);
        return { reply, hasApiKey: true, provider };
      } else if (provider === 'gemini') {
        const reply = await callGemini(apiKey, systemInstruction, updatedHistory);
        return { reply, hasApiKey: true, provider };
      } else if (provider === 'openai') {
        const reply = await callOpenAI(apiKey, systemInstruction, updatedHistory);
        return { reply, hasApiKey: true, provider };
      }
    } catch (err) {
      console.error('AI API error, falling back to local catalog search:', err);
      const fallbackReply = generateFallbackResponse(userMessage, watches);
      return {
        reply: `${fallbackReply}\n\n*(Note: AI API call encountered an error: ${err.message})*`,
        hasApiKey: true,
        error: err.message
      };
    }
  }

  // Try backend AI proxy if key is configured on server without VITE_ prefix (GROQ_API_KEY)
  try {
    const envUrl = import.meta.env ? import.meta.env.VITE_API_URL : null;
    const rawApiUrl = (envUrl && envUrl.trim() !== '') ? envUrl.trim() : 'https://watchlabcebu-production.up.railway.app';
    const apiBase = `${rawApiUrl.replace(/\/+$/, '')}/api`;

    const backendRes = await fetch(`${apiBase}/ai/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: updatedHistory,
        systemInstruction
      })
    });

    if (backendRes.ok) {
      const data = await backendRes.json();
      if (data.reply) {
        return { reply: data.reply, hasApiKey: true, provider: data.provider || 'groq' };
      }
    }
  } catch (backendErr) {
    console.warn('Backend AI route unavailable, using local catalog search:', backendErr);
  }

  // Fallback catalog search if Vercel env key is not yet set
  const reply = generateFallbackResponse(userMessage, watches);
  return { reply, hasApiKey: false };
}

/**
 * Parses watch IDs from text tags like [WATCH_ID:12] and returns matching watch objects
 */
export function extractWatchCardsFromText(text, watches = []) {
  if (!text || !watches.length) return [];
  const matches = text.match(/\[WATCH_ID:(\d+)\]/g);
  if (!matches) return [];

  const foundIds = new Set();
  const extracted = [];

  for (const match of matches) {
    const idNum = match.replace('[WATCH_ID:', '').replace(']', '');
    if (idNum && !foundIds.has(idNum)) {
      foundIds.add(idNum);
      const watchObj = watches.find(w => String(w.id) === String(idNum));
      if (watchObj) {
        extracted.push(watchObj);
      }
    }
  }

  return extracted;
}
