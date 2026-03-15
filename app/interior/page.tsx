'use client';

import { useState } from 'react';
import { Star, Palette, Home, Sparkles, Crown } from 'lucide-react';
import { useAgents } from '@/hooks/useAgents';
import { calculateBudgetEstimate } from '@/lib/calculators';
import { formatCurrency } from '@/lib/formatters';
import QuoteForm from '@/components/forms/QuoteForm';
import type { Agent } from '@/types/index';

type DesignStyle = 'Basic' | 'Standard' | 'Premium' | 'Luxury';

const STYLE_OPTIONS: { value: DesignStyle; label: string; icon: React.ReactNode }[] = [
  { value: 'Basic', label: 'Basic', icon: <Home className="w-4 h-4" /> },
  { value: 'Standard', label: 'Standard', icon: <Palette className="w-4 h-4" /> },
  { value: 'Premium', label: 'Premium', icon: <Sparkles className="w-4 h-4" /> },
  { value: 'Luxury', label: 'Luxury', icon: <Crown className="w-4 h-4" /> },
];

function isInteriorDesigner(agent: Agent): boolean {
  const s = agent.specialty.toLowerCase();
  return s.includes('interior') || s.includes('design');
}

function DesignerCard({ agent }: { agent: Agent }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition hover:shadow-md">
      {/* Portfolio image placeholder */}
      <div className="mb-4 h-36 w-full overflow-hidden rounded-lg bg-gradient-to-br from-indigo-100 to-purple-100">
        {agent.portfolioImage ? (
          <img
            src={agent.portfolioImage}
            alt={`${agent.name} portfolio`}
            className="h-full w-full object-cover"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).style.display = 'none';
            }}
          />
        ) : null}
      </div>

      <h3 className="text-base font-semibold text-gray-900">{agent.name}</h3>
      <p className="mt-0.5 text-sm text-gray-500">{agent.agency}</p>
      <p className="mt-1 text-xs font-medium text-indigo-600">{agent.specialty}</p>

      {/* Rating */}
      <div className="mt-3 flex items-center gap-1">
        <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
        <span className="text-sm font-medium text-gray-700">{agent.rating.toFixed(1)}</span>
      </div>
    </div>
  );
}

export default function InteriorPage() {
  const { agents, loading } = useAgents();

  // Filter to interior/design specialists; fall back to all agents if none match
  const designers = agents.filter(isInteriorDesigner);
  const displayedDesigners = designers.length > 0 ? designers : agents;

  // Budget estimator state
  const [roomCount, setRoomCount] = useState<number>(2);
  const [style, setStyle] = useState<DesignStyle>('Standard');

  const estimate = calculateBudgetEstimate(roomCount, style);

  return (
    <main className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="mx-auto max-w-6xl space-y-14">

        {/* Page header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-gray-900">Interior Design Services</h1>
          <p className="mx-auto max-w-xl text-gray-500">
            Transform your new home with our trusted design partners. Browse portfolios, estimate
            your budget, and get an instant quote.
          </p>
        </div>

        {/* Designer card grid */}
        <section aria-labelledby="designers-heading">
          <h2 id="designers-heading" className="mb-6 text-xl font-semibold text-gray-800">
            Our Design Partners
          </h2>

          {loading ? (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className="h-56 animate-pulse rounded-xl bg-gray-200"
                />
              ))}
            </div>
          ) : displayedDesigners.length === 0 ? (
            <p className="text-gray-500">No designers available at the moment.</p>
          ) : (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {displayedDesigners.map((agent) => (
                <DesignerCard key={agent.id} agent={agent} />
              ))}
            </div>
          )}
        </section>

        <hr className="border-gray-200" />

        {/* Budget estimator */}
        <section aria-labelledby="estimator-heading">
          <h2 id="estimator-heading" className="mb-2 text-xl font-semibold text-gray-800">
            Budget Estimator
          </h2>
          <p className="mb-6 text-sm text-gray-500">
            Get a rough cost range based on the number of rooms and your preferred style.
          </p>

          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              {/* Room count */}
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="room-count"
                  className="text-sm font-medium text-gray-700"
                >
                  Number of Rooms
                </label>
                <input
                  id="room-count"
                  type="number"
                  min={1}
                  value={roomCount}
                  onChange={(e) => {
                    const val = parseInt(e.target.value, 10);
                    if (!isNaN(val) && val >= 1) setRoomCount(val);
                  }}
                  className="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none transition focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Style preference */}
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="design-style"
                  className="text-sm font-medium text-gray-700"
                >
                  Style Preference
                </label>
                <select
                  id="design-style"
                  value={style}
                  onChange={(e) => setStyle(e.target.value as DesignStyle)}
                  className="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none transition focus:ring-2 focus:ring-indigo-500"
                >
                  {STYLE_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Cost range result */}
            <div className="mt-6 rounded-lg bg-indigo-50 px-5 py-4">
              <p className="text-sm text-indigo-700 font-medium">Estimated Cost Range</p>
              <p className="mt-1 text-2xl font-bold text-indigo-900">
                {formatCurrency(estimate.min)}{' '}
                <span className="text-lg font-semibold text-indigo-600">–</span>{' '}
                {formatCurrency(estimate.max)}
              </p>
              <p className="mt-1 text-xs text-indigo-500">
                For {roomCount} room{roomCount !== 1 ? 's' : ''} · {style} style
              </p>
            </div>
          </div>
        </section>

        <hr className="border-gray-200" />

        {/* Instant quote form */}
        <section aria-labelledby="quote-heading">
          <h2 id="quote-heading" className="mb-2 text-xl font-semibold text-gray-800">
            Get an Instant Quote
          </h2>
          <p className="mb-6 text-sm text-gray-500">
            Fill in your details and our team will reach out with a personalised quote.
          </p>
          <div className="mx-auto max-w-md rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <QuoteForm />
          </div>
        </section>

      </div>
    </main>
  );
}
