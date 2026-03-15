import type { BadgeProps } from '@/types/index';

const variantClasses: Record<string, string> = {
  new: 'bg-blue-100 text-blue-700',
  featured: 'bg-amber-100 text-amber-700',
  verified: 'bg-green-100 text-green-700',
};

export default function Badge({ label, variant }: BadgeProps) {
  const colorClasses = variantClasses[variant] ?? 'bg-gray-100 text-gray-700';
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${colorClasses}`}>
      {label}
    </span>
  );
}
