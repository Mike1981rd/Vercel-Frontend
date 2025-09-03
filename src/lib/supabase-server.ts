// Supabase server client is disabled in this project build.
// Return a minimal stub to satisfy any legacy imports without coupling to next/headers.
export function createClient(): any {
  return {
    auth: {
      // No-op implementations to avoid runtime errors if accidentally called
      async exchangeCodeForSession() { /* noop */ },
      async signOut() { /* noop */ },
    },
  };
}