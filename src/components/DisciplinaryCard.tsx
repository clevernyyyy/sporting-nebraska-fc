interface Props {
  type: 'yellow' | 'red';
  size?: 'sm' | 'md' | 'lg';
  tilt?: boolean;
}

const SIZES = {
  sm: 'w-3 h-[18px]',
  md: 'w-4 h-[24px]',
  lg: 'w-5 h-[30px]',
};

export default function DisciplinaryCard({ type, size = 'md', tilt = true }: Props) {
  return (
    <span
      className={`inline-block shrink-0 ${SIZES[size]} ${tilt ? 'rotate-[-8deg]' : ''} ${
        type === 'yellow'
          ? 'bg-amber-400 shadow-[1px_1px_2px_rgba(0,0,0,0.35)]'
          : 'bg-red-600 shadow-[1px_1px_2px_rgba(0,0,0,0.35)]'
      }`}
      title={type === 'yellow' ? 'Yellow Card' : 'Red Card'}
      aria-label={type === 'yellow' ? 'Yellow Card' : 'Red Card'}
    />
  );
}
