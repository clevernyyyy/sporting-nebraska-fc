import { useState } from 'react';
import { Plus, Download, Upload, CheckCircle } from 'lucide-react';
import { getAppData, addSeason, addGame } from '../data';
import { PLAYERS } from '../data/players';
import type { Season, Game, GoalEvent } from '../types';

type Tab = 'seasons' | 'games' | 'export';

function newId() {
  return Math.random().toString(36).slice(2, 9);
}

export default function Admin() {
  const [tab, setTab] = useState<Tab>('seasons');
  const [saved, setSaved] = useState('');
  const { seasons, games } = getAppData();

  // Season form
  const [seasonLabel, setSeasonLabel] = useState('');
  const [seasonYear, setSeasonYear] = useState('');

  // Game form
  const [gameSeasonId, setGameSeasonId] = useState(seasons.find(s => s.isActive)?.id ?? seasons[0]?.id ?? '');
  const [gameDate, setGameDate] = useState('');
  const [oppName, setOppName] = useState('');
  const [oppCity, setOppCity] = useState('');
  const [oppState, setOppState] = useState('NE');
  const [venue, setVenue] = useState('');
  const [venueCity, setVenueCity] = useState('');
  const [venueState, setVenueState] = useState('NE');
  const [isHome, setIsHome] = useState(true);
  const [goalsFor, setGoalsFor] = useState('');
  const [goalsAgainst, setGoalsAgainst] = useState('');
  const [notes, setNotes] = useState('');
  const [goalInputs, setGoalInputs] = useState<{ minute: string; scorerId: string; assisterId: string }[]>([]);

  function flash(msg: string) {
    setSaved(msg);
    setTimeout(() => setSaved(''), 3000);
  }

  function handleAddSeason(e: { preventDefault(): void }) {
    e.preventDefault();
    if (!seasonLabel || !seasonYear) return;
    const season: Season = {
      id: `${parseInt(seasonYear) - 1}-${seasonYear}`,
      label: seasonLabel,
      year: parseInt(seasonYear),
      isActive: false,
    };
    addSeason(season);
    setSeasonLabel('');
    setSeasonYear('');
    flash('Season added! Refresh to see it in selectors.');
  }

  function handleAddGame(e: { preventDefault(): void }) {
    e.preventDefault();
    const goals: GoalEvent[] = goalInputs
      .filter(g => g.minute && g.scorerId)
      .map(g => ({
        minute: parseInt(g.minute),
        scorerId: g.scorerId,
        assisterId: g.assisterId || undefined,
      }));

    const game: Game = {
      id: newId(),
      seasonId: gameSeasonId,
      date: gameDate,
      opponent: { name: oppName, city: oppCity, state: oppState },
      venue,
      venueCity,
      venueState,
      isHome,
      goalsFor: parseInt(goalsFor) || 0,
      goalsAgainst: parseInt(goalsAgainst) || 0,
      goals,
      opponentGoals: [],
      notes: notes || undefined,
    };
    addGame(game);
    // reset
    setGameDate('');
    setOppName('');
    setOppCity('');
    setGoalsFor('');
    setGoalsAgainst('');
    setNotes('');
    setGoalInputs([]);
    flash('Game saved!');
  }

  const exportData = JSON.stringify(getAppData(), null, 2);

  return (
    <div>
      {/* Page header */}
      <div className="bg-gea-black border-b border-gea-gold py-10">
        <div className="max-w-7xl mx-auto px-4">
          <h1
            className="text-5xl font-display font-bold text-white uppercase tracking-widest"
            style={{ fontFamily: 'Oswald, Arial Narrow, sans-serif' }}
          >
            Admin
          </h1>
          <p className="text-white/40 text-sm mt-1">Manage seasons, games, and data</p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-10 space-y-6">
      {saved && (
        <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 text-sm font-medium">
          <CheckCircle size={16} />
          {saved}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-0 border border-gray-200 w-fit">
        {(['seasons', 'games', 'export'] as Tab[]).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-5 py-2 text-xs font-display uppercase tracking-widest transition-colors border-l border-gray-200 first:border-l-0 ${
              tab === t ? 'bg-gea-black text-gea-gold' : 'bg-white text-gray-500 hover:text-gea-black'
            }`}
            style={{ fontFamily: 'Oswald, Arial Narrow, sans-serif' }}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Seasons tab */}
      {tab === 'seasons' && (
        <div className="space-y-4">
          <div className="bg-white border border border-gray-100 shadow-sm p-5">
            <h2 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Plus size={16} /> Add New Season
            </h2>
            <form onSubmit={handleAddSeason} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                  Season Label (e.g. "2025–2026")
                </label>
                <input
                  value={seasonLabel}
                  onChange={e => setSeasonLabel(e.target.value)}
                  placeholder="2025–2026"
                  className="w-full border border-gray-200 border-0 px-3 py-2 text-sm focus:outline-none focus:border-gea-gold"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                  Spring Year (e.g. 2026)
                </label>
                <input
                  type="number"
                  value={seasonYear}
                  onChange={e => setSeasonYear(e.target.value)}
                  placeholder="2026"
                  className="w-full border border-gray-200 border-0 px-3 py-2 text-sm focus:outline-none focus:border-gea-gold"
                  required
                />
              </div>
              <button
                type="submit"
                className="bg-gea-black text-white px-4 py-2 border-0 text-sm font-semibold hover:bg-gea-charcoal transition-colors"
              >
                Add Season
              </button>
            </form>
          </div>

          {/* Existing seasons */}
          <div className="bg-white border border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-5 py-3 border-b border-gray-100">
              <h2 className="font-bold text-gray-800">Existing Seasons</h2>
            </div>
            <div className="divide-y divide-gray-50">
              {[...seasons].sort((a, b) => b.year - a.year).map(s => (
                <div key={s.id} className="px-5 py-3 flex items-center justify-between">
                  <div>
                    <div className="font-medium text-gray-800 text-sm">{s.label}</div>
                    <div className="text-xs text-gray-400">
                      {games.filter(g => g.seasonId === s.id).length} games
                    </div>
                  </div>
                  {s.isActive && (
                    <span className="text-[10px] font-bold px-1.5 py-0.5 bg-emerald-100 text-emerald-700 rounded uppercase">
                      Active
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-200 border-0 p-4 text-sm text-amber-700">
            <strong>Note:</strong> To permanently add a season to the codebase (survives localStorage clear), edit{' '}
            <code className="bg-amber-100 px-1 rounded">src/data/seasons.ts</code> directly.
          </div>
        </div>
      )}

      {/* Games tab */}
      {tab === 'games' && (
        <div className="bg-white border border border-gray-100 shadow-sm p-5">
          <h2 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Plus size={16} /> Log a Game
          </h2>
          <form onSubmit={handleAddGame} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Season</label>
                <select
                  value={gameSeasonId}
                  onChange={e => setGameSeasonId(e.target.value)}
                  className="w-full border border-gray-200 border-0 px-3 py-2 text-sm focus:outline-none focus:border-gea-gold"
                >
                  {[...seasons].sort((a, b) => b.year - a.year).map(s => (
                    <option key={s.id} value={s.id}>{s.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Date</label>
                <input
                  type="date"
                  value={gameDate}
                  onChange={e => setGameDate(e.target.value)}
                  className="w-full border border-gray-200 border-0 px-3 py-2 text-sm focus:outline-none focus:border-gea-gold"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-2">
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Opponent Name</label>
                <input
                  value={oppName}
                  onChange={e => setOppName(e.target.value)}
                  placeholder="Lincoln United FC"
                  className="w-full border border-gray-200 border-0 px-3 py-2 text-sm focus:outline-none focus:border-gea-gold"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Location</label>
                <div className="flex gap-1">
                  <input value={oppCity} onChange={e => setOppCity(e.target.value)} placeholder="City" className="flex-1 border border-gray-200 border-0 px-2 py-2 text-sm focus:outline-none focus:border-gea-gold" />
                  <input value={oppState} onChange={e => setOppState(e.target.value)} placeholder="NE" className="w-12 border border-gray-200 border-0 px-2 py-2 text-sm focus:outline-none focus:border-gea-gold" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-2">
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Venue Name</label>
                <input
                  value={venue}
                  onChange={e => setVenue(e.target.value)}
                  placeholder="Gretna Sports Complex"
                  className="w-full border border-gray-200 border-0 px-3 py-2 text-sm focus:outline-none focus:border-gea-gold"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Venue City/St</label>
                <div className="flex gap-1">
                  <input value={venueCity} onChange={e => setVenueCity(e.target.value)} placeholder="City" className="flex-1 border border-gray-200 border-0 px-2 py-2 text-sm focus:outline-none focus:border-gea-gold" />
                  <input value={venueState} onChange={e => setVenueState(e.target.value)} placeholder="NE" className="w-12 border border-gray-200 border-0 px-2 py-2 text-sm focus:outline-none focus:border-gea-gold" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Home/Away</label>
                <select
                  value={isHome ? 'home' : 'away'}
                  onChange={e => setIsHome(e.target.value === 'home')}
                  className="w-full border border-gray-200 border-0 px-3 py-2 text-sm focus:outline-none focus:border-gea-gold"
                >
                  <option value="home">Home</option>
                  <option value="away">Away</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Goals For</label>
                <input type="number" min="0" value={goalsFor} onChange={e => setGoalsFor(e.target.value)} className="w-full border border-gray-200 border-0 px-3 py-2 text-sm focus:outline-none focus:border-gea-gold" required />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Goals Against</label>
                <input type="number" min="0" value={goalsAgainst} onChange={e => setGoalsAgainst(e.target.value)} className="w-full border border-gray-200 border-0 px-3 py-2 text-sm focus:outline-none focus:border-gea-gold" required />
              </div>
            </div>

            {/* Goal events */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Goal Details (optional)</label>
                <button
                  type="button"
                  onClick={() => setGoalInputs(prev => [...prev, { minute: '', scorerId: '', assisterId: '' }])}
                  className="text-xs text-gea-gold font-semibold hover:text-gea-gold-light flex items-center gap-1"
                >
                  <Plus size={12} /> Add goal
                </button>
              </div>
              <div className="space-y-2">
                {goalInputs.map((goal, i) => (
                  <div key={i} className="flex gap-2 items-center">
                    <input
                      type="number"
                      placeholder="Min"
                      value={goal.minute}
                      onChange={e => setGoalInputs(prev => prev.map((g, j) => j === i ? { ...g, minute: e.target.value } : g))}
                      className="w-16 border border-gray-200 border-0 px-2 py-1.5 text-sm focus:outline-none focus:border-gea-gold"
                    />
                    <select
                      value={goal.scorerId}
                      onChange={e => setGoalInputs(prev => prev.map((g, j) => j === i ? { ...g, scorerId: e.target.value } : g))}
                      className="flex-1 border border-gray-200 border-0 px-2 py-1.5 text-sm focus:outline-none focus:border-gea-gold"
                    >
                      <option value="">Scorer...</option>
                      {PLAYERS.map(p => <option key={p.id} value={p.id}>{p.name} (#{p.number})</option>)}
                    </select>
                    <select
                      value={goal.assisterId}
                      onChange={e => setGoalInputs(prev => prev.map((g, j) => j === i ? { ...g, assisterId: e.target.value } : g))}
                      className="flex-1 border border-gray-200 border-0 px-2 py-1.5 text-sm focus:outline-none focus:border-gea-gold"
                    >
                      <option value="">Assist (opt)</option>
                      {PLAYERS.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                    <button
                      type="button"
                      onClick={() => setGoalInputs(prev => prev.filter((_, j) => j !== i))}
                      className="text-red-400 hover:text-red-600 text-xs px-1"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Match Notes</label>
              <textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                rows={2}
                placeholder="Optional notes about the match..."
                className="w-full border border-gray-200 border-0 px-3 py-2 text-sm focus:outline-none focus:border-gea-gold resize-none"
              />
            </div>

            <button
              type="submit"
              className="bg-gea-black text-white px-5 py-2.5 border-0 text-sm font-semibold hover:bg-gea-charcoal transition-colors w-full"
            >
              Save Game
            </button>
          </form>
        </div>
      )}

      {/* Export tab */}
      {tab === 'export' && (
        <div className="space-y-4">
          <div className="bg-white border border border-gray-100 shadow-sm p-5">
            <h2 className="font-bold text-gray-800 mb-2 flex items-center gap-2">
              <Download size={16} /> Export All Data
            </h2>
            <p className="text-sm text-gray-500 mb-4">
              Copy this JSON into <code className="bg-gray-100 px-1 rounded text-xs">src/data/</code> files to make changes permanent in the codebase.
            </p>
            <pre className="bg-gray-50 border border-gray-200 border-0 p-3 text-xs overflow-auto max-h-80 text-gray-700">
              {exportData}
            </pre>
            <button
              onClick={() => { navigator.clipboard.writeText(exportData); flash('Copied to clipboard!'); }}
              className="mt-3 bg-gea-black text-white px-4 py-2 border-0 text-sm font-semibold hover:bg-gea-charcoal transition-colors flex items-center gap-2"
            >
              <Upload size={14} /> Copy to Clipboard
            </button>
          </div>

          <div className="bg-amber-50 border border-amber-200 border-0 p-4 text-sm text-amber-700">
            <strong>Tip:</strong> Admin-created seasons and games live in localStorage.
            To bake them into the app permanently, copy the relevant entries above into the{' '}
            <code className="bg-amber-100 px-1 rounded">src/data/seasons.ts</code> or{' '}
            <code className="bg-amber-100 px-1 rounded">src/data/games.ts</code> files and rebuild.
          </div>
        </div>
      )}
      </div>
    </div>
  );
}
