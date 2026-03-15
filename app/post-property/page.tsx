'use client';

import { useState, useRef, ChangeEvent, FormEvent } from 'react';
import { Upload, X } from 'lucide-react';
import type { Property, PropertyType, FurnishingStatus } from '@/types/index';
import { addProperty } from '@/services/propertyService';
import PropertyCard from '@/components/property/PropertyCard';

// ─── Types ────────────────────────────────────────────────────────────────────

interface FormFields {
  title: string;
  type: PropertyType | '';
  bhk: string;
  price: string;
  area: string;
  city: string;
  locality: string;
  description: string;
  amenities: string;
  furnishing: FurnishingStatus | '';
  possessionDate: string;
}

type FormErrors = Partial<Record<keyof FormFields, string>>;

const REQUIRED_FIELDS: (keyof FormFields)[] = [
  'title', 'type', 'bhk', 'price', 'area', 'city', 'locality', 'description',
];

const PROPERTY_TYPES: PropertyType[] = ['Apartment', 'Villa', 'Plot', 'Commercial', 'PG'];
const FURNISHING_OPTIONS: FurnishingStatus[] = ['Furnished', 'Semi-Furnished', 'Unfurnished'];

// ─── Validation ───────────────────────────────────────────────────────────────

function validate(fields: FormFields): FormErrors {
  const errors: FormErrors = {};
  for (const key of REQUIRED_FIELDS) {
    const val = fields[key].toString().trim();
    if (!val) {
      errors[key] = `${fieldLabel(key)} is required`;
    }
  }
  if (fields.bhk && (isNaN(Number(fields.bhk)) || Number(fields.bhk) < 1)) {
    errors.bhk = 'BHK must be a positive number';
  }
  if (fields.price && (isNaN(Number(fields.price)) || Number(fields.price) <= 0)) {
    errors.price = 'Price must be a positive number';
  }
  if (fields.area && (isNaN(Number(fields.area)) || Number(fields.area) <= 0)) {
    errors.area = 'Area must be a positive number';
  }
  return errors;
}

function fieldLabel(key: keyof FormFields): string {
  const labels: Record<keyof FormFields, string> = {
    title: 'Title',
    type: 'Property Type',
    bhk: 'BHK',
    price: 'Price',
    area: 'Area',
    city: 'City',
    locality: 'Locality',
    description: 'Description',
    amenities: 'Amenities',
    furnishing: 'Furnishing',
    possessionDate: 'Possession Date',
  };
  return labels[key];
}

// ─── Initial State ────────────────────────────────────────────────────────────

