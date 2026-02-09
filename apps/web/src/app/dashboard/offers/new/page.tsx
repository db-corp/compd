"use client";

import { useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import Link from "next/link";

const CATEGORIES = [
  "restaurant",
  "salon",
  "med_spa",
  "fitness",
  "retail",
  "hospitality",
  "entertainment",
  "other",
];

const CATEGORY_LABELS: Record<string, string> = {
  restaurant: "Restaurant",
  salon: "Salon & Beauty",
  med_spa: "Med Spa",
  fitness: "Fitness & Gym",
  retail: "Retail",
  hospitality: "Hospitality",
  entertainment: "Entertainment",
  other: "Other",
};

const PLATFORMS = ["instagram", "tiktok"];
const CONTENT_TYPES: Record<string, string[]> = {
  instagram: ["Story", "Reel", "Feed Post", "Carousel"],
  tiktok: ["Video", "Story"],
};

const USAGE_RIGHTS = [
  { value: "repost_with_credit", label: "Repost with credit" },
  { value: "full_rights", label: "Full usage rights" },
  { value: "none", label: "No usage rights" },
];

const VISIBILITY_OPTIONS = [
  { value: "open", label: "Open", desc: "Visible to all creators" },
  {
    value: "established_plus",
    label: "Established+",
    desc: "Only established, trusted, and verified creators",
  },
  {
    value: "trusted_plus",
    label: "Trusted+",
    desc: "Only trusted and verified creators",
  },
  { value: "invite_only", label: "Invite only", desc: "Only creators you invite" },
];

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

type Deliverable = {
  platform: string;
  type: string;
  minDurationSeconds?: number;
  quantity: number;
};

type AvailabilityWindow = {
  dayOfWeek: number[];
  startTime: string;
  endTime: string;
};

const STEPS = [
  "What you provide",
  "Content requirements",
  "Availability",
  "Visibility & publish",
];

export default function NewOfferPage() {
  const router = useRouter();
  const createOffer = useMutation(api.offers.create);
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Step 1: What you provide
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [compensationType, setCompensationType] = useState("barter");
  const [barterDescription, setBarterDescription] = useState("");
  const [barterRetailValue, setBarterRetailValue] = useState("");
  const [cashAmount, setCashAmount] = useState("");
  const [exclusions, setExclusions] = useState("");
  const [partySize, setPartySize] = useState("");

  // Step 2: Content requirements
  const [contentTier, setContentTier] = useState(1);
  const [deliverables, setDeliverables] = useState<Deliverable[]>([
    { platform: "instagram", type: "Story", quantity: 1 },
  ]);
  const [contentWindowHours, setContentWindowHours] = useState("48");
  const [persistenceDays, setPersistenceDays] = useState("7");
  const [creativeDirection, setCreativeDirection] = useState("");
  const [requiredTags, setRequiredTags] = useState("");
  const [requiredHashtags, setRequiredHashtags] = useState("");
  const [requireLocationTag, setRequireLocationTag] = useState(true);
  const [usageRights, setUsageRights] = useState("repost_with_credit");

  // Step 3: Availability
  const [availabilityWindows, setAvailabilityWindows] = useState<
    AvailabilityWindow[]
  >([{ dayOfWeek: [1, 2, 3, 4, 5], startTime: "10:00", endTime: "20:00" }]);
  const [maxRedemptionsPerWeek, setMaxRedemptionsPerWeek] = useState("5");

  // Step 4: Visibility
  const [visibility, setVisibility] = useState("open");
  const [minTrustTier, setMinTrustTier] = useState("");
  const [publishNow, setPublishNow] = useState(true);

  function canAdvance(): boolean {
    if (step === 0) {
      return !!(title && description && category && barterRetailValue);
    }
    if (step === 1) {
      return deliverables.length > 0;
    }
    if (step === 2) {
      return availabilityWindows.length > 0;
    }
    return true;
  }

  function addDeliverable() {
    setDeliverables([
      ...deliverables,
      { platform: "instagram", type: "Story", quantity: 1 },
    ]);
  }

  function updateDeliverable(index: number, field: string, value: string | number) {
    const updated = [...deliverables];
    (updated[index] as Record<string, string | number | undefined>)[field] = value;
    // Reset type when platform changes
    if (field === "platform") {
      updated[index].type = CONTENT_TYPES[value][0];
    }
    setDeliverables(updated);
  }

  function removeDeliverable(index: number) {
    setDeliverables(deliverables.filter((_, i) => i !== index));
  }

  function toggleDay(windowIndex: number, day: number) {
    const updated = [...availabilityWindows];
    const days = updated[windowIndex].dayOfWeek;
    if (days.includes(day)) {
      updated[windowIndex].dayOfWeek = days.filter((d) => d !== day);
    } else {
      updated[windowIndex].dayOfWeek = [...days, day].sort();
    }
    setAvailabilityWindows(updated);
  }

  async function handleSubmit() {
    setSubmitting(true);
    try {
      await createOffer({
        title,
        description,
        category,
        compensationType,
        barterDescription: barterDescription || undefined,
        barterRetailValue: parseFloat(barterRetailValue) || 0,
        cashAmount: cashAmount ? parseFloat(cashAmount) : undefined,
        exclusions: exclusions || undefined,
        partySize: partySize ? parseInt(partySize) : undefined,
        contentTier,
        deliverables,
        contentWindowHours: parseInt(contentWindowHours) || 48,
        persistenceDays: parseInt(persistenceDays) || 7,
        creativeDirection: creativeDirection || undefined,
        requiredTags: requiredTags
          ? requiredTags.split(",").map((t) => t.trim())
          : [],
        requiredHashtags: requiredHashtags
          ? requiredHashtags.split(",").map((h) => h.trim())
          : [],
        requireLocationTag,
        usageRights,
        availabilityWindows,
        maxRedemptionsPerWeek: parseInt(maxRedemptionsPerWeek) || 5,
        visibility,
        minTrustTier: minTrustTier || undefined,
        state: publishNow ? "active" : "draft",
      });
      router.push("/dashboard/offers");
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-2xl">
      <Link
        href="/dashboard/offers"
        className="inline-flex items-center gap-1 text-sm text-neutral-500 hover:text-neutral-700 mb-4"
      >
        <ArrowLeft size={14} /> Back to offers
      </Link>

      <h1 className="font-serif text-3xl text-neutral-800 mb-1">
        Create new offer
      </h1>
      <p className="text-neutral-500 mb-6">
        Set up what you're offering and what content you expect in return.
      </p>

      {/* Step indicator */}
      <div className="flex items-center gap-2 mb-8">
        {STEPS.map((label, i) => (
          <div key={label} className="flex items-center gap-2">
            <button
              onClick={() => i < step && setStep(i)}
              className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full transition-colors ${
                i === step
                  ? "bg-primary-500 text-white"
                  : i < step
                    ? "bg-secondary-100 text-secondary-700 cursor-pointer"
                    : "bg-neutral-100 text-neutral-400"
              }`}
            >
              {i < step ? <Check size={12} /> : null}
              {label}
            </button>
            {i < STEPS.length - 1 && (
              <div className="w-6 h-px bg-neutral-200" />
            )}
          </div>
        ))}
      </div>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-800 flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError("")} className="text-red-600 hover:text-red-800 font-medium text-xs">Dismiss</button>
        </div>
      )}

      {/* Step 1: What you provide */}
      {step === 0 && (
        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Offer title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Complimentary dinner for two"
              className="w-full border border-neutral-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Description *
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Describe what the creator will receive..."
              className="w-full border border-neutral-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Category *
            </label>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                    category === cat
                      ? "bg-primary-500 text-white"
                      : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
                  }`}
                >
                  {CATEGORY_LABELS[cat]}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Compensation type
            </label>
            <div className="flex gap-3">
              {["barter", "cash", "hybrid"].map((type) => (
                <button
                  key={type}
                  onClick={() => setCompensationType(type)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
                    compensationType === type
                      ? "border-primary-500 bg-primary-50 text-primary-600"
                      : "border-neutral-200 text-neutral-600 hover:border-neutral-300"
                  }`}
                >
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {(compensationType === "barter" || compensationType === "hybrid") && (
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                What are you offering?
              </label>
              <input
                type="text"
                value={barterDescription}
                onChange={(e) => setBarterDescription(e.target.value)}
                placeholder="e.g., Dinner for two (up to $150), including drinks"
                className="w-full border border-neutral-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
              />
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Retail value ($) *
              </label>
              <input
                type="number"
                value={barterRetailValue}
                onChange={(e) => setBarterRetailValue(e.target.value)}
                placeholder="150"
                className="w-full border border-neutral-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
              />
            </div>
            {(compensationType === "cash" || compensationType === "hybrid") && (
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Cash amount ($)
                </label>
                <input
                  type="number"
                  value={cashAmount}
                  onChange={(e) => setCashAmount(e.target.value)}
                  placeholder="50"
                  className="w-full border border-neutral-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                />
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Exclusions
            </label>
            <input
              type="text"
              value={exclusions}
              onChange={(e) => setExclusions(e.target.value)}
              placeholder="e.g., Alcohol not included, max $150 bill"
              className="w-full border border-neutral-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Party size
            </label>
            <input
              type="number"
              value={partySize}
              onChange={(e) => setPartySize(e.target.value)}
              placeholder="2"
              className="w-32 border border-neutral-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
            />
          </div>
        </div>
      )}

      {/* Step 2: Content requirements */}
      {step === 1 && (
        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Content tier
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[1, 2, 3, 4].map((tier) => (
                <button
                  key={tier}
                  onClick={() => setContentTier(tier)}
                  className={`p-3 rounded-lg border text-center transition-colors ${
                    contentTier === tier
                      ? "border-primary-500 bg-primary-50"
                      : "border-neutral-200 hover:border-neutral-300"
                  }`}
                >
                  <p className="font-bold text-lg text-neutral-800">{tier}</p>
                  <p className="text-xs text-neutral-500">
                    {tier === 1
                      ? "Basic"
                      : tier === 2
                        ? "Standard"
                        : tier === 3
                          ? "Premium"
                          : "Elite"}
                  </p>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Deliverables
            </label>
            <div className="space-y-3">
              {deliverables.map((d, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 bg-neutral-50 rounded-lg p-3"
                >
                  <select
                    value={d.platform}
                    onChange={(e) =>
                      updateDeliverable(i, "platform", e.target.value)
                    }
                    className="border border-neutral-200 rounded-md px-2 py-1.5 text-sm bg-white"
                  >
                    {PLATFORMS.map((p) => (
                      <option key={p} value={p}>
                        {p.charAt(0).toUpperCase() + p.slice(1)}
                      </option>
                    ))}
                  </select>
                  <select
                    value={d.type}
                    onChange={(e) =>
                      updateDeliverable(i, "type", e.target.value)
                    }
                    className="border border-neutral-200 rounded-md px-2 py-1.5 text-sm bg-white"
                  >
                    {CONTENT_TYPES[d.platform].map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                  <div className="flex items-center gap-1">
                    <span className="text-xs text-neutral-500">Qty:</span>
                    <input
                      type="number"
                      min={1}
                      value={d.quantity}
                      onChange={(e) =>
                        updateDeliverable(
                          i,
                          "quantity",
                          parseInt(e.target.value) || 1
                        )
                      }
                      className="w-14 border border-neutral-200 rounded-md px-2 py-1.5 text-sm text-center"
                    />
                  </div>
                  {deliverables.length > 1 && (
                    <button
                      onClick={() => removeDeliverable(i)}
                      className="text-neutral-400 hover:text-error text-sm"
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}
            </div>
            <button
              onClick={addDeliverable}
              className="mt-2 text-sm text-primary-500 hover:text-primary-600 font-medium"
            >
              + Add deliverable
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Content window (hours)
              </label>
              <input
                type="number"
                value={contentWindowHours}
                onChange={(e) => setContentWindowHours(e.target.value)}
                className="w-full border border-neutral-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
              />
              <p className="text-xs text-neutral-400 mt-1">
                Time to post after visit
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Persistence (days)
              </label>
              <input
                type="number"
                value={persistenceDays}
                onChange={(e) => setPersistenceDays(e.target.value)}
                className="w-full border border-neutral-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
              />
              <p className="text-xs text-neutral-400 mt-1">
                How long content must stay up
              </p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Creative direction
            </label>
            <textarea
              value={creativeDirection}
              onChange={(e) => setCreativeDirection(e.target.value)}
              rows={2}
              placeholder="Any guidance for the creator on how to feature your business..."
              className="w-full border border-neutral-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Required tags
              </label>
              <input
                type="text"
                value={requiredTags}
                onChange={(e) => setRequiredTags(e.target.value)}
                placeholder="@yourbusiness"
                className="w-full border border-neutral-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
              />
              <p className="text-xs text-neutral-400 mt-1">Comma-separated</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Required hashtags
              </label>
              <input
                type="text"
                value={requiredHashtags}
                onChange={(e) => setRequiredHashtags(e.target.value)}
                placeholder="#yourbusiness, #raleigheats"
                className="w-full border border-neutral-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
              />
              <p className="text-xs text-neutral-400 mt-1">Comma-separated</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={requireLocationTag}
                onChange={(e) => setRequireLocationTag(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-neutral-200 peer-focus:outline-none rounded-full peer peer-checked:bg-primary-500 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-full" />
            </label>
            <span className="text-sm text-neutral-700">
              Require location tag
            </span>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Usage rights
            </label>
            <div className="flex gap-2">
              {USAGE_RIGHTS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setUsageRights(opt.value)}
                  className={`px-3 py-1.5 rounded-lg text-sm border transition-colors ${
                    usageRights === opt.value
                      ? "border-primary-500 bg-primary-50 text-primary-600"
                      : "border-neutral-200 text-neutral-600 hover:border-neutral-300"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Step 3: Availability */}
      {step === 2 && (
        <div className="space-y-5">
          {availabilityWindows.map((window, wi) => (
            <div
              key={wi}
              className="bg-white border border-neutral-100 rounded-lg p-4"
            >
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-medium text-neutral-700">
                  Availability window {wi + 1}
                </p>
                {availabilityWindows.length > 1 && (
                  <button
                    onClick={() =>
                      setAvailabilityWindows(
                        availabilityWindows.filter((_, i) => i !== wi)
                      )
                    }
                    className="text-xs text-neutral-400 hover:text-error"
                  >
                    Remove
                  </button>
                )}
              </div>
              <div className="flex gap-1 mb-3">
                {DAYS.map((day, di) => (
                  <button
                    key={di}
                    onClick={() => toggleDay(wi, di)}
                    className={`w-10 h-8 rounded-md text-xs font-medium transition-colors ${
                      window.dayOfWeek.includes(di)
                        ? "bg-primary-500 text-white"
                        : "bg-neutral-100 text-neutral-500 hover:bg-neutral-200"
                    }`}
                  >
                    {day}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="time"
                  value={window.startTime}
                  onChange={(e) => {
                    const updated = [...availabilityWindows];
                    updated[wi].startTime = e.target.value;
                    setAvailabilityWindows(updated);
                  }}
                  className="border border-neutral-200 rounded-md px-2 py-1.5 text-sm"
                />
                <span className="text-neutral-400 text-sm">to</span>
                <input
                  type="time"
                  value={window.endTime}
                  onChange={(e) => {
                    const updated = [...availabilityWindows];
                    updated[wi].endTime = e.target.value;
                    setAvailabilityWindows(updated);
                  }}
                  className="border border-neutral-200 rounded-md px-2 py-1.5 text-sm"
                />
              </div>
            </div>
          ))}

          <button
            onClick={() =>
              setAvailabilityWindows([
                ...availabilityWindows,
                {
                  dayOfWeek: [0, 6],
                  startTime: "11:00",
                  endTime: "22:00",
                },
              ])
            }
            className="text-sm text-primary-500 hover:text-primary-600 font-medium"
          >
            + Add availability window
          </button>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Max redemptions per week
            </label>
            <input
              type="number"
              value={maxRedemptionsPerWeek}
              onChange={(e) => setMaxRedemptionsPerWeek(e.target.value)}
              className="w-32 border border-neutral-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
            />
            <p className="text-xs text-neutral-400 mt-1">
              How many creators can redeem this offer each week
            </p>
          </div>
        </div>
      )}

      {/* Step 4: Visibility & publish */}
      {step === 3 && (
        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Who can see this offer?
            </label>
            <div className="space-y-2">
              {VISIBILITY_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setVisibility(opt.value)}
                  className={`w-full text-left px-4 py-3 rounded-lg border transition-colors ${
                    visibility === opt.value
                      ? "border-primary-500 bg-primary-50"
                      : "border-neutral-200 hover:border-neutral-300"
                  }`}
                >
                  <p className="text-sm font-medium text-neutral-800">
                    {opt.label}
                  </p>
                  <p className="text-xs text-neutral-500">{opt.desc}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={publishNow}
                onChange={(e) => setPublishNow(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-neutral-200 peer-focus:outline-none rounded-full peer peer-checked:bg-primary-500 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-full" />
            </label>
            <div>
              <p className="text-sm text-neutral-700 font-medium">
                Publish immediately
              </p>
              <p className="text-xs text-neutral-400">
                {publishNow
                  ? "Offer will be visible to creators right away"
                  : "Offer will be saved as a draft"}
              </p>
            </div>
          </div>

          {/* Summary */}
          <div className="bg-neutral-50 rounded-lg p-4 mt-4">
            <h3 className="text-sm font-medium text-neutral-700 mb-3">
              Summary
            </h3>
            <div className="space-y-1.5 text-sm">
              <p>
                <span className="text-neutral-500">Title:</span>{" "}
                <span className="text-neutral-800">{title || "—"}</span>
              </p>
              <p>
                <span className="text-neutral-500">Value:</span>{" "}
                <span className="text-neutral-800">
                  ${barterRetailValue || "0"}
                </span>
              </p>
              <p>
                <span className="text-neutral-500">Content tier:</span>{" "}
                <span className="text-neutral-800">{contentTier}</span>
              </p>
              <p>
                <span className="text-neutral-500">Deliverables:</span>{" "}
                <span className="text-neutral-800">
                  {deliverables
                    .map((d) => `${d.quantity}x ${d.platform} ${d.type}`)
                    .join(", ")}
                </span>
              </p>
              <p>
                <span className="text-neutral-500">Visibility:</span>{" "}
                <span className="text-neutral-800">
                  {VISIBILITY_OPTIONS.find((v) => v.value === visibility)
                    ?.label ?? visibility}
                </span>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Navigation buttons */}
      <div className="flex items-center justify-between mt-8 pt-6 border-t border-neutral-100">
        <button
          onClick={() => step > 0 && setStep(step - 1)}
          className={`inline-flex items-center gap-1 text-sm font-medium ${
            step > 0
              ? "text-neutral-600 hover:text-neutral-800"
              : "text-neutral-300 cursor-not-allowed"
          }`}
          disabled={step === 0}
        >
          <ArrowLeft size={14} /> Back
        </button>

        {step < STEPS.length - 1 ? (
          <button
            onClick={() => canAdvance() && setStep(step + 1)}
            disabled={!canAdvance()}
            className={`inline-flex items-center gap-1 px-5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              canAdvance()
                ? "bg-primary-500 text-white hover:bg-primary-600"
                : "bg-neutral-200 text-neutral-400 cursor-not-allowed"
            }`}
          >
            Continue <ArrowRight size={14} />
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="inline-flex items-center gap-1 px-5 py-2.5 rounded-lg text-sm font-medium bg-primary-500 text-white hover:bg-primary-600 transition-colors disabled:opacity-50"
          >
            {submitting ? "Creating..." : publishNow ? "Publish offer" : "Save draft"}
          </button>
        )}
      </div>
    </div>
  );
}
