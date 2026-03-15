'use client';

import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import type { LocalityCardProps } from '@/types/index';
import { formatCurrency } from '@/lib/formatters';

export default function LocalityCard({ locality, onClick }: LocalityCardProps) {
  const { name, city, avgPricePerSqft, trend, propertyCount, slug } = locality;

  const TrendIcon =
    trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus;

  const trendColor =
    trend === 'up'
      ? 'text-green-500'
      : trend === 'down'
      ? 'text-red-500'
      : 'text-gray-400';

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onClick?.(slug)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') onClick?.(slug);
      }}
      className="cursor-pointer rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition-all hover:shadow-md hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-blue-500"
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="font-semibold text-gray-900">{name}</h3>
          <p className="text-sm text-gray-500">{city}</p>
        </div>
        <TrendIcon className={`h-5 w-5 shrink-0 ${trendColor}`} aria-label={`Trend: ${trend}`} />
      </div>

      <div className="mt-3 flex items-center justify-between">
        <div>
          <p className="text-xs text-gray-400">Avg price/sq ft</p>
          <p className="font-semibold text-gray-800">{formatCurrency(avgPricePerSqft)}</p>
        </div>
        <p className="text-sm text-gray-500">{propertyCount} properties</p>
      </div>
    </div>
  );
}
