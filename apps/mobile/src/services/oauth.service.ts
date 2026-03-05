import * as WebBrowser from "expo-web-browser";
import * as AuthSession from "expo-auth-session";
import { supabase } from "../lib/supabase";

WebBrowser.maybeCompleteAuthSession();

export function getRedirectTo() {
  return AuthSession.makeRedirectUri({ path: "auth/callback" });
}

export async function signInWithGoogle() {
  const redirectTo = getRedirectTo();

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo },
  });

  if (error) throw error;
  if (!data?.url) throw new Error("No se recibió URL de OAuth desde Supabase.");

  const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);
  if (result.type !== "success") return;

  // Extraer code del redirect y hacer el exchange PKCE
  const code = new URL(result.url).searchParams.get("code");
  if (!code) throw new Error("No llegó el parámetro 'code' en el redirect.");

  const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
  if (exchangeError) throw exchangeError;
}
