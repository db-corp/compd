import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";

export default function RoleSelect() {
  const router = useRouter();
  const storeUser = useMutation(api.users.store);
  const setRole = useMutation(api.users.setRole);

  const handleSelectRole = async (role: "business" | "creator") => {
    await storeUser();
    await setRole({ role });

    if (role === "business") {
      router.replace("/onboarding/business-setup");
    } else {
      router.replace("/onboarding/creator-setup");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to Comp'd</Text>
      <Text style={styles.subtitle}>How will you use the platform?</Text>

      <TouchableOpacity
        style={styles.card}
        onPress={() => handleSelectRole("business")}
      >
        <Text style={styles.cardTitle}>I'm a Business</Text>
        <Text style={styles.cardDesc}>
          Create offers and connect with local creators for content
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.card}
        onPress={() => handleSelectRole("creator")}
      >
        <Text style={styles.cardTitle}>I'm a Creator</Text>
        <Text style={styles.cardDesc}>
          Discover local businesses and earn through content creation
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FDFCFA",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  title: {
    fontFamily: "DMSerifDisplay_400Regular",
    fontSize: 28,
    color: "#2A2622",
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontFamily: "DMSans_400Regular",
    fontSize: 16,
    color: "#615B53",
    textAlign: "center",
    marginBottom: 40,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#F0EDE8",
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#181614",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  cardTitle: {
    fontFamily: "DMSans_700Bold",
    fontSize: 18,
    color: "#2A2622",
    marginBottom: 6,
  },
  cardDesc: {
    fontFamily: "DMSans_400Regular",
    fontSize: 14,
    color: "#827B72",
    lineHeight: 21,
  },
});