const INITIAL_FIELDS: FormFields = {
  title: '',
  type: '',
  bhk: '',
  price: '',
  area: '',
  city: '',
  locality: '',
  description: '',
  amenities: '',
  furnishing: '',
  possessionDate: '',
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function PostPropertyPage() {
  const [fields, setFields] = useState<FormFields>(INITIAL_FIELDS);
  const [errors, setErrors] = useState<FormErrors>({});
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [submittedProperty, setSubmittedProperty] = useState<Property | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleChange(
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) {
    const { name, value } = e.target;
    setFields((prev) => ({ ...prev, [name]: value }));
    // Clear error on change
    if (errors[name as keyof FormFields]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  }

  function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
  }

  function clearPhoto() {
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const validationErrors = validate(fields);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    const newProperty: Property = {
      id: `prop-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      title: fields.title.trim(),
      type: fields.type as PropertyType,
      bhk: Number(fields.bhk),
      price: Number(fields.price),
      area: Number(fields.area),
      city: fields.city.trim(),
      locality: fields.locality.trim(),
      location: `${fields.locality.trim()}, ${fields.city.trim()}`,
      description: fields.description.trim(),
      amenities: fields.amenities
        ? fields.amenities.split(',').map((a) => a.trim()).filter(Boolean)
        : [],
      furnishing: (fields.furnishing as FurnishingStatus) || 'Unfurnished',
      possessionStatus: 'Ready to Move',
      images: [previewUrl || '/images/placeholder.jpg'],
      badges: [],
      postedAt: new Date().toISOString(),
      propertyAge: 0,
      sellerType: 'Owner',
    };

    addProperty(newProperty);
    setSubmittedProperty(newProperty);
    setFields(INITIAL_FIELDS);
    setErrors({});
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  return (
    <main className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Post Your Property</h1>
        <p className="text-gray-500 mb-8 text-sm">
          Fill in the details below to list your property on the marketplace.
        </p>

        {/* Success preview */}
        {submittedProperty && (
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-green-600 font-semibold text-sm">
                ✓ Property listed successfully! Here&apos;s your preview:
              </span>
            </div>
            <PropertyCard property={submittedProperty} />
            <button
              onClick={() => setSubmittedProperty(null)}
              className="mt-4 text-sm text-blue-600 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-400 rounded"
            >
              Post another property
            </button>
          </div>
        )}

        {!submittedProperty && (
          <form onSubmit={handleSubmit} noValidate className="space-y-6 bg-white rounded-xl shadow-sm p-6">

            {/* Title */}
            <Field label="Property Title" required error={errors.title}>
              <input
                type="text"
                name="title"
                value={fields.title}
                onChange={handleChange}
                placeholder="e.g. Spacious 3BHK in Bandra West"
                className={inputClass(!!errors.title)}
              />
            </Field>

            {/* Type + BHK row */}
            <div className="grid grid-cols-2 gap-4">
              <Field label="Property Type" required error={errors.type}>
                <select
                  name="type"
                  value={fields.type}
                  onChange={handleChange}
                  className={inputClass(!!errors.type)}
                >
                  <option value="">Select type</option>
                  {PROPERTY_TYPES.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </Field>

              <Field label="BHK" required error={errors.bhk}>
                <input
                  type="number"
                  name="bhk"
                  value={fields.bhk}
                  onChange={handleChange}
                  min={1}
                  max={10}
                  placeholder="e.g. 3"
                  className={inputClass(!!errors.bhk)}
                />
              </Field>
            </div>

            {/* Price + Area row */}
            <div className="grid grid-cols-2 gap-4">
              <Field label="Price (₹)" required error={errors.price}>
                <input
                  type="number"
                  name="price"
                  value={fields.price}
                  onChange={handleChange}
                  min={1}
                  placeholder="e.g. 5000000"
                  className={inputClass(!!errors.price)}
                />
              </Field>

              <Field label="Area (sq ft)" required error={errors.area}>
                <input
                  type="number"
                  name="area"
                  value={fields.area}
                  onChange={handleChange}
                  min={1}
                  placeholder="e.g. 1200"
                  className={inputClass(!!errors.area)}
                />
              </Field>
            </div>

            {/* City + Locality row */}
            <div className="grid grid-cols-2 gap-4">
              <Field label="City" required error={errors.city}>
                <input
                  type="text"
                  name="city"
                  value={fields.city}
                  onChange={handleChange}
                  placeholder="e.g. Mumbai"
                  className={inputClass(!!errors.city)}
                />
              </Field>

              <Field label="Locality" required error={errors.locality}>
                <input
                  type="text"
                  name="locality"
                  value={fields.locality}
                  onChange={handleChange}
                  placeholder="e.g. Bandra West"
                  className={inputClass(!!errors.locality)}
                />
              </Field>
            </div>

            {/* Description */}
            <Field label="Description" required error={errors.description}>
              <textarea
                name="description"
                value={fields.description}
                onChange={handleChange}
                rows={4}
                placeholder="Describe your property..."
                className={inputClass(!!errors.description)}
              />
            </Field>

            {/* Amenities */}
            <Field label="Amenities" error={errors.amenities} hint="Comma-separated, e.g. Gym, Pool, Parking">
              <input
                type="text"
                name="amenities"
                value={fields.amenities}
                onChange={handleChange}
                placeholder="Gym, Swimming Pool, Parking"
                className={inputClass(false)}
              />
            </Field>

            {/* Furnishing + Possession Date row */}
            <div className="grid grid-cols-2 gap-4">
              <Field label="Furnishing Status" error={errors.furnishing}>
                <select
                  name="furnishing"
                  value={fields.furnishing}
                  onChange={handleChange}
                  className={inputClass(false)}
                >
                  <option value="">Select furnishing</option>
                  {FURNISHING_OPTIONS.map((f) => (
                    <option key={f} value={f}>{f}</option>
                  ))}
                </select>
              </Field>

              <Field label="Possession Date" error={errors.possessionDate}>
                <input
                  type="date"
                  name="possessionDate"
                  value={fields.possessionDate}
                  onChange={handleChange}
                  className={inputClass(false)}
                />
              </Field>
            </div>

            {/* Photo Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Property Photo
              </label>
              <div className="flex items-start gap-4">
                <label
                  htmlFor="photo-upload"
                  className="flex flex-col items-center justify-center w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors focus-within:ring-2 focus-within:ring-blue-400"
                >
                  <Upload size={20} className="text-gray-400 mb-1" />
                  <span className="text-xs text-gray-500 text-center px-2">Click to upload</span>
                  <input
                    id="photo-upload"
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="sr-only"
                  />
                </label>

                {previewUrl && (
                  <div className="relative w-32 h-32 rounded-lg overflow-hidden border border-gray-200">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={previewUrl}
                      alt="Property preview"
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={clearPhoto}
                      aria-label="Remove photo"
                      className="absolute top-1 right-1 bg-white rounded-full p-0.5 shadow hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-400"
                    >
                      <X size={14} className="text-gray-600" />
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="w-full py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-colors"
            >
              Post Property
            </button>
          </form>
        )}
      </div>
    </main>
  );
}

// ─── Helper Components ────────────────────────────────────────────────────────

function Field({
  label,
  required,
  error,
  hint,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
      {hint && !error && <p className="mt-1 text-xs text-gray-400">{hint}</p>}
      {error && (
        <p role="alert" className="mt-1 text-xs text-red-500">
          {error}
        </p>
      )}
    </div>
  );
}

function inputClass(hasError: boolean): string {
  return [
    'w-full rounded-lg border px-3 py-2 text-sm text-gray-900 placeholder-gray-400',
    'focus:outline-none focus:ring-2 focus:ring-blue-400 transition-colors',
    hasError ? 'border-red-400 bg-red-50' : 'border-gray-300 bg-white',
  ].join(' ');
}
