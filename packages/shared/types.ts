export interface PlayerInfo {
  name: string;
  id: number;
  fideId: number | null;
  club: string | null;
  birthYear: number | null;
  rating: number;
  expectedRating: number | null;
  grade: string;
  rank: number | null;
  licenseExpiry: string | null;
}

export interface TournamentEntry {
  startDate: string;
  updateDate: string | null;
  isPending: boolean;
  tournamentName: string;
  tournamentUrl: string | null;
  games: number;
  points: number;
  performance: number;
  wins: number;
  losses: number;
  draws: number;
  ratingChange: number;
}

export interface PlayerData {
  player: PlayerInfo;
  tournaments: TournamentEntry[];
  scrapedAt: string;
}

export interface ApiResponse {
  player: PlayerInfo;
  tournaments: TournamentEntry[];
  meta: {
    cached: boolean;
    stale: boolean;
    scrapedAt: string;
    cachedAt: string;
  };
}

export interface ApiError {
  error: string;
  message: string;
  statusCode: number;
}
