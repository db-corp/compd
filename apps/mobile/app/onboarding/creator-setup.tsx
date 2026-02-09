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
import { NICHES } from "../../lib/constants";

export default function CreatorSetup() {
  const router = useRouter();
  const createCreator = useMutation(api.creators.create);

  const [bio, setBio] = useState("");
  const [selectedNiches, setSelectedNiches] = useState<string[]>([]);
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [instagramHandle, setInstagramHandle] = useState("");
  const [tiktokHandle, setTiktokHandle] = useState("");
  const [error, setError] = useState("");

  const toggleNiche = (niche: string) => {
    setSelectedNiches((prev) =>
      prev.includes(niche) ? prev.filter((n) => n !== niche) : [...prev, niche]
    );
  };

  const handleSubmit = async () => {
    if (!city || !state || selectedNiches.length === 0) {
      setError("Please fill in your location and select at least one niche");
      return;
    }
    if (!instagramHandle && !tiktokHandle) {
      setError("Please connect at least one social account");
      return;
    }
    setError("");

    try {
      await createCreator({
        bio: bio || undefined,
        niches: selectedNiches,
        city,
        state,
        // TODO: Geocode from city/state in a future update. Raleigh defaults are acceptable for MVP since all seed data is Raleigh.
        latitude: 35.7796,
        longitude: -78.6382,
        instagramHandle: instagramHandle || undefined,
        tiktokHandle: tiktokHandle || undefined,
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
        <Text style={styles.title}>Set up your profile</Text>
        <Text style={styles.subtitle}>
          Help businesses find and choose you
        </Text>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <Text style={styles.label}>Bio</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={bio}
          onChangeText={setBio}
          placeholder="Tell businesses about your content style"
          placeholderTextColor="#A39D94"
          multiline
          numberOfLines={3}
        />

        <Text style={styles.label}>Content niches *</Text>
        <View style={styles.nicheGrid}>
          {NICHES.map((niche) => (
            <TouchableOpacity
              key={niche}
              style={[
                styles.nicheChip,
                selectedNiches.includes(niche) && styles.nicheChipActive,
              ]}
              onPress={() => toggleNiche(niche)}
            >
              <Text
                style={[
                  styles.nicheText,
                  selectedNiches.includes(niche) && styles.nicheTextActive,
                ]}
              >
                {niche.charAt(0).toUpperCase() + niche.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

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
        </View>

        <Text style={styles.sectionTitle}>Social accounts</Text>
        <Text style={styles.sectionDesc}>
          Connect at least one account so businesses can see your content
        </Text>

        <Text style={styles.label}>Instagram</Text>
        <TextInput
          style={styles.input}
          value={instagramHandle}
          onChangeText={setInstagramHandle}
          placeholder="@yourhandle"
          placeholderTextColor="#A39D94"
          autoCapitalize="none"
        />

        <Text style={styles.label}>TikTok</Text>
        <TextInput
          style={styles.input}
          value={tiktokHandle}
          onChangeText={setTiktokHandle}
          placeholder="@yourhandle"
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
  sectionTitle: {
    fontFamily: "DMSans_700Bold",
    fontSize: 18,
    color: "#2A2622",
    marginTop: 8,
    marginBottom: 4,
  },
  sectionDesc: {
    fontFamily: "DMSans_400Regular",
    fontSize: 14,
    color: "#827B72",
    marginBottom: 16,
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
  nicheGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 16,
  },
  nicheChip: {
    borderWidth: 1,
    borderColor: "#F0EDE8",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: "#FFFFFF",
  },
  nicheChipActive: {
    borderColor: "#1A7A6D",
    backgroundColor: "#EEF8F6",
  },
  nicheText: {
    fontFamily: "DMSans_500Medium",
    fontSize: 14,
    color: "#615B53",
  },
  nicheTextActive: {
    color: "#1A7A6D",
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
