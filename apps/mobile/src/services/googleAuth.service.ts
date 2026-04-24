import {
  GoogleSignin,
  isErrorWithCode,
  statusCodes,
} from "@react-native-google-signin/google-signin";
import { supabase } from "../lib/supabase";

let configured = false;

function getGoogleWebClientId(): string {
  const webClientId = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID?.trim();

  if (!webClientId) {
    throw new Error(
      "Falta EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID en las variables de entorno."
    );
  }

  return webClientId;
}

export function configureGoogleSignin() {
  if (configured) return;

  const webClientId = getGoogleWebClientId();

  console.log("[GoogleSignIn] configure -> webClientId:", webClientId);

  GoogleSignin.configure({
    webClientId,
    offlineAccess: false,
    scopes: ["email", "profile"],
  });

  configured = true;
}

export async function signInWithGoogleNative() {
  try {
    configureGoogleSignin();

    console.log("[GoogleSignIn] hasPlayServices -> start");
    await GoogleSignin.hasPlayServices({
      showPlayServicesUpdateDialog: true,
    });
    console.log("[GoogleSignIn] hasPlayServices -> ok");

    console.log("[GoogleSignIn] signIn -> start");
    const signInResponse = await GoogleSignin.signIn();
    console.log(
      "[GoogleSignIn] signIn -> raw response:",
      JSON.stringify(signInResponse)
    );

    console.log("[GoogleSignIn] getTokens -> start");
    const { idToken, accessToken } = await GoogleSignin.getTokens();
    console.log("[GoogleSignIn] getTokens -> idToken exists:", !!idToken);
    console.log("[GoogleSignIn] getTokens -> accessToken exists:", !!accessToken);

    if (!idToken) {
      throw new Error("Google no devolvió un idToken válido.");
    }

    console.log("[GoogleSignIn] supabase.signInWithIdToken -> start");
    const { data, error } = await supabase.auth.signInWithIdToken({
      provider: "google",
      token: idToken,
    });

    if (error) {
      console.log("[GoogleSignIn] supabase.signInWithIdToken -> error:", error);
      throw error;
    }

    console.log(
      "[GoogleSignIn] supabase.signInWithIdToken -> success:",
      !!data?.session
    );

    return data;
  } catch (error) {
    if (isErrorWithCode(error)) {
      console.log("[GoogleSignIn] code:", error.code);
      console.log("[GoogleSignIn] message:", error.message);

      switch (error.code) {
        case statusCodes.IN_PROGRESS:
          throw new Error(
            "Ya hay un inicio de sesión con Google en progreso."
          );

        case statusCodes.PLAY_SERVICES_NOT_AVAILABLE:
          throw new Error(
            "Google Play Services no está disponible o necesita actualizarse."
          );

        default:
          throw new Error(
            `${error.code}: ${error.message || "No se pudo iniciar sesión con Google."}`
          );
      }
    }

    if (error instanceof Error) {
      console.log("[GoogleSignIn] unknown error:", error.message);
      throw error;
    }

    console.log("[GoogleSignIn] unknown non-error:", error);
    throw new Error("No se pudo iniciar sesión con Google.");
  }
}

export async function signOutGoogleNative() {
  try {
    console.log("[GoogleSignIn] signOut -> start");
    await GoogleSignin.signOut();
    console.log("[GoogleSignIn] signOut -> ok");
  } catch (error) {
    if (isErrorWithCode(error)) {
      console.log("[GoogleSignIn] signOut code:", error.code);
      console.log("[GoogleSignIn] signOut message:", error.message);
    } else {
      console.log("[GoogleSignIn] signOut unknown error:", error);
    }
  }
}