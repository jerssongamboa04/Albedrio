import * as WebBrowser from "expo-web-browser";
import * as AuthSession from "expo-auth-session";
import { supabase } from "../lib/supabase";

WebBrowser.maybeCompleteAuthSession();

export function getRedirectTo() {
  const uri = AuthSession.makeRedirectUri({
    scheme: "albedrio",
    path: "auth/callback",
  });
  console.log("[OAuth] redirectTo =", uri);
  return uri;
}

export async function signInWithGoogle() {
  const redirectTo = getRedirectTo();

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo,
      skipBrowserRedirect: true,
    },
  });

  console.log("[OAuth] data.url =", data?.url);
  if (error) {
    console.log("[OAuth] signInWithOAuth error =", error);
    throw error;
  }
  if (!data?.url) {
    throw new Error("No se recibió URL de OAuth desde Supabase.");
  }

  const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);
  console.log("[OAuth] result =", JSON.stringify(result));

  if (result.type !== "success") {
    throw new Error(`El flujo OAuth no volvió correctamente. Resultado: ${result.type}`);
  }

  const code = new URL(result.url).searchParams.get("code");
  console.log("[OAuth] callback url =", result.url);
  console.log("[OAuth] code =", code);

  if (!code) {
    throw new Error("No llegó el parámetro 'code' en el redirect.");
  }

  const { data: sessionData, error: exchangeError } =
    await supabase.auth.exchangeCodeForSession(code);

  console.log("[OAuth] exchange session =", sessionData);

  if (exchangeError) {
    console.log("[OAuth] exchange error =", exchangeError);
    throw exchangeError;
  }
}