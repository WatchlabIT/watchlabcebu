import { fetchWatches } from '../utils/api';
import { formatPrice } from '../utils/format';

/**
 * Reads Groq AI API key from environment variables.
 * Enforces Pure Groq AI usage.
 */
export function getAiApiKeyConfig() {
  const groqKey = import.meta.env.VITE_GROQ_API_KEY || import.meta.env.VITE_AI_API_KEY;

  if (groqKey && groqKey.trim() !== '') {
    return { provider: 'groq', apiKey: groqKey.trim() };
  }

  return { provider: 'groq', apiKey: null };
}

/**
 * Builds system prompt instruction embedding complete WatchLab Cebu system knowledge & real-time inventory.
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

  return `You are WatchLab Cebu's official AI Luxury Watch Specialist and Virtual Concierge, powered by Groq AI.

ABOUT WATCHLAB CEBU:
- Location: Gorordo Avenue, Cebu City, Philippines.
- Owner / Founder: Bea
- Specialization: Authentic luxury and everyday timepieces (Brands: Seiko, Tissot, Omega, Tag Heuer, Rolex, Patek Philippe, Audemars Piguet, Cartier).
- Credibility & Guarantees: DTI Registered, 300+ Watches Sold, 100% Guaranteed Authentic, Warranty Included.
- Fulfillment & Delivery:
  • Meetups available within Cebu City
  • Local delivery via Maxim / Angkas
  • Worldwide shipping via LBC and DHL Express
- Contact & Sourcing: Customers can chat with Bea on WhatsApp or Facebook Messenger for custom sourcing or scheduling meetups.

YOUR MANDATE & SYSTEM KNOWLEDGE:
1. You have real-time access to all ${watches.length} active timepieces currently in our WatchLab system catalog (listed below).
2. Answer customer inquiries accurately based on our inventory knowledge base.
3. Recommend matching watches when customers ask about brands (especially Seiko, Tissot, Omega, Tag Heuer, Rolex, etc.), budget ranges, conditions (Brand New vs Pre-Owned), or styles.
4. CRITICAL CARD TAGGING FORMAT: Whenever you mention or recommend a specific watch from our inventory, MUST include its exact tag format [WATCH_ID:id] (e.g. [WATCH_ID:${watches[0]?.id || 1}]) so the UI renders rich interactive Watch Cards!
5. If a requested model or brand is not currently in stock, state it politely and suggest available alternatives or invite them to contact Bea for custom sourcing.
6. Keep responses elegant, polite, helpful, clear, and concise.

CURRENT WATCHLAB SYSTEM INVENTORY CATALOG (${watches.length} watches total):
${watchCatalogText}`;
}

/**
 * Calls Groq AI REST API (OpenAI compatible format) with automatic fallback across supported Groq models
 */
