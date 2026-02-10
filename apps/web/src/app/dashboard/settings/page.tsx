"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { Save, Building2, MapPin, Globe, Instagram, CreditCard, CheckCircle, Link2, Unlink } from "lucide-react";
import { CATEGORIES } from "@/lib/constants";
import LoadingState from "@/components/ui/LoadingState";

const INPUT_CLASS =
  "w-full px-3 py-2.5 border border-neutral-200 rounded-lg text-sm text-neutral-800 font-sans outline-none transition-colors focus:border-secondary-500 focus:ring-2 focus:ring-secondary-500/10 placeholder:text-neutral-300";

export default function SettingsPage() {
  const business = useQuery(api.businesses.getCurrent);
  const paymentStatus = useQuery(api.payments.getBusinessPaymentStatus);
  const updateBusiness = useMutation(api.businesses.update);
  const createStripeAccount = useMutation(api.payments.createBusinessStripeAccount);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState("");

  const [form, setForm] = useState({
    name: "",
    category: "",
    description: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    instagramHandle: "",
    website: "",
    googleBusinessUrl: "",
  });

  // Populate form when business data loads
  useEffect(() => {
    if (business) {
      setForm({
        name: business.name ?? "",
        category: business.category ?? "",
        description: business.description ?? "",
        address: business.address ?? "",
        city: business.city ?? "",
        state: business.state ?? "",
        zipCode: business.zipCode ?? "",
        instagramHandle: business.instagramHandle ?? "",
        website: business.website ?? "",
        googleBusinessUrl: business.googleBusinessUrl ?? "",
      });
    }
  }, [business]);

  async function handleSave() {
    setSaving(true);
    setSaveError("");
    try {
      await updateBusiness({
        name: form.name || undefined,
        category: form.category || undefined,
        description: form.description || undefined,
        address: form.address || undefined,
        city: form.city || undefined,
        state: form.state || undefined,
        zipCode: form.zipCode || undefined,
        instagramHandle: form.instagramHandle || undefined,
        website: form.website || undefined,
        googleBusinessUrl: form.googleBusinessUrl || undefined,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err: any) {
      setSaveError(err.message ?? "Failed to save changes");
    } finally {
      setSaving(false);
    }
  }

  if (!business) {
    return <LoadingState />;
  }

  return (
    <div className="max-w-2xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-serif text-3xl text-neutral-800">Settings</h1>
          <p className="text-neutral-500 mt-1">
            Manage your business profile and preferences.
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 bg-primary-500 text-white px-5 py-2.5 rounded-lg font-medium text-sm hover:bg-primary-600 disabled:opacity-50 transition-colors"
        >
          <Save size={16} strokeWidth={1.5} />
          {saving ? "Saving..." : saved ? "Saved!" : "Save changes"}
        </button>
      </div>

      {saveError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-6">
          <p className="text-sm text-red-600">{saveError}</p>
        </div>
      )}

      {/* Business Info */}
      <Section
        icon={<Building2 size={18} strokeWidth={1.5} className="text-secondary-500" />}
        title="Business information"
      >
        <Field label="Business name">
          <input
            type="text"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className={INPUT_CLASS}
          />
        </Field>
        <Field label="Category">
          <select
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
            className={INPUT_CLASS}
          >
            <option value="">Select category</option>
            {CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Description">
          <textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            rows={3}
            className={`${INPUT_CLASS} resize-none`}
            placeholder="Tell creators about your business..."
          />
        </Field>
      </Section>

      {/* Location */}
      <Section
        icon={<MapPin size={18} strokeWidth={1.5} className="text-primary-500" />}
        title="Location"
      >
        <Field label="Street address">
          <input
            type="text"
            value={form.address}
            onChange={(e) => setForm({ ...form, address: e.target.value })}
            className={INPUT_CLASS}
          />
        </Field>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Field label="City">
            <input
              type="text"
              value={form.city}
              onChange={(e) => setForm({ ...form, city: e.target.value })}
              className={INPUT_CLASS}
            />
          </Field>
          <Field label="State">
            <input
              type="text"
              value={form.state}
              onChange={(e) => setForm({ ...form, state: e.target.value })}
              className={INPUT_CLASS}
              maxLength={2}
              placeholder="TX"
            />
          </Field>
          <Field label="ZIP">
            <input
              type="text"
              value={form.zipCode}
              onChange={(e) => setForm({ ...form, zipCode: e.target.value })}
              className={INPUT_CLASS}
              maxLength={5}
            />
          </Field>
        </div>
      </Section>

      {/* Online presence */}
      <Section
        icon={<Globe size={18} strokeWidth={1.5} className="text-blue-500" />}
        title="Online presence"
      >
        <Field label="Instagram handle">
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 text-sm">
              @
            </span>
            <input
              type="text"
              value={form.instagramHandle}
              onChange={(e) =>
                setForm({ ...form, instagramHandle: e.target.value })
              }
              className={`${INPUT_CLASS} pl-7`}
              placeholder="yourbusiness"
            />
          </div>
        </Field>
        <Field label="Website">
          <input
            type="url"
            value={form.website}
            onChange={(e) => setForm({ ...form, website: e.target.value })}
            className={INPUT_CLASS}
            placeholder="https://yourbusiness.com"
          />
        </Field>
        <Field label="Google Business URL">
          <input
            type="url"
            value={form.googleBusinessUrl}
            onChange={(e) =>
              setForm({ ...form, googleBusinessUrl: e.target.value })
            }
            className={INPUT_CLASS}
            placeholder="https://g.page/yourbusiness"
          />
        </Field>
      </Section>

      {/* Connected Accounts */}
      <Section
        icon={<Link2 size={18} strokeWidth={1.5} className="text-pink-500" />}
        title="Connected accounts"
      >
        <div className="flex items-center justify-between bg-neutral-50 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <Instagram size={20} strokeWidth={1.5} className="text-pink-500" />
            <div>
              <p className="text-sm font-medium text-neutral-800">Instagram</p>
              {business.instagramConnected && business.instagramHandle ? (
                <p className="text-xs text-neutral-500">
                  @{business.instagramHandle} &middot; Connected
                </p>
              ) : (
                <p className="text-xs text-neutral-400">Not connected</p>
              )}
            </div>
          </div>
          {business.instagramConnected ? (
            <div className="flex items-center gap-2">
              <CheckCircle size={16} strokeWidth={1.5} className="text-green-500" />
              <span className="text-xs text-green-600 font-medium">Verified</span>
            </div>
          ) : (
            <button
              disabled
              title="OAuth connection requires Meta App Review. Use manual handle entry above."
              className="flex items-center gap-1.5 text-xs font-medium text-neutral-400 border border-neutral-200 rounded-md px-3 py-1.5 cursor-not-allowed"
            >
              <Link2 size={14} strokeWidth={1.5} />
              Connect
            </button>
          )}
        </div>
        <p className="text-xs text-neutral-400 mt-2">
          Instagram OAuth requires Meta App Review. Manual handle entry is available in the Online Presence section above.
        </p>
      </Section>

      {/* Payments */}
      <Section
        icon={<CreditCard size={18} strokeWidth={1.5} className="text-green-500" />}
        title="Payments & billing"
      >
        {paymentStatus?.hasStripeAccount ? (
          <div className="flex items-center gap-3 bg-green-50 rounded-lg p-4">
            <CheckCircle size={20} strokeWidth={1.5} className="text-green-600" />
            <div>
              <p className="text-sm font-medium text-green-800">Stripe connected</p>
              <p className="text-xs text-green-600 mt-0.5">
                Platform fee: {paymentStatus.feeRate}% per deal
                {paymentStatus.subscriptionTier !== "free" && ` (${paymentStatus.subscriptionTier} tier)`}
              </p>
            </div>
          </div>
        ) : (
          <div>
            <p className="text-sm text-neutral-600 mb-3">
              Connect your Stripe account to accept deposits and receive payouts from deals.
            </p>
            <button
              onClick={() => createStripeAccount({})}
              className="flex items-center gap-2 bg-[#635BFF] text-white px-5 py-2.5 rounded-lg font-medium text-sm hover:bg-[#5851DB] transition-colors"
            >
              <CreditCard size={16} strokeWidth={1.5} />
              Connect with Stripe
            </button>
            <p className="text-xs text-neutral-400 mt-2">
              Stripe integration is in setup mode. Full payments will be enabled when production keys are configured.
            </p>
          </div>
        )}
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-neutral-50 rounded-lg p-3 text-center">
            <p className="text-xs text-neutral-500 font-medium">Plan</p>
            <p className="text-sm font-bold text-neutral-800 mt-1 capitalize">
              {paymentStatus?.subscriptionTier ?? "free"}
            </p>
          </div>
          <div className="bg-neutral-50 rounded-lg p-3 text-center">
            <p className="text-xs text-neutral-500 font-medium">Fee rate</p>
            <p className="text-sm font-bold text-neutral-800 mt-1">
              {paymentStatus?.feeRate ?? 15}%
            </p>
          </div>
          <div className="bg-neutral-50 rounded-lg p-3 text-center">
            <p className="text-xs text-neutral-500 font-medium">Status</p>
            <p className="text-sm font-bold text-neutral-800 mt-1">
              {paymentStatus?.hasStripeAccount ? "Active" : "Setup"}
            </p>
          </div>
        </div>
      </Section>

      {/* Account info (read-only) */}
      <Section
        icon={<Instagram size={18} strokeWidth={1.5} className="text-pink-500" />}
        title="Account stats"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-neutral-50 rounded-lg p-4">
            <p className="text-xs text-neutral-500 font-medium">
              Completed deals
            </p>
            <p className="text-lg font-bold text-neutral-800 mt-1">
              {business.totalCompletedDeals}
            </p>
          </div>
          <div className="bg-neutral-50 rounded-lg p-4">
            <p className="text-xs text-neutral-500 font-medium">
              Creator rating
            </p>
            <p className="text-lg font-bold text-neutral-800 mt-1">
              {business.averageCreatorRating > 0
                ? business.averageCreatorRating.toFixed(1)
                : "--"}
            </p>
          </div>
          <div className="bg-neutral-50 rounded-lg p-4">
            <p className="text-xs text-neutral-500 font-medium">
              Offer accuracy
            </p>
            <p className="text-lg font-bold text-neutral-800 mt-1">
              {Math.round(business.offerAccuracyRate * 100)}%
            </p>
          </div>
          <div className="bg-neutral-50 rounded-lg p-4">
            <p className="text-xs text-neutral-500 font-medium">
              Cancellation rate
            </p>
            <p className="text-lg font-bold text-neutral-800 mt-1">
              {Math.round(business.cancellationRate * 100)}%
            </p>
          </div>
        </div>
      </Section>

    </div>
  );
}

function Section({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white border border-neutral-100 rounded-lg p-6 shadow-sm mb-6">
      <div className="flex items-center gap-2 mb-5">
        {icon}
        <h2 className="font-semibold text-neutral-800">{title}</h2>
      </div>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-neutral-600 mb-1.5">
        {label}
      </label>
      {children}
    </div>
  );
}
