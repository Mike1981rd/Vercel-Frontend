// Supabase browser client is disabled for this build.
// Provide a minimal stub to satisfy any legacy imports without runtime coupling.
export function createClient(): any {
  return {
    auth: {
      async signInWithPassword() { return { data: null, error: { message: 'Supabase disabled' } }; },
      async signUp() { return { data: null, error: { message: 'Supabase disabled' } }; },
      async signOut() { /* noop */ },
    },
  };
}
