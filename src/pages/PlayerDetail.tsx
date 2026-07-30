import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, X, ChevronLeft, ChevronRight, ExternalLink } from 'lucide-react';
import DisciplinaryCard from '../components/DisciplinaryCard';
import PlayerSilhouette from '../components/PlayerSilhouette';
import { getAppData, getPlayerStats } from '../data';
import { POSITION_FULL, POSITION_GROUP } from '../types';
import type { Season, Game, GoalEvent } from '../types';

const GROUP_COLORS: Record<string, string> = {
  GK: 'bg-amber-500',
  DEF: 'bg-blue-600',
  MID: 'bg-emerald-600',
  FWD: 'bg-red-600',
};

function extractYouTubeId(url: string): string | null {
  const match = url.match(/(?:v=|youtu\.be\/|embed\/)([A-Za-z0-9_-]{11})/);
  return match ? match[1] : null;
}

export default function PlayerDetail() {
  const { id } = useParams<{ id: string }>();
  const { players, seasons, games } = getAppData();
  const player = players.find((p: { id: string }) => p.id === id);

  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);
  const allPhotos = player ? (player.photos ?? []) : [];

  function closeLightbox() { setLightboxIdx(null); }
  function prevPhoto() { setLightboxIdx(i => i === null ? 0 : (i - 1 + allPhotos.length) % allPhotos.length); }
  function nextPhoto() { setLightboxIdx(i => i === null ? 0 : (i + 1) % allPhotos.length); }

  if (!player) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center text-gray-400">
        Player not found.{' '}
        <Link to="/players" className="text-snfc-gold underline">Back to roster</Link>
      </div>
    );
  }

  const playerSeasons = seasons
    .filter((s: Season) => player.seasons.includes(s.id))
    .sort((a: Season, b: Season) => b.year - a.year);

  const group = POSITION_GROUP[player.position];
  const groupColor = GROUP_COLORS[group] ?? 'bg-gray-600';

  const careerTotals = playerSeasons.reduce(
    (acc: { goals: number; assists: number; saves: number; yellowCards: number; redCards: number }, season: Season) => {
      const s = getPlayerStats(season.id, games);
      const ps = s[player.id] ?? { goals: 0, assists: 0, saves: 0, yellowCards: 0, redCards: 0 };
      return {
        goals:       acc.goals       + ps.goals,
        assists:     acc.assists     + ps.assists,
        saves:       acc.saves       + ps.saves,
        yellowCards: acc.yellowCards + ps.yellowCards,
        redCards:    acc.redCards    + ps.redCards,
      };
    },
    { goals: 0, assists: 0, saves: 0, yellowCards: 0, redCards: 0 }
  );

  const goalContribGames = games
    .filter((g: Game) =>
      player.seasons.includes(g.seasonId) &&
      g.goals.some((goal: GoalEvent) => goal.scorerId === player.id || goal.assisterId === player.id)
    )
    .sort((a: Game, b: Game) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const isOrWasKeeper = player.position === 'GK' || player.secondaryPositions?.includes('GK');
  const keeperGames = isOrWasKeeper
    ? games
        .filter((g: Game) => {
          if (!player.seasons.includes(g.seasonId)) return false;
          if (g.keeperSavesDetail) return g.keeperSavesDetail.some(k => k.keeperId === player.id);
          return player.position === 'GK' && g.keeperSaves !== undefined;
        })
        .sort((a: Game, b: Game) => new Date(b.date).getTime() - new Date(a.date).getTime())
    : [];

  const keeperTotals = keeperGames.reduce(
    (acc, g) => {
      const saves = g.keeperSavesDetail
        ? (g.keeperSavesDetail.find(k => k.keeperId === player.id)?.saves ?? 0)
        : (g.keeperSaves ?? 0);
      return {
        saves:        acc.saves + saves,
        cleanSheets:  acc.cleanSheets + (g.goalsAgainst === 0 ? 1 : 0),
        wins:         acc.wins   + (g.goalsFor > g.goalsAgainst ? 1 : 0),
        draws:        acc.draws  + (g.goalsFor === g.goalsAgainst ? 1 : 0),
        losses:       acc.losses + (g.goalsFor < g.goalsAgainst ? 1 : 0),
      };
    },
    { saves: 0, cleanSheets: 0, wins: 0, draws: 0, losses: 0 }
  );

  return (
    <div>
      {/* ── HERO ──────────────────────────────────────────────── */}
      <div className="bg-snfc-navy">
        <div className="max-w-7xl mx-auto px-4 pt-6 pb-0">
          <Link
            to="/players"
            className="inline-flex items-center gap-1.5 text-white/40 hover:text-snfc-gold transition-colors text-xs font-display uppercase tracking-wider mb-6"
            style={{ fontFamily: 'Oswald, Arial Narrow, sans-serif' }}
          >
            <ArrowLeft size={13} /> Roster
          </Link>
        </div>

        <div className="max-w-7xl mx-auto px-4 grid md:grid-cols-[320px_1fr] gap-0">
          {/* Photo column */}
          <div className="relative bg-snfc-navy-soft overflow-hidden">
            {player.photoUrl ? (
              <img
                src={player.photoUrl}
                alt={player.name}
                className="w-full aspect-[3/4] md:h-[480px] object-cover object-top"
              />
            ) : (
              <div className="w-full aspect-[3/4] md:h-[480px]">
                <PlayerSilhouette />
              </div>
            )}
            {/* Number corner */}
            <div
              className="absolute top-0 left-0 bg-snfc-gold text-snfc-navy w-12 h-12 flex items-center justify-center font-display font-bold text-2xl"
              style={{ fontFamily: 'Oswald, Arial Narrow, sans-serif' }}
            >
              {player.number}
            </div>
          </div>

          {/* Info column */}
          <div className="p-8 md:p-10 flex flex-col justify-between">
            <div>
              {/* Primary + secondary positions */}
              <div className="flex flex-wrap items-center gap-2 mb-4">
                <span className={`${groupColor} text-white text-xs font-display font-bold px-3 py-1 uppercase tracking-widest`}
                  style={{ fontFamily: 'Oswald, Arial Narrow, sans-serif' }}>
                  {POSITION_FULL[player.position]}
                </span>
                {player.secondaryPositions && player.secondaryPositions.length > 0 && (
                  <>
                    <span className="text-white/30 text-xs">also</span>
                    {player.secondaryPositions.map(pos => (
                      <span
                        key={pos}
                        className="border border-white/30 text-white/60 text-xs font-display px-2 py-0.5 uppercase tracking-wider"
                        style={{ fontFamily: 'Oswald, Arial Narrow, sans-serif' }}
                      >
                        {POSITION_FULL[pos]}
                      </span>
                    ))}
                  </>
                )}
              </div>

              <h1
                className="text-5xl md:text-6xl font-display font-bold text-white leading-none"
                style={{ fontFamily: 'Oswald, Arial Narrow, sans-serif' }}
              >
                {player.name}
              </h1>
              {player.nickname && (
                <div
                  className="text-snfc-gold font-display uppercase tracking-widest text-lg mt-1 mb-4"
                  style={{ fontFamily: 'Oswald, Arial Narrow, sans-serif' }}
                >
                  "{player.nickname}"
                </div>
              )}
              {!player.nickname && <div className="mb-4" />}

              {player.bio && (
                <div className="text-white/60 text-sm leading-relaxed max-w-md space-y-3">
                  {player.bio.split('\n\n').map((para, i) => (
                    <p key={i}>{para}</p>
                  ))}
                </div>
              )}
            </div>

            {/* Career quick stats */}
            <div className="mt-8 border-t border-white/10 pt-8">
              <div className="flex">
              {player.position === 'GK' ? (
                <div className="pr-4 md:pr-8 border-r border-white/10">
                  <div className="text-3xl md:text-5xl font-display font-bold text-snfc-gold leading-none"
                    style={{ fontFamily: 'Oswald, Arial Narrow, sans-serif' }}>
                    {careerTotals.saves}
                  </div>
                  <div className="text-white/40 text-[10px] md:text-xs font-display uppercase tracking-widest mt-1"
                    style={{ fontFamily: 'Oswald, Arial Narrow, sans-serif' }}>
                    Career Saves
                  </div>
                </div>
              ) : (
                <>
                  <div className="pr-4 md:pr-8 border-r border-white/10">
                    <div className="text-3xl md:text-5xl font-display font-bold text-snfc-gold leading-none"
                      style={{ fontFamily: 'Oswald, Arial Narrow, sans-serif' }}>
                      {careerTotals.goals}
                    </div>
                    <div className="text-white/40 text-[10px] md:text-xs font-display uppercase tracking-widest mt-1"
                      style={{ fontFamily: 'Oswald, Arial Narrow, sans-serif' }}>
                      Career Goals
                    </div>
                  </div>
                  <div className="px-4 md:px-8 border-r border-white/10">
                    <div className="text-3xl md:text-5xl font-display font-bold text-snfc-gold leading-none"
                      style={{ fontFamily: 'Oswald, Arial Narrow, sans-serif' }}>
                      {careerTotals.assists}
                    </div>
                    <div className="text-white/40 text-[10px] md:text-xs font-display uppercase tracking-widest mt-1"
                      style={{ fontFamily: 'Oswald, Arial Narrow, sans-serif' }}>
                      Career Assists
                    </div>
                  </div>
                </>
              )}
              <div className="px-4 md:px-8 border-r border-white/10">
                <div className="text-3xl md:text-5xl font-display font-bold text-white/60 leading-none"
                  style={{ fontFamily: 'Oswald, Arial Narrow, sans-serif' }}>
                  {playerSeasons.length}
                </div>
                <div className="text-white/40 text-[10px] md:text-xs font-display uppercase tracking-widest mt-1"
                  style={{ fontFamily: 'Oswald, Arial Narrow, sans-serif' }}>
                  Seasons
                </div>
              </div>
              {careerTotals.yellowCards > 0 && (
                <div className="px-8 border-r border-white/10">
                  <div className="flex items-end gap-2 leading-none mb-1">
                    <span className="text-5xl font-display font-bold text-amber-400"
                      style={{ fontFamily: 'Oswald, Arial Narrow, sans-serif' }}>
                      {careerTotals.yellowCards}
                    </span>
                    <DisciplinaryCard type="yellow" size="lg" />
                  </div>
                  <div className="text-white/40 text-xs font-display uppercase tracking-widest"
                    style={{ fontFamily: 'Oswald, Arial Narrow, sans-serif' }}>
                    Yellow Cards
                  </div>
                </div>
              )}
              {careerTotals.redCards > 0 && (
                <div className="px-8">
                  <div className="flex items-end gap-2 leading-none mb-1">
                    <span className="text-5xl font-display font-bold text-red-400"
                      style={{ fontFamily: 'Oswald, Arial Narrow, sans-serif' }}>
                      {careerTotals.redCards}
                    </span>
                    <DisciplinaryCard type="red" size="lg" />
                  </div>
                  <div className="text-white/40 text-xs font-display uppercase tracking-widest"
                    style={{ fontFamily: 'Oswald, Arial Narrow, sans-serif' }}>
                    Red Cards
                  </div>
                </div>
              )}
              </div>
              <div className="text-white/20 text-[10px] mt-3"
                style={{ fontFamily: 'Oswald, Arial Narrow, sans-serif' }}>
                * Stats tracked since geasoccer.com was created
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-10 space-y-10">

        {/* ── PHOTO GALLERY ──────────────────────────────────── */}
        {allPhotos.length > 0 && (
          <div>
            <div className="flex items-center gap-4 mb-5">
              <div className="w-1 h-6 bg-snfc-gold" />
              <h2
                className="text-xl font-display font-bold uppercase tracking-widest text-snfc-navy"
                style={{ fontFamily: 'Oswald, Arial Narrow, sans-serif' }}
              >
                Photos
              </h2>
              <span className="text-xs text-gray-400">{allPhotos.length} photos</span>
            </div>

            <div className="grid grid-cols-3 md:grid-cols-4 gap-px bg-gray-200">
              {allPhotos.map((url, i) => (
                <div
                  key={i}
                  className="aspect-square overflow-hidden cursor-pointer bg-snfc-navy group"
                  onClick={() => setLightboxIdx(i)}
                >
                  <img
                    src={url}
                    alt=""
                    className="w-full h-full object-cover object-top group-hover:scale-105 group-hover:opacity-90 transition-all duration-300"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── VIDEO HIGHLIGHTS ───────────────────────────────── */}
        {player.highlights && player.highlights.length > 0 && (
          <div>
            <div className="flex items-center gap-4 mb-5">
              <div className="w-1 h-6 bg-snfc-gold" />
              <h2
                className="text-xl font-display font-bold uppercase tracking-widest text-snfc-navy"
                style={{ fontFamily: 'Oswald, Arial Narrow, sans-serif' }}
              >
                Video Highlights
              </h2>
            </div>

            <div className="grid md:grid-cols-2 gap-px bg-gray-200">
              {player.highlights.map((h, i) => {
                const ytId = extractYouTubeId(h.url);
                const date = new Date(h.date + 'T12:00:00');
                return (
                  <div key={i} className="bg-white">
                    <div className="aspect-video bg-snfc-navy">
                      <iframe
                        src={ytId ? `https://www.youtube.com/embed/${ytId}` : h.url}
                        title={h.title}
                        className="w-full h-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>
                    <div className="px-4 py-3 border-t-2 border-snfc-gold">
                      <div className="font-semibold text-snfc-navy text-sm">{h.title}</div>
                      <div className="flex items-center justify-between mt-1">
                        <div className="text-xs text-gray-400">
                          {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </div>
                        <a
                          href={h.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-xs text-snfc-gold hover:text-snfc-gold-light transition-colors"
                        >
                          <ExternalLink size={11} /> Watch
                        </a>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── SEASON STATS ───────────────────────────────────── */}
        <div>
          <div className="flex items-center gap-4 mb-5">
            <div className="w-1 h-6 bg-snfc-gold" />
            <h2
              className="text-xl font-display font-bold uppercase tracking-widest text-snfc-navy"
              style={{ fontFamily: 'Oswald, Arial Narrow, sans-serif' }}
            >
              Statistics
            </h2>
          </div>

          <div className="bg-white border border-gray-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr
                  className="bg-snfc-navy text-white/60 text-xs font-display uppercase tracking-widest"
                  style={{ fontFamily: 'Oswald, Arial Narrow, sans-serif' }}
                >
                  <th className="text-left px-3 py-2 font-medium">Season</th>
                  {player.position === 'GK'
                    ? <th className="text-center px-3 py-2 font-medium">Saves</th>
                    : <>
                        <th className="text-center px-3 py-2 font-medium">G</th>
                        <th className="text-center px-3 py-2 font-medium">A</th>
                        <th className="text-center px-3 py-2 font-medium">G+A</th>
                      </>
                  }
                  <th className="text-center px-3 py-2 font-medium"><span className="flex justify-center"><DisciplinaryCard type="yellow" size="sm" tilt={false} /></span></th>
                  <th className="text-center px-3 py-2 font-medium"><span className="flex justify-center"><DisciplinaryCard type="red" size="sm" tilt={false} /></span></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {playerSeasons.map((season: Season) => {
                  const s = getPlayerStats(season.id, games);
                  const ps = s[player.id] ?? { goals: 0, assists: 0, saves: 0, yellowCards: 0, redCards: 0 };
                  const isGK = player.position === 'GK';
                  return (
                    <tr key={season.id} className={`hover:bg-gray-50 ${season.isActive ? 'border-l-2 border-l-snfc-gold' : 'border-l-2 border-l-transparent'}`}>
                      <td className="px-3 py-2 font-medium whitespace-nowrap">
                        <span className={season.isActive ? 'text-snfc-gold' : 'text-gray-700'}>
                          {season.id.split('-').map(y => `'${y.slice(2)}`).join('–')}
                        </span>
                      </td>
                      {isGK ? (
                        <td className="px-3 py-2 text-center font-bold text-snfc-navy">{ps.saves}</td>
                      ) : (
                        <>
                          <td className="px-3 py-2 text-center font-bold text-snfc-navy">{ps.goals}</td>
                          <td className="px-3 py-2 text-center font-bold text-snfc-navy">{ps.assists}</td>
                          <td className="px-3 py-2 text-center">
                            <span
                              className={`font-display font-bold text-base ${ps.goals + ps.assists > 0 ? 'text-snfc-gold' : 'text-gray-300'}`}
                              style={{ fontFamily: 'Oswald, Arial Narrow, sans-serif' }}
                            >
                              {ps.goals + ps.assists}
                            </span>
                          </td>
                        </>
                      )}
                      <td className="px-3 py-2 text-center">
                        {ps.yellowCards > 0
                          ? <span className="font-bold text-amber-500">{ps.yellowCards}</span>
                          : <span className="text-gray-200">—</span>}
                      </td>
                      <td className="px-3 py-2 text-center">
                        {ps.redCards > 0
                          ? <span className="font-bold text-red-600">{ps.redCards}</span>
                          : <span className="text-gray-200">—</span>}
                      </td>
                    </tr>
                  );
                })}
                {playerSeasons.length > 1 && (
                  <tr className="bg-snfc-navy/5 border-t-2 border-snfc-gold">
                    <td className="px-3 py-2 font-display font-bold uppercase tracking-wider text-snfc-navy text-xs"
                      style={{ fontFamily: 'Oswald, Arial Narrow, sans-serif' }}>
                      Total
                    </td>
                    {player.position === 'GK' ? (
                      <td className="px-3 py-2 text-center font-bold text-snfc-navy">{careerTotals.saves}</td>
                    ) : (
                      <>
                        <td className="px-3 py-2 text-center font-bold text-snfc-navy">{careerTotals.goals}</td>
                        <td className="px-3 py-2 text-center font-bold text-snfc-navy">{careerTotals.assists}</td>
                        <td className="px-3 py-2 text-center">
                          <span className="font-display font-bold text-base text-snfc-gold"
                            style={{ fontFamily: 'Oswald, Arial Narrow, sans-serif' }}>
                            {careerTotals.goals + careerTotals.assists}
                          </span>
                        </td>
                      </>
                    )}
                    <td className="px-3 py-2 text-center">
                      {careerTotals.yellowCards > 0
                        ? <span className="font-bold text-amber-500">{careerTotals.yellowCards}</span>
                        : <span className="text-gray-200">—</span>}
                    </td>
                    <td className="px-3 py-2 text-center">
                      {careerTotals.redCards > 0
                        ? <span className="font-bold text-red-600">{careerTotals.redCards}</span>
                        : <span className="text-gray-200">—</span>}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── GOALKEEPER APPEARANCES ─────────────────────────── */}
        {keeperGames.length > 0 && (
          <div>
            <div className="flex items-center gap-4 mb-5">
              <div className="w-1 h-6 bg-snfc-gold" />
              <h2
                className="text-xl font-display font-bold uppercase tracking-widest text-snfc-navy"
                style={{ fontFamily: 'Oswald, Arial Narrow, sans-serif' }}
              >
                Goalkeeper Appearances
              </h2>
            </div>

            {/* Summary bar */}
            <div className="grid grid-cols-5 gap-px bg-gray-200 mb-px">
              {[
                { label: 'Appearances', value: keeperGames.length },
                { label: 'Saves',       value: keeperTotals.saves },
                { label: 'Clean Sheets',value: keeperTotals.cleanSheets },
                { label: 'Record',      value: `${keeperTotals.wins}W ${keeperTotals.draws}D ${keeperTotals.losses}L` },
                { label: 'Save %',      value: (() => {
                    const shots = keeperTotals.saves + keeperGames.reduce((a, g) => a + g.goalsAgainst, 0);
                    return shots > 0 ? `${Math.round((keeperTotals.saves / shots) * 100)}%` : '—';
                  })() },
              ].map(({ label, value }) => (
                <div key={label} className="bg-snfc-navy px-4 py-4 text-center">
                  <div
                    className="text-2xl font-display font-bold text-snfc-gold leading-none"
                    style={{ fontFamily: 'Oswald, Arial Narrow, sans-serif' }}
                  >
                    {value}
                  </div>
                  <div
                    className="text-white/40 text-[10px] font-display uppercase tracking-widest mt-1"
                    style={{ fontFamily: 'Oswald, Arial Narrow, sans-serif' }}
                  >
                    {label}
                  </div>
                </div>
              ))}
            </div>

            {/* Per-game table */}
            <div className="bg-white border border-gray-200 overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr
                    className="bg-snfc-navy text-white/60 text-xs font-display uppercase tracking-widest"
                    style={{ fontFamily: 'Oswald, Arial Narrow, sans-serif' }}
                  >
                    <th className="text-left px-4 py-3 font-medium">Date</th>
                    <th className="text-left px-4 py-3 font-medium">Opponent</th>
                    <th className="text-center px-4 py-3 font-medium">Saves</th>
                    <th className="text-center px-4 py-3 font-medium">GA</th>
                    <th className="text-center px-4 py-3 font-medium">Result</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {keeperGames.map((game: Game) => {
                    const date = new Date(game.date + 'T12:00:00');
                    const saves = game.keeperSavesDetail
                      ? (game.keeperSavesDetail.find(k => k.keeperId === player.id)?.saves ?? 0)
                      : (game.keeperSaves ?? 0);
                    const isWin  = game.goalsFor > game.goalsAgainst;
                    const isDraw = game.goalsFor === game.goalsAgainst;
                    const resultLabel = isWin ? 'W' : isDraw ? 'D' : 'L';
                    const resultColor = isWin ? 'text-emerald-600' : isDraw ? 'text-amber-500' : 'text-red-500';
                    const isClean = game.goalsAgainst === 0;
                    return (
                      <tr key={game.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">
                          {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </td>
                        <td className="px-4 py-3">
                          <Link
                            to={`/games/${game.id}`}
                            className="font-medium text-snfc-navy hover:text-snfc-gold transition-colors"
                          >
                            vs. {game.opponent.name}
                          </Link>
                        </td>
                        <td className="px-4 py-3 text-center font-bold text-snfc-navy">{saves}</td>
                        <td className="px-4 py-3 text-center">
                          {isClean ? (
                            <span
                              className="text-xs font-display font-bold px-2 py-0.5 bg-emerald-100 text-emerald-700"
                              style={{ fontFamily: 'Oswald, Arial Narrow, sans-serif' }}
                            >
                              Clean
                            </span>
                          ) : (
                            <span className="text-gray-600">{game.goalsAgainst}</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span
                            className={`font-display font-bold ${resultColor}`}
                            style={{ fontFamily: 'Oswald, Arial Narrow, sans-serif' }}
                          >
                            {resultLabel}
                          </span>
                          <span className="text-gray-400 text-xs ml-1">
                            {game.goalsFor}–{game.goalsAgainst}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── GOAL CONTRIBUTIONS ─────────────────────────────── */}
        {goalContribGames.length > 0 && (
          <div>
            <div className="flex items-center gap-4 mb-5">
              <div className="w-1 h-6 bg-snfc-gold" />
              <h2
                className="text-xl font-display font-bold uppercase tracking-widest text-snfc-navy"
                style={{ fontFamily: 'Oswald, Arial Narrow, sans-serif' }}
              >
                Goal Contributions
              </h2>
            </div>

            <div className="bg-white border border-gray-200 divide-y divide-gray-100">
              {goalContribGames.map((game: Game) => {
                const date = new Date(game.date + 'T12:00:00');
                const contribs = game.goals.filter(
                  (g: GoalEvent) => g.scorerId === player.id || g.assisterId === player.id
                );
                const isWin = game.goalsFor > game.goalsAgainst;
                const isDraw = game.goalsFor === game.goalsAgainst;
                return (
                  <div key={game.id} className="flex items-center gap-3 px-4 py-3">
                    <div className={`w-1 self-stretch shrink-0 ${isWin ? 'bg-emerald-400' : isDraw ? 'bg-amber-400' : 'bg-red-400'}`} />
                    <div className="flex-1 min-w-0">
                      <Link to={`/games/${game.id}`} className="font-medium text-sm text-snfc-navy hover:text-snfc-gold transition-colors leading-tight block truncate">
                        vs. {game.opponent.name}
                      </Link>
                      <div className="text-xs text-gray-400">
                        {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </div>
                    </div>
                    <div
                      className="text-sm font-display font-bold shrink-0 w-10 text-center"
                      style={{ fontFamily: 'Oswald, Arial Narrow, sans-serif' }}
                    >
                      <span className={isWin ? 'text-snfc-gold' : 'text-red-500'}>{game.goalsFor}</span>
                      <span className="text-gray-300 mx-0.5">–</span>
                      <span className="text-gray-500">{game.goalsAgainst}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-1 shrink-0 w-20">
                      {contribs.map((c: GoalEvent, i: number) => (
                        <span
                          key={i}
                          className={`text-xs font-display font-bold px-1.5 py-0.5 text-center whitespace-nowrap ${
                            c.scorerId === player.id
                              ? 'bg-snfc-navy text-snfc-gold'
                              : 'bg-snfc-gold/20 text-snfc-gold-dark border border-snfc-gold/30'
                          }`}
                          style={{ fontFamily: 'Oswald, Arial Narrow, sans-serif' }}
                          title={c.scorerId === player.id ? 'Goal' : 'Assist'}
                        >
                          {c.scorerId === player.id ? `G ${c.minute}'` : `A ${c.minute}'`}
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* ── LIGHTBOX ────────────────────────────────────────── */}
      {lightboxIdx !== null && (
        <div
          className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center"
          onClick={closeLightbox}
        >
          <button
            className="absolute top-4 right-4 text-white/60 hover:text-white p-2 transition-colors"
            onClick={closeLightbox}
          >
            <X size={24} />
          </button>
          <button
            className="absolute left-4 top-1/2 -translate-y-1/2 text-white/60 hover:text-white p-2 transition-colors"
            onClick={e => { e.stopPropagation(); prevPhoto(); }}
          >
            <ChevronLeft size={32} />
          </button>
          <button
            className="absolute right-4 top-1/2 -translate-y-1/2 text-white/60 hover:text-white p-2 transition-colors"
            onClick={e => { e.stopPropagation(); nextPhoto(); }}
          >
            <ChevronRight size={32} />
          </button>
          <img
            src={allPhotos[lightboxIdx]}
            alt=""
            className="max-w-[90vw] max-h-[90vh] object-contain"
            onClick={e => e.stopPropagation()}
          />
          <div className="absolute bottom-4 text-white/40 text-sm">
            {lightboxIdx + 1} / {allPhotos.length}
          </div>
        </div>
      )}
    </div>
  );
}
