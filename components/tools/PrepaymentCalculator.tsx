'use client';

import { useState, useEffect } from 'react';
import { calculatePrepayment } from '@/lib/calculators';
import { formatCurrency } from '@/lib/formatters';

export default function PrepaymentCalculator() {
  const [outstandingLoan, setOutstandingLoan] = useState<string>('');
  const [currentEMI, setCurrentEMI] = useState<string>('');
  const [prepaymentAmount, setPrepaymentAmount] = useState<string>('');
  const [interestRate, setInterestRate] = useState<string>('');
  const [result, setResult] = useState<{ monthsSaved: number; interestSaved: number } | null>(null);

  useEffect(() => {
    const loan = parseFloat(outstandingLoan);
    const emi = parseFloat(currentEMI);
    const prepay = parseFloat(prepaymentAmount);
    const rate = parseFloat(interestRate);

    if (loan > 0 && emi > 0 && prepay > 0 && prepay < loan && rate > 0) {
      setResult(calculatePrepayment(loan, emi, prepay, rate));
    } else {
      setResult(null);
    }
  }, [outstandingLoan, currentEMI, prepaymentAmount, interestRate]);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-5">
      <h2 className="text-xl font-semibold text-gray-800">Prepayment Calculator</h2>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Outstanding Loan (₹)
          </label>
          <input
            type="number"
            min="0"
            value={outstandingLoan}
            onChange={(e) => setOutstandingLoan(e.target.value)}
            placeholder="e.g. 3000000"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Current EMI (₹)
          </label>
          <input
            type="number"
            min="0"
            value={currentEMI}
            onChange={(e) => setCurrentEMI(e.target.value)}
            placeholder="e.g. 25000"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Prepayment Amount (₹)
          </label>
          <input
            type="number"
            min="0"
            value={prepaymentAmount}
            onChange={(e) => setPrepaymentAmount(e.target.value)}
            placeholder="e.g. 500000"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
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
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>
      </div>

      <div className="bg-purple-50 rounded-lg p-4">
        {result !== null ? (
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <p className="text-sm text-gray-500 mb-1">Months Saved</p>
              <p className="text-2xl font-bold text-purple-700">{result.monthsSaved}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Interest Saved</p>
              <p className="text-2xl font-bold text-purple-700">
                {formatCurrency(Math.round(result.interestSaved))}
              </p>
            </div>
          </div>
        ) : (
          <p className="text-sm text-gray-400 italic text-center">Enter valid values</p>
        )}
      </div>
    </div>
  );
}
