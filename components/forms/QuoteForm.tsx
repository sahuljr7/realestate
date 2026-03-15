'use client';

import { useState } from 'react';
import { CheckCircle } from 'lucide-react';

const INDIAN_CITIES = [
  'Ahmedabad',
  'Bangalore',
  'Chennai',
  'Delhi',
  'Hyderabad',
  'Jaipur',
  'Kolkata',
  'Mumbai',
  'Noida',
  'Pune',
];

interface QuoteFormFields {
  name: string;
  phone: string;
  city: string;
  budget: string;
}

interface QuoteFormErrors {
  name?: string;
  phone?: string;
  city?: string;
  budget?: string;
}

function validate(fields: QuoteFormFields): QuoteFormErrors {
  const errors: QuoteFormErrors = {};

  if (!fields.name.trim()) {
    errors.name = 'Name is required.';
  }

  if (!fields.phone.trim()) {
    errors.phone = 'Phone number is required.';
  } else if (!/^\+?[\d\s\-]{7,15}$/.test(fields.phone.trim())) {
    errors.phone = 'Enter a valid phone number.';
  }

  if (!fields.city.trim()) {
    errors.city = 'City is required.';
  }

  if (!fields.budget.trim()) {
    errors.budget = 'Budget is required.';
  } else if (isNaN(Number(fields.budget)) || Number(fields.budget) <= 0) {
    errors.budget = 'Enter a valid budget amount (in INR).';
  }

  return errors;
}

export default function QuoteForm() {
  const [fields, setFields] = useState<QuoteFormFields>({
    name: '',
    phone: '',
    city: '',
    budget: '',
  });
  const [errors, setErrors] = useState<QuoteFormErrors>({});
  const [touched, setTouched] = useState<Record<keyof QuoteFormFields, boolean>>({
    name: false,
    phone: false,
    city: false,
    budget: false,
  });
  const [submitted, setSubmitted] = useState(false);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value } = e.target;
    const updated = { ...fields, [name]: value };
    setFields(updated);
    if (touched[name as keyof QuoteFormFields]) {
      setErrors(validate(updated));
    }
  }

  function handleBlur(e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    setErrors(validate(fields));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const allTouched: Record<keyof QuoteFormFields, boolean> = {
      name: true,
      phone: true,
      city: true,
      budget: true,
    };
    setTouched(allTouched);
    const errs = validate(fields);
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="flex flex-col items-center gap-3 py-8 text-center">
        <CheckCircle className="h-12 w-12 text-green-500" />
        <p className="text-lg font-semibold text-gray-800">Quote Request Received!</p>
        <p className="text-sm text-gray-500">
          Our interior design team will reach out to you shortly with a personalised quote.
        </p>
      </div>
    );
  }

  const inputClass = (field: keyof QuoteFormFields) =>
    `rounded-lg border px-3 py-2 text-sm outline-none transition focus:ring-2 focus:ring-blue-500 ${
      errors[field] && touched[field]
        ? 'border-red-400 bg-red-50'
        : 'border-gray-300 bg-white'
    }`;

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
      {/* Name */}
      <div className="flex flex-col gap-1">
        <label htmlFor="quote-name" className="text-sm font-medium text-gray-700">
          Name <span className="text-red-500">*</span>
        </label>
        <input
          id="quote-name"
          name="name"
          type="text"
          value={fields.name}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder="Your full name"
          className={inputClass('name')}
        />
        {errors.name && touched.name && (
          <p className="text-xs text-red-500">{errors.name}</p>
        )}
      </div>

      {/* Phone */}
      <div className="flex flex-col gap-1">
        <label htmlFor="quote-phone" className="text-sm font-medium text-gray-700">
          Phone <span className="text-red-500">*</span>
        </label>
        <input
          id="quote-phone"
          name="phone"
          type="tel"
          value={fields.phone}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder="+91 XXXXX XXXXX"
          className={inputClass('phone')}
        />
        {errors.phone && touched.phone && (
          <p className="text-xs text-red-500">{errors.phone}</p>
        )}
      </div>

      {/* City */}
      <div className="flex flex-col gap-1">
        <label htmlFor="quote-city" className="text-sm font-medium text-gray-700">
          City <span className="text-red-500">*</span>
        </label>
        <select
          id="quote-city"
          name="city"
          value={fields.city}
          onChange={handleChange}
          onBlur={handleBlur}
          className={inputClass('city')}
        >
          <option value="">Select your city</option>
          {INDIAN_CITIES.map((city) => (
            <option key={city} value={city}>
              {city}
            </option>
          ))}
        </select>
        {errors.city && touched.city && (
          <p className="text-xs text-red-500">{errors.city}</p>
        )}
      </div>

      {/* Budget */}
      <div className="flex flex-col gap-1">
        <label htmlFor="quote-budget" className="text-sm font-medium text-gray-700">
          Budget (INR) <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-sm text-gray-500">
            ₹
          </span>
          <input
            id="quote-budget"
            name="budget"
            type="number"
            min={1}
            value={fields.budget}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="e.g. 500000"
            className={`w-full pl-7 ${inputClass('budget')}`}
          />
        </div>
        {errors.budget && touched.budget && (
          <p className="text-xs text-red-500">{errors.budget}</p>
        )}
      </div>

      <button
        type="submit"
        className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      >
        Get Instant Quote
      </button>
    </form>
  );
}
