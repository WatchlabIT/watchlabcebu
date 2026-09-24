// Philippine Peso price formatter (e.g., ₱450,000)
export function formatPrice(price) {
  if (price === undefined || price === null || isNaN(price)) return '₱0';
  return '₱' + Number(price).toLocaleString('en-PH', {
    maximumFractionDigits: 0
  });
}

// WhatsApp direct chat URL generator (Bea's WhatsApp account: +639436652681)
export function getWhatsAppUrl(watchName = '', price = 0) {
  const phone = '639436652681';
  if (watchName) {
    const formattedPrice = formatPrice(price);
    const message = `Hi Bea! I'm interested in the ${watchName} (${formattedPrice}). Is this still available?`;
    return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
  }
  return `https://wa.me/${phone}`;
}

// Facebook Messenger URL generator
export function getMessengerUrl(watchName = '', price = 0) {
  const pageId = '61571550718463';
  if (watchName) {
    const formattedPrice = formatPrice(price);
    const message = `Hi Watch Lab Cebu! I'm interested in the ${watchName} (${formattedPrice}). Is this still available?`;
    const encoded = encodeURIComponent(message);
    return `https://m.me/${pageId}?text=${encoded}&ref=${encoded}`;
  }
  return `https://m.me/${pageId}`;
}

// Handle backend upload image path vs external URLs
export function getImageUrl(path) {
  if (!path) return 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=1000';
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  return path;
}
