export interface PlayerInfo {
  name: string;
  id: number;
  fideId: number | null;          // null if empty link text (per D-03)
  club: string | null;
  birthYear: number | null;
  rating: number;
  expectedRating: number | null;  // null if not present (per D-03)
  grade: string;
  rank: number | null;
  licenseExpiry: string | null;   // ISO 8601 string or null (per D-03, D-09)
}

export interface TournamentEntry {
  startDate: string;              // ISO 8601 "YYYY-MM-DD" (per D-09)
  updateDate: string | null;      // ISO 8601 or null if pending
  isPending: boolean;             // true when updateDate === "בעדכון הבא" (per D-10)
  tournamentName: string;
  tournamentUrl: string | null;
  games: number;
  points: number;
  performance: number;
  wins: number;                   // parsed from result string (per D-08)
  losses: number;                 // parsed from result string (per D-08)
  draws: number;                  // parsed from result string (per D-08)
  ratingChange: number;           // float, positive or negative (per D-11)
}

export interface PlayerData {
  player: PlayerInfo;
  tournaments: TournamentEntry[];
  scrapedAt: string;              // ISO 8601 timestamp
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
