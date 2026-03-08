import { Image, StyleSheet, View } from "react-native";
import Animated, {
    FadeIn,
    FadeOut,
} from "react-native-reanimated";
import { mascotAssets } from "../features/home/config/mascotAssets";
import type { MascotState } from "../features/home/utils/getMascotState";

type Props = {
    state: MascotState;
};

export function MascotCharacter({ state }: Props) {
    return (
        <Animated.Image
            key={state}
            entering={FadeIn.duration(220)}
            exiting={FadeOut.duration(180)}
            source={mascotAssets[state]}
            style={styles.image}
            resizeMode="contain"
        />
    );
}

const styles = StyleSheet.create({
    image: {
        width: 220,
        height: 220,
    },
});