/**
 * Pure financial calculator utilities for the real-estate marketplace.
 * All functions are stateless and side-effect-free.
 */

/**
 * Calculates the Equated Monthly Installment (EMI) using the standard
 * reducing-balance formula: EMI = P × r × (1+r)^n / ((1+r)^n - 1)
 *
 * @param principal       - Loan amount in INR
 * @param annualRatePercent - Annual interest rate as a percentage (e.g. 8.5 for 8.5%)
 * @param tenureYears     - Loan tenure in years
 * @returns Monthly EMI amount
 */
export function calculateEMI(
  principal: number,
  annualRatePercent: number,
  tenureYears: number
): number {
  const r = annualRatePercent / 12 / 100;
  const n = tenureYears * 12;
  if (r === 0) return principal / n;
  return (principal * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
}

/**
 * Estimates the maximum loan amount a borrower is eligible for.
 * Uses the rule: max EMI = 50% of monthly income minus existing EMI obligations.
 *
 * @param monthlyIncome     - Gross monthly income in INR
 * @param existingEMIs      - Total existing monthly EMI obligations in INR
 * @param annualRatePercent - Annual interest rate as a percentage
 * @param tenureYears       - Assumed loan tenure in years (default: 20)
 * @returns Maximum eligible loan amount in INR
 */
export function calculateLoanEligibility(
  monthlyIncome: number,
  existingEMIs: number,
  annualRatePercent: number,
  tenureYears = 20
): number {
  const maxEMI = monthlyIncome * 0.5 - existingEMIs;
  if (maxEMI <= 0) return 0;
  const r = annualRatePercent / 12 / 100;
  const n = tenureYears * 12;
  return (maxEMI * (Math.pow(1 + r, n) - 1)) / (r * Math.pow(1 + r, n));
}

/**
 * Calculates the tenure reduction and interest savings from a lump-sum prepayment.
 *
 * @param outstandingLoan   - Current outstanding loan balance in INR
 * @param currentEMI        - Current monthly EMI in INR
 * @param prepaymentAmount  - Lump-sum prepayment amount in INR
 * @param annualRatePercent - Annual interest rate as a percentage
 * @returns Object with `monthsSaved` (integer) and `interestSaved` (INR, non-negative)
 */
export function calculatePrepayment(
  outstandingLoan: number,
  currentEMI: number,
  prepaymentAmount: number,
  annualRatePercent: number
): { monthsSaved: number; interestSaved: number } {
  const r = annualRatePercent / 12 / 100;
  const remainingMonths = (balance: number) => {
    if (r === 0) return balance / currentEMI;
    return Math.log(currentEMI / (currentEMI - balance * r)) / Math.log(1 + r);
  };
  const originalMonths = remainingMonths(outstandingLoan);
  const newMonths = remainingMonths(outstandingLoan - prepaymentAmount);
  const monthsSaved = Math.round(originalMonths - newMonths);
  const interestSaved =
    currentEMI * originalMonths - outstandingLoan -
    (currentEMI * newMonths - (outstandingLoan - prepaymentAmount));
  return { monthsSaved, interestSaved: Math.max(0, interestSaved) };
}

/**
 * Estimates the interior design budget range based on room count and style preference.
 *
 * @param roomCount - Number of rooms (>= 1)
 * @param style     - Design style tier
 * @returns Object with `min` and `max` cost estimates in INR
 */
export function calculateBudgetEstimate(
  roomCount: number,
  style: 'Basic' | 'Standard' | 'Premium' | 'Luxury'
): { min: number; max: number } {
  const basePerRoom: Record<string, { min: number; max: number }> = {
    Basic: { min: 50000, max: 100000 },
    Standard: { min: 100000, max: 200000 },
    Premium: { min: 200000, max: 400000 },
    Luxury: { min: 400000, max: 800000 },
  };
  const base = basePerRoom[style] ?? basePerRoom['Standard'];
  return {
    min: base.min * roomCount,
    max: base.max * roomCount,
  };
}
