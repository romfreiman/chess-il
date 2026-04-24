import { describe, it, expect, vi, beforeEach } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';

// Mock axios before importing the module under test
vi.mock('axios');

import axios from 'axios';
import { scrapeClubList, searchClubPlayers } from '../../src/scraper/clubs';

const mockedAxios = vi.mocked(axios, true);

const advancedFixture = readFileSync(
  resolve(__dirname, '../fixtures/search-advanced.html'),
  'utf-8'
);

const resultsFixture = readFileSync(
  resolve(__dirname, '../fixtures/search-results.html'),
  'utf-8'
);

// Minimal initial page HTML with viewstate fields (step 1 response)
const initialPageHtml = `
<!DOCTYPE html>
<html>
<body>
<form id="aspnetForm">
<input type="hidden" name="__VIEWSTATE" id="__VIEWSTATE" value="MOCK_VS1" />
<input type="hidden" name="__EVENTVALIDATION" id="__EVENTVALIDATION" value="MOCK_EV1" />
<input type="hidden" name="__VIEWSTATEGENERATOR" id="__VIEWSTATEGENERATOR" value="MOCK_VSG1" />
</form>
</body>
</html>
`;

const noViewstateHtml = `
<!DOCTYPE html>
<html>
<body>
<form id="aspnetForm">
</form>
</body>
</html>
`;

beforeEach(() => {
  vi.clearAllMocks();
});

describe('scrapeClubList', () => {
  it('returns clubs from expanded panel', async () => {
    mockedAxios.get.mockResolvedValueOnce({ status: 200, data: initialPageHtml });
    mockedAxios.post.mockResolvedValueOnce({ status: 200, data: advancedFixture });

    const clubs = await scrapeClubList();

    expect(clubs).toHaveLength(3);
    expect(clubs[0]).toEqual({ id: 6, name: 'אליצור ירושלים' });
    expect(clubs[1]).toEqual({ id: 24, name: 'מכבי תל אביב' });
    expect(clubs[2]).toEqual({ id: 2414, name: 'אילת שחמט' });
  });

  it('returns empty array on GET failure', async () => {
    mockedAxios.get.mockResolvedValueOnce({ status: 500, data: '' });

    const clubs = await scrapeClubList();

    expect(clubs).toEqual([]);
  });

  it('returns empty array when viewstate missing', async () => {
    mockedAxios.get.mockResolvedValueOnce({ status: 200, data: noViewstateHtml });

    const clubs = await scrapeClubList();

    expect(clubs).toEqual([]);
  });

  it('sends correct __EVENTTARGET for panel expansion', async () => {
    mockedAxios.get.mockResolvedValueOnce({ status: 200, data: initialPageHtml });
    mockedAxios.post.mockResolvedValueOnce({ status: 200, data: advancedFixture });

    await scrapeClubList();

    expect(mockedAxios.post).toHaveBeenCalledTimes(1);
    const postCall = mockedAxios.post.mock.calls[0];
    const formBody = postCall[1] as string;
    expect(formBody).toContain('__EVENTTARGET=ctl00%24ContentPlaceHolder1%24AdvancedSearchLinkButton');
  });
});

