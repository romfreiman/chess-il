// Color tokens (also defined in tailwind.config.js for Tailwind classes)
export const COLORS = {
  primary: '#378ADD',
  positive: '#639922',
  negative: '#E24B4A',
  pending: '#EF9F27',
} as const;

// localStorage keys
export const STORAGE_KEYS = {
  theme: 'theme',
  recentSearches: 'chess-il-recent-searches',
  savedPlayers: 'chess-il-saved-players',
} as const;

// Limits
export const MAX_RECENT_SEARCHES = 5;
export const MAX_SAVED_PLAYERS = 10;
