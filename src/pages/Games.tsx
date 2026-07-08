import { useState } from 'react';
import { getAppData, getSeasonRecord } from '../data';
import GameCard from '../components/GameCard';
import SeasonSelector from '../components/SeasonSelector';
import StatCard from '../components/StatCard';
import type { Game, Season } from '../types';

export default function Games() {
  const { seasons, games } = getAppData();
  const activeSeason = seasons.find((s: Season) => s.isActive) ?? seasons[seasons.length - 1];
  const [seasonId, setSeasonId] = useState(activeSeason?.id ?? '');
  const [filter, setFilter] = useState<'all' | 'W' | 'D' | 'L'>('all');

  const record = getSeasonRecord(seasonId, games);
  const gameDateTime = (g: Game) =>
    new Date(`${g.date}T${g.startTime ?? '12:00'}:00`).getTime();

  const seasonGames = [...games]
    .filter((g: Game) => g.seasonId === seasonId)
    .sort((a: Game, b: Game) => gameDateTime(b) - gameDateTime(a));

  const filtered = seasonGames.filter((g: Game) => {
    if (filter === 'all') return true;
    if (filter === 'W') return g.goalsFor > g.goalsAgainst;
    if (filter === 'L') return g.goalsFor < g.goalsAgainst;
    return g.goalsFor === g.goalsAgainst;
  });

  return (
    <div>
      {/* Page header */}
      <div className="bg-snfc-navy border-b border-snfc-gold py-10">
        <div className="max-w-7xl mx-auto px-4 flex items-end justify-between gap-4">
          <h1
            className="text-5xl font-display font-bold text-white uppercase tracking-widest"
            style={{ fontFamily: 'Oswald, Arial Narrow, sans-serif' }}
          >
            Games
          </h1>
          <SeasonSelector seasons={seasons} currentId={seasonId} onChange={setSeasonId} />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-10 space-y-8">
        {/* Stats row */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-px bg-gray-200 border border-gray-200">
          <StatCard label="Wins" value={record.wins} />
          <StatCard label="Draws" value={record.draws} />
          <StatCard label="Losses" value={record.losses} />
          <StatCard label="Goals For" value={record.goalsFor} invert />
          <StatCard label="Goals Against" value={record.goalsAgainst} />
        </div>

        {/* Goal diff bar */}
        {record.played > 0 && (record.goalsFor + record.goalsAgainst) > 0 && (
          <div className="bg-white border border-gray-200 p-4">
            <div className="flex justify-between text-xs text-gray-500 mb-2 font-medium">
              <span>Scored: {record.goalsFor}</span>
              <span className={record.goalsFor >= record.goalsAgainst ? 'text-emerald-600 font-bold' : 'text-red-500 font-bold'}>
                Diff: {record.goalsFor - record.goalsAgainst > 0 ? '+' : ''}{record.goalsFor - record.goalsAgainst}
              </span>
              <span>Conceded: {record.goalsAgainst}</span>
            </div>
            <div className="h-2 bg-gray-100 overflow-hidden flex">
              <div
                className="h-full bg-snfc-gold"
                style={{ width: `${(record.goalsFor / (record.goalsFor + record.goalsAgainst)) * 100}%` }}
              />
              <div className="h-full bg-red-400 flex-1" />
            </div>
          </div>
        )}

        {/* Filter buttons */}
        <div className="flex gap-0 border border-gray-200 w-fit">
          {(['all', 'W', 'D', 'L'] as const).map((f, i) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-5 py-2 text-xs font-display uppercase tracking-widest transition-colors ${i > 0 ? 'border-l border-gray-200' : ''} ${
                filter === f
                  ? 'bg-snfc-navy text-snfc-gold'
                  : 'bg-white text-gray-500 hover:text-snfc-navy'
              }`}
              style={{ fontFamily: 'Oswald, Arial Narrow, sans-serif' }}
            >
              {f === 'all' ? 'All' : f === 'W' ? 'Wins' : f === 'D' ? 'Draws' : 'Losses'}
            </button>
          ))}
        </div>

        {/* Game list */}
        <div className="space-y-px border border-gray-200">
          {filtered.map((game: Game) => <GameCard key={game.id} game={game} />)}
          {filtered.length === 0 && (
            <div className="py-16 text-center text-gray-400 bg-white">No games match this filter.</div>
          )}
        </div>
      </div>
    </div>
  );
}
