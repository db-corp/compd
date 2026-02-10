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
  Image,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { CATEGORIES } from "../../lib/constants";
import { Camera, MapPin, CheckCircle, Plus, X } from "lucide-react-native";
import { pickImage, uploadToConvex } from "../../lib/imagePicker";
import { getCurrentLocation, geocodeAddress, reverseGeocode } from "../../lib/geolocation";

export default function BusinessSetup() {
  const router = useRouter();
  const createBusiness = useMutation(api.businesses.create);
  const generateUploadUrl = useMutation(api.files.generateUploadUrl);

  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [instagramHandle, setInstagramHandle] = useState("");
  const [website, setWebsite] = useState("");
  const [error, setError] = useState("");

  // Location
  const [latitude, setLatitude] = useState(35.7796);
  const [longitude, setLongitude] = useState(-78.6382);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationResolved, setLocationResolved] = useState(false);

  // Photos
  const [photos, setPhotos] = useState<{ uri: string; storageId?: string }[]>([]);

  const handleAddPhoto = async () => {
    if (photos.length >= 5) {
      Alert.alert("Limit reached", "You can upload up to 5 photos.");
      return;
    }
    const uri = await pickImage();
    if (uri) {
      const newPhoto = { uri };
      setPhotos((prev) => [...prev, newPhoto]);
      try {
        const storageId = await uploadToConvex(uri, generateUploadUrl);
        setPhotos((prev) =>
          prev.map((p) => (p.uri === uri ? { ...p, storageId } : p))
        );
      } catch {
        Alert.alert("Upload failed", "Could not upload photo.");
      }
    }
  };

  const handleRemovePhoto = (index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUseMyLocation = async () => {
    setLocationLoading(true);
    setError("");
    try {
      const loc = await getCurrentLocation();
      if (!loc) {
        setError("Location permission denied.");
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
      setError("Could not determine location.");
    }
    setLocationLoading(false);
  };

  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!name || !category || !address || !city || !state || !zipCode) {
      setError("Please fill in all required fields");
      return;
    }
    setError("");
    setSubmitting(true);

    try {
      // Use local vars to avoid React state batching bug
      let lat = latitude;
      let lng = longitude;

      // Geocode if not already resolved
      if (!locationResolved) {
        const coords = await geocodeAddress(`${address}, ${city}, ${state} ${zipCode}`);
        if (coords) {
          lat = coords.latitude;
          lng = coords.longitude;
          setLatitude(lat);
          setLongitude(lng);
        } else {
          setError("Could not determine location from address. Please use 'Use my location' or check your address.");
          setSubmitting(false);
          return;
        }
      }

      const photoIds = photos
        .map((p) => p.storageId)
        .filter((id): id is string => !!id);

      await createBusiness({
        name,
        category,
        description: description || undefined,
        address,
        city,
        state,
        zipCode,
        latitude: lat,
        longitude: lng,
        instagramHandle: instagramHandle ? instagramHandle.replace(/^@/, "") : undefined,
        website: website || undefined,
        photos: photoIds,
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
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.title}>Set up your business</Text>
        <Text style={styles.subtitle}>
          Tell creators about your business
        </Text>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        {/* Photos */}
        <Text style={styles.label}>Photos (logo & storefront)</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.photoScroll}
          contentContainerStyle={styles.photoScrollContent}
        >
          {photos.map((photo, i) => (
            <View key={i} style={styles.photoThumb}>
              <Image source={{ uri: photo.uri }} style={styles.photoThumbImage} />
              <TouchableOpacity
                style={styles.photoRemove}
                onPress={() => handleRemovePhoto(i)}
              >
                <X size={12} color="#FFF" strokeWidth={2} />
              </TouchableOpacity>
            </View>
          ))}
          {photos.length < 5 && (
            <TouchableOpacity style={styles.photoAdd} onPress={handleAddPhoto}>
              <Plus size={24} color="#A39D94" strokeWidth={1.5} />
            </TouchableOpacity>
          )}
        </ScrollView>

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

        {/* Use my location */}
        <TouchableOpacity
          style={styles.locationButton}
          onPress={handleUseMyLocation}
          disabled={locationLoading}
        >
          {locationLoading ? (
            <ActivityIndicator size="small" color="#1A7A6D" />
          ) : (
            <MapPin size={16} color="#1A7A6D" strokeWidth={1.5} />
          )}
          <Text style={styles.locationButtonText}>
            {locationLoading ? "Finding..." : "Use my location"}
          </Text>
          {locationResolved && (
            <CheckCircle size={14} color="#1A7A6D" strokeWidth={1.5} />
          )}
        </TouchableOpacity>

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

        <Text style={styles.label}>Website</Text>
        <TextInput
          style={styles.input}
          value={website}
          onChangeText={setWebsite}
          placeholder="https://yourbusiness.com"
          placeholderTextColor="#A39D94"
          autoCapitalize="none"
          keyboardType="url"
        />

        <TouchableOpacity
          style={[styles.button, submitting && styles.buttonDisabled]}
          onPress={handleSubmit}
          disabled={submitting}
        >
          {submitting ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text style={styles.buttonText}>Complete setup</Text>
          )}
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

  // Photos
  photoScroll: {
    marginBottom: 16,
  },
  photoScrollContent: {
    gap: 10,
    flexDirection: "row",
  },
  photoThumb: {
    width: 80,
    height: 80,
    borderRadius: 10,
    overflow: "hidden",
  },
  photoThumbImage: {
    width: 80,
    height: 80,
  },
  photoRemove: {
    position: "absolute",
    top: 4,
    right: 4,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "rgba(0,0,0,0.5)",
    alignItems: "center",
    justifyContent: "center",
  },
  photoAdd: {
    width: 80,
    height: 80,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: "#F0EDE8",
    borderStyle: "dashed",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FAF8F5",
  },

  // Location
  locationButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 12,
  },
  locationButtonText: {
    fontFamily: "DMSans_500Medium",
    fontSize: 13,
    color: "#1A7A6D",
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
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    fontFamily: "DMSans_700Bold",
    fontSize: 15,
    color: "#FFFFFF",
  },
});
