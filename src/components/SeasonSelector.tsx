import type { Season } from '../types';

interface Props {
  seasons: Season[];
  currentId: string;
  onChange: (id: string) => void;
}

export default function SeasonSelector({ seasons, currentId, onChange }: Props) {
  const sorted = [...seasons].sort((a, b) => b.year - a.year);

  return (
    <select
      value={currentId}
      onChange={e => onChange(e.target.value)}
      className="appearance-none bg-snfc-navy text-snfc-gold border border-snfc-gold px-3 py-1.5 text-sm font-display uppercase tracking-wider cursor-pointer focus:outline-none"
      style={{ fontFamily: 'Oswald, Arial Narrow, sans-serif' }}
    >
      {sorted.map(s => (
        <option key={s.id} value={s.id} className="bg-snfc-navy text-snfc-gold">
          {s.label}{s.isActive ? ' ★' : ''}
        </option>
      ))}
    </select>
  );
}
