import { Link } from 'react-router-dom';
import type { Player } from '../types';
import { POSITION_FULL, POSITION_GROUP } from '../types';
import PlayerSilhouette from './PlayerSilhouette';

const GROUP_COLORS: Record<string, string> = {
  GK:  'bg-amber-500',
  DEF: 'bg-blue-600',
  MID: 'bg-emerald-600',
  FWD: 'bg-red-600',
};

interface PlayerCardProps {
  player: Player;
  goals?: number;
  assists?: number;
  saves?: number;
}

export default function PlayerCard({ player, goals = 0, assists = 0, saves }: PlayerCardProps) {
  const group = POSITION_GROUP[player.position];
  const groupColor = GROUP_COLORS[group] ?? 'bg-gray-600';

  return (
    <Link
      to={`/players/${player.id}`}
      className="block bg-white border border-gray-200 hover:border-snfc-gold transition-colors group overflow-hidden"
    >
      {/* Photo */}
      <div className="aspect-[3/4] bg-snfc-navy overflow-hidden relative">
        {player.photoUrl ? (
          <img
            src={player.photoUrl}
            alt={player.name}
            className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <PlayerSilhouette />
        )}
        {/* Jersey number */}
        <div
          className="absolute top-0 left-0 bg-snfc-gold text-snfc-navy w-8 h-8 flex items-center justify-center font-display font-bold text-sm leading-none"
          style={{ fontFamily: 'Oswald, Arial Narrow, sans-serif' }}
        >
          {player.number}
        </div>
        {/* Position overlay */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent pt-6 pb-2 px-2">
          <div
            className={`inline-block ${groupColor} text-white text-[10px] font-display font-bold px-1.5 py-0.5 uppercase tracking-wider`}
            style={{ fontFamily: 'Oswald, Arial Narrow, sans-serif' }}
          >
            {POSITION_FULL[player.position]}
          </div>
          {player.secondaryPositions && player.secondaryPositions.length > 0 && (
            <div className="flex flex-wrap gap-0.5 mt-1">
              {player.secondaryPositions.map(pos => (
                <span
                  key={pos}
                  className="text-[9px] font-display bg-white/20 text-white px-1 py-0.5 uppercase tracking-wide"
                  style={{ fontFamily: 'Oswald, Arial Narrow, sans-serif' }}
                >
                  {pos}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Info */}
      <div className="p-3 border-t-2 border-snfc-gold">
        <div className="font-semibold text-snfc-navy group-hover:text-snfc-gold transition-colors text-sm leading-tight truncate">
          {player.name}
        </div>
        {player.nickname && (
          <div className="text-[11px] text-snfc-gold font-display uppercase tracking-widest leading-tight truncate"
            style={{ fontFamily: 'Oswald, Arial Narrow, sans-serif' }}>
            "{player.nickname}"
          </div>
        )}
        <div className="flex gap-3 mt-1.5 text-xs text-gray-500">
          {player.position === 'GK' ? (
            <>
              <span><span className="font-bold text-snfc-navy">{saves ?? 0}</span> saves</span>
            </>
          ) : (
            <>
              <span><span className="font-bold text-snfc-navy">{goals}</span> G</span>
              <span><span className="font-bold text-snfc-navy">{assists}</span> A</span>
            </>
          )}
        </div>
      </div>
    </Link>
  );
}
