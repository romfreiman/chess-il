export interface SavedPlayer {
  id: number;
  name: string;
  rating: number;
  club: string | null;
  totalGames?: number;
  savedAt: string;
}
