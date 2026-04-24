import axios from 'axios';
import * as cheerio from 'cheerio';
import type { SearchResult } from '../../packages/shared/types.js';

const SEARCH_URL = 'https://www.chess.org.il/Players/SearchPlayers.aspx';
const USER_AGENT = 'ChessIL-Dashboard/1.0 (community project)';

/**
 * Search for players by name on chess.org.il.
 *
 * Uses the ASP.NET WebForms search page: first GET to obtain ViewState,
 * then POST with the search query to get results.
 *
 * Returns up to 10 SearchResult objects. On any error, returns empty array
 * (search should degrade gracefully).
 */
export async function searchPlayers(query: string): Promise<SearchResult[]> {
  try {
    // Step 1: GET the search page to obtain ASP.NET hidden fields
    const getResponse = await axios.get(SEARCH_URL, {
      headers: { 'User-Agent': USER_AGENT },
      timeout: 15000,
      responseType: 'text',
      validateStatus: () => true,
    });

    if (getResponse.status !== 200) {
      console.error(`Search page GET returned HTTP ${getResponse.status}`);
      return [];
    }

    const $get = cheerio.load(getResponse.data as string);
    const viewState = $get('#__VIEWSTATE').val() as string;
    const eventValidation = $get('#__EVENTVALIDATION').val() as string;
    const viewStateGenerator = $get('#__VIEWSTATEGENERATOR').val() as string;

    if (!viewState || !eventValidation) {
      console.error('Missing ASP.NET hidden fields on search page');
      return [];
    }

    // Step 2: POST with the search query
    const formData = new URLSearchParams();
    formData.append('__VIEWSTATE', viewState);
    formData.append('__EVENTVALIDATION', eventValidation);
    if (viewStateGenerator) {
      formData.append('__VIEWSTATEGENERATOR', viewStateGenerator);
    }
    formData.append('ctl00$ContentPlaceHolder1$SearchNameBox', query);
    formData.append('ctl00$ContentPlaceHolder1$SearchButton', '\u05D7\u05D9\u05E4\u05D5\u05E9'); // חיפוש

    const postResponse = await axios.post(SEARCH_URL, formData.toString(), {
      headers: {
        'User-Agent': USER_AGENT,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      timeout: 15000,
      responseType: 'text',
      validateStatus: () => true,
    });

    if (postResponse.status !== 200) {
      console.error(`Search page POST returned HTTP ${postResponse.status}`);
      return [];
    }

    // Step 3: Parse the response HTML for the results table
    const $post = cheerio.load(postResponse.data as string);
    const table = $post('#ctl00_ContentPlaceHolder1_playersGridView');

    if (table.length === 0) {
      return [];
    }

    // Step 4: Extract results from table rows (skip header row)
    const results: SearchResult[] = [];
    const rows = table.find('tr');

    rows.each((index, row) => {
      if (index === 0) return; // Skip header row
      if (results.length >= 10) return; // Limit to 10 results

      const cells = $post(row).find('td');

      // Column 2 (index 1): Name with link containing player ID
      const nameCell = cells.eq(1);
      const nameLink = nameCell.find('a');
      const name = nameLink.text().trim() || nameCell.text().trim();
      const href = nameLink.attr('href') || '';
      const idMatch = href.match(/Id=(\d+)/);

      // Column 3 (index 2): Player number (fallback ID source)
      const playerNumber = cells.eq(2).text().trim();

      let id: number;
      if (idMatch) {
        id = parseInt(idMatch[1], 10);
      } else if (playerNumber && /^\d+$/.test(playerNumber)) {
        id = parseInt(playerNumber, 10);
      } else {
        return; // Skip rows without a valid ID
      }

      // Column 8 (index 7): Club
      const clubText = cells.eq(7).text().trim();
      const club = clubText || null;

      // Column 10 (index 9): Israeli rating
      const ratingText = cells.eq(9).text().trim();
      const ratingParsed = parseInt(ratingText, 10);
      const rating = isNaN(ratingParsed) ? null : ratingParsed;

      // Column 12 (index 11): Grade
      const gradeText = cells.eq(11).text().trim();
      const grade = gradeText || null;

      if (name) {
        results.push({ id, name, rating, club, grade });
      }
    });

    return results;
  } catch (error) {
    console.error('Search error:', error instanceof Error ? error.message : String(error));
    return [];
  }
}
