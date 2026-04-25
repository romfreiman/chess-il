import type { ClubSearchResult } from '@shared/types';

const BOM = '﻿';
const HEADER = 'שם,מספר שחקן,דירוג,מועדון,גיל';

/**
 * Escape a CSV field per RFC 4180:
 * If the field contains a comma, double quote, or newline, wrap it in double quotes
 * and double any internal double quotes.
 */
function escapeCsvField(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n') || value.includes('\r')) {
    return '"' + value.replace(/"/g, '""') + '"';
  }
  return value;
}

/**
 * Generate CSV content string from an array of players.
 * Returns UTF-8 BOM-prefixed string with Hebrew column headers.
 */
export function generateCsvContent(players: ClubSearchResult[]): string {
  const currentYear = new Date().getFullYear();
  const rows = players.map((player) => {
    const name = escapeCsvField(player.name);
    const id = String(player.id);
    const rating = player.rating !== null ? String(player.rating) : '';
    const club = escapeCsvField(player.club);
    const age = player.birthYear !== null ? String(currentYear - player.birthYear) : '';
    return [name, id, rating, club, age].join(',');
  });

  return BOM + [HEADER, ...rows].join('\r\n') + '\r\n';
}

/**
 * Generate a filename for the CSV export.
 * Format: {clubName}-YYYY-MM-DD-HHmm.csv
 */
export function generateFilename(clubName: string): string {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  const hh = String(now.getHours()).padStart(2, '0');
  const min = String(now.getMinutes()).padStart(2, '0');
  return `${clubName}-${yyyy}-${mm}-${dd}-${hh}${min}.csv`;
}

/**
 * Export selected players from search results to a CSV file download.
 * Filters allResults to only players whose id is in selectedIds,
 * preserving the original order from allResults.
 */
export function exportPlayersCsv(
  allResults: ClubSearchResult[],
  selectedIds: Set<number>,
  clubName: string,
): void {
  const filtered = allResults.filter((r) => selectedIds.has(r.id));
  const csvContent = generateCsvContent(filtered);
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = generateFilename(clubName);
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
