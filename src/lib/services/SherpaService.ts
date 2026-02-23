const SHERPA_API_URL = process.env.SHERPA_API_URL || 'https://keyholekc.com/sherpa';
const SHERPA_ENTRIES_API_URL = process.env.SHERPA_ENTRIES_API_URL || 'https://keyholekc.com/api';
const SHERPA_API_TIMEOUT_MS = 10000;

export interface SherpaClient {
  id: number;
  name: string;
  active?: boolean;
}

export interface SherpaWeek {
  date: string;
  hours: number;
  status?: string;
}

export interface SherpaEntry {
  day: string;
  hours: number;
  notes?: string;
}

async function sherpaFetch<T>(path: string, token: string, userid: string, jsessionid?: string): Promise<T> {
  const url = `${SHERPA_API_URL}/service${path}`;

  const headers: Record<string, string> = {
    'token': token,
    'userid': userid,
    'Accept': 'application/json, text/javascript, */*; q=0.01',
    'X-Requested-With': 'XMLHttpRequest',
  };

  if (jsessionid) {
    headers['Cookie'] = `JSESSIONID=${jsessionid}`;
  }

  const response = await fetch(url, {
    headers,
    signal: AbortSignal.timeout(SHERPA_API_TIMEOUT_MS),
  });

  if (!response.ok) {
    const text = await response.text();
    console.error(`Sherpa API error [${response.status}] GET ${url}`, text);
    throw new Error(`Sherpa API error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

export async function getMyClients(token: string, userid: string, jsessionid?: string): Promise<SherpaClient[]> {
  const clients = await sherpaFetch<SherpaClient[]>('/my/clients', token, userid, jsessionid);

  if (!Array.isArray(clients)) {
    throw new Error('Invalid Sherpa clients response');
  }

  return clients;
}

export async function getMyEntries(
  clientId: number,
  startDate: string,
  endDate: string,
  jsessionid?: string,
): Promise<SherpaWeek[]> {
  const url = `${SHERPA_ENTRIES_API_URL}/service/my/week/client/${clientId}`;

  const headers: Record<string, string> = {
    'Accept': 'application/json, text/javascript, */*; q=0.01',
    'X-Requested-With': 'XMLHttpRequest',
  };

  if (jsessionid) {
    headers['Cookie'] = `JSESSIONID=${jsessionid}`;
  }

  const response = await fetch(url, {
    headers,
    signal: AbortSignal.timeout(SHERPA_API_TIMEOUT_MS),
  });

  if (!response.ok) {
    const text = await response.text();
    console.error(`Sherpa entries API error [${response.status}] GET ${url}`, text);
    throw new Error(`Sherpa API error: ${response.status} ${response.statusText}`);
  }

  const weeks = await response.json();

  if (!Array.isArray(weeks)) {
    throw new Error('Invalid Sherpa entries response');
  }

  const filtered = (weeks as SherpaWeek[]).filter(w => weekOverlapsPeriod(w.date, startDate, endDate));

  // The backend groups by (week, status) which can produce duplicate week rows.
  // Aggregate into one row per week date, summing hours.
  const weekMap = new Map<string, SherpaWeek>();
  for (const w of filtered) {
    const key = w.date.substring(0, 10);
    const existing = weekMap.get(key);
    if (existing) {
      existing.hours = (existing.hours || 0) + (w.hours || 0);
    } else {
      weekMap.set(key, { ...w, date: key });
    }
  }

  return Array.from(weekMap.values());
}

export async function getMyDailyEntries(
  clientId: number,
  startDate: string,
  endDate: string,
  token: string,
  userid: string,
  jsessionid?: string,
): Promise<SherpaEntry[]> {
  const path = `/my/week/client/${clientId}/times/start/${startDate}/end/${endDate}`;
  const data = await sherpaFetch<unknown>(path, token, userid, jsessionid);

  // Sherpa auth failure returns {"code":"ERROR"}
  if (data && typeof data === 'object' && !Array.isArray(data) && (data as Record<string, unknown>).code === 'ERROR') {
    throw new Error('Sherpa authentication error');
  }

  if (!Array.isArray(data)) {
    throw new Error('Invalid Sherpa daily entries response');
  }

  return data as SherpaEntry[];
}

function weekOverlapsPeriod(weekDateStr: string, startDate: string, endDate: string): boolean {
  const weekStart = weekDateStr.substring(0, 10);
  // Add 6 days to get Saturday (end of calendar week)
  const d = new Date(weekStart + 'T12:00:00');
  d.setDate(d.getDate() + 6);
  const weekEnd = d.toISOString().substring(0, 10);
  return weekStart <= endDate && weekEnd >= startDate;
}
