import { Asset } from "expo-asset";

export async function preloadAppResources() {
  const images = [
    require("../../assets/brand/logo.png"),
    require("../../assets/brand/mascot.png"),
    require("../../assets/brand/google.png"),
  ];

  await Promise.all(images.map((img) => Asset.fromModule(img).downloadAsync()));
}