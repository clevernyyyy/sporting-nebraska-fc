import { useState } from 'react';
import { getAppData, getPlayerStats, COACHES } from '../data';
import PlayerCard from '../components/PlayerCard';
import CoachCard from '../components/CoachCard';
import SeasonSelector from '../components/SeasonSelector';
import type { Player, Season, PositionGroup } from '../types';
import { POSITION_GROUP, POSITION_FULL } from '../types';
import { Link } from 'react-router-dom';
import DisciplinaryCard from '../components/DisciplinaryCard';

const GROUP_LABELS: { value: PositionGroup | 'all'; label: string; short: string }[] = [
  { value: 'all', label: 'All',         short: 'All' },
  { value: 'GK',  label: 'GK',          short: 'GK' },
  { value: 'DEF', label: 'Defenders',   short: 'Def' },
  { value: 'MID', label: 'Midfielders', short: 'Mid' },
  { value: 'FWD', label: 'Forwards',    short: 'Fwd' },
];

export default function Players() {
  const { players, seasons, games } = getAppData();
  const activeSeason = seasons.find((s: Season) => s.isActive) ?? seasons[seasons.length - 1];
  const [seasonId, setSeasonId] = useState(activeSeason?.id ?? '');
  const [groupFilter, setGroupFilter] = useState<PositionGroup | 'all'>('all');

  const stats = getPlayerStats(seasonId, games);

  const seasonCoaches = COACHES.filter(c => c.seasons.includes(seasonId));

  const seasonPlayers = players
    .filter((p: Player) => p.seasons.includes(seasonId))
    .filter((p: Player) => groupFilter === 'all' || POSITION_GROUP[p.position] === groupFilter)
    .sort((a: Player, b: Player) => a.number - b.number);

  return (
    <div>
      {/* Page header */}
      <div className="bg-snfc-navy border-b border-snfc-gold py-10">
        <div className="max-w-7xl mx-auto px-4 flex items-end justify-between gap-4">
          <div>
            <h1
              className="text-5xl font-display font-bold text-white uppercase tracking-widest"
              style={{ fontFamily: 'Oswald, Arial Narrow, sans-serif' }}
            >
              Roster
            </h1>
            <div
              className="text-snfc-gold text-sm font-display uppercase tracking-widest mt-1"
              style={{ fontFamily: 'Oswald, Arial Narrow, sans-serif' }}
            >
              {seasonPlayers.length} Players
            </div>
          </div>
          <SeasonSelector seasons={seasons} currentId={seasonId} onChange={setSeasonId} />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-10 space-y-8">
        {/* Position filter */}
        <div className="flex gap-0 border border-gray-200 w-full">
          {GROUP_LABELS.map(({ value, label, short }, i) => (
            <button
              key={value}
              onClick={() => setGroupFilter(value)}
              className={`flex-1 px-2 py-2 text-xs font-display uppercase tracking-widest transition-colors ${i > 0 ? 'border-l border-gray-200' : ''} ${
                groupFilter === value
                  ? 'bg-snfc-navy text-snfc-gold'
                  : 'bg-white text-gray-500 hover:text-snfc-navy'
              }`}
              style={{ fontFamily: 'Oswald, Arial Narrow, sans-serif' }}
            >
              <span className="sm:hidden">{short}</span>
              <span className="hidden sm:inline">{label}</span>
            </button>
          ))}
        </div>

        {/* Player grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-px bg-gray-200">
          {seasonPlayers.map((player: Player) => (
            <PlayerCard
              key={player.id}
              player={player}
              goals={stats[player.id]?.goals ?? 0}
              assists={stats[player.id]?.assists ?? 0}
              saves={stats[player.id]?.saves ?? 0}
            />
          ))}
        </div>

        {seasonPlayers.length === 0 && (
          <div className="py-16 text-center text-gray-400 bg-white border border-gray-200">
            No players found.
          </div>
        )}

        {/* Coaching staff */}
        {seasonCoaches.length > 0 && (
          <div>
            <div className="flex items-center gap-4 mb-4">
              <div className="w-1 h-6 bg-snfc-gold" />
              <h2
                className="font-display font-bold uppercase tracking-widest text-snfc-navy"
                style={{ fontFamily: 'Oswald, Arial Narrow, sans-serif' }}
              >
                Coaching Staff
              </h2>
            </div>
            <div className="space-y-px">
              {seasonCoaches.map(coach => (
                <div key={coach.id} className="bg-white border border-gray-200 flex gap-0 overflow-hidden">
                  <div className="w-40 shrink-0">
                    <CoachCard coach={coach} photoOnly />
                  </div>
                  {coach.bio && (

                    <div className="flex-1 p-5 flex flex-col justify-center border-l border-gray-100">
                      <div className="mb-3">
                        <div className="font-semibold text-snfc-navy text-sm leading-tight">{coach.name}</div>
                        <div
                          className="text-xs text-gray-400 mt-0.5 font-display uppercase tracking-wider"
                          style={{ fontFamily: 'Oswald, Arial Narrow, sans-serif' }}
                        >
                          {coach.title}
                        </div>
                      </div>
                      <div
                        className="text-xs font-display uppercase tracking-widest text-snfc-gold mb-2"
                        style={{ fontFamily: 'Oswald, Arial Narrow, sans-serif' }}
                      >
                        About
                      </div>
                      <p className="text-sm text-gray-600 leading-relaxed">{coach.bio}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Stats table */}
        {seasonPlayers.length > 0 && (
          <div className="bg-white border border-gray-200 overflow-hidden">
            <div className="border-b-2 border-snfc-gold px-5 py-3">
              <h2
                className="font-display font-bold uppercase tracking-widest text-snfc-navy"
                style={{ fontFamily: 'Oswald, Arial Narrow, sans-serif' }}
              >
                Season Stats
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-snfc-navy text-white/60 text-xs font-display uppercase tracking-widest"
                    style={{ fontFamily: 'Oswald, Arial Narrow, sans-serif' }}>
                    <th className="text-left px-4 py-3 font-medium">#</th>
                    <th className="text-left px-4 py-3 font-medium">Player</th>
                    <th className="text-left px-4 py-3 font-medium hidden sm:table-cell">Position</th>
                    <th className="text-center px-4 py-3 font-medium">Goals</th>
                    <th className="text-center px-4 py-3 font-medium">Assists</th>
                    <th className="text-center px-4 py-3 font-medium">G+A</th>
                    <th className="text-center px-4 py-3 font-medium hidden md:table-cell">Saves</th>
                    <th className="text-center px-4 py-3 font-medium hidden md:table-cell"><span className="flex justify-center"><DisciplinaryCard type="yellow" size="sm" tilt={false} /></span></th>
                    <th className="text-center px-4 py-3 font-medium hidden md:table-cell"><span className="flex justify-center"><DisciplinaryCard type="red" size="sm" tilt={false} /></span></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {[...seasonPlayers]
                    .sort((a: Player, b: Player) => {
                      const aTotal = (stats[a.id]?.goals ?? 0) + (stats[a.id]?.assists ?? 0);
                      const bTotal = (stats[b.id]?.goals ?? 0) + (stats[b.id]?.assists ?? 0);
                      return bTotal - aTotal;
                    })
                    .map((player: Player) => {
                      const s = stats[player.id] ?? { goals: 0, assists: 0 };
                      return (
                        <tr key={player.id} className="hover:bg-gray-50 transition-colors">
                          <td
                            className="px-4 py-3 text-gray-300 font-display font-bold"
                            style={{ fontFamily: 'Oswald, Arial Narrow, sans-serif' }}
                          >
                            {player.number}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              {player.photoUrl && (
                                <img src={player.photoUrl} className="w-7 h-7 object-cover object-center border border-snfc-gold" alt="" />
                              )}
                              <Link to={`/players/${player.id}`} className="font-medium text-snfc-navy hover:text-snfc-gold transition-colors">
                                {player.name}
                              </Link>
                            </div>
                          </td>
                          <td className="px-4 py-3 hidden sm:table-cell">
                            <span
                              className="text-xs font-display uppercase tracking-wider text-gray-400"
                              style={{ fontFamily: 'Oswald, Arial Narrow, sans-serif' }}
                            >
                              {POSITION_FULL[player.position]}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center font-bold text-snfc-navy">{s.goals}</td>
                          <td className="px-4 py-3 text-center font-bold text-snfc-navy">{s.assists}</td>
                          <td className="px-4 py-3 text-center">
                            <span
                              className={`font-display font-bold ${s.goals + s.assists > 0 ? 'text-snfc-gold' : 'text-gray-300'}`}
                              style={{ fontFamily: 'Oswald, Arial Narrow, sans-serif' }}
                            >
                              {s.goals + s.assists}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center text-gray-400 hidden md:table-cell">
                            {s.saves > 0 ? <span className="font-bold text-snfc-navy">{s.saves}</span> : '—'}
                          </td>
                          <td className="px-4 py-3 text-center hidden md:table-cell">
                            {s.yellowCards > 0 ? <span className="font-bold text-amber-500">{s.yellowCards}</span> : <span className="text-gray-200">—</span>}
                          </td>
                          <td className="px-4 py-3 text-center hidden md:table-cell">
                            {s.redCards > 0 ? <span className="font-bold text-red-600">{s.redCards}</span> : <span className="text-gray-200">—</span>}
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
