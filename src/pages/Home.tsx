import { useState } from 'react';
import { Link } from 'react-router-dom';
import { getAppData, getSeasonRecord, getPlayerStats } from '../data';
import StatCard from '../components/StatCard';
import GameCard from '../components/GameCard';
import SeasonSelector from '../components/SeasonSelector';
import PlayerSilhouette from '../components/PlayerSilhouette';
import type { Game, Season } from '../types';

const PITCH_BG = 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=1920&q=80&auto=format&fit=crop';
const SNFC_LOGO = '/sporting-nebraska-logo.png';

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-4 mb-6">
      <div className="w-1 h-6 bg-snfc-gold" />
      <h2
        className="text-xl font-display font-bold uppercase tracking-widest text-snfc-navy"
        style={{ fontFamily: 'Oswald, Arial Narrow, sans-serif' }}
      >
        {children}
      </h2>
    </div>
  );
}

export default function Home() {
  const { players, seasons, games } = getAppData();
  const activeSeason = seasons.find((s: Season) => s.isActive) ?? seasons[seasons.length - 1];
  const [seasonId, setSeasonId] = useState(activeSeason?.id ?? '');

  const record = getSeasonRecord(seasonId, games);
  const stats = getPlayerStats(seasonId, games);
  const currentSeason = seasons.find((s: Season) => s.id === seasonId);

  const seasonGames = [...games]
    .filter((g: Game) => g.seasonId === seasonId)
    .sort((a: Game, b: Game) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const topScorer = [...players]
    .map(p => ({ player: p, goals: stats[p.id]?.goals ?? 0 }))
    .sort((a, b) => b.goals - a.goals)[0];

  const topAssist = [...players]
    .map(p => ({ player: p, assists: stats[p.id]?.assists ?? 0 }))
    .sort((a, b) => b.assists - a.assists)[0];

  const winPct = record.played > 0 ? Math.round((record.wins / record.played) * 100) : 0;
  const cleanSheets = seasonGames.filter((g: Game) => g.goalsAgainst === 0).length;

  return (
    <div>
      {/* ── HERO ──────────────────────────────────────────────────── */}
      <div
        className="relative min-h-[45vh] flex items-center justify-center overflow-hidden"
        style={{
          backgroundImage: `url(${PITCH_BG})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center 30%',
          backgroundAttachment: 'fixed',
        }}
      >
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-snfc-navy/75" />
        {/* Gold vignette bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-snfc-navy/80 to-transparent" />

        <div className="relative z-10 text-center px-4">
          <img
            src={SNFC_LOGO}
            alt="Sporting Nebraska FC"
            className="h-20 md:h-24 w-auto object-contain mx-auto mb-4 drop-shadow-2xl"
          />
          <div
            className="text-white/50 text-sm font-display uppercase tracking-[0.3em] mb-3"
            style={{ fontFamily: 'Oswald, Arial Narrow, sans-serif' }}
          >
            U11 · 9v9
          </div>
          <h1
            className="text-5xl md:text-6xl font-display font-bold text-white leading-none tracking-wide mb-2"
            style={{ fontFamily: 'Oswald, Arial Narrow, sans-serif' }}
          >
            {currentSeason?.label ?? seasonId}
          </h1>

          {/* Record */}
          <div className="flex items-center justify-center gap-0 mt-5">
            {[
              { val: record.wins,   label: 'W', color: 'text-emerald-400' },
              { val: record.draws,  label: 'D', color: 'text-white/60' },
              { val: record.losses, label: 'L', color: 'text-red-400' },
            ].map(({ val, label, color }, i) => (
              <div key={label} className={`px-8 ${i > 0 ? 'border-l border-white/20' : ''} text-center`}>
                <div
                  className={`text-5xl md:text-6xl font-display font-bold ${color} leading-none`}
                  style={{ fontFamily: 'Oswald, Arial Narrow, sans-serif' }}
                >
                  {val}
                </div>
                <div
                  className="text-white/40 text-xs font-display uppercase tracking-widest mt-1"
                  style={{ fontFamily: 'Oswald, Arial Narrow, sans-serif' }}
                >
                  {label === 'W' ? 'Wins' : label === 'D' ? 'Draws' : 'Losses'}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 flex items-center justify-center gap-3">
            <Link
              to="/games"
              className="bg-snfc-gold text-snfc-navy px-6 py-2.5 text-sm font-display font-semibold uppercase tracking-widest hover:bg-snfc-gold-light transition-colors"
              style={{ fontFamily: 'Oswald, Arial Narrow, sans-serif' }}
            >
              View All Games
            </Link>
            <Link
              to="/players"
              className="border border-white/30 text-white px-6 py-2.5 text-sm font-display font-semibold uppercase tracking-widest hover:border-snfc-gold hover:text-snfc-gold transition-colors"
              style={{ fontFamily: 'Oswald, Arial Narrow, sans-serif' }}
            >
              View Roster
            </Link>
          </div>
        </div>
      </div>

      {/* ── MAIN CONTENT ─────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 py-12 space-y-14">

        {/* Season selector + stats */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <SectionLabel>Season Stats</SectionLabel>
            <SeasonSelector seasons={seasons} currentId={seasonId} onChange={setSeasonId} />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-gray-200 border border-gray-200">
            <StatCard label="Games Played" value={record.played} />
            <StatCard label="Goals Scored" value={record.goalsFor} invert />
            <StatCard label="Goals Against" value={record.goalsAgainst} />
            <StatCard label="Win Rate" value={`${winPct}%`} sub={`${record.wins}W · ${record.draws}D · ${record.losses}L`} invert />
          </div>
        </div>

        {/* Leaders + Clean Sheets */}
        <div>
          <SectionLabel>Season Leaders</SectionLabel>
          <div className="grid md:grid-cols-3 gap-0 border border-gray-200 bg-gray-200 gap-px">
            {topScorer && topScorer.goals > 0 && (
              <Link
                to={`/players/${topScorer.player.id}`}
                className="bg-white p-5 hover:bg-gray-50 transition-colors group flex flex-col gap-3"
              >
                <div
                  className="text-xs font-display uppercase tracking-widest text-snfc-gold"
                  style={{ fontFamily: 'Oswald, Arial Narrow, sans-serif' }}
                >
                  Top Scorer
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 border-2 border-snfc-gold shrink-0 overflow-hidden">
                    {topScorer.player.photoUrl
                      ? <img src={topScorer.player.photoUrl} className="w-full h-full object-cover object-top" alt="" />
                      : <PlayerSilhouette />
                    }
                  </div>
                  <div>
                    <div className="font-semibold text-snfc-navy group-hover:text-snfc-gold transition-colors">
                      {topScorer.player.name}
                    </div>
                    <div
                      className="text-3xl font-display font-bold text-snfc-navy leading-tight mt-0.5"
                      style={{ fontFamily: 'Oswald, Arial Narrow, sans-serif' }}
                    >
                      {topScorer.goals} <span className="text-sm font-normal text-gray-400">goals</span>
                    </div>
                  </div>
                </div>
              </Link>
            )}

            {topAssist && topAssist.assists > 0 && (
              <Link
                to={`/players/${topAssist.player.id}`}
                className="bg-white p-5 hover:bg-gray-50 transition-colors group flex flex-col gap-3"
              >
                <div
                  className="text-xs font-display uppercase tracking-widest text-snfc-gold"
                  style={{ fontFamily: 'Oswald, Arial Narrow, sans-serif' }}
                >
                  Top Assister
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 border-2 border-snfc-gold shrink-0 overflow-hidden">
                    {topAssist.player.photoUrl
                      ? <img src={topAssist.player.photoUrl} className="w-full h-full object-cover object-top" alt="" />
                      : <PlayerSilhouette />
                    }
                  </div>
                  <div>
                    <div className="font-semibold text-snfc-navy group-hover:text-snfc-gold transition-colors">
                      {topAssist.player.name}
                    </div>
                    <div
                      className="text-3xl font-display font-bold text-snfc-navy leading-tight mt-0.5"
                      style={{ fontFamily: 'Oswald, Arial Narrow, sans-serif' }}
                    >
                      {topAssist.assists} <span className="text-sm font-normal text-gray-400">assists</span>
                    </div>
                  </div>
                </div>
              </Link>
            )}

            <div className="bg-snfc-navy p-5 flex items-center gap-4">
              <div
                className="text-6xl font-display font-bold text-snfc-gold leading-none"
                style={{ fontFamily: 'Oswald, Arial Narrow, sans-serif' }}
              >
                {cleanSheets}
              </div>
              <div>
                <div
                  className="text-xs font-display uppercase tracking-widest text-white/40 mb-1"
                  style={{ fontFamily: 'Oswald, Arial Narrow, sans-serif' }}
                >
                  Clean Sheets
                </div>
                <div className="text-sm text-white/60">
                  Shutouts in {seasonGames.length} games
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Results */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <SectionLabel>Recent Results</SectionLabel>
            <Link
              to="/games"
              className="text-xs font-display uppercase tracking-widest text-snfc-gold hover:text-snfc-gold-light transition-colors"
              style={{ fontFamily: 'Oswald, Arial Narrow, sans-serif' }}
            >
              All Games →
            </Link>
          </div>
          <div className="space-y-px border border-gray-200">
            {seasonGames.slice(0, 5).map((game: Game) => (
              <GameCard key={game.id} game={game} />
            ))}
            {seasonGames.length === 0 && (
              <div className="py-16 text-center text-gray-400 bg-white border border-gray-200">
                No games yet this season.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
