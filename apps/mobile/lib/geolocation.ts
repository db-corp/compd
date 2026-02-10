import * as Location from "expo-location";

/**
 * Request location permissions and get the current device position.
 */
export async function getCurrentLocation(): Promise<{
  latitude: number;
  longitude: number;
} | null> {
  const { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== "granted") return null;

  try {
    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });

    return {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
    };
  } catch {
    // getCurrentPositionAsync can throw even after permission is granted
    // (e.g. location services disabled, timeout, etc.)
    return null;
  }
}

/**
 * Geocode a city/state string to coordinates.
 */
export async function geocodeAddress(
  address: string
): Promise<{ latitude: number; longitude: number } | null> {
  try {
    const results = await Location.geocodeAsync(address);
    if (results.length === 0) return null;
    return {
      latitude: results[0].latitude,
      longitude: results[0].longitude,
    };
  } catch {
    return null;
  }
}

/**
 * Reverse geocode coordinates to get city/state.
 */
export async function reverseGeocode(
  latitude: number,
  longitude: number
): Promise<{ city: string; state: string } | null> {
  try {
    const results = await Location.reverseGeocodeAsync({ latitude, longitude });
    if (results.length === 0) return null;
    return {
      city: results[0].city ?? "",
      state: results[0].region ?? "",
    };
  } catch {
    return null;
  }
}
