import axios, { type AxiosResponse } from 'axios';
import * as cheerio from 'cheerio';
import type { ClubInfo, ClubSearchResult } from '../../packages/shared/types.js';

const SEARCH_URL = 'https://www.chess.org.il/Players/SearchPlayers.aspx';
const USER_AGENT = 'ChessIL-Dashboard/1.0 (community project)';

const AXIOS_CONFIG = {
  headers: { 'User-Agent': USER_AGENT },
  timeout: 15000,
  responseType: 'text' as const,
  validateStatus: () => true,
};

const POST_CONFIG = {
  ...AXIOS_CONFIG,
  headers: {
    ...AXIOS_CONFIG.headers,
    'Content-Type': 'application/x-www-form-urlencoded',
  },
};

interface ViewStateFields {
  viewState: string;
  eventValidation: string;
  viewStateGenerator: string;
}

/**
 * Extract ASP.NET hidden form fields from parsed HTML.
 * Returns null if required fields (viewState, eventValidation) are missing.
 */
function extractViewState($: cheerio.CheerioAPI): ViewStateFields | null {
  const viewState = $('#__VIEWSTATE').val() as string;
  const eventValidation = $('#__EVENTVALIDATION').val() as string;
  const viewStateGenerator = ($('#__VIEWSTATEGENERATOR').val() as string) || '';

  if (!viewState || !eventValidation) {
    return null;
  }

  return { viewState, eventValidation, viewStateGenerator };
}

/**
 * POST to expand the advanced search panel via ASP.NET __doPostBack.
 * Returns the HTTP response containing the expanded form with club dropdown.
 */
async function expandAdvancedPanel(
  vs: ViewStateFields
): Promise<AxiosResponse> {
  const form = new URLSearchParams();
  form.append('__EVENTTARGET', 'ctl00$ContentPlaceHolder1$AdvancedSearchLinkButton');
  form.append('__EVENTARGUMENT', '');
  form.append('__VIEWSTATE', vs.viewState);
  form.append('__EVENTVALIDATION', vs.eventValidation);
  form.append('__VIEWSTATEGENERATOR', vs.viewStateGenerator);
  form.append('ctl00$ContentPlaceHolder1$SearchNameBox', '');

  return axios.post(SEARCH_URL, form.toString(), POST_CONFIG);
}

/**
 * Scrape the full list of clubs from chess.org.il advanced search panel.
 *
 * Uses a 2-step ASP.NET postback flow:
 *   Step 1: GET the search page to obtain ViewState
 *   Step 2: POST to expand the advanced panel and extract club dropdown options
 *
 * Returns ~199 clubs (skipping the "all clubs" default option with value="0").
 * On any error, returns empty array (graceful degradation).
 */
export async function scrapeClubList(): Promise<ClubInfo[]> {
  try {
    // Step 1: GET initial page for ViewState
    const r1 = await axios.get(SEARCH_URL, AXIOS_CONFIG);

    if (r1.status !== 200) {
      console.error(`Club list: GET returned HTTP ${r1.status}`);
      return [];
    }

    const $1 = cheerio.load(r1.data as string);
    const vs1 = extractViewState($1);

    if (!vs1) {
      console.error('Club list: missing ASP.NET hidden fields');
      return [];
    }

    // Step 2: POST to expand advanced panel
    const r2 = await expandAdvancedPanel(vs1);

    if (r2.status !== 200) {
      console.error(`Club list: expand panel POST returned HTTP ${r2.status}`);
      return [];
    }

    // Parse club dropdown from expanded panel
    const $2 = cheerio.load(r2.data as string);
    const clubs: ClubInfo[] = [];

    $2('#ctl00_ContentPlaceHolder1_ClubsDDL option').each((_, el) => {
      const id = parseInt($2(el).attr('value') || '0', 10);
      const name = $2(el).text().trim();
      if (id > 0) {
        clubs.push({ id, name });
      }
    });

    return clubs;
  } catch (error) {
    console.error('Club list scrape error:', error instanceof Error ? error.message : String(error));
    return [];
  }
}

/**
 * Search players by club and optional age range on chess.org.il.
 *
 * Uses a 3-step ASP.NET postback flow:
 *   Step 1: GET the search page to obtain ViewState
 *   Step 2: POST to expand the advanced panel (get updated ViewState with all dropdowns)
 *   Step 3: POST with club and age filters to get search results
 *
 * Returns up to 250 ClubSearchResult objects (server-side limit).
 * On any error, returns empty array (graceful degradation).
 */
