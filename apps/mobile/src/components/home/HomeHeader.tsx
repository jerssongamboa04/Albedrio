import { View, Text, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

type Props = {
    name: string;
};

export function HomeHeader({ name }: Props) {
    return (
        <View style={styles.wrapper}>
            <LinearGradient
                colors={["#F5ECFF", "#EFE5FF", "#F8F3FF"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.card}
            >
                <View style={styles.glowOne} />
                <View style={styles.glowTwo} />

                <Text style={styles.starOne}>✦</Text>
                <Text style={styles.starTwo}>✦</Text>
                <Text style={styles.starThree}>✦</Text>

                <View style={styles.textBlock}>
                    <Text style={styles.greeting}>Hola ,</Text>
                    <Text style={styles.name} numberOfLines={1} ellipsizeMode="tail">
                        {name}
                    </Text>
                    <Text style={styles.subtitle}>Hoy toca avanzar con calma.</Text>
                </View>
            </LinearGradient>
        </View>
    );
}

const styles = StyleSheet.create({
    wrapper: {
        marginTop: 8,
        marginBottom: -30,
        position: "relative",
        zIndex: 1,
    },
    card: {
        minHeight: 185,
        borderTopLeftRadius: 34,
        borderTopRightRadius: 34,
        borderBottomLeftRadius: 10,
        borderBottomRightRadius: 10,
        paddingTop: 26,
        paddingLeft: 24,
        paddingRight: 24,
        paddingBottom: 26,
        borderWidth: 1,
        borderColor: "#E4D6FA",
        overflow: "hidden",
        shadowColor: "#C8B2F5",
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.22,
        shadowRadius: 22,
        elevation: 6,
    },
    textBlock: {
        maxWidth: "62%",
        zIndex: 3,
    },
    greeting: {
        fontFamily: "Poppins-Medium",
        fontSize: 22,
        lineHeight: 28,
        color: "#3D2D6B",
    },
    name: {
        margin: 0,
        fontFamily: "Poppins-Bold",
        fontSize: 22,
        lineHeight: 34,
        color: "#2E2053",
        letterSpacing: -0.4,
    },
    subtitle: {
        marginTop: 12,
        fontFamily: "Poppins-Regular",
        fontSize: 15,
        lineHeight: 22,
        color: "#61518F",
    },
    glowOne: {
        position: "absolute",
        right: 30,
        top: 14,
        width: 124,
        height: 124,
        borderRadius: 999,
        backgroundColor: "rgba(255,255,255,0.30)",
    },
    glowTwo: {
        position: "absolute",
        right: 88,
        top: 62,
        width: 92,
        height: 92,
        borderRadius: 999,
        backgroundColor: "rgba(223,206,248,0.34)",
    },
    starOne: {
        position: "absolute",
        right: 52,
        top: 18,
        fontSize: 18,
        color: "#D9C8FB",
    },
    starTwo: {
        position: "absolute",
        right: 108,
        top: 56,
        fontSize: 14,
        color: "#E6D9FF",
    },
    starThree: {
        position: "absolute",
        right: 26,
        top: 94,
        fontSize: 16,
        color: "#D6C1FA",
    },
});