import { describe, it } from 'vitest';
import * as fc from 'fast-check';
import {
  calculateEMI,
  calculateLoanEligibility,
  calculatePrepayment,
  calculateBudgetEstimate,
} from '@/lib/calculators';

describe('calculators', () => {
  // Feature: real-estate-marketplace, Property 8: EMI calculator correctness and positivity
  it('calculateEMI: returns positive value and total repayment >= principal', () => {
    fc.assert(
      fc.property(
        fc.float({ min: Math.fround(100000), max: Math.fround(50000000), noNaN: true }),
        // Use a minimum rate of 0.001% to avoid subnormal floats that cause
        // floating-point precision loss in the total-repayment check
        fc.float({ min: Math.fround(0.001), max: Math.fround(20), noNaN: true }),
        fc.integer({ min: 1, max: 30 }),
        (principal, annualRate, tenureYears) => {
          const emi = calculateEMI(principal, annualRate, tenureYears);
          const nMonths = tenureYears * 12;

          // EMI must be positive
          if (emi <= 0) return false;

          // Total repayment must be at least the principal.
          // Allow a small relative tolerance for floating-point rounding.
          const tolerance = principal * 1e-4;
          if (emi * nMonths < principal - tolerance) return false;

          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  // Feature: real-estate-marketplace, Property 9: Loan eligibility is non-negative
  it('calculateLoanEligibility: result is non-negative and zero when existingEMIs >= income * 0.5', () => {
    fc.assert(
      fc.property(
        fc.float({ min: 0, max: 1000000, noNaN: true }),
        fc.float({ min: 0, max: 500000, noNaN: true }),
        fc.float({ min: 1, max: 20, noNaN: true }),
        (monthlyIncome, existingEMIs, annualRate) => {
          const result = calculateLoanEligibility(monthlyIncome, existingEMIs, annualRate);

          // Result must always be non-negative
          if (result < 0) return false;

          // When existingEMIs >= income * 0.5, result must be 0
          if (existingEMIs >= monthlyIncome * 0.5 && result !== 0) return false;

          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  // Feature: real-estate-marketplace, Property 10: Prepayment reduces tenure and saves interest
  it('calculatePrepayment: monthsSaved >= 0, interestSaved >= 0, larger prepayment saves more', () => {
    fc.assert(
      fc.property(
        fc.float({ min: 100000, max: 10000000, noNaN: true }),
        fc.float({ min: 1, max: 20, noNaN: true }),
        fc.float({ min: Math.fround(0.01), max: Math.fround(0.99), noNaN: true }),
        (outstandingLoan, annualRate, prepaymentFraction) => {
          // Derive a valid EMI using a 20-year tenure so it's always > monthly interest
          const currentEMI = calculateEMI(outstandingLoan, annualRate, 20);
          const prepayment = outstandingLoan * prepaymentFraction;

          const { monthsSaved, interestSaved } = calculatePrepayment(
            outstandingLoan,
            currentEMI,
            prepayment,
            annualRate
          );

          // Both values must be non-negative
          if (monthsSaved < 0) return false;
          if (interestSaved < 0) return false;

          // A larger prepayment must produce equal or greater savings
          const largerPrepayment = Math.min(prepayment * 1.5, outstandingLoan * 0.999);
          const larger = calculatePrepayment(
            outstandingLoan,
            currentEMI,
            largerPrepayment,
            annualRate
          );

          if (larger.monthsSaved < monthsSaved) return false;
          if (larger.interestSaved < interestSaved - 0.01) return false;

          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  // Feature: real-estate-marketplace, Property 19: Budget estimator returns valid range
  it('calculateBudgetEstimate: min >= 0 and min <= max for any roomCount and style', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 20 }),
        fc.constantFrom('Basic', 'Standard', 'Premium', 'Luxury' as const),
        (roomCount, style) => {
          const { min, max } = calculateBudgetEstimate(
            roomCount,
            style as 'Basic' | 'Standard' | 'Premium' | 'Luxury'
          );

          if (min < 0) return false;
          if (min > max) return false;

          return true;
        }
      ),
      { numRuns: 100 }
    );
  });
});