export async function searchClubPlayers(
  clubId: number,
  minAge?: number,
  maxAge?: number
): Promise<ClubSearchResult[]> {
  try {
    // Step 1: GET initial page for ViewState
    const r1 = await axios.get(SEARCH_URL, AXIOS_CONFIG);

    if (r1.status !== 200) {
      console.error(`Club search: GET returned HTTP ${r1.status}`);
      return [];
    }

    const $1 = cheerio.load(r1.data as string);
    const vs1 = extractViewState($1);

    if (!vs1) {
      console.error('Club search: missing ASP.NET hidden fields');
      return [];
    }

    // Step 2: POST to expand advanced panel
    const r2 = await expandAdvancedPanel(vs1);

    if (r2.status !== 200) {
      console.error(`Club search: expand panel POST returned HTTP ${r2.status}`);
      return [];
    }

    const $2 = cheerio.load(r2.data as string);
    const vs2 = extractViewState($2);

    if (!vs2) {
      console.error('Club search: missing ViewState after panel expansion');
      return [];
    }

    // Step 3: POST with search filters
    const form3 = new URLSearchParams();
    form3.append('__VIEWSTATE', vs2.viewState);
    form3.append('__EVENTVALIDATION', vs2.eventValidation);
    form3.append('__VIEWSTATEGENERATOR', vs2.viewStateGenerator);
    form3.append('__EVENTTARGET', '');
    form3.append('__EVENTARGUMENT', '');
    form3.append('ctl00$ContentPlaceHolder1$AdvancedSearchNameTextBox', '');
    form3.append('ctl00$ContentPlaceHolder1$ClubsDDL', String(clubId));
    form3.append('ctl00$ContentPlaceHolder1$AgeFromTB', minAge !== undefined ? String(minAge) : '');
    form3.append('ctl00$ContentPlaceHolder1$AgeTillTB', maxAge !== undefined ? String(maxAge) : '');
    form3.append('ctl00$ContentPlaceHolder1$GenderDDL', 'ALL');
    form3.append('ctl00$ContentPlaceHolder1$CitiesDDL', 'All');
    form3.append('ctl00$ContentPlaceHolder1$RatingFromTB', '');
    form3.append('ctl00$ContentPlaceHolder1$RatingUptoTB', '');
    form3.append('ctl00$ContentPlaceHolder1$ForeignDDL', 'ALL');
    form3.append('ctl00$ContentPlaceHolder1$CountriesDDL', 'ALL');
    form3.append('ctl00$ContentPlaceHolder1$MembershipStatusDDL', 'ALL');
    form3.append('ctl00$ContentPlaceHolder1$PlayerStatusDDL', '1');
    form3.append('ctl00$ContentPlaceHolder1$AdvancedSearchButton', '\u05D7\u05D9\u05E4\u05D5\u05E9');

    const r3 = await axios.post(SEARCH_URL, form3.toString(), POST_CONFIG);

    if (r3.status !== 200) {
      console.error(`Club search: search POST returned HTTP ${r3.status}`);
      return [];
    }

    // Parse results table
    const $3 = cheerio.load(r3.data as string);
    const table = $3('#ctl00_ContentPlaceHolder1_playersGridView');

    if (table.length === 0) {
      return [];
    }

    const results: ClubSearchResult[] = [];
    const rows = table.find('tr');

    rows.each((index, row) => {
      if (index === 0) return; // Skip header row

      const cells = $3(row).find('td');

      // Name: column 1 (link text or plain text)
      const nameCell = cells.eq(1);
      const nameLink = nameCell.find('a');
      const name = nameLink.text().trim() || nameCell.text().trim();

      // ID: from href match on column 1 link, fallback to column 2 text
      const href = nameLink.attr('href') || '';
      const idMatch = href.match(/Id=(\d+)/);
      let id: number;

      if (idMatch) {
        id = parseInt(idMatch[1], 10);
      } else {
        const playerNumber = cells.eq(2).text().trim();
        if (playerNumber && /^\d+$/.test(playerNumber)) {
          id = parseInt(playerNumber, 10);
        } else {
          return; // Skip rows without valid player ID
        }
      }

      // Rating: column 9 (Israeli rating)
      const ratingText = cells.eq(9).text().trim();
      const ratingParsed = parseInt(ratingText, 10);
      const rating = isNaN(ratingParsed) ? null : ratingParsed;

      // Club: column 6
      const club = cells.eq(6).text().replace(/\s+/g, ' ').trim();

      // Birth year: column 13
      const birthYearText = cells.eq(13).text().trim();
      const birthYearParsed = parseInt(birthYearText, 10);
      const birthYear = isNaN(birthYearParsed) ? null : birthYearParsed;

      if (name) {
        results.push({ id, name, rating, club, birthYear });
      }
    });

    return results;
  } catch (error) {
    console.error('Club search error:', error instanceof Error ? error.message : String(error));
    return [];
  }
}
