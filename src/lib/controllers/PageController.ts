import { getServerSession } from "@keyhole/services/AuthService";
import { getMyClients, getMyEntries, getMyDailyEntries, type SherpaClient, type SherpaWeek, type SherpaEntry } from "@keyhole/services/SherpaService";
import { getPayPeriod, formatDateParam, type PayPeriod } from "@keyhole/utils/payPeriod";
import { redirect } from "next/navigation";
import { signIn, signOut } from "next-auth/react"

const GITHUB_API_BASE_URL = process.env.GITHUB_API_BASE_URL || 'https://api.github.com';
const GITHUB_API_TIMEOUT_MS = 10000; // 10 seconds

/**
 * Validates GitHub username format
 * GitHub usernames can only contain alphanumeric characters and hyphens,
 * cannot start with a hyphen, and are 1-39 characters long
 */
const isValidGithubUsername = (username: string): boolean => {
  return /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,37}[a-zA-Z0-9])?$|^[a-zA-Z0-9]$/.test(username);
};

export const getPublicPageProps  = async () => {
  const session = await getServerSession();

  return {
    name: session?.user?.name ?? undefined,
  };
};

export const getPrivatePageProps  = async () => {
  const session = await getServerSession();

  if (!session) {
    redirect(`/`)
  }

  return {
    name: session?.user?.name ?? undefined,
  };
};


export const getGithubPageProps = async () => {
  const session = await getServerSession();

  if (!session) {
    redirect(`/`)
  }

  const { githubLogin } = session?.user;

  if (!githubLogin) {
    redirect(`/`)
  }

  // Validate GitHub username format to prevent URL injection
  if (!isValidGithubUsername(githubLogin)) {
    throw new Error('Invalid GitHub username format');
  }

  const githubUserApiUrl = `${GITHUB_API_BASE_URL}/users/${encodeURIComponent(githubLogin)}`;
  const githubApiOptions: RequestInit = {
    headers: {
      Authorization: `Bearer ${session.auth.token}`,
      'Accept': 'application/vnd.github.v3+json',
      'User-Agent': 'khs-next-example',
    },
    signal: AbortSignal.timeout(GITHUB_API_TIMEOUT_MS),
  };

  try {
    const [profileResponse, eventsResponse] = await Promise.all([
      fetch(githubUserApiUrl, githubApiOptions),
      fetch(`${githubUserApiUrl}/events`, githubApiOptions)
    ]);

    // Check for HTTP errors
    if (!profileResponse.ok) {
      throw new Error(`GitHub API error: ${profileResponse.status} ${profileResponse.statusText}`);
    }
    if (!eventsResponse.ok) {
      throw new Error(`GitHub API error: ${eventsResponse.status} ${eventsResponse.statusText}`);
    }

    const profile = await profileResponse.json();
    const events = await eventsResponse.json();

    // Validate response structure
    if (!Array.isArray(events)) {
      throw new Error('Invalid GitHub events response');
    }

    return {
      profile,
      events,
    };
  } catch (error) {
    if (error instanceof Error && error.name === 'TimeoutError') {
      throw new Error('GitHub API request timed out');
    }
    throw error;
  }
}

export interface ClientEntries {
  client: SherpaClient;
  entries: SherpaWeek[];
  dailyEntries: SherpaEntry[] | null;
  totalHours: number;
}

export type { SherpaEntry };

export interface TimesheetPageProps {
  clientEntries: ClientEntries[];
  payPeriod: PayPeriod;
  grandTotal: number;
}

export const getTimesheetPageProps = async (startParam?: string): Promise<TimesheetPageProps> => {
  const session = await getServerSession();

  if (!session || session.auth?.provider !== 'keyhole') {
    redirect('/');
  }

  const token = session.auth.token;
  const userid = session.auth.accountId;
  const jsessionid = session.auth.jsessionid;
  // Parse as local time (new Date("YYYY-MM-DD") is UTC, which shifts the day back in US timezones)
  const referenceDate = startParam
    ? (() => { const [y, m, d] = startParam.split('-').map(Number); return new Date(y, m - 1, d); })()
    : new Date();
  const payPeriod = getPayPeriod(referenceDate);
  const start = formatDateParam(payPeriod.start);
  const end = formatDateParam(payPeriod.end);

  try {
    const clients = await getMyClients(token, userid, jsessionid);

    const allClientEntries = await Promise.all(
      clients.map(async (client) => {
        const [entries, dailyEntries] = await Promise.all([
          getMyEntries(client.id, start, end, jsessionid),
          getMyDailyEntries(client.id, start, end, token, userid, jsessionid).catch(() => null),
        ]);
        const totalHours = entries.reduce((sum, e) => sum + (e.hours || 0), 0);
        return { client, entries, dailyEntries, totalHours };
      }),
    );

    const clientEntries = allClientEntries.filter((ce) => ce.entries.length > 0);
    const grandTotal = clientEntries.reduce((sum, ce) => sum + ce.totalHours, 0);

    return { clientEntries, payPeriod, grandTotal };
  } catch (error) {
    if (error instanceof Error && error.name === 'TimeoutError') {
      throw new Error('Sherpa API request timed out');
    }
    throw error;
  }
};

export {
  signIn,
  signOut,
}
