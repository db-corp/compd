import { View, Text, StyleSheet } from "react-native";
import type { LucideIcon } from "lucide-react-native";

export default function EmptyState({
  icon: Icon,
  title,
  body,
}: {
  icon?: LucideIcon;
  title: string;
  body?: string;
}) {
  return (
    <View style={styles.container}>
      {Icon && <Icon size={40} color="#C5BFB6" strokeWidth={1.5} />}
      <Text style={styles.title}>{title}</Text>
      {body && <Text style={styles.body}>{body}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  title: {
    fontFamily: "DMSans_500Medium",
    fontSize: 16,
    color: "#615B53",
    marginTop: 12,
  },
  body: {
    fontFamily: "DMSans_400Regular",
    fontSize: 14,
    color: "#A39D94",
    textAlign: "center",
    marginTop: 4,
    lineHeight: 20,
  },
});
