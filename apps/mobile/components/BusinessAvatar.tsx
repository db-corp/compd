import { View, Text, Image, StyleSheet } from "react-native";
import { useState } from "react";

const AVATAR_COLORS = [
  "#E8573D", // coral
  "#1A7A6D", // teal
  "#E8A917", // amber
  "#4A90D9", // info blue
  "#C4422E", // deep coral
  "#14635A", // deep teal
];

function hashName(name: string): number {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = (hash * 31 + name.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

interface BusinessAvatarProps {
  name: string;
  photoUrl?: string | null;
  size?: number;
}

export default function BusinessAvatar({
  name,
  photoUrl,
  size = 36,
}: BusinessAvatarProps) {
  const [imgError, setImgError] = useState(false);
  const color = AVATAR_COLORS[hashName(name) % AVATAR_COLORS.length];
  const fontSize = size * 0.44;

  if (photoUrl && !imgError) {
    return (
      <Image
        source={{ uri: photoUrl }}
        style={[
          styles.image,
          { width: size, height: size, borderRadius: size / 2 },
        ]}
        onError={() => setImgError(true)}
      />
    );
  }

  return (
    <View
      style={[
        styles.circle,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: color,
        },
      ]}
    >
      <Text style={[styles.initial, { fontSize }]}>
        {name.charAt(0).toUpperCase()}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  image: {
    backgroundColor: "#F0EDE8",
  },
  circle: {
    alignItems: "center",
    justifyContent: "center",
  },
  initial: {
    fontFamily: "DMSans_700Bold",
    color: "#FFFFFF",
  },
});
