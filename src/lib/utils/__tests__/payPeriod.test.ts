import {
  getPayPeriod,
  getPreviousPayPeriod,
  getNextPayPeriod,
  formatPayPeriodLabel,
  formatDateParam,
  type PayPeriod,
} from '../payPeriod';

describe('payPeriod', () => {
  describe('getPayPeriod', () => {
    it('should return period B (prev month 22nd → this 7th) for dates before the 7th', () => {
      const period = getPayPeriod(new Date(2025, 1, 3)); // Feb 3
      expect(period.start).toEqual(new Date(2025, 0, 22)); // Jan 22
      expect(period.end).toEqual(new Date(2025, 1, 7));    // Feb 7
    });

    it('should return period A (7th → 22nd) for the 7th', () => {
      const period = getPayPeriod(new Date(2025, 1, 7)); // Feb 7
      expect(period.start).toEqual(new Date(2025, 1, 7));  // Feb 7
      expect(period.end).toEqual(new Date(2025, 1, 22));   // Feb 22
    });

    it('should return period A (7th → 22nd) for a mid-period date', () => {
      const period = getPayPeriod(new Date(2025, 1, 15)); // Feb 15
      expect(period.start).toEqual(new Date(2025, 1, 7));
      expect(period.end).toEqual(new Date(2025, 1, 22));
    });

    it('should return period A (7th → 22nd) for the 21st', () => {
      const period = getPayPeriod(new Date(2025, 1, 21)); // Feb 21
      expect(period.start).toEqual(new Date(2025, 1, 7));
      expect(period.end).toEqual(new Date(2025, 1, 22));
    });

    it('should return period B (22nd → next 7th) for the 22nd', () => {
      const period = getPayPeriod(new Date(2025, 1, 22)); // Feb 22
      expect(period.start).toEqual(new Date(2025, 1, 22)); // Feb 22
      expect(period.end).toEqual(new Date(2025, 2, 7));    // Mar 7
    });

    it('should return period B (22nd → next 7th) for the 28th', () => {
      const period = getPayPeriod(new Date(2025, 1, 28)); // Feb 28
      expect(period.start).toEqual(new Date(2025, 1, 22));
      expect(period.end).toEqual(new Date(2025, 2, 7));
    });

    it('should handle year boundary (Jan 1)', () => {
      const period = getPayPeriod(new Date(2025, 0, 1)); // Jan 1
      expect(period.start).toEqual(new Date(2024, 11, 22)); // Dec 22 2024
      expect(period.end).toEqual(new Date(2025, 0, 7));     // Jan 7 2025
    });

    it('should handle year boundary (Dec 22)', () => {
      const period = getPayPeriod(new Date(2025, 11, 22)); // Dec 22
      expect(period.start).toEqual(new Date(2025, 11, 22)); // Dec 22
      expect(period.end).toEqual(new Date(2026, 0, 7));     // Jan 7 2026
    });
  });

  describe('pay date calculation (arrears by one month)', () => {
    it('should pay period A (7th start) on the 22nd of the next month', () => {
      const period = getPayPeriod(new Date(2025, 0, 10)); // Jan 10 → period A (Jan 7–22)
      expect(period.payDate).toEqual(new Date(2025, 1, 22)); // paid Feb 22
    });

    it('should pay period B (22nd start) on the 7th two months later', () => {
      const period = getPayPeriod(new Date(2025, 0, 25)); // Jan 25 → period B (Jan 22–Feb 7)
      expect(period.payDate).toEqual(new Date(2025, 2, 7)); // paid Mar 7
    });

    it('should handle year boundary for pay date', () => {
      const period = getPayPeriod(new Date(2025, 10, 10)); // Nov 10 → period A (Nov 7–22)
      expect(period.payDate).toEqual(new Date(2025, 11, 22)); // paid Dec 22
    });

    it('should handle pay date crossing year boundary', () => {
      const period = getPayPeriod(new Date(2025, 11, 10)); // Dec 10 → period A (Dec 7–22)
      expect(period.payDate).toEqual(new Date(2026, 0, 22)); // paid Jan 22 2026
    });

    it('should handle period B pay date crossing year boundary', () => {
      const period = getPayPeriod(new Date(2025, 10, 25)); // Nov 25 → period B (Nov 22–Dec 7)
      expect(period.payDate).toEqual(new Date(2026, 0, 7)); // paid Jan 7 2026
    });
  });

  describe('getPreviousPayPeriod', () => {
    it('should return the previous period', () => {
      const current = getPayPeriod(new Date(2025, 1, 15)); // Feb 7–22
      const prev = getPreviousPayPeriod(current);
      expect(prev.start).toEqual(new Date(2025, 0, 22)); // Jan 22
      expect(prev.end).toEqual(new Date(2025, 1, 7));    // Feb 7
    });

    it('should chain correctly across multiple periods', () => {
      const period1 = getPayPeriod(new Date(2025, 1, 15)); // Feb 7–22
      const period2 = getPreviousPayPeriod(period1);        // Jan 22–Feb 7
      const period3 = getPreviousPayPeriod(period2);        // Jan 7–22
      expect(period3.start).toEqual(new Date(2025, 0, 7));
      expect(period3.end).toEqual(new Date(2025, 0, 22));
    });
  });

  describe('getNextPayPeriod', () => {
    it('should return the next period', () => {
      const current = getPayPeriod(new Date(2025, 1, 15)); // Feb 7–22
      const next = getNextPayPeriod(current);
      expect(next.start).toEqual(new Date(2025, 1, 22)); // Feb 22
      expect(next.end).toEqual(new Date(2025, 2, 7));    // Mar 7
    });

    it('should chain correctly across multiple periods', () => {
      const period1 = getPayPeriod(new Date(2025, 1, 15)); // Feb 7–22
      const period2 = getNextPayPeriod(period1);            // Feb 22–Mar 7
      const period3 = getNextPayPeriod(period2);            // Mar 7–22
      expect(period3.start).toEqual(new Date(2025, 2, 7));
      expect(period3.end).toEqual(new Date(2025, 2, 22));
    });
  });

  describe('formatPayPeriodLabel', () => {
    it('should format a same-month period', () => {
      const period: PayPeriod = {
        start: new Date(2025, 0, 7),
        end: new Date(2025, 0, 22),
        payDate: new Date(2025, 1, 22),
      };
      expect(formatPayPeriodLabel(period)).toBe('Jan 7 – Jan 22, 2025 (paid Feb 22, 2025)');
    });

    it('should format a cross-month period', () => {
      const period: PayPeriod = {
        start: new Date(2025, 0, 22),
        end: new Date(2025, 1, 7),
        payDate: new Date(2025, 2, 7),
      };
      expect(formatPayPeriodLabel(period)).toBe('Jan 22 – Feb 7, 2025 (paid Mar 7, 2025)');
    });
  });

  describe('formatDateParam', () => {
    it('should format a date as yyyy-MM-dd', () => {
      expect(formatDateParam(new Date(2025, 0, 7))).toBe('2025-01-07');
    });

    it('should zero-pad single-digit months and days', () => {
      expect(formatDateParam(new Date(2025, 2, 3))).toBe('2025-03-03');
    });
  });
});
