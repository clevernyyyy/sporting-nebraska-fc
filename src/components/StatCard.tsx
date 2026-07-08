interface StatCardProps {
  label: string;
  value: string | number;
  sub?: string;
  invert?: boolean;
}

export default function StatCard({ label, value, sub, invert }: StatCardProps) {
  return (
    <div className={`p-4 border-l-2 border-snfc-gold ${invert ? 'bg-snfc-navy text-white' : 'bg-white'}`}>
      <div
        className={`text-4xl font-display font-bold leading-none mb-1 ${invert ? 'text-snfc-gold' : 'text-snfc-navy'}`}
        style={{ fontFamily: 'Oswald, Arial Narrow, sans-serif' }}
      >
        {value}
      </div>
      <div className={`text-xs font-semibold uppercase tracking-widest ${invert ? 'text-white/50' : 'text-gray-400'}`}>
        {label}
      </div>
      {sub && (
        <div className={`text-xs mt-0.5 ${invert ? 'text-white/30' : 'text-gray-400'}`}>{sub}</div>
      )}
    </div>
  );
}
