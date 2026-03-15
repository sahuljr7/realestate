import EMICalculator from '@/components/tools/EMICalculator';
import LoanEligibilityCalculator from '@/components/tools/LoanEligibilityCalculator';
import PrepaymentCalculator from '@/components/tools/PrepaymentCalculator';
import { Calculator, BadgeIndianRupee, TrendingDown } from 'lucide-react';

export const metadata = {
  title: 'Home Loan Tools | Real Estate Marketplace',
  description: 'Calculate your EMI, check loan eligibility, and estimate prepayment savings.',
};

export default function ToolsPage() {
  return (
    <main className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-4xl mx-auto space-y-12">
        {/* Page header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-gray-900">Home Loan Tools</h1>
          <p className="text-gray-500 max-w-xl mx-auto">
            Estimate your monthly payments, check how much you can borrow, and see how prepayments
            can save you money — all in one place.
          </p>
        </div>

        {/* EMI Calculator */}
        <section aria-labelledby="emi-heading" className="space-y-3">
          <div className="flex items-center gap-2">
            <Calculator className="w-5 h-5 text-blue-600" />
            <h2 id="emi-heading" className="text-lg font-semibold text-gray-800">
              EMI Calculator
            </h2>
          </div>
          <p className="text-sm text-gray-500">
            Enter your loan amount, interest rate, and tenure to find out your monthly instalment.
          </p>
          <EMICalculator />
        </section>

        <hr className="border-gray-200" />

        {/* Loan Eligibility Calculator */}
        <section aria-labelledby="eligibility-heading" className="space-y-3">
          <div className="flex items-center gap-2">
            <BadgeIndianRupee className="w-5 h-5 text-green-600" />
            <h2 id="eligibility-heading" className="text-lg font-semibold text-gray-800">
              Loan Eligibility Calculator
            </h2>
          </div>
          <p className="text-sm text-gray-500">
            Find out the maximum loan amount you qualify for based on your income and existing
            obligations.
          </p>
          <LoanEligibilityCalculator />
        </section>

        <hr className="border-gray-200" />

        {/* Prepayment Calculator */}
        <section aria-labelledby="prepayment-heading" className="space-y-3">
          <div className="flex items-center gap-2">
            <TrendingDown className="w-5 h-5 text-purple-600" />
            <h2 id="prepayment-heading" className="text-lg font-semibold text-gray-800">
              Prepayment Calculator
            </h2>
          </div>
          <p className="text-sm text-gray-500">
            See how a lump-sum prepayment reduces your remaining tenure and total interest paid.
          </p>
          <PrepaymentCalculator />
        </section>
      </div>
    </main>
  );
}
