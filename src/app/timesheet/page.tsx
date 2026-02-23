import { Fragment } from "react";
import { getTimesheetPageProps, type ClientEntries, type SherpaEntry } from "@keyhole/controllers/PageController";
import { formatPayPeriodLabel, formatDateParam, getPreviousPayPeriod, getNextPayPeriod, type PayPeriod } from "@keyhole/utils/payPeriod";
import { Metadata } from "next/types";

export const metadata: Metadata = {
  title: "Keyhole Next | Timesheet",
  description: "View your timesheet entries and pay period totals.",
};

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function fmtDate(d: Date): string {
  return `${MONTHS[d.getMonth()]} ${d.getDate()}`;
}

function fmtDay(d: Date): string {
  return `${DAYS[d.getDay()]} ${fmtDate(d)}`;
}

function parseLocalDate(dateStr: string): Date {
  const [y, m, d] = dateStr.substring(0, 10).split('-').map(Number);
  return new Date(y, m - 1, d);
}

/**
 * Returns the Sunday-based week start key (yyyy-MM-dd) for a given date string.
 */
function getWeekStartKey(dateStr: string): string {
  const d = new Date(dateStr.substring(0, 10) + 'T12:00:00');
  const dow = d.getDay(); // 0 = Sunday
  d.setDate(d.getDate() - dow);
  return d.toISOString().substring(0, 10);
}

/**
 * Returns the intersection of a calendar week with the pay period,
 * and whether the week is partial (straddles a period boundary).
 */
function getWeekPeriodIntersection(weekDateStr: string, period: PayPeriod) {
  const ws = parseLocalDate(weekDateStr);
  const we = new Date(ws);
  we.setDate(we.getDate() + 6); // Saturday

  const ps = new Date(period.start); ps.setHours(0, 0, 0, 0);
  const pe = new Date(period.end);   pe.setHours(0, 0, 0, 0);

  const from = ws >= ps ? ws : ps;
  const to   = we <= pe ? we : pe;
  const isPartial = ws.getTime() < ps.getTime() || we.getTime() > pe.getTime();

  return { from, to, isPartial };
}

function formatDateRange(from: Date, to: Date): string {
  if (from.getTime() === to.getTime()) return fmtDate(from);
  if (from.getMonth() === to.getMonth()) return `${fmtDate(from)}–${to.getDate()}`;
  return `${fmtDate(from)} – ${fmtDate(to)}`;
}

export default async function TimesheetPage({
  searchParams,
}: {
  searchParams: Promise<{ start?: string }>;
}) {
  const { start } = await searchParams;
  const { clientEntries, payPeriod, grandTotal } = await getTimesheetPageProps(start);

  const prevStart    = formatDateParam(getPreviousPayPeriod(payPeriod).start);
  const nextStart    = formatDateParam(getNextPayPeriod(payPeriod).start);
  const currentStart = formatDateParam(new Date());

  return (
    <main className="flex min-h-screen flex-col items-center pt-20 px-8 pb-8">
      <div className="w-full max-w-5xl font-mono text-sm flex flex-col gap-6">

        {/* Pay period navigation */}
        <div className="flex items-center justify-between gap-2">
          <a
            href={`/timesheet?start=${prevStart}`}
            className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-100 dark:border-zinc-600 dark:hover:bg-zinc-700 whitespace-nowrap"
          >
            &larr; Prev
          </a>

          <div className="flex flex-col items-center min-w-0">
            <h2 className="text-xl font-bold text-center">
              {formatPayPeriodLabel(payPeriod)}
            </h2>
            <a
              href={`/timesheet?start=${currentStart}`}
              className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 mt-1"
            >
              Current Period
            </a>
          </div>

          <a
            href={`/timesheet?start=${nextStart}`}
            className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-100 dark:border-zinc-600 dark:hover:bg-zinc-700 whitespace-nowrap"
          >
            Next &rarr;
          </a>
        </div>

        {/* Client entry tables */}
        {clientEntries.length === 0 ? (
          <p className="text-center text-gray-500">No entries for this pay period.</p>
        ) : (
          clientEntries.map((ce: ClientEntries) => (
            <div key={ce.client.id} className="border border-gray-300 dark:border-zinc-600 rounded-lg p-4">
              <div className="flex justify-between items-baseline mb-3">
                <h3 className="text-lg font-semibold">{ce.client.name}</h3>
                <span className="font-bold">{ce.totalHours.toFixed(1)} hrs</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-zinc-700">
                      <th className="py-2 pr-4">Period Dates</th>
                      <th className="py-2 pr-4">Hours</th>
                      <th className="py-2">Notes / Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ce.entries.map((entry) => {
                      const { from, to, isPartial } = getWeekPeriodIntersection(entry.date, payPeriod);
                      const weekKey = entry.date.substring(0, 10);

                      const dayEntries: SherpaEntry[] = ce.dailyEntries
                        ? ce.dailyEntries.filter(e => getWeekStartKey(e.day) === weekKey)
                        : [];

                      return (
                        <Fragment key={entry.date}>
                          {/* Week summary row */}
                          <tr className="border-b border-gray-100 dark:border-zinc-800 font-medium">
                            <td className="py-2 pr-4 whitespace-nowrap">
                              {formatDateRange(from, to)}
                              {isPartial && (
                                <span className="ml-2 text-xs font-normal text-gray-400">(partial week)</span>
                              )}
                            </td>
                            <td className="py-2 pr-4">{entry.hours}</td>
                            <td className="py-2 text-gray-600 dark:text-gray-400 font-normal">
                              {entry.status || '—'}
                            </td>
                          </tr>

                          {/* Per-day detail rows */}
                          {dayEntries.map((de) => {
                            const day = parseLocalDate(de.day);
                            return (
                              <tr key={de.day} className="border-b border-gray-50 dark:border-zinc-900">
                                <td className="py-1 pr-4 pl-6 text-gray-500 dark:text-gray-400 whitespace-nowrap">
                                  {fmtDay(day)}
                                </td>
                                <td className="py-1 pr-4 text-gray-500 dark:text-gray-400">
                                  {de.hours}
                                </td>
                                <td className="py-1 text-gray-400 dark:text-gray-500 italic">
                                  {de.notes || ''}
                                </td>
                              </tr>
                            );
                          })}
                        </Fragment>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ))
        )}

        {/* Grand total */}
        <div className="flex justify-end text-lg font-bold border-t border-gray-300 dark:border-zinc-600 pt-4">
          Total: {grandTotal.toFixed(1)} hours
        </div>

      </div>
    </main>
  );
}
