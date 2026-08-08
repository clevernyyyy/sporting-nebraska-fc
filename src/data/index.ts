/**
 * Central data store.
 *
 * Base data lives in players.ts, seasons.ts, games.ts — edit those directly.
 * Admin-created seasons/games are layered on top via localStorage.
 */

import { PLAYERS } from './players';
import { SEASONS } from './seasons';
import { GAMES } from './games';
import { COACHES } from './coaches';
import type { AppData, Game, Season, PlayerStats } from '../types';

const LS_KEY = 'gea_u11_data';

function loadLocalData(): Partial<AppData> {
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveLocalData(data: Partial<AppData>) {
  localStorage.setItem(LS_KEY, JSON.stringify(data));
}

export function getAppData(): AppData {
  const local = loadLocalData();
  return {
    players: PLAYERS,
    seasons: [...SEASONS, ...(local.seasons ?? [])],
    games: [...GAMES, ...(local.games ?? [])],
  };
}

export function addSeason(season: Season): void {
  const local = loadLocalData();
  saveLocalData({ ...local, seasons: [...(local.seasons ?? []), season] });
}

export function addGame(game: Game): void {
  const local = loadLocalData();
  saveLocalData({ ...local, games: [...(local.games ?? []), game] });
}

/** Returns per-player stats for a given season. */
export function getPlayerStats(seasonId: string, games: Game[]): Record<string, PlayerStats> {
  const seasonGames = games.filter(g => g.seasonId === seasonId);
  const stats: Record<string, PlayerStats> = {};

  const ensure = (id: string) => {
    if (!stats[id]) {
      stats[id] = { goals: 0, assists: 0, gamesPlayed: 0, saves: 0, shotsOnGoal: 0, yellowCards: 0, redCards: 0 };
    }
  };

  for (const game of seasonGames) {
    const involvedPlayers = new Set<string>();

    // Goals (skip own goals — they count in goalsFor but not a player's tally)
    for (const goal of game.goals) {
      if (goal.isOwnGoal) continue;
      ensure(goal.scorerId);
      stats[goal.scorerId].goals += 1;
      involvedPlayers.add(goal.scorerId);

      if (goal.assisterId) {
        ensure(goal.assisterId);
        stats[goal.assisterId].assists += 1;
        involvedPlayers.add(goal.assisterId);
      }
    }

    // Cards (skip opposition cards)
    for (const card of (game.cards ?? [])) {
      if (card.team === 'opponent' || card.playerId === 'opponent') continue;
      ensure(card.playerId);
      if (card.type === 'yellow') stats[card.playerId].yellowCards += 1;
      else                        stats[card.playerId].redCards   += 1;
      involvedPlayers.add(card.playerId);
    }

    involvedPlayers.forEach(id => {
      ensure(id);
      stats[id].gamesPlayed += 1;
    });
  }

  // Shots on goal — attribute per-player from detail breakdown
  for (const game of seasonGames) {
    if (game.shotsOnGoalDetail) {
      for (const { playerId, sog } of game.shotsOnGoalDetail) {
        ensure(playerId);
        stats[playerId].shotsOnGoal += sog;
      }
    }
  }

  // Keeper saves — use per-player detail when available, else attribute to the GK
  for (const game of seasonGames) {
    if (game.keeperSavesDetail) {
      for (const { keeperId, saves } of game.keeperSavesDetail) {
        ensure(keeperId);
        stats[keeperId].saves += saves;
      }
    } else if (game.keeperSaves !== undefined) {
      const gkPlayer = PLAYERS.find(p => p.position === 'GK' && p.seasons.includes(seasonId));
      if (gkPlayer) {
        ensure(gkPlayer.id);
        stats[gkPlayer.id].saves += game.keeperSaves;
      }
    }
  }
  // Ensure GK gamesPlayed is at least the number of season games
  const gkPlayer = PLAYERS.find(p => p.position === 'GK' && p.seasons.includes(seasonId));
  if (gkPlayer) {
    ensure(gkPlayer.id);
    stats[gkPlayer.id].gamesPlayed = Math.max(stats[gkPlayer.id].gamesPlayed, seasonGames.length);
  }

  return stats;
}

export function getSeasonRecord(seasonId: string, games: Game[]) {
  const sg = games.filter(g => g.seasonId === seasonId);
  return {
    wins:         sg.filter(g => g.goalsFor > g.goalsAgainst).length,
    losses:       sg.filter(g => g.goalsFor < g.goalsAgainst).length,
    draws:        sg.filter(g => g.goalsFor === g.goalsAgainst).length,
    played:       sg.length,
    goalsFor:     sg.reduce((s, g) => s + g.goalsFor,     0),
    goalsAgainst: sg.reduce((s, g) => s + g.goalsAgainst, 0),
  };
}

export { PLAYERS, SEASONS, GAMES, COACHES };
