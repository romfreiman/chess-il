import * as cheerio from 'cheerio';
import type { Element } from 'domhandler';
import type { PlayerData, PlayerInfo, RatingHistoryEntry, TournamentEntry } from '../../packages/shared/types.js';

/**
 * Parse a chess.org.il player page HTML string into structured PlayerData.
 * This is a pure function: HTML in, typed data out. No side effects.
 */
export function parsePlayerPage(html: string): PlayerData {
  const $ = cheerio.load(html);

  const player = parsePlayerInfo($);
  const tournaments = parseTournamentTable($);
  const ratingHistory = parseRatingHistory($);

  return {
    player,
    tournaments,
    ratingHistory,
    scrapedAt: new Date().toISOString(),
  };
}

function parsePlayerInfo($: cheerio.CheerioAPI): PlayerInfo {
  // Player name: inside .p-profile .section-title h2
  const name = $('.p-profile .section-title h2').first().text().trim();

  // Grade: paragraph after the section-title (format: "דרגה שישית" or just "מדורג מתחיל")
  const gradeText = $('.p-profile > p').first().text().trim();
  // Remove "דרגה " prefix if present
  const grade = gradeText.replace(/^דרגה\s*/, '');

  // Player info fields: find <li> elements by their Hebrew label text
  const allListItems = $('div.full-block li');

  // Player ID
  const playerIdText = extractSpanByLabel(allListItems, $, 'מספר שחקן:');
  const playerId = parseInt(playerIdText, 10);

  // FIDE ID: extract <a> text from FIDE label li, return null if empty
  const fideIdLi = findLiByLabel(allListItems, $, 'מספר שחקן פיד"ה:');
  const fideIdText = fideIdLi.find('a').text().trim();
  const fideId = fideIdText ? parseInt(fideIdText, 10) : null;

  // Club: note the <b> tag wrapping the label
  const clubLi = findLiByLabel(allListItems, $, 'מועדון:');
  const club = clubLi.find('a').text().trim() || null;

  // Birth year
  const birthYearText = extractSpanByLabel(allListItems, $, 'שנת לידה:');
  const birthYear = birthYearText ? parseInt(birthYearText, 10) : null;

  // License expiry
  const licenseExpiryText = extractSpanByLabel(allListItems, $, 'תוקף כרטיס שחמטאי');
  const licenseExpiry = licenseExpiryText ? parseDateDDMMYYYY(licenseExpiryText) : null;

  // Rating: complex nested structure
  // HTML: מד כושר ישראלי<span>: 1476 (צפוי: </span><a>1475</a><span>)</span>
  const ratingLi = findLiByLabel(allListItems, $, 'מד כושר ישראלי');
  const ratingSpanText = ratingLi.find('span').first().text();
  const ratingMatch = ratingSpanText.match(/:\s*(\d+)/);
  const rating = ratingMatch ? parseInt(ratingMatch[1], 10) : NaN;

  // Expected rating: inside <a> tag within the rating li
  const expectedRatingText = ratingLi.find('a').text().trim();
  const expectedRatingParsed = expectedRatingText ? parseInt(expectedRatingText, 10) : NaN;
  const expectedRating = !isNaN(expectedRatingParsed) ? expectedRatingParsed : null;

  // Rank: "דירוג בישראל: 2872"
  const rankLi = findLiByLabel(allListItems, $, 'דירוג בישראל');
  const rankSpanText = rankLi.find('span').first().text();
  const rankMatch = rankSpanText.match(/:\s*(\d+)/);
  const rank = rankMatch ? parseInt(rankMatch[1], 10) : null;

  // Validation: minimum viable fields
  if (!name || isNaN(rating)) {
    throw new Error('Failed to extract minimum required fields (name, rating)');
  }

  return {
    name,
    id: playerId,
    fideId,
    club,
    birthYear,
    rating,
    expectedRating,
    grade,
    rank,
    licenseExpiry,
  };
}

function parseTournamentTable($: cheerio.CheerioAPI): TournamentEntry[] {
  const tournaments: TournamentEntry[] = [];

  // Find tournament table by its DIRECT header content (content-based selector per D-01)
  // Use children('thead') to avoid matching parent wrapper tables that contain nested tables
  const table = $('table').filter((_: number, el: Element) => {
    const headers = $(el).children('thead').find('th').map((_: number, th: Element) => $(th).text().trim()).get();
    return headers.includes('תחרות') && headers.includes('תאריך התחלה');
  });

  // Skip GridPager row (pagination controls)
  table.children('tbody').children('tr').not('.GridPager').each((_: number, row: Element) => {
    const cells = $(row).find('td');
    if (cells.length < 8) return;

    const startDateRaw = cells.eq(0).text().trim();
    const updateDateRaw = cells.eq(1).text().trim();
    const tournamentLink = cells.eq(2).find('a');
    const tournamentName = tournamentLink.text().trim();
    const tournamentHref = tournamentLink.attr('href') || null;
    const games = parseInt(cells.eq(3).text().trim(), 10) || 0;
    const points = parseFloat(cells.eq(4).text().trim()) || 0;
    const performance = parseInt(cells.eq(5).text().trim(), 10) || 0;

    // Result is inside <div class="ltr"> wrapper
    const resultRaw = cells.eq(6).find('div.ltr').text().trim();
    // Rating change is inside <div class="ltr"> wrapper (may contain <span>)
    const ratingChangeRaw = cells.eq(7).find('div.ltr').text().trim();

    // Parse result: "+3-1=0" -> { wins: 3, losses: 1, draws: 0 }
    const { wins, losses, draws } = parseResult(resultRaw);

    // Parse rating change: "17.9+" -> 17.9, "1.7-" -> -1.7, "0" -> 0
    const ratingChange = parseRatingChange(ratingChangeRaw);

    // Parse isPending from update date
    const isPending = updateDateRaw === 'בעדכון הבא';
    const updateDate = isPending ? null : parseDateFromUpdateText(updateDateRaw);

    // Build tournament URL
    let tournamentUrl: string | null = null;
    if (tournamentHref) {
      tournamentUrl = `https://www.chess.org.il${tournamentHref.replace('..', '')}`;
    }

    tournaments.push({
      startDate: parseDateDDMMYYYY(startDateRaw),
      updateDate,
      isPending,
      tournamentName,
      tournamentUrl,
      games,
      points,
      performance,
      wins,
      losses,
      draws,
      ratingChange,
    });
  });

  return tournaments;
}

