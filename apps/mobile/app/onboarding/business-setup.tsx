import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { CATEGORIES } from "../../lib/constants";

export default function BusinessSetup() {
  const router = useRouter();
  const createBusiness = useMutation(api.businesses.create);

  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [instagramHandle, setInstagramHandle] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!name || !category || !address || !city || !state || !zipCode) {
      setError("Please fill in all required fields");
      return;
    }
    setError("");

    try {
      await createBusiness({
        name,
        category,
        description: description || undefined,
        address,
        city,
        state,
        zipCode,
        // TODO: Geocode from address in a future update. Raleigh defaults are acceptable for MVP since all seed data is Raleigh.
        latitude: 35.7796,
        longitude: -78.6382,
        instagramHandle: instagramHandle || undefined,
        photos: [],
      });
      router.replace("/(app)/(tabs)/explore");
    } catch (err: any) {
      setError(err.message ?? "Setup failed");
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.title}>Set up your business</Text>
        <Text style={styles.subtitle}>
          Tell creators about your business
        </Text>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <Text style={styles.label}>Business name *</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="e.g. Bida Manda"
          placeholderTextColor="#A39D94"
        />

        <Text style={styles.label}>Category *</Text>
        <View style={styles.categoryGrid}>
          {CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat.value}
              style={[
                styles.categoryChip,
                category === cat.value && styles.categoryChipActive,
              ]}
              onPress={() => setCategory(cat.value)}
            >
              <Text
                style={[
                  styles.categoryText,
                  category === cat.value && styles.categoryTextActive,
                ]}
              >
                {cat.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>Description</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={description}
          onChangeText={setDescription}
          placeholder="What makes your business special?"
          placeholderTextColor="#A39D94"
          multiline
          numberOfLines={3}
        />

        <Text style={styles.label}>Address *</Text>
        <TextInput
          style={styles.input}
          value={address}
          onChangeText={setAddress}
          placeholder="123 Main St"
          placeholderTextColor="#A39D94"
        />

        <View style={styles.row}>
          <View style={styles.flex2}>
            <Text style={styles.label}>City *</Text>
            <TextInput
              style={styles.input}
              value={city}
              onChangeText={setCity}
              placeholder="Raleigh"
              placeholderTextColor="#A39D94"
            />
          </View>
          <View style={styles.flex1}>
            <Text style={styles.label}>State *</Text>
            <TextInput
              style={styles.input}
              value={state}
              onChangeText={setState}
              placeholder="NC"
              placeholderTextColor="#A39D94"
              maxLength={2}
              autoCapitalize="characters"
            />
          </View>
          <View style={styles.flex1}>
            <Text style={styles.label}>Zip *</Text>
            <TextInput
              style={styles.input}
              value={zipCode}
              onChangeText={setZipCode}
              placeholder="27601"
              placeholderTextColor="#A39D94"
              keyboardType="number-pad"
              maxLength={5}
            />
          </View>
        </View>

        <Text style={styles.label}>Instagram handle</Text>
        <TextInput
          style={styles.input}
          value={instagramHandle}
          onChangeText={setInstagramHandle}
          placeholder="@yourbusiness"
          placeholderTextColor="#A39D94"
          autoCapitalize="none"
        />

        <TouchableOpacity style={styles.button} onPress={handleSubmit}>
          <Text style={styles.buttonText}>Complete setup</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FDFCFA",
  },
  scroll: {
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 40,
  },
  title: {
    fontFamily: "DMSerifDisplay_400Regular",
    fontSize: 28,
    color: "#2A2622",
    marginBottom: 8,
  },
  subtitle: {
    fontFamily: "DMSans_400Regular",
    fontSize: 16,
    color: "#615B53",
    marginBottom: 32,
  },
  error: {
    fontFamily: "DMSans_400Regular",
    fontSize: 14,
    color: "#C93B3B",
    marginBottom: 16,
  },
  label: {
    fontFamily: "DMSans_500Medium",
    fontSize: 14,
    color: "#2A2622",
    marginBottom: 6,
  },
  input: {
    fontFamily: "DMSans_400Regular",
    fontSize: 16,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#F0EDE8",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 16,
    color: "#2A2622",
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: "top",
  },
  categoryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 16,
  },
  categoryChip: {
    borderWidth: 1,
    borderColor: "#F0EDE8",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: "#FFFFFF",
  },
  categoryChipActive: {
    borderColor: "#E8573D",
    backgroundColor: "#FEF2F0",
  },
  categoryText: {
    fontFamily: "DMSans_500Medium",
    fontSize: 14,
    color: "#615B53",
  },
  categoryTextActive: {
    color: "#E8573D",
  },
  row: {
    flexDirection: "row",
    gap: 12,
  },
  flex1: {
    flex: 1,
  },
  flex2: {
    flex: 2,
  },
  button: {
    backgroundColor: "#E8573D",
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 8,
  },
  buttonText: {
    fontFamily: "DMSans_700Bold",
    fontSize: 15,
    color: "#FFFFFF",
  },
});
