export function trackOutboundClick({
  destination_url,
  link_type,
  label,
  source_page,
}: {
  destination_url: string;
  link_type: string;
  label?: string;
  source_page?: string | null;
}) {
  const payload = JSON.stringify({
    destination_url,
    link_type,
    label: label || null,
    source_page: source_page || (typeof window !== "undefined" ? window.location.pathname : null),
  });

  if (typeof navigator !== "undefined" && (navigator as any).sendBeacon) {
    try {
      (navigator as any).sendBeacon("/api/track-click", new Blob([payload], { type: "application/json" }));
      return;
    } catch {
      // fall through to fetch
    }
  }

  if (typeof fetch !== "undefined") {
    try {
      fetch("/api/track-click", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: payload,
        keepalive: true,
      }).catch(() => {});
    } catch {
      // ignore
    }
  }
}
