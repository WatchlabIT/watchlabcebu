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
- Specialization: Authentic timepieces — Exclusive Brands: Seiko, Tissot, Omega, Tag Heuer.
- Credibility & Guarantees: DTI Registered, 300+ Watches Sold, 100% Guaranteed Authentic, Warranty Included.
- Fulfillment & Delivery:
  • Meetups available within Cebu City
  • Local delivery via Maxim / Angkas
  • Worldwide shipping via LBC and DHL Express
- Contact & Sourcing: Customers can chat with Bea on WhatsApp or Facebook Messenger for custom sourcing or scheduling meetups.

YOUR MANDATE & SYSTEM KNOWLEDGE:
1. You have real-time access to all ${watches.length} active timepieces currently in our WatchLab system catalog (listed below).
2. Answer customer inquiries accurately based on our inventory knowledge base.
3. Recommend matching watches when customers ask about brands (Seiko, Tissot, Omega, Tag Heuer), budget ranges, conditions (Brand New vs Pre-Owned), or styles.
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
 * Smart Catalog Fallback — answers ANY question using watch inventory data.
 * Used only when Groq API is unreachable.
 */
function generateFallbackResponse(userMessage, watches = []) {
  const query = userMessage.toLowerCase().trim();

  // 1. Brand-specific queries
  const brandMap = {
    seiko: watches.filter(w => w.brand?.toLowerCase().includes('seiko')),
    tissot: watches.filter(w => w.brand?.toLowerCase().includes('tissot')),
    omega: watches.filter(w => w.brand?.toLowerCase().includes('omega')),
    'tag heuer': watches.filter(w => w.brand?.toLowerCase().includes('tag')),
    tag: watches.filter(w => w.brand?.toLowerCase().includes('tag')),
  };

  for (const [keyword, matched] of Object.entries(brandMap)) {
    if (query.includes(keyword)) {
      if (matched.length > 0) {
        return `Here are our **${matched[0].brand}** watches currently available:\n\n` +
          matched.map(w => `• **${w.name}** — ${formatPrice(w.price)} (${w.condition || 'Pre-Owned'}) ${Number(w.stock) > 0 ? '✅ In Stock' : '❌ Sold Out'} [WATCH_ID:${w.id}]`).join('\n') +
          `\n\nInterested? Contact **Bea** on WhatsApp or Messenger to inquire!`;
      }
      return `We currently don't have any ${keyword.charAt(0).toUpperCase() + keyword.slice(1)} watches in stock right now. You can reach **Bea** on WhatsApp or Messenger to request custom sourcing!`;
    }
  }

  // 2. Price / budget queries
  if (query.includes('cheap') || query.includes('affordable') || query.includes('budget') || query.includes('lowest') || query.includes('cheapest')) {
    const sorted = [...watches].sort((a, b) => Number(a.price || 0) - Number(b.price || 0));
    if (sorted.length > 0) {
      return `Here are our most affordable watches starting from ${formatPrice(sorted[0].price)}:\n\n` +
        sorted.slice(0, 4).map(w => `• **${w.brand} ${w.name}** — ${formatPrice(w.price)} (${w.condition || 'Pre-Owned'}) [WATCH_ID:${w.id}]`).join('\n');
    }
  }

  if (query.includes('expensive') || query.includes('premium') || query.includes('luxury') || query.includes('highest') || query.includes('most expensive') || query.includes('top')) {
    const sorted = [...watches].sort((a, b) => Number(b.price || 0) - Number(a.price || 0));
    if (sorted.length > 0) {
      return `Our top timepieces by value:\n\n` +
        sorted.slice(0, 4).map(w => `• **${w.brand} ${w.name}** — ${formatPrice(w.price)} (${w.condition || 'Pre-Owned'}) [WATCH_ID:${w.id}]`).join('\n');
    }
  }

  // 3. Condition queries
  if (query.includes('brand new') || query.includes('new watch')) {
    const brandNew = watches.filter(w => w.condition?.toLowerCase().includes('brand') || w.condition?.toLowerCase().includes('new'));
    if (brandNew.length > 0) {
      return `Here are our **Brand New** watches:\n\n` +
        brandNew.map(w => `• **${w.brand} ${w.name}** — ${formatPrice(w.price)} [WATCH_ID:${w.id}]`).join('\n');
    }
    return `We don't currently have Brand New watches listed, but new arrivals come in regularly! Contact **Bea** to be notified.`;
  }

  if (query.includes('pre-owned') || query.includes('pre owned') || query.includes('second hand') || query.includes('used')) {
    const preOwned = watches.filter(w => w.condition?.toLowerCase().includes('pre'));
    if (preOwned.length > 0) {
      return `Here are our **Pre-Owned** watches in excellent condition:\n\n` +
        preOwned.map(w => `• **${w.brand} ${w.name}** — ${formatPrice(w.price)} [WATCH_ID:${w.id}]`).join('\n');
    }
  }

  // 4. Stock / availability queries
  if (query.includes('in stock') || query.includes('available') || query.includes('stock')) {
    const inStock = watches.filter(w => Number(w.stock || 0) > 0);
    if (inStock.length > 0) {
      return `We have **${inStock.length} watches** currently in stock:\n\n` +
        inStock.slice(0, 5).map(w => `• **${w.brand} ${w.name}** — ${formatPrice(w.price)} ✅ [WATCH_ID:${w.id}]`).join('\n') +
        (inStock.length > 5 ? `\n\n...and ${inStock.length - 5} more! View the full Collection page.` : '');
    }
  }

  // 5. Location / delivery / meetup queries
  if (query.includes('location') || query.includes('where') || query.includes('cebu') || query.includes('meetup') || query.includes('meet') || query.includes('address')) {
    return `📍 We are located at **Gorordo Avenue, Cebu City**.\n\n**Delivery Options:**\n• Meetups within Cebu City (send a message in advance to schedule)\n• Local delivery via Maxim / Angkas\n• Worldwide shipping via LBC and DHL Express\n\nContact **Bea** on WhatsApp or Messenger to schedule a meetup!`;
  }

  // 6. Contact / owner queries
  if (query.includes('contact') || query.includes('bea') || query.includes('owner') || query.includes('message') || query.includes('whatsapp') || query.includes('messenger')) {
    return `You can reach **Bea** (Founder of WatchLab Cebu) directly:\n\n• 💬 **Facebook Messenger** — facebook.com/p/Watch-Lab-Cebu-61571550718463\n• 📱 **WhatsApp** — available for inquiries and meetup scheduling\n\nShe's very responsive and will help you find the right watch! 😊`;
  }

  // 7. Price range / budget queries
  if (query.includes('price') || query.includes('cost') || query.includes('how much') || query.includes('peso') || query.includes('₱')) {
    const sorted = [...watches].sort((a, b) => Number(a.price || 0) - Number(b.price || 0));
    if (sorted.length > 0) {
      return `Our watches range from **${formatPrice(sorted[0].price)}** to **${formatPrice(sorted[sorted.length - 1].price)}**.\n\nHere's a sample of our current listings:\n\n` +
        sorted.slice(0, 4).map(w => `• **${w.brand} ${w.name}** — ${formatPrice(w.price)} (${w.condition || 'Pre-Owned'}) [WATCH_ID:${w.id}]`).join('\n');
    }
  }

  // 8. Catalog / show all queries
  if (query.includes('show') || query.includes('all watches') || query.includes('catalog') || query.includes('list') || query.includes('what do you have') || query.includes('collection')) {
    if (watches.length > 0) {
      return `Here's our current WatchLab Cebu collection (${watches.length} watches):\n\n` +
        watches.slice(0, 6).map(w => `• **${w.brand} ${w.name}** — ${formatPrice(w.price)} (${w.condition || 'Pre-Owned'}) ${Number(w.stock) > 0 ? '✅' : '❌'} [WATCH_ID:${w.id}]`).join('\n') +
        (watches.length > 6 ? `\n\n...and ${watches.length - 6} more! View the full catalog on the **Collection** page.` : '');
    }
  }

  // 9. Warranty / authenticity queries
  if (query.includes('warranty') || query.includes('authentic') || query.includes('legit') || query.includes('original') || query.includes('genuine') || query.includes('dti')) {
    return `✅ **100% Guaranteed Authentic** — All our watches are verified genuine timepieces.\n\n• **Warranty Included** on eligible pieces\n• **DTI Registered** business\n• **300+ Watches Sold** with trusted customer satisfaction\n\nYou can shop with full confidence at WatchLab Cebu! 🎉`;
  }

  // 10. Shipping / delivery queries
  if (query.includes('ship') || query.includes('deliver') || query.includes('lbc') || query.includes('dhl') || query.includes('nationwide') || query.includes('province')) {
    return `📦 **We ship nationwide and worldwide!**\n\n• 🏍️ Local delivery via **Maxim / Angkas** (within Cebu City)\n• 📦 Nationwide shipping via **LBC**\n• 🌍 International shipping via **DHL Express**\n\nContact Bea on WhatsApp or Messenger to arrange shipping for your order!`;
  }

  // 11. General name/keyword match in watches
  const matches = watches.filter(w => {
    const searchIn = `${w.brand} ${w.name} ${w.description}`.toLowerCase();
    const words = query.split(/\s+/).filter(word => word.length > 2);
    return words.some(word => searchIn.includes(word));
  });
  if (matches.length > 0) {
    return `Here are WatchLab Cebu watches matching your search:\n\n` +
      matches.slice(0, 5).map(w => `• **${w.brand} ${w.name}** — ${formatPrice(w.price)} (${w.condition || 'Pre-Owned'}) [WATCH_ID:${w.id}]`).join('\n');
  }

  // 12. Default general welcome response for any other question
  return `Hi there! 👋 I'm the **WatchLab Cebu AI Concierge**.\n\nWe currently have **${watches.length} watches** in our collection from top brands: **Seiko, Tissot, Omega, and Tag Heuer**.\n\nYou can ask me about:\n• 🔍 Specific brands or models\n• 💰 Pricing and budget ranges\n• ✅ Stock availability\n• 📍 Location and delivery options\n• 📞 How to contact Bea\n\nHow can I help you find your perfect timepiece today?`;
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

    // Surface the actual error reason from backend
    if (data.message) {
      console.warn('Backend Groq error:', data.message);
    }
  } catch (backendErr) {
    console.warn('Backend AI route unavailable, using local catalog search:', backendErr);
  }

  // 3. Smart catalog fallback — handles ANY question
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