/**
 * Extract official rating history from the ViewState Chart XML.
 * The ViewState contains a base64-encoded blob with embedded Chart XML
 * that has DataPoint elements with ToolTip="DD/MM/YYYY RATING".
 * Returns [] on any failure (never throws).
 */
function parseRatingHistory($: cheerio.CheerioAPI): RatingHistoryEntry[] {
  try {
    const viewStateValue = $('input#__VIEWSTATE').attr('value');
    if (!viewStateValue) return [];

    const decoded = Buffer.from(viewStateValue, 'base64').toString('latin1');

    const chartStart = decoded.indexOf('<Chart');
    const chartEndTag = '</Chart>';
    const chartEndIdx = decoded.indexOf(chartEndTag);
    if (chartStart === -1 || chartEndIdx === -1) return [];

    const chartXml = decoded.substring(chartStart, chartEndIdx + chartEndTag.length);
    const chart$ = cheerio.load(chartXml, { xml: true });

    const entries: RatingHistoryEntry[] = [];
    chart$('DataPoint[ToolTip]').each((_: number, el: Element) => {
      const toolTip = chart$(el).attr('ToolTip');
      if (!toolTip) return;

      const parts = toolTip.trim().split(/\s+/);
      if (parts.length < 2) return;

      const date = parseDateDDMMYYYY(parts[0]);
      const rating = parseInt(parts[1], 10);

      // Skip if date parse failed (returned original string) or rating is NaN
      if (!date.match(/^\d{4}-\d{2}-\d{2}$/) || isNaN(rating)) return;

      entries.push({ date, rating });
    });

    // Sort by date ascending (ISO string comparison)
    entries.sort((a, b) => a.date.localeCompare(b.date));

    return entries;
  } catch {
    return [];
  }
}

// --- Helper Functions ---

/**
 * Find a <li> element whose text starts with the given Hebrew label.
 * Handles <b> tags via .text() which strips them.
 */
function findLiByLabel(
  items: cheerio.Cheerio<Element>,
  $: cheerio.CheerioAPI,
  label: string
): cheerio.Cheerio<Element> {
  return items
    .filter((_: number, el: Element) => {
      return $(el).text().trim().startsWith(label);
    })
    .first();
}

/**
 * Extract <span> text from a <li> found by label.
 */
function extractSpanByLabel(
  items: cheerio.Cheerio<Element>,
  $: cheerio.CheerioAPI,
  label: string
): string {
  const li = findLiByLabel(items, $, label);
  return li.find('span').text().trim();
}

/**
 * Parse rating change: "17.9+" -> 17.9, "1.7-" -> -1.7, "0" -> 0
 * Format: VALUE+/VALUE- (sign after number, Israeli display convention)
 */
function parseRatingChange(raw: string): number {
  const trimmed = raw.trim();
  if (trimmed === '0' || trimmed === '') return 0;

  const match = trimmed.match(/^([\d.]+)([+-])$/);
  if (!match) return 0;

  const value = parseFloat(match[1]);
  return match[2] === '-' ? -value : value;
}

/**
 * Parse result string: "+3-1=0" -> { wins: 3, losses: 1, draws: 0 }
 */
function parseResult(raw: string): { wins: number; losses: number; draws: number } {
  const match = raw.match(/\+(\d+)-(\d+)=(\d+)/);
  if (!match) return { wins: 0, losses: 0, draws: 0 };
  return {
    wins: parseInt(match[1], 10),
    losses: parseInt(match[2], 10),
    draws: parseInt(match[3], 10),
  };
}

/**
 * Parse date from dd/MM/yyyy format to ISO 8601 (YYYY-MM-DD).
 * Does NOT use new Date() -- manual split to avoid dd/MM vs MM/dd confusion.
 */
function parseDateDDMMYYYY(dateStr: string): string {
  const parts = dateStr.trim().split('/');
  if (parts.length !== 3) return dateStr; // fallback
  const [day, month, year] = parts;
  return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
}

/**
 * Parse update date text: "עדכון DD/MM/YYYY" -> ISO 8601, or null
 */
function parseDateFromUpdateText(text: string): string | null {
  const match = text.match(/(\d{2}\/\d{2}\/\d{4})/);
  if (!match) return null;
  return parseDateDDMMYYYY(match[1]);
}
