import { Link } from 'react-router-dom';
import { MapPin, Trophy } from 'lucide-react';
import type { Game } from '../types';

export function isUpcomingGame(game: Game) {
  return new Date(game.date + 'T23:59:59') > new Date();
}

function getResult(game: Game): 'W' | 'D' | 'L' {
  if (game.goalsFor > game.goalsAgainst) return 'W';
  if (game.goalsFor < game.goalsAgainst) return 'L';
  return 'D';
}

function formatTime(time: string) {
  const [h, m] = time.split(':').map(Number);
  const period = h >= 12 ? 'PM' : 'AM';
  const hour = h > 12 ? h - 12 : h === 0 ? 12 : h;
  return `${hour}:${m.toString().padStart(2, '0')} ${period}`;
}

const RESULT_STYLES = {
  W: { bar: 'bg-emerald-500', text: 'text-emerald-600', bg: 'bg-emerald-50' },
  D: { bar: 'bg-amber-400',   text: 'text-amber-600',   bg: 'bg-amber-50'   },
  L: { bar: 'bg-red-500',     text: 'text-red-600',     bg: 'bg-red-50'     },
};

export default function GameCard({ game }: { game: Game }) {
  const upcoming = isUpcomingGame(game);
  const date = new Date(game.date + 'T12:00:00');

  if (upcoming) {
    return (
      <Link
        to={`/games/${game.id}`}
        className="flex items-stretch bg-white hover:bg-gray-50 transition-colors border border-gray-200 hover:border-snfc-gold group overflow-hidden"
      >
        {/* Gold left bar */}
        <div className="w-1.5 shrink-0 bg-snfc-gold" />

        {/* Date block */}
        <div className="flex flex-col items-center justify-center w-14 shrink-0 bg-gray-50 py-3 px-1">
          <span
            className="text-[10px] font-display uppercase tracking-wider text-gray-400 leading-none"
            style={{ fontFamily: 'Oswald, Arial Narrow, sans-serif' }}
          >
            {date.toLocaleDateString('en-US', { month: 'short' })}
          </span>
          <span
            className="text-2xl font-display font-bold text-snfc-navy leading-tight"
            style={{ fontFamily: 'Oswald, Arial Narrow, sans-serif' }}
          >
            {date.getDate()}
          </span>
          <span
            className="text-[9px] font-display uppercase tracking-wider text-gray-400 leading-none mt-0.5"
            style={{ fontFamily: 'Oswald, Arial Narrow, sans-serif' }}
          >
            {date.toLocaleDateString('en-US', { weekday: 'short' })}
          </span>
        </div>

        {/* Main info */}
        <div className="flex-1 px-4 py-3 border-l border-gray-100 min-w-0">
          <div className="font-semibold text-snfc-navy group-hover:text-snfc-gold transition-colors truncate">
            vs. {game.opponent.name}
          </div>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-0.5 text-xs text-gray-500">
            <span className="font-medium text-snfc-navy/70">
              {game.startTime ? formatTime(game.startTime) : 'Time TBD'}
            </span>
            {game.venueCity !== 'TBD' && (
              <span className="flex items-center gap-1">
                <MapPin size={10} />
                {game.venueCity}, {game.venueState}
              </span>
            )}
            <span className="font-medium text-gray-400 uppercase tracking-wide">
              {game.isHome ? 'Home' : 'Away'}
            </span>
            {game.tournament && (
              <span
                className="font-display uppercase tracking-wide text-snfc-gold font-bold"
                style={{ fontFamily: 'Oswald, Arial Narrow, sans-serif' }}
              >
                {game.tournament.name}
              </span>
            )}
          </div>
        </div>

        {/* Arrow */}
        <div className="flex items-center pr-4 text-gray-300 group-hover:text-snfc-gold transition-colors">
          →
        </div>
      </Link>
    );
  }

  const result = getResult(game);
  const style = RESULT_STYLES[result];

  return (
    <Link
      to={`/games/${game.id}`}
      className="flex items-stretch bg-white hover:bg-gray-50 transition-colors border border-gray-200 hover:border-snfc-gold group overflow-hidden"
    >
      {/* Left result bar */}
      <div className={`w-1.5 shrink-0 ${style.bar}`} />

      {/* Result badge */}
      <div className={`flex items-center justify-center w-14 shrink-0 ${style.bg}`}>
        <span
          className={`text-2xl font-display font-bold ${style.text}`}
          style={{ fontFamily: 'Oswald, Arial Narrow, sans-serif' }}
        >
          {result}
        </span>
      </div>

      {/* Score */}
      <div className="flex items-center justify-center w-20 shrink-0 border-r border-l border-gray-100 bg-white">
        <span
          className="text-2xl font-display font-bold text-snfc-navy"
          style={{ fontFamily: 'Oswald, Arial Narrow, sans-serif' }}
        >
          {game.goalsFor}–{game.goalsAgainst}
        </span>
      </div>

      {/* Main info */}
      <div className="flex-1 px-4 py-3 min-w-0">
        <div className="font-semibold text-snfc-navy group-hover:text-snfc-gold transition-colors truncate">
          vs. {game.opponent.name}
        </div>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-0.5 text-xs text-gray-500">
          <span>
            {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </span>
          <span className="flex items-center gap-1">
            <MapPin size={10} />
            {game.venueCity}, {game.venueState}
          </span>
          <span className="font-medium text-gray-400 uppercase tracking-wide">
            {game.isHome ? 'Home' : 'Away'}
          </span>
          {game.tournament && (
            <span
              className={`inline-flex items-center gap-1.5 font-display uppercase tracking-wide ${
                game.tournament.result === 'champion'
                  ? 'text-snfc-gold font-bold'
                  : 'text-gray-400'
              }`}
              style={{ fontFamily: 'Oswald, Arial Narrow, sans-serif' }}
            >
              {game.tournament.logoUrl
                ? <img src={game.tournament.logoUrl} alt="" className="h-4 w-auto object-contain" />
                : game.tournament.result === 'champion' && <Trophy size={10} />
              }
              {game.tournament.result === 'champion' ? 'Champions' : game.tournament.round ?? game.tournament.name}
            </span>
          )}
        </div>
      </div>

      {/* Arrow */}
      <div className="flex items-center pr-4 text-gray-300 group-hover:text-snfc-gold transition-colors">
        →
      </div>
    </Link>
  );
}
