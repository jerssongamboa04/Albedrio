import type { ImageSourcePropType } from "react-native";
import type { MascotState } from "../utils/getMascotState";

export const mascotAssets: Record<MascotState, ImageSourcePropType> = {
  idle: require("../../../../assets/characters/idle.png"),
  active: require("../../../../assets/characters/active.png"),
  complete: require("../../../../assets/characters/AlbeNinja.png"),
};