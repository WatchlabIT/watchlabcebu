// Philippine Peso price formatter (e.g., ₱450,000)
export function formatPrice(price) {
  if (price === undefined || price === null || isNaN(price)) return '₱0';
  return '₱' + Number(price).toLocaleString('en-PH', {
    maximumFractionDigits: 0
  });
}

// WhatsApp / Inquiry URL generator (redirects to Facebook Messenger)
export function getWhatsAppUrl(watchName = '', price = 0) {
  return getMessengerUrl(watchName, price);
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
