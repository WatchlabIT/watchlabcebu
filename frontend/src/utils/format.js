// Philippine Peso price formatter (e.g., ₱450,000)
export function formatPrice(price) {
  if (price === undefined || price === null || isNaN(price)) return '₱0';
  return '₱' + Number(price).toLocaleString('en-PH', {
    maximumFractionDigits: 0
  });
}

// WhatsApp pre-filled link generator
export function getWhatsAppUrl(watchName = '', price = 0) {
  const phoneNumber = '639436652681'; // International format without +
  let message = "Hi Watch Lab Cebu! I'm interested in your watch collection. Are you available for inquiries?";
  
  if (watchName) {
    const formattedPrice = formatPrice(price);
    message = `Hi Watch Lab Cebu! I'm interested in the ${watchName} (${formattedPrice}). Is this still available?`;
  }
  
  return `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
}

// Facebook Messenger URL generator
export function getMessengerUrl() {
  return 'https://m.me/61571550718463';
}

// Handle backend upload image path vs external URLs
export function getImageUrl(path) {
  if (!path) return 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=1000';
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  return path;
}
