import { View, Text, StyleSheet } from "react-native";

export default function LoadingState({ message = "Loading..." }: { message?: string }) {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FDFCFA",
  },
  text: {
    fontFamily: "DMSans_400Regular",
    fontSize: 14,
    color: "#A39D94",
  },
});
