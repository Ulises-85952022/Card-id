/**
 * Ultra-fast Link & Connection Optimizer
 * Pre-warms DNS and TLS handshakes when users hover or touch external links,
 * eliminating 200-500ms of network latency when navigating to WhatsApp,
 * maps, or partner websites.
 */

const preconnectedHosts = new Set<string>();

export function preconnectUrl(url: string | undefined | null): void {
  if (!url || typeof document === 'undefined') return;

  try {
    let origin = '';
    if (url.startsWith('http://') || url.startsWith('https://')) {
      const parsed = new URL(url);
      origin = parsed.origin;
    } else if (url.startsWith('wa.me') || url.includes('whatsapp.com')) {
      origin = 'https://wa.me';
    } else {
      return;
    }

    if (!origin || preconnectedHosts.has(origin)) return;
    preconnectedHosts.add(origin);

    // DNS prefetch
    const dnsLink = document.createElement('link');
    dnsLink.rel = 'dns-prefetch';
    dnsLink.href = origin;
    document.head.appendChild(dnsLink);

    // Preconnect for TCP/TLS handshake
    const preconnectLink = document.createElement('link');
    preconnectLink.rel = 'preconnect';
    preconnectLink.href = origin;
    preconnectLink.crossOrigin = 'anonymous';
    document.head.appendChild(preconnectLink);
  } catch {
    // Fail silently on invalid URLs
  }
}
