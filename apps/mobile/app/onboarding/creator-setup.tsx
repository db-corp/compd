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
  ActivityIndicator,
  Image,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { NICHES } from "../../lib/constants";
import OnboardingWizard from "../../components/OnboardingWizard";
import { MapPin, CheckCircle, AlertCircle, Camera } from "lucide-react-native";
import { pickImage, uploadToConvex } from "../../lib/imagePicker";
import { getCurrentLocation, geocodeAddress, reverseGeocode } from "../../lib/geolocation";

const STEP_LABELS = ["About You", "Location", "Accounts", "Review"];

export default function CreatorSetup() {
  const router = useRouter();
  const createCreator = useMutation(api.creators.create);
  const generateUploadUrl = useMutation(api.files.generateUploadUrl);

  const [step, setStep] = useState(0);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Step 1: About You
  const [profilePhotoUri, setProfilePhotoUri] = useState<string | null>(null);
  const [profilePhotoStorageId, setProfilePhotoStorageId] = useState<string | null>(null);
  const [bio, setBio] = useState("");
  const [selectedNiches, setSelectedNiches] = useState<string[]>([]);

  // Step 2: Location
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [latitude, setLatitude] = useState(35.7796);
  const [longitude, setLongitude] = useState(-78.6382);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationResolved, setLocationResolved] = useState(false);

  // Step 3: Social Accounts
  const [instagramHandle, setInstagramHandle] = useState("");
  const [tiktokHandle, setTiktokHandle] = useState("");
  const [instagramError, setInstagramError] = useState("");
  const [tiktokError, setTiktokError] = useState("");

  const toggleNiche = (niche: string) => {
    setSelectedNiches((prev) =>
      prev.includes(niche) ? prev.filter((n) => n !== niche) : [...prev, niche]
    );
  };

  const handlePickPhoto = async () => {
    const uri = await pickImage();
    if (uri) {
      setProfilePhotoUri(uri);
      try {
        const storageId = await uploadToConvex(uri, generateUploadUrl);
        setProfilePhotoStorageId(storageId);
      } catch {
        Alert.alert("Upload failed", "Could not upload photo. You can try again later.");
      }
    }
  };

  const handleUseMyLocation = async () => {
    setLocationLoading(true);
    setError("");
    try {
      const loc = await getCurrentLocation();
      if (!loc) {
        setError("Location permission denied. Please enter your city manually.");
        setLocationLoading(false);
        return;
      }
      setLatitude(loc.latitude);
      setLongitude(loc.longitude);

      const addr = await reverseGeocode(loc.latitude, loc.longitude);
      if (addr) {
        setCity(addr.city);
        setState(addr.state);
        setLocationResolved(true);
      }
    } catch {
      setError("Could not determine location. Please enter manually.");
    }
    setLocationLoading(false);
  };

  const handleGeocodeCity = async () => {
    if (!city || !state) return;
    const coords = await geocodeAddress(`${city}, ${state}`);
    if (coords) {
      setLatitude(coords.latitude);
      setLongitude(coords.longitude);
      setLocationResolved(true);
    }
  };

  const validateStep = (): boolean => {
    setError("");
    setInstagramError("");
    setTiktokError("");

    switch (step) {
      case 0: // About You
        if (selectedNiches.length === 0) {
          setError("Select at least one content niche");
          return false;
        }
        return true;
      case 1: // Location
        if (!city || !state) {
          setError("City and state are required");
          return false;
        }
        return true;
      case 2: // Accounts
        if (!instagramHandle && !tiktokHandle) {
          setError("Connect at least one social account");
          return false;
        }
        return true;
      case 3: // Review
        return true;
      default:
        return true;
    }
  };

  const handleNext = async () => {
    if (!validateStep()) return;

    if (step === 1 && !locationResolved) {
      await handleGeocodeCity();
    }

    if (step < 3) {
      setStep(step + 1);
    } else {
      await handleSubmit();
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setError("");
    try {
      // Use local vars to avoid React state batching bug with geocoding
      let lat = latitude;
      let lng = longitude;
      if (!locationResolved) {
        const coords = await geocodeAddress(`${city}, ${state}`);
        if (coords) {
          lat = coords.latitude;
          lng = coords.longitude;
        } else {
          setError("Could not determine location. Please use 'Use my location'.");
          setSubmitting(false);
          return;
        }
      }

      await createCreator({
        bio: bio || undefined,
        niches: selectedNiches,
        city,
        state,
        latitude: lat,
        longitude: lng,
        instagramHandle: instagramHandle ? instagramHandle.replace(/^@/, "") : undefined,
        tiktokHandle: tiktokHandle ? tiktokHandle.replace(/^@/, "") : undefined,
        profilePhotoId: (profilePhotoStorageId as any) || undefined,
      });
      router.replace("/(app)/(tabs)/explore");
    } catch (err: any) {
      setError(err.message ?? "Setup failed");
      setSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View style={styles.headerArea}>
        <Text style={styles.title}>Set up your profile</Text>
        <Text style={styles.subtitle}>Help businesses find and choose you</Text>
      </View>

      <OnboardingWizard
        currentStep={step}
        totalSteps={4}
        stepLabels={STEP_LABELS}
        onBack={() => setStep(step - 1)}
        onNext={handleNext}
        nextLabel={step === 3 ? (submitting ? "Setting up..." : "Complete setup") : "Continue"}
        nextDisabled={submitting}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {error ? <Text style={styles.error}>{error}</Text> : null}

          {/* ─── Step 1: About You ─────────────────────── */}
          {step === 0 && (
            <>
              {/* Profile photo */}
              <TouchableOpacity style={styles.photoUpload} onPress={handlePickPhoto}>
                {profilePhotoUri ? (
                  <Image source={{ uri: profilePhotoUri }} style={styles.photoPreview} />
                ) : (
                  <View style={styles.photoPlaceholder}>
                    <Camera size={24} color="#A39D94" strokeWidth={1.5} />
                    <Text style={styles.photoPlaceholderText}>Add photo</Text>
                  </View>
                )}
              </TouchableOpacity>

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
            </>
          )}

          {/* ─── Step 2: Location ──────────────────────── */}
          {step === 1 && (
            <>
              <TouchableOpacity
                style={styles.locationButton}
                onPress={handleUseMyLocation}
                disabled={locationLoading}
              >
                {locationLoading ? (
                  <ActivityIndicator size="small" color="#1A7A6D" />
                ) : (
                  <MapPin size={18} color="#1A7A6D" strokeWidth={1.5} />
                )}
                <Text style={styles.locationButtonText}>
                  {locationLoading ? "Finding location..." : "Use my location"}
                </Text>
              </TouchableOpacity>

              {locationResolved && (
                <View style={styles.locationSuccess}>
                  <CheckCircle size={14} color="#1A7A6D" strokeWidth={1.5} />
                  <Text style={styles.locationSuccessText}>Location found</Text>
                </View>
              )}

              <Text style={styles.orDivider}>or enter manually</Text>

              <View style={styles.row}>
                <View style={styles.flex2}>
                  <Text style={styles.label}>City *</Text>
                  <TextInput
                    style={styles.input}
                    value={city}
                    onChangeText={(val) => {
                      setCity(val);
                      setLocationResolved(false);
                    }}
                    placeholder="Raleigh"
                    placeholderTextColor="#A39D94"
                  />
                </View>
                <View style={styles.flex1}>
                  <Text style={styles.label}>State *</Text>
                  <TextInput
                    style={styles.input}
                    value={state}
                    onChangeText={(val) => {
                      setState(val);
                      setLocationResolved(false);
                    }}
                    placeholder="NC"
                    placeholderTextColor="#A39D94"
                    maxLength={2}
                    autoCapitalize="characters"
                  />
                </View>
              </View>
            </>
          )}

          {/* ─── Step 3: Connect Accounts ──────────────── */}
          {step === 2 && (
            <>
              <Text style={styles.sectionTitle}>Social accounts</Text>
              <Text style={styles.sectionDesc}>
                Connect at least one account so businesses can see your content.
                You can also enter handles manually.
              </Text>

              <Text style={styles.label}>Instagram</Text>
              <TextInput
                style={[styles.input, instagramError ? styles.inputError : null]}
                value={instagramHandle}
                onChangeText={(val) => {
                  setInstagramHandle(val);
                  setInstagramError("");
                }}
                placeholder="@yourhandle"
                placeholderTextColor="#A39D94"
                autoCapitalize="none"
              />
              {instagramError ? (
                <View style={styles.fieldErrorRow}>
                  <AlertCircle size={12} color="#C93B3B" strokeWidth={1.5} />
                  <Text style={styles.fieldErrorText}>{instagramError}</Text>
                </View>
              ) : null}

              <Text style={styles.label}>TikTok</Text>
              <TextInput
                style={[styles.input, tiktokError ? styles.inputError : null]}
                value={tiktokHandle}
                onChangeText={(val) => {
                  setTiktokHandle(val);
                  setTiktokError("");
                }}
                placeholder="@yourhandle"
                placeholderTextColor="#A39D94"
                autoCapitalize="none"
              />
              {tiktokError ? (
                <View style={styles.fieldErrorRow}>
                  <AlertCircle size={12} color="#C93B3B" strokeWidth={1.5} />
                  <Text style={styles.fieldErrorText}>{tiktokError}</Text>
                </View>
              ) : null}

              <Text style={styles.oauthNote}>
                Full OAuth verification (verified badge + metrics) will be available after
                app review with Instagram and TikTok.
              </Text>
            </>
          )}

          {/* ─── Step 4: Review ────────────────────────── */}
          {step === 3 && (
            <>
              <Text style={styles.sectionTitle}>Review your profile</Text>

              <View style={styles.reviewCard}>
                <View style={styles.reviewRow}>
                  <Text style={styles.reviewLabel}>Niches</Text>
                  <Text style={styles.reviewValue}>
                    {selectedNiches
                      .map((n) => n.charAt(0).toUpperCase() + n.slice(1))
                      .join(", ")}
                  </Text>
                </View>
                {bio ? (
                  <View style={styles.reviewRow}>
                    <Text style={styles.reviewLabel}>Bio</Text>
                    <Text style={styles.reviewValue} numberOfLines={2}>
                      {bio}
                    </Text>
                  </View>
                ) : null}
                <View style={styles.reviewRow}>
                  <Text style={styles.reviewLabel}>Location</Text>
                  <Text style={styles.reviewValue}>
                    {city}, {state}
                  </Text>
                </View>
                {instagramHandle ? (
                  <View style={styles.reviewRow}>
                    <Text style={styles.reviewLabel}>Instagram</Text>
                    <Text style={styles.reviewValue}>@{instagramHandle.replace(/^@/, "")}</Text>
                  </View>
                ) : null}
                {tiktokHandle ? (
                  <View style={styles.reviewRow}>
                    <Text style={styles.reviewLabel}>TikTok</Text>
                    <Text style={styles.reviewValue}>@{tiktokHandle.replace(/^@/, "")}</Text>
                  </View>
                ) : null}
              </View>
            </>
          )}
        </ScrollView>
      </OnboardingWizard>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FDFCFA",
  },
  headerArea: {
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 8,
  },
  title: {
    fontFamily: "DMSerifDisplay_400Regular",
    fontSize: 28,
    color: "#2A2622",
    marginBottom: 4,
  },
  subtitle: {
    fontFamily: "DMSans_400Regular",
    fontSize: 16,
    color: "#615B53",
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 20,
  },
  error: {
    fontFamily: "DMSans_400Regular",
    fontSize: 14,
    color: "#C93B3B",
    marginBottom: 12,
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
  inputError: {
    borderColor: "#C93B3B",
    marginBottom: 4,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: "top",
  },
  sectionTitle: {
    fontFamily: "DMSans_700Bold",
    fontSize: 18,
    color: "#2A2622",
    marginBottom: 4,
  },
  sectionDesc: {
    fontFamily: "DMSans_400Regular",
    fontSize: 14,
    color: "#827B72",
    marginBottom: 16,
  },

  // Photo upload
  photoUpload: {
    alignSelf: "center",
    marginBottom: 24,
  },
  photoPreview: {
    width: 96,
    height: 96,
    borderRadius: 48,
  },
  photoPlaceholder: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: "#F0EDE8",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
  photoPlaceholderText: {
    fontFamily: "DMSans_400Regular",
    fontSize: 12,
    color: "#A39D94",
  },

  // Niches
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

  // Location
  locationButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#EEF8F6",
    borderWidth: 1,
    borderColor: "#1A7A6D",
    borderRadius: 8,
    paddingVertical: 14,
    marginBottom: 12,
  },
  locationButtonText: {
    fontFamily: "DMSans_500Medium",
    fontSize: 15,
    color: "#1A7A6D",
  },
  locationSuccess: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 12,
  },
  locationSuccessText: {
    fontFamily: "DMSans_400Regular",
    fontSize: 13,
    color: "#1A7A6D",
  },
  orDivider: {
    fontFamily: "DMSans_400Regular",
    fontSize: 13,
    color: "#A39D94",
    textAlign: "center",
    marginBottom: 12,
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

  // Social field errors
  fieldErrorRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 12,
  },
  fieldErrorText: {
    fontFamily: "DMSans_400Regular",
    fontSize: 12,
    color: "#C93B3B",
  },
  oauthNote: {
    fontFamily: "DMSans_400Regular",
    fontSize: 12,
    color: "#A39D94",
    marginTop: 8,
    fontStyle: "italic",
  },

  // Review
  reviewCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#F0EDE8",
    marginTop: 12,
  },
  reviewRow: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#F0EDE8",
  },
  reviewLabel: {
    fontFamily: "DMSans_500Medium",
    fontSize: 12,
    color: "#827B72",
    marginBottom: 2,
  },
  reviewValue: {
    fontFamily: "DMSans_400Regular",
    fontSize: 15,
    color: "#2A2622",
  },
});
