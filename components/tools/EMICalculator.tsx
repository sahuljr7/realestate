'use client';

import { useState, useEffect } from 'react';
import { calculateEMI } from '@/lib/calculators';
import { formatCurrency } from '@/lib/formatters';

interface EMICalculatorProps {
  initialLoanAmount?: number;
}

export default function EMICalculator({ initialLoanAmount }: EMICalculatorProps) {
  const [loanAmount, setLoanAmount] = useState<string>(
    initialLoanAmount ? String(initialLoanAmount) : ''
  );
  const [interestRate, setInterestRate] = useState<string>('');
  const [tenure, setTenure] = useState<string>('');
  const [emi, setEmi] = useState<number | null>(null);

  useEffect(() => {
    const P = parseFloat(loanAmount);
    const r = parseFloat(interestRate);
    const n = parseFloat(tenure);

    if (P > 0 && r > 0 && n > 0) {
      setEmi(calculateEMI(P, r, n));
    } else {
      setEmi(null);
    }
  }, [loanAmount, interestRate, tenure]);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-5">
      <h2 className="text-xl font-semibold text-gray-800">EMI Calculator</h2>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Loan Amount (₹)
          </label>
          <input
            type="number"
            min="0"
            value={loanAmount}
            onChange={(e) => setLoanAmount(e.target.value)}
            placeholder="e.g. 5000000"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tenure (Years)
          </label>
          <input
            type="number"
            min="0"
            value={tenure}
            onChange={(e) => setTenure(e.target.value)}
            placeholder="e.g. 20"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      <div className="bg-blue-50 rounded-lg p-4 text-center">
        <p className="text-sm text-gray-500 mb-1">Monthly EMI</p>
        {emi !== null ? (
          <p className="text-2xl font-bold text-blue-700">{formatCurrency(Math.round(emi))}</p>
        ) : (
          <p className="text-sm text-gray-400 italic">Enter valid values</p>
        )}
      </div>
    </div>
  );
}
