import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const FourStarFees = () => {
  // State for form inputs
  const [initialInvestment, setInitialInvestment] = useState(10000);
  const [annualContribution, setAnnualContribution] = useState(5000);
  const [investmentPeriod, setInvestmentPeriod] = useState(30);
  const [expectedReturn, setExpectedReturn] = useState(7);
  const [annualFee, setAnnualFee] = useState(2);
  
  // State for calculation results
  const [withoutFeesResult, setWithoutFeesResult] = useState(0);
  const [withFeesResult, setWithFeesResult] = useState(0);
  const [feesTotal, setFeesTotal] = useState(0);
  const [feePercentage, setFeePercentage] = useState(0);
  const [tRexScore, setTRexScore] = useState(0);
  const [chartData, setChartData] = useState([]);
  const [hasCalculated, setHasCalculated] = useState(false);

  // Calculate investment growth
  const calculateGrowth = () => {
    const withoutFees = calculateInvestmentGrowth(initialInvestment, annualContribution, investmentPeriod, expectedReturn, 0);
    const withFees = calculateInvestmentGrowth(initialInvestment, annualContribution, investmentPeriod, expectedReturn, annualFee);
    
    const totalFees = withoutFees - withFees;
    const feeImpactPercentage = (totalFees / withoutFees) * 100;
    const tRex = 100 - feeImpactPercentage;
    
    setWithoutFeesResult(withoutFees);
    setWithFeesResult(withFees);
    setFeesTotal(totalFees);
    setFeePercentage(feeImpactPercentage);
    setTRexScore(tRex);
    
    // Generate chart data
    const data = [];
    
    for (let year = 0; year <= investmentPeriod; year++) {
      const withoutFeesAtYear = calculateInvestmentGrowth(initialInvestment, annualContribution, year, expectedReturn, 0);
      const withFeesAtYear = calculateInvestmentGrowth(initialInvestment, annualContribution, year, expectedReturn, annualFee);
      
      data.push({
        year,
        withoutFees: Math.round(withoutFeesAtYear),
        withFees: Math.round(withFeesAtYear),
      });
    }
    
    setChartData(data);
    setHasCalculated(true);
  };

  // Core calculation function
  const calculateInvestmentGrowth = (initial, annual, years, returnRate, feeRate) => {
    const effectiveReturn = (returnRate - feeRate) / 100;
    let totalAmount = initial;
    
    for (let i = 0; i < years; i++) {
      totalAmount = totalAmount * (1 + effectiveReturn) + annual;
    }
    
    return totalAmount;
  };

  // Format currency
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <header className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">FourStar Fees</h1>
          <p className="text-xl text-gray-600">Understand how investment fees impact your long-term returns</p>
        </header>

        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">Investment Fee Calculator</h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div>
                <label htmlFor="initialInvestment" className="block text-sm font-medium text-gray-700 mb-1">
                  Initial Investment
                </label>
                <div className="relative mt-1 rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 sm:text-sm">$</span>
                  </div>
                  <input
                    type="number"
                    id="initialInvestment"
                    className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-7 pr-12 sm:text-sm border-gray-300 rounded-md p-2 border"
                    value={initialInvestment}
                    onChange={(e) => setInitialInvestment(Number(e.target.value))}
                    min="0"
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="annualContribution" className="block text-sm font-medium text-gray-700 mb-1">
                  Annual Contribution
                </label>
                <div className="relative mt-1 rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 sm:text-sm">$</span>
                  </div>
                  <input
                    type="number"
                    id="annualContribution"
                    className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-7 pr-12 sm:text-sm border-gray-300 rounded-md p-2 border"
                    value={annualContribution}
                    onChange={(e) => setAnnualContribution(Number(e.target.value))}
                    min="0"
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="investmentPeriod" className="block text-sm font-medium text-gray-700 mb-1">
                  Investment Period (years)
                </label>
                <input
                  type="number"
                  id="investmentPeriod"
                  className="focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border"
                  value={investmentPeriod}
                  onChange={(e) => setInvestmentPeriod(Number(e.target.value))}
                  min="1"
                  max="100"
                />
              </div>
            </div>
            
            <div className="space-y-6">
              <div>
                <label htmlFor="expectedReturn" className="block text-sm font-medium text-gray-700 mb-1">
                  Expected Annual Return (%)
                </label>
                <div className="relative mt-1 rounded-md shadow-sm">
                  <input
                    type="number"
                    id="expectedReturn"
                    className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pr-12 sm:text-sm border-gray-300 rounded-md p-2 border"
                    value={expectedReturn}
                    onChange={(e) => setExpectedReturn(Number(e.target.value))}
                    min="0"
                    max="50"
                    step="0.1"
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 sm:text-sm">%</span>
                  </div>
                </div>
              </div>
              
              <div>
                <label htmlFor="annualFee" className="block text-sm font-medium text-gray-700 mb-1">
                  Annual Fee (%)
                </label>
                <div className="relative mt-1 rounded-md shadow-sm">
                  <input
                    type="number"
                    id="annualFee"
                    className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pr-12 sm:text-sm border-gray-300 rounded-md p-2 border"
                    value={annualFee}
                    onChange={(e) => setAnnualFee(Number(e.target.value))}
                    min="0"
                    max="20"
                    step="0.1"
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 sm:text-sm">%</span>
                  </div>
                </div>
              </div>
              
              <div className="pt-4">
                <button
                  onClick={calculateGrowth}
                  className="w-full bg-black hover:bg-gray-800 text-white font-bold py-3 px-4 rounded focus:outline-none focus:shadow-outline transition-colors"
                >
                  Calculate Impact
                </button>
              </div>
            </div>
          </div>
        </div>

        {hasCalculated && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">Results</h2>
            
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <div className="bg-gray-50 rounded-lg p-6 mb-6">
                  <h3 className="text-xl font-medium text-gray-700 mb-4">T-Rex Score: {tRexScore.toFixed(1)}%</h3>
                  <p className="text-gray-600 mb-4">
                    Your T-Rex Score shows what percentage of your potential returns you actually keep. 
                    Higher is better; the rest goes to fees.
                  </p>
                  
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Investment without fees:</span>
                        <span className="font-medium">{formatCurrency(withoutFeesResult)}</span>
                      </div>
                      <div className="w-full bg-green-100 rounded-full h-4">
                        <div className="bg-green-500 h-4 rounded-full" style={{ width: '100%' }}></div>
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Investment with fees:</span>
                        <span className="font-medium">{formatCurrency(withFeesResult)}</span>
                      </div>
                      <div className="w-full bg-green-100 rounded-full h-4">
                        <div 
                          className="bg-green-500 h-4 rounded-full" 
                          style={{ width: `${tRexScore}%` }}
                        ></div>
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Total fees paid:</span>
                        <span className="font-medium text-red-500">{formatCurrency(feesTotal)}</span>
                      </div>
                      <div className="w-full bg-red-100 rounded-full h-4">
                        <div 
                          className="bg-red-500 h-4 rounded-full" 
                          style={{ width: `${feePercentage}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="text-gray-600 text-sm">
                  <p className="mb-2"><strong>Fee impact:</strong> {feePercentage.toFixed(1)}% of your potential returns</p>
                  <p>An annual fee of {annualFee}% might seem small, but over {investmentPeriod} years it consumes {formatCurrency(feesTotal)} of your potential {formatCurrency(withoutFeesResult)} investment value.</p>
                </div>
              </div>
              
              <div>
                <h3 className="text-xl font-medium text-gray-700 mb-4">Investment Growth Comparison</h3>
                <div className="h-64 md:h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={chartData}
                      margin={{
                        top: 5,
                        right: 30,
                        left: 20,
                        bottom: 5,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="year" 
                        label={{ value: 'Years', position: 'insideBottomRight', offset: -10 }} 
                      />
                      <YAxis 
                        tickFormatter={(value) => value.toLocaleString('en-US', { 
                          style: 'currency', 
                          currency: 'USD',
                          minimumFractionDigits: 0,
                          maximumFractionDigits: 0,
                          notation: 'compact'
                        })} 
                      />
                      <Tooltip 
                        formatter={(value) => [value.toLocaleString('en-US', { 
                          style: 'currency', 
                          currency: 'USD',
                          minimumFractionDigits: 0,
                          maximumFractionDigits: 0
                        }), '']} 
                        labelFormatter={(label) => `Year ${label}`}
                      />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="withoutFees" 
                        name="Without Fees" 
                        stroke="#10B981" 
                        strokeWidth={2} 
                        activeDot={{ r: 8 }} 
                      />
                      <Line 
                        type="monotone" 
                        dataKey="withFees" 
                        name="With Fees" 
                        stroke="#EF4444" 
                        strokeWidth={2} 
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        )}
        
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Understanding Investment Fees</h2>
          
          <div className="prose max-w-none">
            <p>
              Investment fees might seem small at first glance, but their impact compounds dramatically over time. 
              A difference of just 1-2% in annual fees can reduce your final investment value by 20-40% over several decades.
            </p>
            
            <h3>Types of Investment Fees</h3>
            <ul>
              <li><strong>Management Expense Ratio (MER):</strong> Annual fee charged by mutual funds and ETFs</li>
              <li><strong>Advisory Fees:</strong> Charges for investment advice and portfolio management</li>
              <li><strong>Trading Commissions:</strong> Costs per transaction when buying or selling investments</li>
              <li><strong>Account Fees:</strong> Administrative charges for maintaining your investment account</li>
            </ul>
            
            <h3>The T-Rex Score</h3>
            <p>
              The T-Rex Score was developed by Larry Bates to help investors understand the true impact of fees. 
              It represents the percentage of your potential investment returns that you actually keep, with the rest being consumed by fees.
              A higher score is better—ideally, you want to keep as much of your returns as possible.
            </p>
            
            <h3>How to Improve Your T-Rex Score</h3>
            <ul>
              <li>Consider low-cost index funds or ETFs instead of actively managed funds</li>
              <li>Compare fee structures when selecting investment platforms</li>
              <li>Be wary of "hidden" fees that may not be immediately obvious</li>
              <li>Review your investment costs annually to ensure they remain competitive</li>
            </ul>
          </div>
        </div>
        
        <footer className="text-center text-gray-500 text-sm mt-12">
          <p>FourStar Fees | Investment Fee Impact Calculator</p>
          <p className="mt-1">Inspired by Larry Bates' T-Rex Score concept</p>
        </footer>
      </div>
    </div>
  );
};

export default FourStarFees;