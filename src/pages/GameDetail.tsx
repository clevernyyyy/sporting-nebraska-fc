import { Fragment, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Calendar, Home, Plane, ExternalLink, Clock, Trophy, HelpCircle, X, MapPin } from 'lucide-react';
import { getAppData } from '../data';
import { PLAYERS } from '../data/players';
import type { GoalEvent, CardEvent } from '../types';
import DisciplinaryCard from '../components/DisciplinaryCard';
import { isUpcomingGame } from '../components/GameCard';

function playerName(id: string, guestName?: string) {
  if (id === 'opponent') return 'Opponent';
  if (id === 'guest') return guestName ?? 'Guest Player';
  return PLAYERS.find(p => p.id === id)?.name ?? 'Unknown';
}

export default function GameDetail() {
  const { id } = useParams<{ id: string }>();
  const [pkAssistModal, setPkAssistModal] = useState(false);
  const { games, seasons } = getAppData();
  const game = games.find((g: { id: string }) => g.id === id);

  if (!game) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center text-gray-400">
        Game not found.{' '}
        <Link to="/games" className="text-snfc-gold underline">Back to games</Link>
      </div>
    );
  }

  const season = seasons.find((s: { id: string }) => s.id === game.seasonId);
  const date = new Date(game.date + 'T12:00:00');
  const upcoming = isUpcomingGame(game);
  const isWin = game.goalsFor > game.goalsAgainst;
  const isDraw = game.goalsFor === game.goalsAgainst;

  type TimelineItem =
    | { kind: 'goal'; data: GoalEvent & { team: 'gretna' | 'opponent' }; minute: number }
    | { kind: 'card'; data: CardEvent; minute: number };

  const timeline: TimelineItem[] = [
    ...game.goals.map((g: GoalEvent) => ({ kind: 'goal' as const, data: { ...g, team: 'gretna' as const }, minute: g.minute })),
    ...game.opponentGoals.map((g: GoalEvent) => ({ kind: 'goal' as const, data: { ...g, team: 'opponent' as const }, minute: g.minute })),
    ...(game.cards ?? []).map((c: CardEvent) => ({ kind: 'card' as const, data: c, minute: c.minute })),
  ].sort((a, b) => a.minute - b.minute);


  let gretnaScore = 0;
  let oppScore = 0;

  const HERO_BG = 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=1920&q=80&auto=format&fit=crop';

  return (
    <div>
      {/* ── HERO ─────────────────────────────────────────────── */}
      <div
        className="relative py-16 px-4"
        style={{
          backgroundImage: `url(${HERO_BG})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed',
        }}
      >
        <div className="absolute inset-0 bg-snfc-navy/82" />
        <div className="relative max-w-3xl mx-auto">
          <Link
            to="/games"
            className="inline-flex items-center gap-1.5 text-white/50 hover:text-snfc-gold transition-colors text-sm font-display uppercase tracking-wider mb-6"
            style={{ fontFamily: 'Oswald, Arial Narrow, sans-serif' }}
          >
            <ArrowLeft size={14} /> Back to Games
          </Link>

          <div className="flex items-start justify-between gap-4 mb-8">
            <div>
              <div
                className="text-snfc-gold text-xs font-display uppercase tracking-widest mb-2"
                style={{ fontFamily: 'Oswald, Arial Narrow, sans-serif' }}
              >
                {season?.label} · {game.isHome ? 'Home' : 'Away'}
              </div>
              <h1
                className="text-4xl md:text-5xl font-display font-bold text-white leading-none"
                style={{ fontFamily: 'Oswald, Arial Narrow, sans-serif' }}
              >
                vs. {game.opponent.name}
              </h1>
              <div className="text-white/40 text-sm mt-1">{game.opponent.city}, {game.opponent.state}</div>
            </div>
            <div
              className={`shrink-0 px-4 py-1.5 text-sm font-display font-bold uppercase tracking-wider border ${
                upcoming
                  ? 'border-snfc-gold text-snfc-gold'
                  : isWin
                  ? 'border-emerald-400 text-emerald-400'
                  : isDraw
                  ? 'border-white/30 text-white/60'
                  : 'border-red-400 text-red-400'
              }`}
              style={{ fontFamily: 'Oswald, Arial Narrow, sans-serif' }}
            >
              {upcoming ? 'Upcoming' : isWin ? 'WIN' : isDraw ? 'DRAW' : 'LOSS'}
            </div>
          </div>

          {/* Score / kickoff */}
          {upcoming ? (
            <div className="flex items-center gap-6 mb-8">
              <div className="text-center bg-white/10 px-6 py-4">
                <div className="text-xs text-white/40 font-display uppercase tracking-widest mb-1"
                  style={{ fontFamily: 'Oswald, Arial Narrow, sans-serif' }}>
                  {date.toLocaleDateString('en-US', { weekday: 'long' })}
                </div>
                <div
                  className="text-5xl font-display font-bold text-snfc-gold leading-none"
                  style={{ fontFamily: 'Oswald, Arial Narrow, sans-serif' }}
                >
                  {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </div>
                {game.startTime && (
                  <div className="text-white/60 text-sm mt-2">
                    {(() => {
                      const [h, m] = game.startTime.split(':').map(Number);
                      const ampm = h >= 12 ? 'PM' : 'AM';
                      return `${h > 12 ? h - 12 : h || 12}:${String(m).padStart(2, '0')} ${ampm}`;
                    })()}
                  </div>
                )}
              </div>
              {game.venueCity !== 'TBD' && (
                <div className="text-white/50 text-sm flex items-start gap-1.5">
                  <MapPin size={13} className="mt-0.5 shrink-0" />
                  <div>
                    <div>{game.venue}</div>
                    <div>{game.venueCity}, {game.venueState}</div>
                  </div>
                </div>
              )}
            </div>
          ) : (
          <div className="flex items-center gap-8 mb-8">
            <div className="text-center">
              <div className="text-xs text-white/40 font-display uppercase tracking-widest mb-1"
                style={{ fontFamily: 'Oswald, Arial Narrow, sans-serif' }}>
                Sporting NE FC
              </div>
              <div
                className="text-8xl font-display font-bold text-snfc-gold leading-none"
                style={{ fontFamily: 'Oswald, Arial Narrow, sans-serif' }}
              >
                {game.goalsFor}
              </div>
            </div>
            <div className="text-4xl text-white/20 font-display"
              style={{ fontFamily: 'Oswald, Arial Narrow, sans-serif' }}>–</div>
            <div className="text-center">
              <div className="text-xs text-white/40 font-display uppercase tracking-widest mb-1"
                style={{ fontFamily: 'Oswald, Arial Narrow, sans-serif' }}>
                {game.opponent.name}
              </div>
              <div
                className="text-8xl font-display font-bold text-white/70 leading-none"
                style={{ fontFamily: 'Oswald, Arial Narrow, sans-serif' }}
              >
                {game.goalsAgainst}
              </div>
            </div>
          </div>
          )}

          {/* Tournament banner + keeper saves */}
          {(game.tournament || game.keeperSaves !== undefined || game.keeperSavesDetail || game.shotsOnGoal !== undefined || game.shotsOnGoalDetail) && (
            <div className="flex flex-wrap items-center gap-3 mb-6">

          {game.tournament && (() => {
            const isChamp = game.tournament.result === 'champion';
            const inner = (
              <>
                {game.tournament.logoUrl && (
                  <img src={game.tournament.logoUrl} alt={game.tournament.name} className="h-8 w-auto object-contain shrink-0" />
                )}
                {isChamp && !game.tournament.logoUrl && <Trophy size={15} className="text-snfc-navy shrink-0" />}
                <div className="flex flex-col leading-tight">
                  <span
                    className={`font-display font-bold uppercase tracking-widest text-sm ${isChamp ? 'text-snfc-navy' : 'text-white/80'}`}
                    style={{ fontFamily: 'Oswald, Arial Narrow, sans-serif' }}
                  >
                    {game.tournament.name}
                  </span>
                  {(game.tournament.round || isChamp) && (
                    <span
                      className={`text-xs uppercase tracking-wider ${isChamp ? 'text-snfc-navy/60' : 'text-white/40'}`}
                      style={{ fontFamily: 'Oswald, Arial Narrow, sans-serif' }}
                    >
                      {isChamp ? 'Champions' : game.tournament.round}
                    </span>
                  )}
                </div>
              </>
            );
            const baseClass = `inline-flex items-center gap-3 px-4 py-2.5 ${isChamp ? 'bg-snfc-gold' : 'bg-white/10'}`;
            return game.tournament.website ? (
              <a href={game.tournament.website} target="_blank" rel="noopener noreferrer" className={`${baseClass} hover:brightness-125 transition-[filter]`}>
                {inner}
              </a>
            ) : (
              <div className={baseClass}>{inner}</div>
            );
          })()}

          {/* Keeper saves pill */}
          {(game.keeperSaves !== undefined || game.keeperSavesDetail) && (
            <div className="inline-flex items-center gap-3 bg-white/10 px-4 py-2 flex-wrap">
              <span className="text-white/50 text-xs font-display uppercase tracking-wider"
                style={{ fontFamily: 'Oswald, Arial Narrow, sans-serif' }}>
                Keeper Saves
              </span>
              {game.keeperSavesDetail ? (
                <span className="flex items-center gap-3">
                  {game.keeperSavesDetail.map(({ keeperId, saves }) => (
                    <span key={keeperId} className="flex items-center gap-1">
                      <span className="text-white/50 text-xs"
                        style={{ fontFamily: 'Oswald, Arial Narrow, sans-serif' }}>
                        {playerName(keeperId)}
                      </span>
                      <span className="text-snfc-gold font-display font-bold text-xl leading-none"
                        style={{ fontFamily: 'Oswald, Arial Narrow, sans-serif' }}>
                        {saves}
                      </span>
                    </span>
                  ))}
                </span>
              ) : (
                <span className="text-snfc-gold font-display font-bold text-xl leading-none"
                  style={{ fontFamily: 'Oswald, Arial Narrow, sans-serif' }}>
                  {game.keeperSaves}
                </span>
              )}
            </div>
          )}

          {/* Shots on goal pill */}
          {(game.shotsOnGoal !== undefined || game.shotsOnGoalDetail) && (
            <div className="inline-flex items-center gap-3 bg-white/10 px-4 py-2 flex-wrap">
              <span className="text-white/50 text-xs font-display uppercase tracking-wider"
                style={{ fontFamily: 'Oswald, Arial Narrow, sans-serif' }}>
                Shots on Goal
              </span>
              <span className="text-snfc-gold font-display font-bold text-xl leading-none"
                style={{ fontFamily: 'Oswald, Arial Narrow, sans-serif' }}>
                {game.shotsOnGoal ?? game.shotsOnGoalDetail!.reduce((s, d) => s + d.sog, 0)}
              </span>
            </div>
          )}

            </div>
          )}

          {/* Shots on goal breakdown */}
          {game.shotsOnGoalDetail && game.shotsOnGoalDetail.length > 0 && (
            <div className="mb-6 -mt-2">
              <div className="text-white/40 text-[10px] font-display uppercase tracking-widest mb-2"
                style={{ fontFamily: 'Oswald, Arial Narrow, sans-serif' }}>
                Shots on Goal by Player
              </div>
              <div className="flex flex-wrap gap-2">
                {[...game.shotsOnGoalDetail]
                  .sort((a, b) => b.sog - a.sog)
                  .map(({ playerId, sog }) => (
                    <Link
                      key={playerId}
                      to={`/players/${playerId}`}
                      className="inline-flex items-center gap-1.5 bg-white/10 hover:bg-white/20 transition-colors px-2.5 py-1"
                    >
                      <span className="text-white/70 text-xs"
                        style={{ fontFamily: 'Oswald, Arial Narrow, sans-serif' }}>
                        {playerName(playerId)}
                      </span>
                      <span className="text-snfc-gold font-display font-bold text-sm leading-none"
                        style={{ fontFamily: 'Oswald, Arial Narrow, sans-serif' }}>
                        {sog}
                      </span>
                    </Link>
                  ))}
              </div>
            </div>
          )}

          {/* Meta */}
          <div className="flex flex-wrap gap-5 text-white/50 text-sm mb-4">
            <span className="flex items-center gap-1.5"><Calendar size={13} />
              {date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </span>
            {game.startTime && (
              <span className="flex items-center gap-1.5"><Clock size={13} />
                {(() => {
                  const [h, m] = game.startTime.split(':').map(Number);
                  const ampm = h >= 12 ? 'PM' : 'AM';
                  return `${h > 12 ? h - 12 : h || 12}:${String(m).padStart(2, '0')} ${ampm} CST`;
                })()}
              </span>
            )}
          </div>

          {/* Venue + field type */}
          <div className="flex items-start justify-between gap-6">
            <div className="flex items-start gap-2 text-white/50 text-sm">
              <span className="mt-0.5 shrink-0">
                {game.isHome ? <Home size={13} /> : <Plane size={13} />}
              </span>
              <div className="space-y-0.5">
                <div>{game.venue}</div>
                {game.venueAddress && <div>{game.venueAddress}</div>}
                <div>{game.venueCity}, {game.venueState}</div>
              </div>
            </div>
            {(game.fieldType || game.uniformColor) && (
              <div className="flex gap-6 shrink-0">
                {game.fieldType && (
                  <div className="text-right">
                    <div
                      className="text-white/30 text-[10px] font-display uppercase tracking-widest mb-0.5"
                      style={{ fontFamily: 'Oswald, Arial Narrow, sans-serif' }}
                    >
                      Field Type
                    </div>
                    <div
                      className="text-white/60 text-sm font-display uppercase tracking-wider capitalize"
                      style={{ fontFamily: 'Oswald, Arial Narrow, sans-serif' }}
                    >
                      {game.fieldType}
                    </div>
                  </div>
                )}
                {game.uniformColor && (
                  <div className="text-right">
                    <div
                      className="text-white/30 text-[10px] font-display uppercase tracking-widest mb-0.5"
                      style={{ fontFamily: 'Oswald, Arial Narrow, sans-serif' }}
                    >
                      Uniform
                    </div>
                    <div
                      className="text-white/60 text-sm font-display uppercase tracking-wider capitalize"
                      style={{ fontFamily: 'Oswald, Arial Narrow, sans-serif' }}
                    >
                      {game.uniformColor}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── CONTENT ──────────────────────────────────────────── */}
      <div className="max-w-3xl mx-auto px-4 py-10 space-y-6">

        {/* Goal Timeline */}
        {timeline.length > 0 && (
          <div className="bg-white border border-gray-200">
            <div className="border-b-2 border-snfc-gold px-5 py-3">
              <h2
                className="font-display font-bold uppercase tracking-widest text-snfc-navy"
                style={{ fontFamily: 'Oswald, Arial Narrow, sans-serif' }}
              >
                Match Timeline
              </h2>
            </div>
            <div>
              {timeline.map((item, i) => {
                const showHalftime = item.minute > 30 && (i === 0 || timeline[i - 1].minute <= 30);
                const halftimeRow = showHalftime ? (
                  <div className="flex items-center gap-3 px-5 py-2 border-b border-gray-100 bg-gray-50">
                    <span
                      className="text-xs font-display font-bold text-gray-300 w-10 text-right shrink-0"
                      style={{ fontFamily: 'Oswald, Arial Narrow, sans-serif' }}
                    >
                      30'
                    </span>
                    <div className="flex-1 h-px bg-gray-200" />
                    <span
                      className="text-[10px] font-display font-bold uppercase tracking-widest text-gray-400 shrink-0 px-2"
                      style={{ fontFamily: 'Oswald, Arial Narrow, sans-serif' }}
                    >
                      Half Time
                    </span>
                    <div className="flex-1 h-px bg-gray-200" />
                  </div>
                ) : null;

                if (item.kind === 'goal') {
                  const goal = item.data;
                  if (goal.team === 'gretna') gretnaScore += 1;
                  else oppScore += 1;
                  const isGretna = goal.team === 'gretna';
                  const isGuest = goal.scorerId === 'guest';
                  const scorer = playerName(goal.scorerId, goal.guestName);
                  const assister = goal.assisterId ? playerName(goal.assisterId, goal.assisterGuestName) : null;
                  const assisterIsGuest = goal.assisterId === 'guest';
                  const scorerPlayer = isGretna && !isGuest ? PLAYERS.find(p => p.id === goal.scorerId) : null;

                  return (
                    <Fragment key={i}>
                    {halftimeRow}
                    <div className={`flex items-center gap-4 px-5 py-3 border-b border-gray-100 last:border-0 ${isGretna ? '' : 'bg-red-50/50'}`}>
                      <span className="text-sm font-display font-bold text-gray-400 w-10 text-right shrink-0"
                        style={{ fontFamily: 'Oswald, Arial Narrow, sans-serif' }}>
                        {goal.minute}'
                      </span>
                      <span className={`text-base shrink-0 ${isGretna ? '' : 'opacity-40'}`}>⚽</span>
                      <div className="flex-1 min-w-0">
                        {isGretna ? (
                          goal.isOwnGoal ? (
                            <span className="text-sm text-gray-500 italic">
                              Own Goal — {game.opponent.name}
                            </span>
                          ) : (
                            <div className="flex items-center gap-2 flex-wrap">
                              {scorerPlayer?.photoUrl && (
                                <img src={scorerPlayer.photoUrl} className="w-6 h-6 object-cover object-[center_25%] border border-snfc-gold shrink-0" alt="" />
                              )}
                              {isGuest ? (
                                <span className="font-semibold text-snfc-navy text-sm">
                                  {scorer}
                                  <span className="text-[10px] text-white/60 font-normal bg-gray-400 px-1 py-0.5 ml-1 uppercase tracking-wider">Guest</span>
                                </span>
                              ) : (
                                <Link to={`/players/${goal.scorerId}`} className="font-semibold text-snfc-navy hover:text-snfc-gold transition-colors text-sm">
                                  {scorer}
                                </Link>
                              )}
                              {goal.isPenalty && (
                                <span
                                  className="text-[10px] font-display font-bold text-snfc-gold border border-snfc-gold px-1 py-0.5 uppercase tracking-wider leading-none"
                                  style={{ fontFamily: 'Oswald, Arial Narrow, sans-serif' }}
                                >
                                  PK
                                </span>
                              )}
                              {assister && (
                                <span className="text-xs text-gray-400 flex items-center gap-1">
                                  · assist: {assisterIsGuest
                                    ? <span className="text-gray-500">{assister}</span>
                                    : <Link to={`/players/${goal.assisterId!}`} className="hover:text-snfc-gold transition-colors">{assister}</Link>
                                  }
                                  {goal.assistType === 'corner_kick' && (
                                    <span className="text-snfc-gold font-semibold"> (CK)</span>
                                  )}
                                  {goal.isPenalty && (
                                    <button
                                      onClick={() => setPkAssistModal(true)}
                                      className="text-gray-300 hover:text-snfc-gold transition-colors ml-0.5"
                                      title="Why does a PK have an assist?"
                                    >
                                      <HelpCircle size={15} />
                                    </button>
                                  )}
                                </span>
                              )}
                            </div>
                          )
                        ) : (
                          <span className="flex items-center gap-2 text-sm text-gray-500 italic">
                            {game.opponent.name}
                            {goal.isPenalty && (
                              <span
                                className="text-[10px] not-italic font-display font-bold text-gray-400 border border-gray-300 px-1 py-0.5 uppercase tracking-wider leading-none"
                                style={{ fontFamily: 'Oswald, Arial Narrow, sans-serif' }}
                              >
                                PK
                              </span>
                            )}
                          </span>
                        )}
                      </div>
                      <span className="shrink-0 text-sm font-display font-bold"
                        style={{ fontFamily: 'Oswald, Arial Narrow, sans-serif' }}>
                        <span className={isGretna ? 'text-snfc-gold' : 'text-gray-400'}>{gretnaScore}</span>
                        <span className="text-gray-300 mx-1">–</span>
                        <span className={!isGretna ? 'text-red-500' : 'text-gray-400'}>{oppScore}</span>
                      </span>
                    </div>
                    </Fragment>
                  );
                }

                // Card event
                const card = item.data;
                const isOppCard = card.team === 'opponent' || card.playerId === 'opponent';
                const cardPlayer = isOppCard ? null : PLAYERS.find(p => p.id === card.playerId);
                return (
                  <Fragment key={i}>
                  {halftimeRow}
                  <div className={`flex items-center gap-4 px-5 py-3 border-b border-gray-100 last:border-0 ${card.type === 'yellow' ? 'bg-amber-50/40' : 'bg-red-50/40'}`}>
                    <span className="text-sm font-display font-bold text-gray-400 w-10 text-right shrink-0"
                      style={{ fontFamily: 'Oswald, Arial Narrow, sans-serif' }}>
                      {card.minute}'
                    </span>
                    <DisciplinaryCard type={card.type} size="md" />
                    <div className="flex-1 min-w-0 flex items-center gap-2">
                      {isOppCard ? (
                        <span className="text-sm text-gray-500 italic">
                          {game.opponent.name}{card.jerseyNumber ? ` #${card.jerseyNumber}` : ''}
                        </span>
                      ) : (
                        <>
                          {cardPlayer?.photoUrl && (
                            <img src={cardPlayer.photoUrl} className="w-6 h-6 object-cover object-[center_25%] border border-gray-200 shrink-0" alt="" />
                          )}
                          <Link to={`/players/${card.playerId}`} className="font-semibold text-snfc-navy hover:text-snfc-gold transition-colors text-sm">
                            {cardPlayer?.name ?? 'Unknown'}
                          </Link>
                        </>
                      )}
                      {card.reason && (
                        <span className="text-xs text-gray-400 italic">· {card.reason}</span>
                      )}
                    </div>
                    <span className="shrink-0 text-sm font-display font-bold text-gray-300"
                      style={{ fontFamily: 'Oswald, Arial Narrow, sans-serif' }}>
                      {gretnaScore}–{oppScore}
                    </span>
                  </div>
                  </Fragment>
                );
              })}
            </div>
          </div>
        )}

        {/* Scorer cards */}
        {game.goals.some((g: GoalEvent) => !g.isOwnGoal) && (
          <div className="bg-white border border-gray-200">
            <div className="border-b-2 border-snfc-gold px-5 py-3">
              <h2
                className="font-display font-bold uppercase tracking-widest text-snfc-navy"
                style={{ fontFamily: 'Oswald, Arial Narrow, sans-serif' }}
              >
                Sporting NE FC Scorers
              </h2>
            </div>
            <div className="divide-y divide-gray-100">
              {game.goals.filter((g: GoalEvent) => !g.isOwnGoal).map((goal: GoalEvent, i: number) => {
                const isGuest = goal.scorerId === 'guest';
                const scorer = isGuest ? null : PLAYERS.find(p => p.id === goal.scorerId);
                const scorerDisplayName = isGuest ? (goal.guestName ?? 'Guest Player') : (scorer?.name ?? 'Unknown');
                const assisterIsGuest = goal.assisterId === 'guest';
                const assister = goal.assisterId && !assisterIsGuest ? PLAYERS.find(p => p.id === goal.assisterId) : null;
                const assisterDisplayName = assisterIsGuest ? (goal.assisterGuestName ?? 'Guest') : assister?.name;
                return (
                  <div key={i} className="flex items-center gap-3 px-5 py-3">
                    {scorer?.photoUrl && (
                      <img src={scorer.photoUrl} alt="" className="w-10 h-10 object-cover object-[center_25%] border-2 border-snfc-gold" />
                    )}
                    <div className="flex-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {isGuest ? (
                          <span className="font-semibold text-snfc-navy text-sm">{scorerDisplayName}</span>
                        ) : (
                          <Link to={`/players/${scorer?.id}`} className="font-semibold text-snfc-navy hover:text-snfc-gold transition-colors text-sm">
                            {scorerDisplayName}
                          </Link>
                        )}
                        {isGuest && (
                          <span className="text-[10px] text-white/60 font-normal bg-gray-400 px-1 py-0.5 uppercase tracking-wider">Guest</span>
                        )}
                        {goal.isPenalty && (
                          <span
                            className="text-[10px] font-display font-bold text-snfc-gold border border-snfc-gold px-1 py-0.5 uppercase tracking-wider leading-none"
                            style={{ fontFamily: 'Oswald, Arial Narrow, sans-serif' }}
                          >
                            PK
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-gray-400">
                        {goal.minute}'
                        {assisterDisplayName && (
                          <> · Assist: {assisterIsGuest
                            ? <span>{assisterDisplayName}</span>
                            : <Link to={`/players/${assister!.id}`} className="hover:text-snfc-gold transition-colors">{assisterDisplayName}</Link>
                          }
                          {goal.assistType === 'corner_kick' && <span className="text-snfc-gold font-semibold"> (CK)</span>}
                          </>
                        )}
                      </div>
                    </div>
                    <span
                      className="text-xl font-display font-bold text-gray-200"
                      style={{ fontFamily: 'Oswald, Arial Narrow, sans-serif' }}
                    >
                      {scorer?.number !== undefined ? `#${scorer.number}` : ''}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Notes */}
        {game.notes && (
          <div className="bg-white border border-gray-200">
            <div className="border-b-2 border-snfc-gold px-5 py-3">
              <h2
                className="font-display font-bold uppercase tracking-widest text-snfc-navy"
                style={{ fontFamily: 'Oswald, Arial Narrow, sans-serif' }}
              >
                Match Summary
              </h2>
            </div>
            <p className="px-5 py-4 text-gray-600 text-sm leading-relaxed">{game.notes}</p>
          </div>
        )}

        {/* Highlights */}
        {game.highlights && game.highlights.length > 0 && (
          <div className="bg-white border border-gray-200">
            <div className="border-b-2 border-snfc-gold px-5 py-3">
              <h2
                className="font-display font-bold uppercase tracking-widest text-snfc-navy"
                style={{ fontFamily: 'Oswald, Arial Narrow, sans-serif' }}
              >
                Highlights
              </h2>
            </div>
            <div className="px-5 py-4 space-y-2">
              {game.highlights.map((url: string, i: number) => (
                <a
                  key={i}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-snfc-gold hover:text-snfc-gold-light font-medium transition-colors"
                >
                  <ExternalLink size={13} />
                  Watch Highlight {game.highlights!.length > 1 ? i + 1 : ''}
                </a>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── PK ASSIST MODAL ─────────────────────────────────── */}
      {pkAssistModal && (
        <div
          className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
          onClick={() => setPkAssistModal(false)}
        >
          <div
            className="bg-white max-w-md w-full shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between bg-snfc-navy px-5 py-4">
              <h3
                className="text-white font-display font-bold uppercase tracking-widest text-sm"
                style={{ fontFamily: 'Oswald, Arial Narrow, sans-serif' }}
              >
                Why does a penalty have an assist?
              </h3>
              <button onClick={() => setPkAssistModal(false)} className="text-white/40 hover:text-white transition-colors">
                <X size={18} />
              </button>
            </div>
            <div className="px-5 py-5 space-y-3">
              <p className="text-gray-700 text-sm leading-relaxed">
                Under FIFA scoring rules, if a player is fouled in the penalty area and a teammate converts the resulting penalty kick, <strong>the fouled player is credited with an assist</strong> - even though they didn't directly create the goal.
              </p>
              <p className="text-gray-700 text-sm leading-relaxed">
                The logic: the foul was drawn by the fouled player's attacking action, which directly led to the scoring opportunity. The assist recognizes that contribution.
              </p>
              <p className="text-gray-500 text-xs leading-relaxed border-t border-gray-100 pt-3">
                This site follows FIFA assist rules.{' '}
                <a
                  href="https://sportspundit.com/soccer/terms/2682-assist/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-snfc-gold hover:underline inline-flex items-center gap-1"
                >
                  Learn more <ExternalLink size={10} />
                </a>
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
