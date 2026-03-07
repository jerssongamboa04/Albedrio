// src/lib/preload.ts
import { Asset } from "expo-asset";
import * as Font from "expo-font";

export async function preloadAppResources() {
  await Promise.all([
    Asset.loadAsync([
      require("../../assets/brand/logo.png"),
      require("../../assets/brand/mascot.png"),
      require("../../assets/brand/google.png"),
      require("../../assets/brand/AlbeNinja.png"),
    ]),
    Font.loadAsync({
      "Poppins-Regular": require("../../assets/fonts/Poppins-Regular.ttf"),
      "Poppins-Medium": require("../../assets/fonts/Poppins-Medium.ttf"),
      "Poppins-SemiBold": require("../../assets/fonts/Poppins-SemiBold.ttf"),
      "Poppins-Bold": require("../../assets/fonts/Poppins-Bold.ttf"),
    }),
  ]);
}