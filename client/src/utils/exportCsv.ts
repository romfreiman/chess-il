import type { ClubSearchResult } from '@shared/types';

const BOM = '\uFEFF';
const HEADER = 'שם,מספר שחקן,דירוג,מועדון,גיל';

function escapeCsvField(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n') || value.includes('\r')) {
    return '"' + value.replace(/"/g, '""') + '"';
  }
  return value;
}

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

export function generateFilename(clubNames: string[]): string {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  const hh = String(now.getHours()).padStart(2, '0');
  const min = String(now.getMinutes()).padStart(2, '0');

  const prefix = clubNames.length === 1 ? clubNames[0] : 'clubs-export';
  return `${prefix}-${yyyy}-${mm}-${dd}-${hh}${min}.csv`;
}

export function exportPlayersCsv(
  allResults: ClubSearchResult[],
  selectedIds: Set<number>,
  clubNames: string[],
): void {
  const filtered = allResults.filter((r) => selectedIds.has(r.id));
  const csvContent = generateCsvContent(filtered);
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = generateFilename(clubNames);
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
