export function assertLocalDatabase(raw) {
  let url;
  try { url = new URL(raw); } catch { throw new Error('Set a local PostgreSQL DATABASE_URL.'); }
  if (!['postgresql:', 'postgres:'].includes(url.protocol) || !['localhost', '127.0.0.1', '[::1]'].includes(url.hostname) || url.pathname !== '/aurelle_dev') {
    throw new Error('Development seed requires loopback PostgreSQL database aurelle_dev.');
  }
  if ([...url.searchParams.keys()].some(key => !['schema', 'connection_limit', 'connect_timeout'].includes(key))) throw new Error('Unsupported development connection options.');
  return raw;
}