describe('searchClubPlayers', () => {
  it('returns parsed player results', async () => {
    // Step 1: GET initial page
    mockedAxios.get.mockResolvedValueOnce({ status: 200, data: initialPageHtml });
    // Step 2: POST to expand panel
    mockedAxios.post.mockResolvedValueOnce({ status: 200, data: advancedFixture });
    // Step 3: POST with search filters
    mockedAxios.post.mockResolvedValueOnce({ status: 200, data: resultsFixture });

    const results = await searchClubPlayers(6);

    expect(results).toHaveLength(2);
    expect(results[0]).toEqual({
      id: 205001,
      name: 'אנדי פריימן',
      rating: 1850,
      club: 'אליצור ירושלים',
      birthYear: 1986,
    });
  });

  it('handles null rating and birthYear', async () => {
    mockedAxios.get.mockResolvedValueOnce({ status: 200, data: initialPageHtml });
    mockedAxios.post.mockResolvedValueOnce({ status: 200, data: advancedFixture });
    mockedAxios.post.mockResolvedValueOnce({ status: 200, data: resultsFixture });

    const results = await searchClubPlayers(24);

    expect(results[1]).toEqual({
      id: 210498,
      name: 'שחקן שני',
      rating: null,
      club: 'מכבי תל אביב',
      birthYear: 2012,
    });
  });

  it('returns empty array on HTTP failure', async () => {
    mockedAxios.get.mockResolvedValueOnce({ status: 500, data: '' });

    const results = await searchClubPlayers(6);

    expect(results).toEqual([]);
  });

  it('sends correct default values for unused dropdowns', async () => {
    mockedAxios.get.mockResolvedValueOnce({ status: 200, data: initialPageHtml });
    mockedAxios.post.mockResolvedValueOnce({ status: 200, data: advancedFixture });
    mockedAxios.post.mockResolvedValueOnce({ status: 200, data: resultsFixture });

    await searchClubPlayers(6);

    // Step 3 is the second post call
    expect(mockedAxios.post).toHaveBeenCalledTimes(2);
    const step3Call = mockedAxios.post.mock.calls[1];
    const formBody = step3Call[1] as string;
    expect(formBody).toContain('GenderDDL=ALL');
    expect(formBody).toContain('CitiesDDL=All');
    expect(formBody).toContain('PlayerStatusDDL=1');
    expect(formBody).not.toContain('FreeOnlyCB');
    expect(formBody).not.toContain('ManagersOnlyCB');
  });

  it('passes age filters correctly', async () => {
    mockedAxios.get.mockResolvedValueOnce({ status: 200, data: initialPageHtml });
    mockedAxios.post.mockResolvedValueOnce({ status: 200, data: advancedFixture });
    mockedAxios.post.mockResolvedValueOnce({ status: 200, data: resultsFixture });

    await searchClubPlayers(6, 8, 14);

    const step3Call = mockedAxios.post.mock.calls[1];
    const formBody = step3Call[1] as string;
    expect(formBody).toContain('AgeFromTB=8');
    expect(formBody).toContain('AgeTillTB=14');
  });

  it('omits age filters when not provided', async () => {
    mockedAxios.get.mockResolvedValueOnce({ status: 200, data: initialPageHtml });
    mockedAxios.post.mockResolvedValueOnce({ status: 200, data: advancedFixture });
    mockedAxios.post.mockResolvedValueOnce({ status: 200, data: resultsFixture });

    await searchClubPlayers(6);

    const step3Call = mockedAxios.post.mock.calls[1];
    const formBody = step3Call[1] as string;
    // Empty strings for age fields when not provided
    expect(formBody).toContain('AgeFromTB=&');
    expect(formBody).toContain('AgeTillTB=&');
  });

  it('skips rows without valid player ID', async () => {
    const noIdResultsHtml = `
    <!DOCTYPE html>
    <html><body>
    <form id="aspnetForm">
    <input type="hidden" name="__VIEWSTATE" id="__VIEWSTATE" value="MOCK_VS3" />
    <input type="hidden" name="__EVENTVALIDATION" id="__EVENTVALIDATION" value="MOCK_EV3" />
    <table id="ctl00_ContentPlaceHolder1_playersGridView">
    <tr><th>#</th><th>שם</th><th>מספר שחקן</th><th>מדינה</th><th>מין</th><th>מספר תחרויות</th><th>מועדון</th><th>מספר בפיד"ה</th><th>סטטוס</th><th>מד כושר ישראלי</th><th>מד כושר פיד"ה רגיל</th><th>דרגה</th><th>כרטיס שחמטאי</th><th>שנת לידה</th><th>תפקיד</th></tr>
    <tr><td>1</td><td>שחקן ללא מזהה</td><td></td><td>ישראל</td><td>זכר</td><td>0</td><td>מועדון</td><td></td><td>פעיל</td><td></td><td></td><td></td><td></td><td></td><td></td></tr>
    </table>
    </form>
    </body></html>`;

    mockedAxios.get.mockResolvedValueOnce({ status: 200, data: initialPageHtml });
    mockedAxios.post.mockResolvedValueOnce({ status: 200, data: advancedFixture });
    mockedAxios.post.mockResolvedValueOnce({ status: 200, data: noIdResultsHtml });

    const results = await searchClubPlayers(6);

    expect(results).toEqual([]);
  });
});
