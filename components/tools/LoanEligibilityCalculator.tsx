'use client';

import { useState, useEffect } from 'react';
import { calculateLoanEligibility } from '@/lib/calculators';
import { formatCurrency } from '@/lib/formatters';

export default function LoanEligibilityCalculator() {
  const [monthlyIncome, setMonthlyIncome] = useState<string>('');
  const [existingEMIs, setExistingEMIs] = useState<string>('');
  const [interestRate, setInterestRate] = useState<string>('');
  const [maxLoan, setMaxLoan] = useState<number | null>(null);

  useEffect(() => {
    const income = parseFloat(monthlyIncome);
    const emis = parseFloat(existingEMIs) || 0;
    const rate = parseFloat(interestRate);

    if (income > 0 && rate > 0) {
      setMaxLoan(calculateLoanEligibility(income, emis, rate));
    } else {
      setMaxLoan(null);
    }
  }, [monthlyIncome, existingEMIs, interestRate]);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-5">
      <h2 className="text-xl font-semibold text-gray-800">Loan Eligibility Calculator</h2>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Monthly Income (₹)
          </label>
          <input
            type="number"
            min="0"
            value={monthlyIncome}
            onChange={(e) => setMonthlyIncome(e.target.value)}
            placeholder="e.g. 100000"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Existing Monthly EMIs (₹)
          </label>
          <input
            type="number"
            min="0"
            value={existingEMIs}
            onChange={(e) => setExistingEMIs(e.target.value)}
            placeholder="e.g. 10000"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Annual Interest Rate (%)
          </label>
          <input
            type="number"
            min="0"
            step="0.1"
            value={interestRate}
            onChange={(e) => setInterestRate(e.target.value)}
            placeholder="e.g. 8.5"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>
      </div>

      <div className="bg-green-50 rounded-lg p-4 text-center">
        <p className="text-sm text-gray-500 mb-1">Estimated Max Loan Amount</p>
        {maxLoan !== null ? (
          <p className="text-2xl font-bold text-green-700">{formatCurrency(Math.round(maxLoan))}</p>
        ) : (
          <p className="text-sm text-gray-400 italic">Enter valid values</p>
        )}
      </div>
    </div>
  );
}
