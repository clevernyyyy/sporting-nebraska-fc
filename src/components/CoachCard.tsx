import type { Coach } from '../types';
import PlayerSilhouette from './PlayerSilhouette';

interface Props {
  coach: Coach;
}

export default function CoachCard({ coach }: Props) {
  return (
    <div className="bg-white border border-gray-200 overflow-hidden">
      {/* Photo or silhouette */}
      <div className="aspect-[3/4] overflow-hidden relative bg-gea-black">
        {coach.photoUrl ? (
          <img
            src={coach.photoUrl}
            alt={coach.name}
            className="w-full h-full object-cover object-top"
          />
        ) : (
          <PlayerSilhouette className="absolute inset-0" />
        )}
        {/* Title badge */}
        <div
          className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent pt-6 pb-2 px-2"
        >
          <div
            className="inline-block bg-gea-gold text-gea-black text-[10px] font-display font-bold px-1.5 py-0.5 uppercase tracking-wider"
            style={{ fontFamily: 'Oswald, Arial Narrow, sans-serif' }}
          >
            {coach.title}
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="p-3 border-t-2 border-gea-gold">
        <div className="font-semibold text-gea-black text-sm leading-tight truncate">
          {coach.name}
        </div>
        <div
          className="text-xs text-gray-400 mt-0.5 font-display uppercase tracking-wider"
          style={{ fontFamily: 'Oswald, Arial Narrow, sans-serif' }}
        >
          {coach.title}
        </div>
      </div>
    </div>
  );
}
