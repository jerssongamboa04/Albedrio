// src/app/Root.tsx
import { useEffect, useCallback, useRef, useState } from "react";
import { View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { NavigationContainer } from "@react-navigation/native";
import * as SplashScreen from "expo-splash-screen";
import * as Linking from "expo-linking";
import * as QueryParams from "expo-auth-session/build/QueryParams";

import { RootNavigator } from "../navigation/RootNavigator";
import { preloadAppResources } from "../lib/preload";
import { useAuthStore } from "../store/auth.store";
import { supabase } from "../lib/supabase";

SplashScreen.preventAutoHideAsync().catch(() => {});

export function Root() {
  const { setSession, setInitialized, setRecovery } = useAuthStore();
  const [ready, setReady] = useState(false);

  const authSubRef = useRef<ReturnType<typeof supabase.auth.onAuthStateChange> | null>(null);
  const linkSubRef = useRef<ReturnType<typeof Linking.addEventListener> | null>(null);

  useEffect(() => {
    let mounted = true;

    async function handleAuthRedirect(url: string) {
      // 1) Parse params tanto de query (?a=b) como de hash (#access_token=...)
      const { params, errorCode } = QueryParams.getQueryParams(url);
      if (errorCode) return;

      // 2) Si es recovery, forzamos modo recovery (para NO ir a Home aunque haya sesión)
      if (params?.type === "recovery") {
        setRecovery(true);
      }

      // 3) Caso estándar en móvil: vienen tokens en el hash -> creamos sesión con setSession
      // (Patrón oficial de Supabase para deep linking en móvil)
      const access_token = params?.access_token;
      const refresh_token = params?.refresh_token;

      if (access_token && refresh_token) {
        await supabase.auth.setSession({ access_token, refresh_token });
        return;
      }

      // 4) Caso alternativo PKCE: viene code -> lo intercambiamos
      const code = params?.code;
      if (code) {
        await supabase.auth.exchangeCodeForSession(code);
        return;
      }
    }

    async function boot() {
      try {
        // A) precarga assets
        await preloadAppResources();

        // B) procesar initialUrl (app cerrada)
        const initialUrl = await Linking.getInitialURL();
        if (initialUrl) {
          try {
            await handleAuthRedirect(initialUrl);
          } catch {
            // ignoramos links no relacionados
          }
        }

        // C) listener links (app abierta/background)
        linkSubRef.current = Linking.addEventListener("url", ({ url }) => {
          void (async () => {
            try {
              await handleAuthRedirect(url);
            } catch {
              // ignoramos
            }
          })();
        });

        // D) sesión inicial
        const { data } = await supabase.auth.getSession();
        if (!mounted) return;

        setSession(data.session ?? null);
        setInitialized(true);

        // E) listener auth único
        authSubRef.current = supabase.auth.onAuthStateChange((event, newSession) => {
          setSession(newSession);

          // Supabase documenta PASSWORD_RECOVERY para mostrar pantalla reset
          if (event === "PASSWORD_RECOVERY") setRecovery(true);

          if (event === "SIGNED_OUT") setRecovery(false);
        });
      } finally {
        if (mounted) setReady(true);
      }
    }

    void boot();

    return () => {
      mounted = false;
      linkSubRef.current?.remove?.();
      const sub = authSubRef.current?.data?.subscription;
      sub?.unsubscribe();
    };
  }, [setInitialized, setRecovery, setSession]);

  const onLayout = useCallback(async () => {
    if (ready) await SplashScreen.hideAsync();
  }, [ready]);

  if (!ready) return null;

  return (
    <SafeAreaProvider>
      <View style={{ flex: 1 }} onLayout={onLayout}>
        <NavigationContainer>
          <RootNavigator />
        </NavigationContainer>
      </View>
    </SafeAreaProvider>
  );
}