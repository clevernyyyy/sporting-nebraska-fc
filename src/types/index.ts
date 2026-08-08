export type Position =
  | 'GK'
  | 'RB' | 'CB' | 'LB'
  | 'CDM' | 'CM' | 'CAM' | 'RM' | 'LM'
  | 'RW' | 'LW' | 'ST' | 'CF';

export type PositionGroup = 'GK' | 'DEF' | 'MID' | 'FWD';

export const POSITION_GROUP: Record<Position, PositionGroup> = {
  GK:  'GK',
  RB:  'DEF', CB:  'DEF', LB:  'DEF',
  CDM: 'MID', CM:  'MID', CAM: 'MID', RM: 'MID', LM: 'MID',
  RW:  'FWD', LW:  'FWD', ST:  'FWD', CF: 'FWD',
};

export const POSITION_FULL: Record<Position, string> = {
  GK:  'Goalkeeper',
  RB:  'Right Back',    CB:  'Center Back',    LB:  'Left Back',
  CDM: 'Defensive Mid', CM:  'Central Mid',    CAM: 'Attacking Mid',
  RM:  'Right Mid',     LM:  'Left Mid',
  RW:  'Right Wing',    LW:  'Left Wing',      ST:  'Striker',   CF: 'Center Forward',
};

export interface VideoHighlight {
  title: string;
  url: string;
  date: string;
}

export interface Player {
  id: string;
  name: string;
  number: number;
  position: Position;              // primary position
  secondaryPositions?: Position[]; // also comfortable here
  nickname?: string;
  photoUrl?: string;
  photos?: string[];
  bio?: string;
  highlights?: VideoHighlight[];
  seasons: string[];
}

export interface Opponent {
  name: string;
  city: string;
  state: string;
  logoUrl?: string;
}

export interface GoalEvent {
  minute: number;
  scorerId: string;
  guestName?: string;           // display name when scorerId === 'guest'
  assisterId?: string;
  assisterGuestName?: string;   // display name when assisterId === 'guest'
  assistType?: 'corner_kick';   // how the assist was delivered
  isPenalty?: boolean;
  isOwnGoal?: boolean;
  note?: string;
}

export type CardType = 'yellow' | 'red';

export interface CardEvent {
  minute: number;
  playerId: string;           // our player's id, or 'opponent' for opposition cards
  team?: 'gretna' | 'opponent'; // defaults to 'gretna'
  jerseyNumber?: number;      // opposition player's number, when team === 'opponent'
  type: CardType;
  reason?: string;
}

export interface Game {
  id: string;
  seasonId: string;
  date: string;
  startTime?: string;           // 24h "HH:MM", e.g. "18:30"
  opponent: Opponent;
  venue: string;
  venueAddress?: string;
  venueCity: string;
  venueState: string;
  isHome: boolean;
  fieldType?: 'grass' | 'turf' | 'indoor';
  uniformColor?: string;
  tournament?: {
    name: string;
    round?: string;
    result?: 'champion' | 'runner-up';
    logoUrl?: string;
    website?: string;
  };
  goalsFor: number;
  goalsAgainst: number;
  goals: GoalEvent[];
  opponentGoals: GoalEvent[];
  keeperSaves?: number;  // total saves this game (all keepers combined)
  keeperSavesDetail?: { keeperId: string; saves: number }[];  // per-keeper breakdown
  shotsOnGoal?: number;  // total shots on goal this game (all our players combined)
  shotsOnGoalDetail?: { playerId: string; sog: number }[];  // per-player breakdown
  cards?: CardEvent[];   // yellow/red cards received by our players
  highlights?: string[];
  notes?: string;
  isShootout?: boolean;
  shootoutWin?: boolean;
}

export interface Season {
  id: string;
  label: string;
  year: number;
  isActive: boolean;
}

export interface Coach {
  id: string;
  name: string;
  title: string;
  photoUrl?: string;
  bio?: string;
  seasons: string[];
}

export interface AppData {
  players: Player[];
  seasons: Season[];
  games: Game[];
}

// Computed per player per season
export interface PlayerStats {
  goals: number;
  assists: number;
  gamesPlayed: number;
  saves: number;       // GK only — sum of keeperSaves across games
  shotsOnGoal: number; // sum of shotsOnGoalDetail across games
  yellowCards: number;
  redCards: number;
}
