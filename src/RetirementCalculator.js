import React, { useState, useEffect, useCallback } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area, BarChart, Bar } from 'recharts';
import * as LucideIcons from 'lucide-react';

const RetirementCalculator = () => {
  // State for form inputs
  const [currentAge, setCurrentAge] = useState(30);
  const [retirementAge, setRetirementAge] = useState(65);
  const [lifeExpectancy, setLifeExpectancy] = useState(90);
  const [currentSavings, setCurrentSavings] = useState(50000);
  const [annualContribution, setAnnualContribution] = useState(6000);
  const [expectedReturn, setExpectedReturn] = useState(7);
  const [inflationRate, setInflationRate] = useState(2.5);
  const [annualIncome, setAnnualIncome] = useState(80000);
  const [incomeReplacementRate, setIncomeReplacementRate] = useState(80);
  const [annualFees, setAnnualFees] = useState(1);
  
  // State for calculation results
  const [retirementPeriod, setRetirementPeriod] = useState(0);
  const [savingsPeriod, setSavingsPeriod] = useState(0);
  const [totalContributions, setTotalContributions] = useState(0);
  const [retirementSavings, setRetirementSavings] = useState(0);
  const [monthlyRetirementIncome, setMonthlyRetirementIncome] = useState(0);
  const [requiredMonthlyIncome, setRequiredMonthlyIncome] = useState(0);
  const [incomeGap, setIncomeGap] = useState(0);
  const [retirementShortfall, setRetirementShortfall] = useState(0);
  const [savingsWithoutFees, setSavingsWithoutFees] = useState(0);
  const [feesImpact, setFeesImpact] = useState(0);
  const [showTooltip, setShowTooltip] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [hasCalculated, setHasCalculated] = useState(false);
  const [scenarioName, setScenarioName] = useState('My Retirement Plan');
  const [savedScenarios, setSavedScenarios] = useState([]);
  const [calculationKey, setCalculationKey] = useState(0);

  // Tooltip content
  const tooltipContent = {
    currentAge: "Your current age in years.",
    retirementAge: "The age at which you plan to retire and stop working full-time.",
    lifeExpectancy: "Your expected age at the end of life, used to calculate how many years your savings need to last.",
    currentSavings: "The total amount you have already saved for retirement across all accounts.",
    annualContribution: "How much you plan to contribute to your retirement savings each year.",
    expectedReturn: "The estimated annual return on your investments before retirement (conservative estimate recommended).",
    inflationRate: "The estimated annual inflation rate that will reduce your purchasing power over time.",
    annualIncome: "Your current annual income before taxes.",
    incomeReplacementRate: "The percentage of your pre-retirement income you'll need in retirement (typically 70-85%).",
    annualFees: "The percentage of your portfolio paid in investment fees annually.",
  };

  // Reset results when inputs change
  useEffect(() => {
    if (hasCalculated) {
      setHasCalculated(false);
    }
  }, [currentAge, retirementAge, lifeExpectancy, currentSavings, 
      annualContribution, expectedReturn, inflationRate, 
      annualIncome, incomeReplacementRate, annualFees]);

// Enhanced calculate function with clean state reset
const calculateRetirement = useCallback(() => {
  // Reset all calculation state first
  setChartData([]);

  // Calculate periods
  const savingsYears = retirementAge - currentAge;
  const retirementYears = lifeExpectancy - retirementAge;

  setSavingsPeriod(savingsYears);
  setRetirementPeriod(retirementYears);

  // Calculate effective return rates
  const effectiveReturn = expectedReturn / 100;
  const effectiveReturnAfterFees = (expectedReturn - annualFees) / 100;
  const inflationRate100 = inflationRate / 100;

  // Use a more conservative return during retirement (2% by default, or 1% less than accumulation)
  const retirementReturnAfterFees = Math.max(2.0, effectiveReturnAfterFees - 1.0) / 100;

  // Calculate accumulation phase
  let totalSavingsWithFees = currentSavings;
  let totalSavingsWithoutFees = currentSavings;
  let totalContrib = 0;

  // Generate chart data for accumulation phase
  const data = [];

  // Add initial data point
  data.push({
    age: currentAge,
    phase: "Accumulation",
    savings: Math.round(totalSavingsWithFees),
    savingsWithoutFees: Math.round(totalSavingsWithoutFees),
    contributions: Math.round(currentSavings),
  });

  // Calculate year by year savings growth during accumulation phase
  for (let year = 1; year <= savingsYears; year++) {
    // Update savings with fees
    totalSavingsWithFees = totalSavingsWithFees * (1 + effectiveReturnAfterFees) + annualContribution;
    
    // Update savings without fees (for comparison)
    totalSavingsWithoutFees = totalSavingsWithoutFees * (1 + effectiveReturn) + annualContribution;
    
    // Update total contributions
    totalContrib += annualContribution;
    
    // Add data point for chart
    data.push({
      age: currentAge + year,
      phase: "Accumulation",
      savings: Math.round(totalSavingsWithFees),
      savingsWithoutFees: Math.round(totalSavingsWithoutFees),
      contributions: Math.round(currentSavings + totalContrib),
    });
  }

  // Calculate required income in retirement 
  const baseRequiredIncome = annualIncome * (incomeReplacementRate / 100);
  const inflationFactor = Math.pow(1 + inflationRate100, savingsYears);
  const adjustedRequiredIncome = baseRequiredIncome * inflationFactor;
  const requiredMonthlyIncomeValue = adjustedRequiredIncome / 12;

  // Calculate initial withdrawal amount (4% of retirement savings)
  const initialAnnualWithdrawal = totalSavingsWithFees * 0.04;
  const initialMonthlyWithdrawal = initialAnnualWithdrawal / 12;

  // Initialize retirement savings balance
  let retirementSavingsBalance = totalSavingsWithFees;
  let totalWithdrawals = 0;

  // Generate data for distribution phase
  for (let year = 1; year <= retirementYears; year++) {
    // Calculate this year's withdrawal (adjusted for inflation)
    const yearlyWithdrawal = initialAnnualWithdrawal * Math.pow(1 + inflationRate100, year - 1);
    totalWithdrawals += yearlyWithdrawal;

    // Calculate investment returns
    const investmentReturns = retirementSavingsBalance * retirementReturnAfterFees;
    
    // Update balance
    retirementSavingsBalance = Math.max(0, retirementSavingsBalance + investmentReturns - yearlyWithdrawal);
    
    // Calculate required income for this year
    const requiredIncomeForYear = adjustedRequiredIncome * Math.pow(1 + inflationRate100, year - 1);
    
    // Add data point
    data.push({
      age: retirementAge + year,
      phase: "Distribution",
      savings: Math.round(retirementSavingsBalance),
      withdrawal: Math.round(yearlyWithdrawal),
      required: Math.round(requiredIncomeForYear),
    });
  }

  // Calculate average monthly income over retirement
  const avgMonthlyWithdrawal = totalWithdrawals / (retirementYears * 12);

  // Calculate income gap
  const monthlyGap = requiredMonthlyIncomeValue - avgMonthlyWithdrawal;

  // Set all state values
  setChartData(data);
  setTotalContributions(totalContrib);
  setRetirementSavings(Math.round(totalSavingsWithFees));
  setSavingsWithoutFees(Math.round(totalSavingsWithoutFees));
  setFeesImpact(Math.round(totalSavingsWithoutFees - totalSavingsWithFees));
  setRequiredMonthlyIncome(Math.round(requiredMonthlyIncomeValue));
  setMonthlyRetirementIncome(Math.round(avgMonthlyWithdrawal));
  setIncomeGap(Math.max(0, Math.round(monthlyGap)));
  setRetirementShortfall(Math.round(monthlyGap > 0 ? monthlyGap * 12 * retirementYears : 0));

  setHasCalculated(true);
  setCalculationKey(prev => prev + 1);

  console.log("Final values:", {
    retirementSavings: Math.round(totalSavingsWithFees),
    totalContributions: totalContrib,
    monthlyIncome: Math.round(avgMonthlyWithdrawal),
    requiredIncome: Math.round(requiredMonthlyIncomeValue),
    gap: Math.round(monthlyGap),
    endingBalance: Math.round(retirementSavingsBalance)
  });
}, [currentAge, retirementAge, lifeExpectancy, currentSavings, annualContribution, expectedReturn, inflationRate, annualIncome, incomeReplacementRate, annualFees]);
  
  // Enhanced calculation handler with debounce
  const handleCalculateClick = useCallback(() => {
    // Reset calculation state
    setHasCalculated(false);
    
    // Small timeout to ensure clean state before calculation
    setTimeout(() => {
      calculateRetirement();
    }, 50);
  }, [calculateRetirement]);
  
  // Format currency
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };
  
  // Save current scenario
  const saveScenario = () => {
    const newScenario = {
      id: Date.now(),
      name: scenarioName,
      currentAge,
      retirementAge,
      lifeExpectancy,
      currentSavings,
      annualContribution,
      expectedReturn,
      inflationRate,
      annualIncome,
      incomeReplacementRate,
      annualFees,
      results: {
        retirementSavings,
        monthlyRetirementIncome,
        requiredMonthlyIncome,
        incomeGap,
        retirementShortfall,
        feesImpact
      }
    };
    
    setSavedScenarios([...savedScenarios, newScenario]);
  };
  
  // Export results
  const exportResults = () => {
    alert("PDF export feature would generate a detailed report of your retirement calculations");
  };
  
  // Share results
  const shareResults = () => {
    alert("Share feature would allow you to send these results via email or social media");
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-gray-800">Retirement Savings Calculator</h2>
      </div>
      
      {/* Scenario Name */}
      <div className="mb-6">
        <label htmlFor="scenarioName" className="block text-sm font-medium text-gray-700 mb-1">
          Scenario Name
        </label>
        <input
          type="text"
          id="scenarioName"
          className="focus:ring-black focus:border-black block w-full sm:text-sm border-gray-300 rounded-md p-2 border"
          value={scenarioName}
          onChange={(e) => setScenarioName(e.target.value)}
          placeholder="e.g., Early Retirement Plan"
        />
      </div>
      
      <div className="grid md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div>
            <label htmlFor="currentAge" className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
              Current Age
              <button 
                className="ml-1 text-gray-400 hover:text-gray-600 focus:outline-none"
                onClick={() => setShowTooltip('currentAge')}
              >
                <LucideIcons.HelpCircle size={16} />
              </button>
              {showTooltip === 'currentAge' && (
                <div className="absolute z-10 mt-2 w-64 p-3 bg-gray-800 text-white text-xs rounded shadow-lg">
                  {tooltipContent.currentAge}
                  <button 
                    className="absolute top-1 right-1 text-white hover:text-gray-300"
                    onClick={() => setShowTooltip(null)}
                  >
                    <LucideIcons.X size={14} />
                  </button>
                </div>
              )}
            </label>
            <input
              type="range"
              id="currentAge"
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              min="18"
              max="80"
              value={currentAge}
              onChange={(e) => setCurrentAge(Number(e.target.value))}
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>18</span>
              <span>{currentAge} years</span>
              <span>80</span>
            </div>
          </div>
          
          <div>
            <label htmlFor="retirementAge" className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
              Retirement Age
              <button 
                className="ml-1 text-gray-400 hover:text-gray-600 focus:outline-none"
                onClick={() => setShowTooltip('retirementAge')}
              >
                <LucideIcons.HelpCircle size={16}/>
              </button>
              {showTooltip === 'retirementAge' && (
                <div className="absolute z-10 mt-2 w-64 p-3 bg-gray-800 text-white text-xs rounded shadow-lg">
                  {tooltipContent.retirementAge}
                  <button 
                    className="absolute top-1 right-1 text-white hover:text-gray-300"
                    onClick={() => setShowTooltip(null)}
                  >
                    <LucideIcons.X size={14} />
                  </button>
                </div>
              )}
            </label>
            <input
              type="range"
              id="retirementAge"
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              min={currentAge + 1}
              max="85"
              value={retirementAge}
              onChange={(e) => setRetirementAge(Number(e.target.value))}
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>{currentAge + 1}</span>
              <span>{retirementAge} years</span>
              <span>85</span>
            </div>
          </div>
          
          <div>
            <label htmlFor="lifeExpectancy" className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
              Life Expectancy
              <button 
                className="ml-1 text-gray-400 hover:text-gray-600 focus:outline-none"
                onClick={() => setShowTooltip('lifeExpectancy')}
              >
                <LucideIcons.HelpCircle size={16} />
              </button>
              {showTooltip === 'lifeExpectancy' && (
                <div className="absolute z-10 mt-2 w-64 p-3 bg-gray-800 text-white text-xs rounded shadow-lg">
                  {tooltipContent.lifeExpectancy}
                  <button 
                    className="absolute top-1 right-1 text-white hover:text-gray-300"
                    onClick={() => setShowTooltip(null)}
                  >
                    <LucideIcons.X size={14} />
                  </button>
                </div>
              )}
            </label>
            <input
              type="range"
              id="lifeExpectancy"
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              min={retirementAge + 1}
              max="105"
              value={lifeExpectancy}
              onChange={(e) => setLifeExpectancy(Number(e.target.value))}
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>{retirementAge + 1}</span>
              <span>{lifeExpectancy} years</span>
              <span>105</span>
            </div>
          </div>
          
          <div>
            <label htmlFor="currentSavings" className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
              Current Retirement Savings
              <button 
                className="ml-1 text-gray-400 hover:text-gray-600 focus:outline-none"
                onClick={() => setShowTooltip('currentSavings')}
              >
                <LucideIcons.HelpCircle size={16} />
              </button>
              {showTooltip === 'currentSavings' && (
                <div className="absolute z-10 mt-2 w-64 p-3 bg-gray-800 text-white text-xs rounded shadow-lg">
                  {tooltipContent.currentSavings}
                  <button 
                    className="absolute top-1 right-1 text-white hover:text-gray-300"
                    onClick={() => setShowTooltip(null)}
                  >
                    <LucideIcons.X size={14} />
                  </button>
                </div>
              )}
            </label>
            <div className="relative mt-1 rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-500 sm:text-sm">$</span>
              </div>
              <input
                type="number"
                id="currentSavings"
                className="focus:ring-black focus:border-black block w-full pl-7 pr-12 sm:text-sm border-gray-300 rounded-md p-2 border"
                value={currentSavings}
                onChange={(e) => setCurrentSavings(Number(e.target.value))}
                min="0"
              />
            </div>
          </div>
          
          <div>
            <label htmlFor="annualContribution" className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
              Annual Contribution
              <button 
                className="ml-1 text-gray-400 hover:text-gray-600 focus:outline-none"
                onClick={() => setShowTooltip('annualContribution')}
              >
                <LucideIcons.HelpCircle size={16} />
              </button>
              {showTooltip === 'annualContribution' && (
                <div className="absolute z-10 mt-2 w-64 p-3 bg-gray-800 text-white text-xs rounded shadow-lg">
                  {tooltipContent.annualContribution}
                  <button 
                    className="absolute top-1 right-1 text-white hover:text-gray-300"
                    onClick={() => setShowTooltip(null)}
                  >
                    <LucideIcons.X size={14} />
                  </button>
                </div>
              )}
            </label>
            <div className="relative mt-1 rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-500 sm:text-sm">$</span>
              </div>
              <input
                type="number"
                id="annualContribution"
                className="focus:ring-black focus:border-black block w-full pl-7 pr-12 sm:text-sm border-gray-300 rounded-md p-2 border"
                value={annualContribution}
                onChange={(e) => setAnnualContribution(Number(e.target.value))}
                min="0"
              />
            </div>
          </div>
        </div>
        
        <div className="space-y-6">
          <div>
            <label htmlFor="expectedReturn" className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
              Expected Annual Return (%)
              <button 
                className="ml-1 text-gray-400 hover:text-gray-600 focus:outline-none"
                onClick={() => setShowTooltip('expectedReturn')}
              >
                <LucideIcons.HelpCircle size={16} />
              </button>
              {showTooltip === 'expectedReturn' && (
                <div className="absolute z-10 mt-2 w-64 p-3 bg-gray-800 text-white text-xs rounded shadow-lg">
                  {tooltipContent.expectedReturn}
                  <button 
                    className="absolute top-1 right-1 text-white hover:text-gray-300"
                    onClick={() => setShowTooltip(null)}
                  >
                    <LucideIcons.X size={14} />
                  </button>
                </div>
              )}
            </label>
            <div className="relative mt-1 rounded-md shadow-sm">
              <input
                type="number"
                id="expectedReturn"
                className="focus:ring-black focus:border-black block w-full pr-12 sm:text-sm border-gray-300 rounded-md p-2 border"
                value={expectedReturn}
                onChange={(e) => setExpectedReturn(Number(e.target.value))}
                min="0"
                max="20"
                step="0.1"
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <span className="text-gray-500 sm:text-sm">%</span>
              </div>
            </div>
          </div>
          
          <div>
            <label htmlFor="inflationRate" className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
              Inflation Rate (%)
              <button 
                className="ml-1 text-gray-400 hover:text-gray-600 focus:outline-none"
                onClick={() => setShowTooltip('inflationRate')}
              >
                <LucideIcons.HelpCircle size={16} />
              </button>
              {showTooltip === 'inflationRate' && (
                <div className="absolute z-10 mt-2 w-64 p-3 bg-gray-800 text-white text-xs rounded shadow-lg">
                  {tooltipContent.inflationRate}
                  <button 
                    className="absolute top-1 right-1 text-white hover:text-gray-300"
                    onClick={() => setShowTooltip(null)}
                  >
                    <LucideIcons.X size={14} />
                  </button>
                </div>
              )}
            </label>
            <div className="relative mt-1 rounded-md shadow-sm">
              <input
                type="number"
                id="inflationRate"
                className="focus:ring-black focus:border-black block w-full pr-12 sm:text-sm border-gray-300 rounded-md p-2 border"
                value={inflationRate}
                onChange={(e) => setInflationRate(Number(e.target.value))}
                min="0"
                max="10"
                step="0.1"
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <span className="text-gray-500 sm:text-sm">%</span>
              </div>
            </div>
          </div>
          
          <div>
            <label htmlFor="annualIncome" className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
              Current Annual Income
              <button 
                className="ml-1 text-gray-400 hover:text-gray-600 focus:outline-none"
                onClick={() => setShowTooltip('annualIncome')}
              >
                <LucideIcons.HelpCircle size={16} />
              </button>
              {showTooltip === 'annualIncome' && (
                <div className="absolute z-10 mt-2 w-64 p-3 bg-gray-800 text-white text-xs rounded shadow-lg">
                  {tooltipContent.annualIncome}
                  <button 
                    className="absolute top-1 right-1 text-white hover:text-gray-300"
                    onClick={() => setShowTooltip(null)}
                  >
                    <LucideIcons.X size={14} />
                  </button>
                </div>
              )}
            </label>
            <div className="relative mt-1 rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-500 sm:text-sm">$</span>
              </div>
              <input
                type="number"
                id="annualIncome"
                className="focus:ring-black focus:border-black block w-full pl-7 pr-12 sm:text-sm border-gray-300 rounded-md p-2 border"
                value={annualIncome}
                onChange={(e) => setAnnualIncome(Number(e.target.value))}
                min="0"
              />
            </div>
          </div>
          
          <div>
            <label htmlFor="incomeReplacementRate" className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
              Income Replacement Rate (%)
              <button 
                className="ml-1 text-gray-400 hover:text-gray-600 focus:outline-none"
                onClick={() => setShowTooltip('incomeReplacementRate')}
              >
                <LucideIcons.HelpCircle size={16} />
              </button>
              {showTooltip === 'incomeReplacementRate' && (
                <div className="absolute z-10 mt-2 w-64 p-3 bg-gray-800 text-white text-xs rounded shadow-lg">
                  {tooltipContent.incomeReplacementRate}
                  <button 
                    className="absolute top-1 right-1 text-white hover:text-gray-300"
                    onClick={() => setShowTooltip(null)}
                  >
                    <LucideIcons.X size={14} />
                  </button>
                </div>
              )}
            </label>
            <div className="relative mt-1 rounded-md shadow-sm">
              <input
                type="range"
                id="incomeReplacementRate"
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                min="50"
                max="100"
                step="5"
                value={incomeReplacementRate}
                onChange={(e) => setIncomeReplacementRate(Number(e.target.value))}
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>50%</span>
                <span>{incomeReplacementRate}%</span>
                <span>100%</span>
              </div>
            </div>
          </div>
          
          <div>
            <label htmlFor="annualFees" className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
              Annual Investment Fees (%)
              <button 
                className="ml-1 text-gray-400 hover:text-gray-600 focus:outline-none"
                onClick={() => setShowTooltip('annualFees')}
              >
                <LucideIcons.HelpCircle size={16} />
              </button>
              {showTooltip === 'annualFees' && (
                <div className="absolute z-10 mt-2 w-64 p-3 bg-gray-800 text-white text-xs rounded shadow-lg">
                  {tooltipContent.annualFees}
                  <button 
                    className="absolute top-1 right-1 text-white hover:text-gray-300"
                    onClick={() => setShowTooltip(null)}
                  >
                    <LucideIcons.X size={14} />
                  </button>
                </div>
              )}
            </label>
            <div className="relative mt-1 rounded-md shadow-sm">
              <input
                type="number"
                id="annualFees"
                className="focus:ring-black focus:border-blackblock w-full pr-12 sm:text-sm border-gray-300 rounded-md p-2 border"
                value={annualFees}
                onChange={(e) => setAnnualFees(Number(e.target.value))}
                min="0"
                max="5"
                step="0.01"
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <span className="text-gray-500 sm:text-sm">%</span>
              </div>
            </div>
          </div>
          
          <div className="pt-4">
  <button
    onClick={() => {
      setHasCalculated(false);
      setTimeout(calculateRetirement, 50);
    }}
    className="w-full bg-black hover:bg-gray-800 text-white font-bold py-3 px-4 rounded focus:outline-none focus:shadow-outline transition-colors"
  >
    Calculate Retirement Plan
  </button>
</div>
        </div>
      </div>
      
      {hasCalculated && (
        <div className="bg-white rounded-lg shadow-lg p-6 mt-8" key={calculationKey}>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold text-gray-800">Results: {scenarioName}</h2>
            
            <div className="flex space-x-2">
              <button 
                onClick={saveScenario}
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
              >
                <LucideIcons.Save size={16} className="mr-2" />
                Save
              </button>
              <button 
                onClick={exportResults}
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
              >
                <LucideIcons.Download size={16} className="mr-2" />
                Export
              </button>
              <button 
                onClick={shareResults}
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
              >
                <LucideIcons.Share2 size={16} className="mr-2" />
                Share
              </button>
            </div>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <div className="bg-gray-50 rounded-lg p-6 mb-6">
                <h3 className="text-xl font-medium text-gray-700 mb-4">Retirement Overview</h3>
                
                <div className="grid grid-cols-2 gap-4 mb-6">
  <div className="bg-white rounded-lg p-4 shadow-sm">
    <p className="text-sm text-gray-500 mb-1">Years Until Retirement</p>
    <p className="text-2xl font-semibold text-gray-800">{savingsPeriod}</p>
  </div>
  <div className="bg-white rounded-lg p-4 shadow-sm">
    <p className="text-sm text-gray-500 mb-1">Years In Retirement</p>
    <p className="text-2xl font-semibold text-gray-800">{retirementPeriod}</p>
  </div>
  <div className="bg-white rounded-lg p-4 shadow-sm">
    <p className="text-sm text-gray-500 mb-1">Retirement Savings</p>
    <p className="text-2xl font-semibold text-gray-800">{formatCurrency(retirementSavings)}</p>
  </div>
  <div className="bg-white rounded-lg p-4 shadow-sm">
    <p className="text-sm text-gray-500 mb-1">Total Contributions</p>
    <p className="text-2xl font-semibold text-gray-800">{formatCurrency(currentSavings + totalContributions)}</p>
  </div>
</div>
                
                <div className="space-y-3 mb-6">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Monthly Income Needed:</span>
                      <span className="font-medium">{formatCurrency(requiredMonthlyIncome)}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-4">
                      <div className="bg-gray-500 h-4 rounded-full" style={{ width: '100%' }}></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Projected Monthly Income:</span>
                      <span className="font-medium">{formatCurrency(monthlyRetirementIncome)}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-4">
                      <div 
                        className={`h-4 rounded-full ${monthlyRetirementIncome >= requiredMonthlyIncome ? 'bg-green-500' : 'bg-yellow-500'}`} 
                        style={{ width: `${Math.min(100, (monthlyRetirementIncome / requiredMonthlyIncome) * 100)}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  {incomeGap > 0 && (
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Monthly Income Gap:</span>
                        <span className="font-medium text-red-500">{formatCurrency(incomeGap)}</span>
                      </div>
                      <div className="w-full bg-red-100 rounded-full h-4">
                        <div 
                          className="bg-red-500 h-4 rounded-full" 
                          style={{ width: `${Math.min(100, (incomeGap / requiredMonthlyIncome) * 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="bg-white rounded-lg p-4 shadow-sm mb-6">
                  <h4 className="font-medium text-gray-700 mb-2">Fee Impact on Savings</h4>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Lost to Fees:</span>
                    <span className="font-medium text-red-500">{formatCurrency(feesImpact)}</span>
                  </div>
                  <div className="text-xs text-gray-500 mt-2">
                    That's {((feesImpact / savingsWithoutFees) * 100).toFixed(1)}% of your potential retirement savings
                  </div>
                </div>
                
                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <h4 className="font-medium text-gray-700 mb-2">Key Insights</h4>
                  <ul className="text-sm text-gray-600 space-y-2">
                    <li className="flex items-start">
                      <LucideIcons.CheckCircle size={16} className="text-green-500 mr-2 mt-0.5" />
                      {monthlyRetirementIncome >= requiredMonthlyIncome ? 
                        `You're on track to meet your retirement income goals.` : 
                        `You may need to increase savings to meet your retirement income goals.`}
                    </li>
                    <li className="flex items-start">
                      <LucideIcons.Clock size={16} className="text-blue-500 mr-2 mt-0.5" />
                      Your retirement savings need to last for {retirementPeriod} years.
                    </li>
                    <li className="flex items-start">
                      <LucideIcons.DollarSign size={16} className="text-yellow-500 mr-2 mt-0.5" />
                      Investment growth will account for {formatCurrency(retirementSavings - currentSavings - totalContributions)} of your retirement savings.
                    </li>
                    <li className="flex items-start">
                      <LucideIcons.AlertCircle size={16} className="text-red-500 mr-2 mt-0.5" />
                      {annualFees > 1 ? 
                        `Your annual investment fees (${annualFees}%) are higher than average. Reducing fees could significantly increase your retirement savings.` : 
                        `Your annual investment fees (${annualFees}%) are reasonable, but continued optimization could further improve results.`}
                    </li>
                  </ul>
                </div>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-xl font-medium text-gray-700 mb-4">Recommended Actions</h3>
                
                <div className="space-y-4">
                  {incomeGap > 0 && (
                    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
                      <div className="flex items-start">
                        <div className="flex-shrink-0">
                          <LucideIcons.AlertTriangle size={24} className="text-yellow-400" />
                        </div>
                        <div className="ml-3">
                          <h3 className="text-sm font-medium text-yellow-800">Income Gap Detected</h3>
                          <div className="mt-2 text-sm text-yellow-700">
                            <p>
                              You're projected to have an income gap of {formatCurrency(incomeGap)} per month in retirement.
                              Consider one of these options to close the gap:
                            </p>
                            <ul className="list-disc pl-5 mt-1 space-y-1">
                              <li>Increase annual contributions by {formatCurrency((incomeGap * 12) / (Math.pow(1 + (expectedReturn - annualFees) / 100, savingsPeriod) - 1) * ((expectedReturn - annualFees) / 100))}</li>
                              <li>Delay retirement by {Math.ceil(incomeGap / (annualIncome / 12) * 3)} years</li>
                              <li>Reduce retirement expenses by {formatCurrency(incomeGap)}/month</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {annualFees > 1 && (
                    <div className="bg-blue-50 border-l-4 border-blue-400 p-4">
                      <div className="flex items-start">
                        <div className="flex-shrink-0">
                          <LucideIcons.Info size={24} className="text-blue-400" />
                        </div>
                        <div className="ml-3">
                          <h3 className="text-sm font-medium text-blue-800">Fee Reduction Opportunity</h3>
                          <div className="mt-2 text-sm text-blue-700">
                            <p>
                              Reducing your investment fees from {annualFees}% to 0.5% could add approximately {formatCurrency(feesImpact * ((annualFees - 0.5) / annualFees))} to your retirement savings.
                            </p>
                            <p className="mt-1">
                              Consider low-cost index funds or ETFs to minimize fees while maintaining market returns.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {savingsPeriod > 10 && monthlyRetirementIncome < requiredMonthlyIncome * 1.2 && (
                    <div className="bg-green-50 border-l-4 border-green-400 p-4">
                      <div className="flex items-start">
                        <div className="flex-shrink-0">
                          <LucideIcons.TrendingUp size={24} className="text-green-400" />
                        </div>
                        <div className="ml-3">
                          <h3 className="text-sm font-medium text-green-800">Optimization Opportunity</h3>
                          <div className="mt-2 text-sm text-green-700">
                            <p>
                              You still have {savingsPeriod} years until retirement, which gives you time to optimize.
                              Increasing your annual contribution by just {formatCurrency(annualContribution * 0.1)} could add approximately 
                              {formatCurrency(annualContribution * 0.1 * savingsPeriod * Math.pow(1 + (expectedReturn - annualFees) / 100, savingsPeriod / 2))} to your retirement savings.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-xl font-medium text-gray-700 mb-4">Retirement Savings Projection</h3>
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
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis 
                      dataKey="age" 
                      label={{ value: 'Age', position: 'insideBottomRight', offset: -10 }} 
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
                      labelFormatter={(label) => `Age ${label}`}
                      contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', borderRadius: '4px' }}
                    />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="savings" 
                      name="Projected Savings" 
                      stroke="#10B981" 
                      strokeWidth={3} 
                      activeDot={{ r: 8 }} 
                    />
                    {chartData.length > 0 && chartData[0].savingsWithoutFees && (
                      <Line 
                        type="monotone" 
                        dataKey="savingsWithoutFees" 
                        name="Without Fees" 
                        stroke="#6366F1" 
                        strokeWidth={2} 
                        strokeDasharray="5 5"
                      />
                    )}
                    {chartData.length > 0 && chartData[0].contributions && (
                      <Line 
                        type="monotone" 
                        dataKey="contributions" 
                        name="Total Contributions" 
                        stroke="#FBBF24" 
                        strokeWidth={2} 
                      />
                    )}
                  </LineChart>
                </ResponsiveContainer>
              </div>
              
              <h3 className="text-xl font-medium text-gray-700 my-6">Retirement Income vs. Needs</h3>
              <div className="h-64 md:h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={chartData.filter(d => d.phase === "Distribution")}
                    margin={{
                      top: 5,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis 
                      dataKey="age" 
                      label={{ value: 'Age', position: 'insideBottomRight', offset: -10 }} 
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
                      labelFormatter={(label) => `Age ${label}`}
                      contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', borderRadius: '4px' }}
                    />
                    <Legend />
                    <Bar 
                      dataKey="withdrawal" 
                      name="Projected Income" 
                      fill="#10B981" 
                    />
                    <Bar 
                      dataKey="required" 
                      name="Income Needed" 
                      fill="#F87171" 
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              
              <div className="bg-white rounded-lg shadow-sm p-6 mt-6">
                <h3 className="text-lg font-medium text-gray-700 mb-4">Detailed Breakdown</h3>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-gray-600 mb-2">Saving Phase (Ages {currentAge}-{retirementAge})</h4>
                    <table className="min-w-full divide-y divide-gray-200">
                      <tbody className="divide-y divide-gray-200">
                        <tr>
                          <td className="py-2 text-sm text-gray-500">Starting Balance</td>
                          <td className="py-2 text-sm text-gray-900 text-right">{formatCurrency(currentSavings)}</td>
                        </tr>
                        <tr>
                          <td className="py-2 text-sm text-gray-500">Total Contributions</td>
                          <td className="py-2 text-sm text-gray-900 text-right">{formatCurrency(totalContributions)}</td>
                        </tr>
                        <tr>
                          <td className="py-2 text-sm text-gray-500">Investment Growth</td>
                          <td className="py-2 text-sm text-gray-900 text-right">{formatCurrency(retirementSavings - currentSavings - totalContributions)}</td>
                        </tr>
                        <tr>
                          <td className="py-2 text-sm text-gray-500">Lost to Fees</td>
                          <td className="py-2 text-sm text-red-500 text-right">-{formatCurrency(feesImpact)}</td>
                        </tr>
                        <tr className="bg-gray-50">
                          <td className="py-2 text-sm font-medium text-gray-700">Retirement Savings</td>
                          <td className="py-2 text-sm font-medium text-gray-900 text-right">{formatCurrency(retirementSavings)}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-600 mb-2">Distribution Phase (Ages {retirementAge}-{lifeExpectancy})</h4>
                    <table className="min-w-full divide-y divide-gray-200">
                      <tbody className="divide-y divide-gray-200">
                        <tr>
                          <td className="py-2 text-sm text-gray-500">Annual Retirement Income</td>
                          <td className="py-2 text-sm text-gray-900 text-right">{formatCurrency(monthlyRetirementIncome * 12)}</td>
                        </tr>
                        <tr>
                          <td className="py-2 text-sm text-gray-500">Annual Income Needed</td>
                          <td className="py-2 text-sm text-gray-900 text-right">{formatCurrency(requiredMonthlyIncome * 12)}</td>
                        </tr>
                        <tr>
                          <td className="py-2 text-sm text-gray-500">Annual Income Gap</td>
                          <td className="py-2 text-sm text-gray-900 text-right">{incomeGap > 0 ? formatCurrency(incomeGap * 12) : "No Gap"}</td>
                        </tr>
                        <tr>
                          <td className="py-2 text-sm text-gray-500">Withdrawal Rate</td>
                          <td className="py-2 text-sm text-gray-900 text-right">4%</td>
                        </tr>
                        <tr className="bg-gray-50">
                          <td className="py-2 text-sm font-medium text-gray-700">Retirement Sufficiency</td>
                          <td className="py-2 text-sm font-medium text-right">
                            <span 
                              className={`py-1 px-2 rounded text-white ${incomeGap <= 0 ? 'bg-green-500' : 'bg-red-500'}`}
                            >
                              {incomeGap <= 0 ? "On Track" : "Action Needed"}
                            </span>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Saved Scenarios Section */}
          {savedScenarios.length > 0 && (
            <div className="mt-8 border-t border-gray-200 pt-6">
              <h3 className="text-lg font-medium text-gray-700 mb-4">Saved Scenarios</h3>
              <div className="overflow-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Retire Age</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Annual Contrib</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Return</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fees</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Retirement Savings</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Monthly Income</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {savedScenarios.map((scenario) => (
                      <tr key={scenario.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{scenario.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{scenario.retirementAge}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatCurrency(scenario.annualContribution)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{scenario.expectedReturn}%</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{scenario.annualFees}%</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatCurrency(scenario.results.retirementSavings)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatCurrency(scenario.results.monthlyRetirementIncome)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
      
      <div className="bg-white rounded-lg p-6 mt-8">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6">Understanding Retirement Planning</h2>
        
        <div className="prose max-w-none">
          <p>
            Planning for retirement is one of the most important financial steps you can take. The earlier you start,
            the more time your investments have to grow through the power of compounding.
          </p>
          
          <h3>Key Factors in Retirement Planning</h3>
          <ul>
            <li><strong>Time Horizon:</strong> The number of years until retirement significantly impacts how much you need to save</li>
            <li><strong>Savings Rate:</strong> How much you contribute annually is often more important than investment returns</li>
            <li><strong>Investment Returns:</strong> Higher returns can dramatically increase your savings, but come with higher risk</li>
            <li><strong>Inflation:</strong> The silent wealth eroder that reduces your purchasing power over time</li>
            <li><strong>Investment Fees:</strong> Even small fees compound over time and can reduce your final savings by 20-30%</li>
          </ul>
          
          <h3>The 4% Rule</h3>
          <p>
            This calculator uses the widely-accepted "4% rule" as a baseline for sustainable withdrawals. This rule suggests
            that retirees can safely withdraw 4% of their initial retirement savings in the first year, then adjust that amount
            for inflation each year thereafter, with a high probability that their savings will last 30 years.
          </p>
          
          <h3>Income Replacement Rate</h3>
          <p>
            Most financial planners recommend targeting 70-85% of your pre-retirement income during retirement. This is because
            some expenses typically decrease in retirement (commuting costs, retirement savings, etc.), while others may increase
            (healthcare, leisure activities).
          </p>
          
          <h3>The Impact of Fees</h3>
          <p>
            Investment fees may seem small, but their impact compounds dramatically over time. A difference of just 1% in
            annual fees can reduce your final retirement savings by 20-30% over a full career. This calculator shows you exactly
            how much of your potential retirement savings are lost to fees.
          </p>
        </div>
      </div>
    </div>
  );
};

export default RetirementCalculator;