async function callGroq(apiKey, systemInstructionText, chatHistory) {
  const models = [
    'llama-3.3-70b-versatile',
    'llama-3.1-8b-instant',
    'llama3-70b-8192',
    'llama3-8b-8192',
    'mixtral-8x7b-32768',
    'gemma2-9b-it'
  ];
  const cleanKey = apiKey ? apiKey.trim().replace(/^["']|["']$/g, '') : '';

  const messages = [
    { role: 'system', content: systemInstructionText },
    ...chatHistory.map(msg => ({
      role: msg.role === 'user' ? 'user' : 'assistant',
      content: msg.content
    }))
  ];

  let lastError = null;

  for (const model of models) {
    try {
      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${cleanKey}`
        },
        body: JSON.stringify({
          model,
          messages,
          temperature: 0.7,
          max_tokens: 1000
        })
      });

      const data = await res.json().catch(() => ({}));

      if (res.ok) {
        const replyText = data.choices?.[0]?.message?.content;
        if (replyText) return replyText;
      }

      const errMsg = data.error?.message || `HTTP ${res.status}`;
      console.warn(`Groq model ${model} issue:`, errMsg);
      lastError = errMsg;

      if (res.status === 401 || res.status === 403) {
        throw new Error(`Invalid Groq API Key (${errMsg})`);
      }
    } catch (err) {
      if (err.message && err.message.includes('Invalid Groq API Key')) {
        throw err;
      }
      lastError = err.message;
    }
  }

  throw new Error(`Groq API issue: ${lastError || 'Service unavailable'}`);
}

/**
 * Intelligent Catalog Search Fallback response when Groq API key is not present directly in browser
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

  if (query.includes('seiko') || query.includes('tissot') || query.includes('omega') || query.includes('tag heuer') || query.includes('tag')) {
    const brandMatches = watches.filter(w => w.brand && (
      (query.includes('seiko') && w.brand.toLowerCase().includes('seiko')) ||
      (query.includes('tissot') && w.brand.toLowerCase().includes('tissot')) ||
      (query.includes('omega') && w.brand.toLowerCase().includes('omega')) ||
      (query.includes('tag') && w.brand.toLowerCase().includes('tag'))
    ));
    if (brandMatches.length > 0) {
      text = `Here are our available watches in stock matching your brand request:\n\n` +
        brandMatches.map(w => `• **${w.brand} ${w.name}** - ${formatPrice(w.price)} (${w.condition || 'Pre-Owned'}) [WATCH_ID:${w.id}]`).join('\n');
    } else {
      text = `We currently don't have that specific brand model in stock, but you can explore our complete Collection page or contact Bea directly for custom watch sourcing!`;
    }
  } else if (query.includes('expensive') || query.includes('highest price') || query.includes('costliest') || query.includes('most expensive')) {
    const sorted = [...watches].sort((a, b) => (Number(b.price) || 0) - (Number(a.price) || 0));
    if (sorted.length > 0) {
      const topWatch = sorted[0];
      text = `Our top timepiece currently listed is the **${topWatch.brand} ${topWatch.name}**, priced at **${formatPrice(topWatch.price)}** (${topWatch.condition || 'Pre-Owned'}). [WATCH_ID:${topWatch.id}]\n\n` +
        `Here are our top featured watches:\n` +
        sorted.slice(0, 3).map(w => `• **${w.brand} ${w.name}** - ${formatPrice(w.price)} (${w.condition || 'Pre-Owned'}) [WATCH_ID:${w.id}]`).join('\n');
    }
  } else if (matches.length > 0) {
    text = `Here are timepieces from our WatchLab Cebu inventory matching your inquiry:\n\n` +
      matches.map(w => `• **${w.brand} ${w.name}** - ${formatPrice(w.price)} (${w.condition || 'Pre-Owned'}) [WATCH_ID:${w.id}]`).join('\n');
  } else {
    text = `Welcome to WatchLab Cebu! We currently have **${watches.length} watches** listed in our system, including top brands like Seiko, Tissot, Omega, Tag Heuer, and Rolex.\n\n` +
      `Feel free to ask me about specific brands, prices, conditions, or delivery options! You can also view our full catalog on the Collection page or contact Bea directly via WhatsApp or Messenger.`;
  }

  return text;
}

/**
 * Main Pure Groq AI Agent messaging handler
 */
export async function sendAiAgentMessage({ userMessage, history, watches = [] }) {
  const { apiKey } = getAiApiKeyConfig();
  const systemInstruction = buildSystemPrompt(watches);

  const updatedHistory = [...history, { role: 'user', content: userMessage }];

  // 1. Direct Frontend Groq API call if VITE_GROQ_API_KEY is present
  if (apiKey) {
    try {
      const reply = await callGroq(apiKey, systemInstruction, updatedHistory);
      return { reply, hasApiKey: true, provider: 'groq' };
    } catch (err) {
      console.warn('Frontend Groq API call error, trying backend Groq proxy:', err);
    }
  }

  // 2. Backend Groq Proxy endpoint call
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

    const data = await backendRes.json().catch(() => ({}));

    if (backendRes.ok && data.reply) {
      return { reply: data.reply, hasApiKey: true, provider: 'groq' };
    }
  } catch (backendErr) {
    console.warn('Backend AI route unavailable, using local catalog search:', backendErr);
  }

  // 3. Fallback catalog response generator
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
