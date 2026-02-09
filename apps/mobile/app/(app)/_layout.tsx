import { useEffect } from "react";
import { Slot, useRouter } from "expo-router";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";

export default function AppLayout() {
  const router = useRouter();
  const user = useQuery(api.users.getCurrent);
  const storeUser = useMutation(api.users.store);

  useEffect(() => {
    if (user === undefined) return; // loading

    if (user === null) {
      // User authenticated with Clerk but not yet stored in Convex
      storeUser().then(() => {
        router.replace("/onboarding/role-select");
      });
      return;
    }

    // If user exists but hasn't completed onboarding, send to onboarding
    if (user.role === "creator") {
      // Check if creator profile exists — handled by tab screens
    }
  }, [user]);

  if (user === undefined) return null; // loading

  return <Slot />;
}
