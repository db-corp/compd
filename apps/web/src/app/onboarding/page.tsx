"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "convex/react";
import { api } from "@convex/_generated/api";

import { CATEGORIES } from "@/lib/constants";

export default function OnboardingPage() {
  const router = useRouter();
  const storeUser = useMutation(api.users.store);
  const setRole = useMutation(api.users.setRole);
  const createBusiness = useMutation(api.businesses.create);

  const [step, setStep] = useState<"role" | "creator-redirect" | "business-setup">("role");
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [instagramHandle, setInstagramHandle] = useState("");
  const [website, setWebsite] = useState("");
  const [googleBusinessUrl, setGoogleBusinessUrl] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSelectRole = async () => {
    try {
      await storeUser();
      await setRole({ role: "business" });
      setStep("business-setup");
    } catch (err: any) {
      setError(err.message ?? "Failed to set role");
    }
  };

  const handleSubmitBusiness = async () => {
    if (!name || !category || !address || !city || !state || !zipCode) {
      setError("Please fill in all required fields");
      return;
    }
    setError("");
    setSubmitting(true);

    try {
      // TODO: Replace with browser Geolocation API or geocoding service.
      // For now, attempt browser geolocation, fall back to Raleigh defaults.
      let lat = 35.7796;
      let lng = -78.6382;
      try {
        const pos = await new Promise<GeolocationPosition>((resolve, reject) =>
          navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 })
        );
        lat = pos.coords.latitude;
        lng = pos.coords.longitude;
      } catch {
        // Browser geolocation unavailable or denied — use defaults
      }

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
        instagramHandle: instagramHandle || undefined,
        website: website || undefined,
        googleBusinessUrl: googleBusinessUrl || undefined,
        photos: [],
      });
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message ?? "Setup failed");
    } finally {
      setSubmitting(false);
    }
  };

  if (step === "role") {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <div className="max-w-md w-full">
          <h1 className="font-serif text-3xl text-neutral-800 text-center mb-2">
            Welcome to Comp'd
          </h1>
          <p className="text-neutral-500 text-center mb-10">
            How will you use the platform?
          </p>

          {error && (
            <p className="text-error text-sm mb-4 text-center">{error}</p>
          )}

          <div className="space-y-3">
            <button
              onClick={handleSelectRole}
              className="w-full border-2 border-primary-500 bg-primary-50 rounded-xl p-5 text-left hover:bg-primary-100 transition-colors"
            >
              <p className="font-semibold text-primary-600 mb-1">I'm a business</p>
              <p className="text-sm text-neutral-500">
                Create offers, manage deals, and get authentic content from local creators.
              </p>
            </button>

            <button
              onClick={() => setStep("creator-redirect")}
              className="w-full border-2 border-neutral-200 bg-white rounded-xl p-5 text-left hover:border-secondary-300 hover:bg-secondary-50/30 transition-colors"
            >
              <p className="font-semibold text-neutral-800 mb-1">I'm a creator</p>
              <p className="text-sm text-neutral-500">
                Discover offers, apply to deals, and earn through content collaborations.
              </p>
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (step === "creator-redirect") {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <div className="max-w-md w-full text-center">
          <div className="w-16 h-16 rounded-2xl bg-secondary-50 flex items-center justify-center mx-auto mb-6">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#1A7A6D" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
              <line x1="12" y1="18" x2="12.01" y2="18" />
            </svg>
          </div>
          <h1 className="font-serif text-3xl text-neutral-800 mb-3">
            Grab the app
          </h1>
          <p className="text-neutral-500 mb-8 leading-relaxed">
            The creator experience is built for mobile. Download the Comp'd app to discover offers, apply to deals, and submit content — all from your phone.
          </p>

          <div className="space-y-3 mb-8">
            <div className="flex items-center gap-3 bg-neutral-50 rounded-lg px-4 py-3 text-left">
              <span className="text-lg">1.</span>
              <span className="text-sm text-neutral-600">Browse offers from local businesses</span>
            </div>
            <div className="flex items-center gap-3 bg-neutral-50 rounded-lg px-4 py-3 text-left">
              <span className="text-lg">2.</span>
              <span className="text-sm text-neutral-600">Apply, check in, and redeem on the go</span>
            </div>
            <div className="flex items-center gap-3 bg-neutral-50 rounded-lg px-4 py-3 text-left">
              <span className="text-lg">3.</span>
              <span className="text-sm text-neutral-600">Submit content and track your deals</span>
            </div>
          </div>

          <p className="text-xs text-neutral-400 mb-6">
            Coming soon to the App Store and Google Play.
          </p>

          <button
            onClick={() => setStep("role")}
            className="text-sm text-neutral-500 hover:text-neutral-700 transition-colors"
          >
            &larr; Back to role selection
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-12">
      <div className="max-w-lg w-full">
        <h1 className="font-serif text-3xl text-neutral-800 mb-2">
          Set up your business
        </h1>
        <p className="text-neutral-500 mb-8">
          Tell creators about your business
        </p>

        {error && (
          <p className="text-error text-sm mb-4">{error}</p>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-neutral-800 mb-1">
              Business name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border border-neutral-100 rounded-md px-4 py-3 text-neutral-800 bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="e.g. Bida Manda"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-800 mb-1">
              Category *
            </label>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.value}
                  onClick={() => setCategory(cat.value)}
                  className={`px-4 py-2 rounded-md text-sm font-medium border transition-colors ${
                    category === cat.value
                      ? "border-primary-500 bg-primary-50 text-primary-500"
                      : "border-neutral-100 bg-white text-neutral-600 hover:border-neutral-200"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-800 mb-1">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full border border-neutral-100 rounded-md px-4 py-3 text-neutral-800 bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="What makes your business special?"
              rows={3}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-800 mb-1">
              Address *
            </label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full border border-neutral-100 rounded-md px-4 py-3 text-neutral-800 bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="123 Main St"
            />
          </div>

          <div className="grid grid-cols-4 gap-3">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-neutral-800 mb-1">
                City *
              </label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full border border-neutral-100 rounded-md px-4 py-3 text-neutral-800 bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Raleigh"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-800 mb-1">
                State *
              </label>
              <input
                type="text"
                value={state}
                onChange={(e) => setState(e.target.value)}
                className="w-full border border-neutral-100 rounded-md px-4 py-3 text-neutral-800 bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="NC"
                maxLength={2}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-800 mb-1">
                Zip *
              </label>
              <input
                type="text"
                value={zipCode}
                onChange={(e) => setZipCode(e.target.value)}
                className="w-full border border-neutral-100 rounded-md px-4 py-3 text-neutral-800 bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="27601"
                maxLength={5}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-800 mb-1">
              Instagram handle
            </label>
            <input
              type="text"
              value={instagramHandle}
              onChange={(e) => setInstagramHandle(e.target.value)}
              className="w-full border border-neutral-100 rounded-md px-4 py-3 text-neutral-800 bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="@yourbusiness"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-800 mb-1">
              Website
            </label>
            <input
              type="url"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              className="w-full border border-neutral-100 rounded-md px-4 py-3 text-neutral-800 bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="https://yourbusiness.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-800 mb-1">
              Google Business URL
            </label>
            <input
              type="url"
              value={googleBusinessUrl}
              onChange={(e) => setGoogleBusinessUrl(e.target.value)}
              className="w-full border border-neutral-100 rounded-md px-4 py-3 text-neutral-800 bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="https://g.page/yourbusiness"
            />
          </div>

          <button
            onClick={handleSubmitBusiness}
            disabled={submitting}
            className="w-full bg-primary-500 text-white font-bold text-sm py-3 rounded-md hover:bg-primary-600 disabled:opacity-50 transition-colors mt-4"
          >
            {submitting ? "Setting up..." : "Complete setup"}
          </button>
        </div>
      </div>
    </div>
  );
}
