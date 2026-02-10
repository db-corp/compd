import * as ImagePicker from "expo-image-picker";

/**
 * Pick an image from the device library.
 * Returns the local URI or null if cancelled.
 */
export async function pickImage(): Promise<string | null> {
  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (status !== "granted") return null;

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ["images"],
    allowsEditing: true,
    aspect: [1, 1],
    quality: 0.8,
  });

  if (result.canceled || result.assets.length === 0) return null;
  return result.assets[0].uri;
}

/**
 * Upload a local image URI to Convex storage.
 * Returns the storage ID.
 */
export async function uploadToConvex(
  localUri: string,
  generateUploadUrl: () => Promise<string>
): Promise<string> {
  const uploadUrl = await generateUploadUrl();

  const response = await fetch(localUri);
  const blob = await response.blob();

  const uploadRes = await fetch(uploadUrl, {
    method: "POST",
    headers: { "Content-Type": blob.type || "image/jpeg" },
    body: blob,
  });

  if (!uploadRes.ok) {
    throw new Error("Failed to upload image");
  }

  const { storageId } = (await uploadRes.json()) as { storageId: string };
  return storageId;
}
