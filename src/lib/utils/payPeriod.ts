export interface PayPeriod {
  start: Date;
  end: Date;
  payDate: Date;
}

/**
 * Returns the pay period containing the given date.
 *
 * Keyhole pay periods:
 *   Period A: 7th → 21st of the same month
 *   Period B: 22nd → 6th of the next month
 *
 * Dates on a boundary (the 7th or the 22nd) belong to the period that starts on that day.
 */
export function getPayPeriod(date: Date): PayPeriod {
  const y = date.getFullYear();
  const m = date.getMonth(); // 0-indexed
  const d = date.getDate();

  if (d < 7) {
    // Before the 7th → previous period B (22nd of prior month → 6th of this month)
    const prevMonth = m === 0 ? 11 : m - 1;
    const prevYear = m === 0 ? y - 1 : y;
    return {
      start: new Date(prevYear, prevMonth, 22),
      end: new Date(y, m, 6),
      payDate: computePayDate(new Date(prevYear, prevMonth, 22)),
    };
  }

  if (d < 22) {
    // 7th–21st → period A (7th → 21st of this month)
    return {
      start: new Date(y, m, 7),
      end: new Date(y, m, 21),
      payDate: computePayDate(new Date(y, m, 7)),
    };
  }

  // 22nd or later → period B (22nd of this month → 6th of next month)
  const nextMonth = m === 11 ? 0 : m + 1;
  const nextYear = m === 11 ? y + 1 : y;
  return {
    start: new Date(y, m, 22),
    end: new Date(nextYear, nextMonth, 6),
    payDate: computePayDate(new Date(y, m, 22)),
  };
}

/**
 * Pay is in arrears by one month.
 * Period starting on the 7th  → paid on the 22nd of the following month.
 * Period starting on the 22nd → paid on the 7th two months later.
 */
function computePayDate(periodStart: Date): Date {
  const y = periodStart.getFullYear();
  const m = periodStart.getMonth();
  const d = periodStart.getDate();

  if (d === 7) {
    // Paid on the 22nd, one month later
    const payMonth = m === 11 ? 0 : m + 1;
    const payYear = m === 11 ? y + 1 : y;
    return new Date(payYear, payMonth, 22);
  }

  // d === 22 → paid on the 7th, two months later
  const payMonth = (m + 2) % 12;
  const payYear = y + Math.floor((m + 2) / 12);
  return new Date(payYear, payMonth, 7);
}

export function getPreviousPayPeriod(period: PayPeriod): PayPeriod {
  // Go one day before the start of the current period
  const dayBefore = new Date(period.start);
  dayBefore.setDate(dayBefore.getDate() - 1);
  return getPayPeriod(dayBefore);
}

export function getNextPayPeriod(period: PayPeriod): PayPeriod {
  // Go one day after the end of the current period
  const dayAfter = new Date(period.end);
  dayAfter.setDate(dayAfter.getDate() + 1);
  return getPayPeriod(dayAfter);
}

const MONTH_NAMES = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

export function formatPayPeriodLabel(period: PayPeriod): string {
  const s = period.start;
  const e = period.end;
  const p = period.payDate;

  const startLabel = `${MONTH_NAMES[s.getMonth()]} ${s.getDate()}`;
  const endLabel = `${MONTH_NAMES[e.getMonth()]} ${e.getDate()}, ${e.getFullYear()}`;
  const payLabel = `${MONTH_NAMES[p.getMonth()]} ${p.getDate()}, ${p.getFullYear()}`;

  return `${startLabel} – ${endLabel} (paid ${payLabel})`;
}

/** Format a Date as yyyy-MM-dd for Sherpa API calls. */
export function formatDateParam(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}
