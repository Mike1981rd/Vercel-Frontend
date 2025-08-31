export function createClient(): any {
  return { auth: { async signInWithPassword(){return {data:null,error:{message:'Supabase disabled'}}}, async signUp(){return {data:null,error:{message:'Supabase disabled'}}}, async signOut(){} } };
}
