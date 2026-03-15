'use client';

import { useState } from 'react';
import { CheckCircle } from 'lucide-react';
import { useMarketplaceStore } from '@/store/useMarketplaceStore';

interface ContactFormProps {
  propertyId: string;
}

interface FormFields {
  name: string;
  phone: string;
  message: string;
}

interface FormErrors {
  name?: string;
  phone?: string;
  message?: string;
}

function validate(fields: FormFields): FormErrors {
  const errors: FormErrors = {};
  if (!fields.name.trim()) errors.name = 'Name is required.';
  if (!fields.phone.trim()) {
    errors.phone = 'Phone number is required.';
  } else if (!/^\+?[\d\s\-]{7,15}$/.test(fields.phone.trim())) {
    errors.phone = 'Enter a valid phone number.';
  }
  if (!fields.message.trim()) errors.message = 'Message is required.';
  return errors;
}

export default function ContactForm({ propertyId }: ContactFormProps) {
  const recordContact = useMarketplaceStore((s) => s.recordContact);

  const [fields, setFields] = useState<FormFields>({ name: '', phone: '', message: '' });
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Record<keyof FormFields, boolean>>({
    name: false,
    phone: false,
    message: false,
  });
  const [submitted, setSubmitted] = useState(false);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value } = e.target;
    const updated = { ...fields, [name]: value };
    setFields(updated);
    // Re-validate touched fields on change
    if (touched[name as keyof FormFields]) {
      setErrors(validate(updated));
    }
  }

  function handleBlur(e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name } = e.target;
    const updatedTouched = { ...touched, [name]: true };
    setTouched(updatedTouched);
    setErrors(validate(fields));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const allTouched = { name: true, phone: true, message: true };
    setTouched(allTouched);
    const errs = validate(fields);
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;
    recordContact(propertyId);
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="flex flex-col items-center gap-3 py-8 text-center">
        <CheckCircle className="h-12 w-12 text-green-500" />
        <p className="text-lg font-semibold text-gray-800">Message Sent!</p>
        <p className="text-sm text-gray-500">
          The owner has been notified. They will contact you shortly.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
      {/* Name */}
      <div className="flex flex-col gap-1">
        <label htmlFor="contact-name" className="text-sm font-medium text-gray-700">
          Name <span className="text-red-500">*</span>
        </label>
        <input
          id="contact-name"
          name="name"
          type="text"
          value={fields.name}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder="Your full name"
          className={`rounded-lg border px-3 py-2 text-sm outline-none transition focus:ring-2 focus:ring-blue-500 ${
            errors.name && touched.name
              ? 'border-red-400 bg-red-50'
              : 'border-gray-300 bg-white text-gray-900'
          }`}
        />
        {errors.name && touched.name && (
          <p className="text-xs text-red-500">{errors.name}</p>
        )}
      </div>

      {/* Phone */}
      <div className="flex flex-col gap-1">
        <label htmlFor="contact-phone" className="text-sm font-medium text-gray-700">
          Phone <span className="text-red-500">*</span>
        </label>
        <input
          id="contact-phone"
          name="phone"
          type="tel"
          value={fields.phone}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder="+91 XXXXX XXXXX"
          className={`rounded-lg border px-3 py-2 text-sm outline-none transition focus:ring-2 focus:ring-blue-500 ${
            errors.phone && touched.phone
              ? 'border-red-400 bg-red-50'
              : 'border-gray-300 bg-white text-gray-900'
          }`}
        />
        {errors.phone && touched.phone && (
          <p className="text-xs text-red-500">{errors.phone}</p>
        )}
      </div>

      {/* Message */}
      <div className="flex flex-col gap-1">
        <label htmlFor="contact-message" className="text-sm font-medium text-gray-700">
          Message <span className="text-red-500">*</span>
        </label>
        <textarea
          id="contact-message"
          name="message"
          rows={4}
          value={fields.message}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder="I'm interested in this property..."
          className={`resize-none rounded-lg border px-3 py-2 text-sm outline-none transition focus:ring-2 focus:ring-blue-500 ${
            errors.message && touched.message
              ? 'border-red-400 bg-red-50'
              : 'border-gray-300 bg-white text-gray-900'
          }`}
        />
        {errors.message && touched.message && (
          <p className="text-xs text-red-500">{errors.message}</p>
        )}
      </div>

      <button
        type="submit"
        className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      >
        Send Message
      </button>
    </form>
  );
}
