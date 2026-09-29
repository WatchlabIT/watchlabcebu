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

// Handle backend upload image path, Google Drive links, vs external URLs
export function getImageUrl(path) {
  const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=1000';
  if (!path || typeof path !== 'string' || !path.trim()) {
    return FALLBACK_IMAGE;
  }
  const cleanPath = path.trim();

  // Convert Google Drive view/share links to direct image thumbnail/display URLs
  if (cleanPath.includes('drive.google.com')) {
    const fileIdMatch = cleanPath.match(/\/d\/([a-zA-Z0-9_-]+)/) || cleanPath.match(/id=([a-zA-Z0-9_-]+)/);
    if (fileIdMatch && fileIdMatch[1]) {
      return `https://lh3.googleusercontent.com/d/${fileIdMatch[1]}`;
    }
  }

  // Base64 Data URL, Blob URL, or Full HTTP(S) URL
  if (
    cleanPath.startsWith('http://') ||
    cleanPath.startsWith('https://') ||
    cleanPath.startsWith('data:') ||
    cleanPath.startsWith('blob:')
  ) {
    return cleanPath;
  }

  // Relative backend path (e.g., /uploads/filename.jpg or uploads/filename.jpg)
  const normalizedPath = cleanPath.startsWith('/') ? cleanPath : `/${cleanPath}`;

  const envUrl = import.meta.env ? import.meta.env.VITE_API_URL : null;
  const rawApiUrl = (envUrl && envUrl.trim() !== '') ? envUrl.trim() : 'https://watchlabcebu-production.up.railway.app';
  const backendOrigin = rawApiUrl.replace(/\/+$/, '').replace(/\/api$/, '');

  return `${backendOrigin}${normalizedPath}`;
}

