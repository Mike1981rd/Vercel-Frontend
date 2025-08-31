export function createClient(): any {
  return { auth: { async exchangeCodeForSession() {}, async signOut() {} } };
}
