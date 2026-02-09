import { View, Text, StyleSheet } from "react-native";
import { STATE_CONFIG } from "../lib/constants";

export default function StateBadge({ state }: { state: string }) {
  const config = STATE_CONFIG[state] ?? STATE_CONFIG.applied;
  return (
    <View style={[styles.badge, { backgroundColor: config.bg }]}>
      <Text style={[styles.text, { color: config.color }]}>{config.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  text: {
    fontFamily: "DMSans_500Medium",
    fontSize: 11,
  },
});
