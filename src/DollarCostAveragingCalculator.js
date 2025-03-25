import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area, BarChart, Bar } from 'recharts';
import * as LucideIcons from 'lucide-react';

const DollarCostAveragingCalculator = () => {
  // State for form inputs
  const [lumpSum, setLumpSum] = useState(10000);
  const [regularInvestment, setRegularInvestment] = useState(500);
  const [investmentPeriod, setInvestmentPeriod] = useState(12);
  const [investmentFrequency, setInvestmentFrequency] = useState('monthly');
  const [expectedReturn, setExpectedReturn] = useState(8);
  const [volatility, setVolatility] = useState(15);
  const [annualFees, setAnnualFees] = useState(1);
  const [showTooltip, setShowTooltip] = useState(null);
  const [scenarioName, setScenarioName] = useState('My DCA Plan');
  
  // State for calculation results
  const [dcaResults, setDcaResults] = useState([]);
  const [lumpSumResults, setLumpSumResults] = useState([]);
  const [dcaReturnMetrics, setDcaReturnMetrics] = useState({});
  const [lumpSumReturnMetrics, setLumpSumReturnMetrics] = useState({});
  const [conversionPlan, setConversionPlan] = useState([]);
  const [totalInvested, setTotalInvested] = useState(0);
  const [probabilityAnalysis, setProbabilityAnalysis] = useState({});
  const [hasCalculated, setHasCalculated] = useState(false);
  const [savedScenarios, setSavedScenarios] = useState([]);
  
  // Tooltip content
  const tooltipContent = {
    lumpSum: "The total amount of money available for investment upfront.",
    regularInvestment: "The amount to invest at regular intervals when using dollar cost averaging.",
    investmentPeriod: "The total length of time over which to spread your investments.",
    investmentFrequency: "How often to make regular investments during the investment period.",
    expectedReturn: "The estimated annual return of the investment (before fees).",
    volatility: "The expected annual standard deviation of the investment's returns.",
    annualFees: "The annual investment management fees as a percentage."
  };

  // Calculate DCA vs Lump Sum
  const calculateDCA = () => {
    // Convert investment period to months for consistency
    let periodInMonths = investmentPeriod;
    if (investmentFrequency === 'quarterly') {
      periodInMonths = investmentPeriod * 3;
    } else if (investmentFrequency === 'annually') {
      periodInMonths = investmentPeriod * 12;
    }
    
    // Calculate investment amount per period
    let investmentAmount = regularInvestment;
    
    // Calculate total to be invested
    const totalToInvest = investmentAmount * investmentPeriod;
    setTotalInvested(totalToInvest);
    
    // Check if total investment exceeds lump sum
    if (totalToInvest > lumpSum) {
      alert("Total DCA investment amount exceeds lump sum. Adjusting regular investment amount.");
      investmentAmount = lumpSum / investmentPeriod;
      setRegularInvestment(investmentAmount);
    }
    
    // Calculate periods per year based on frequency
    const periodsPerYear = investmentFrequency === 'monthly' ? 12 : investmentFrequency === 'quarterly' ? 4 : 1;
    
    // Convert annual rates to per-period rates
    const periodReturnRate = (Math.pow(1 + expectedReturn / 100, 1 / periodsPerYear) - 1);
    const periodFeeRate = (Math.pow(1 + annualFees / 100, 1 / periodsPerYear) - 1);
    const periodVolatility = volatility / 100 / Math.sqrt(periodsPerYear);
    
    // Simulate DCA performance with random variation
    const dcaData = [];
    let dcaInvested = 0;
    let dcaValue = 0;
    
    // Run multiple Monte Carlo simulations for DCA
    const numSimulations = 500;
    let dcaEndValues = [];
    let dcaPathSamples = [];
    
    for (let sim = 0; sim < numSimulations; sim++) {
      let simulatedValue = 0;
      let simulatedInvested = 0;
      const simPath = [];
      
      for (let period = 0; period <= investmentPeriod; period++) {
        // Track total invested at each point
        if (period > 0) {
          simulatedInvested += investmentAmount;
          
          // Calculate return with random variation (simplified Monte Carlo)
          const randomReturn = generateRandomReturn(periodReturnRate, periodVolatility);
          const effectiveReturn = randomReturn - periodFeeRate;
          
          // Update portfolio value
          simulatedValue = (simulatedValue * (1 + effectiveReturn)) + investmentAmount;
        }
        
        // Store the simulated path for visualization (only store a few samples)
        if (sim < 3) {
          simPath.push({
            period,
            invested: simulatedInvested,
            value: simulatedValue
          });
        }
      }
      
      // Store the end value for probability analysis
      dcaEndValues.push(simulatedValue);
      
      // Store the simulation path (only for a few samples)
      if (sim < 3) {
        dcaPathSamples.push(simPath);
      }
      
      // Use the first simulation for the main display
      if (sim === 0) {
        dcaInvested = simulatedInvested;
        dcaValue = simulatedValue;
        
        // Store the DCA data for the main chart
        for (let period = 0; period <= investmentPeriod; period++) {
          const amountInvested = period > 0 ? investmentAmount * period : 0;
          
          dcaData.push({
            period,
            invested: amountInvested,
            value: sim < 3 ? dcaPathSamples[sim][period].value : 0,
            value1: sim >= 1 && sim < 3 ? dcaPathSamples[sim][period].value : 0,
            value2: sim >= 2 && sim < 3 ? dcaPathSamples[sim][period].value : 0
          });
        }
      }
    }
    
    // Calculate average, median, min, max for DCA
    dcaEndValues.sort((a, b) => a - b);
    const dcaAvg = dcaEndValues.reduce((sum, val) => sum + val, 0) / numSimulations;
    const dcaMedian = dcaEndValues[Math.floor(numSimulations / 2)];
    const dcaMin = dcaEndValues[0];
    const dcaMax = dcaEndValues[numSimulations - 1];
    
    // Simulate Lump Sum performance with random variation
    const lumpSumData = [];
    let lumpSumEndValues = [];
    let lumpSumPathSamples = [];
    
    for (let sim = 0; sim < numSimulations; sim++) {
      let simulatedValue = lumpSum;
      const simPath = [];
      
      for (let period = 0; period <= investmentPeriod; period++) {
        // For period 0, just use the lump sum amount
        if (period === 0) {
          simPath.push({
            period,
            invested: lumpSum,
            value: simulatedValue
          });
          continue;
        }
        
        // Calculate return with random variation
        const randomReturn = generateRandomReturn(periodReturnRate, periodVolatility);
        const effectiveReturn = randomReturn - periodFeeRate;
        
        // Update portfolio value
        simulatedValue = simulatedValue * (1 + effectiveReturn);
        
        // Store the simulated path
        if (sim < 3) {
          simPath.push({
            period,
            invested: lumpSum,
            value: simulatedValue
          });
        }
      }
      
      // Store the end value for probability analysis
      lumpSumEndValues.push(simulatedValue);
      
      // Store the simulation path (only for a few samples)
      if (sim < 3) {
        lumpSumPathSamples.push(simPath);
      }
      
      // Use the first simulation for the main display
      if (sim === 0) {
        // Store the lump sum data for the chart
        for (let period = 0; period <= investmentPeriod; period++) {
          lumpSumData.push({
            period,
            invested: lumpSum,
            value: sim < 3 ? lumpSumPathSamples[sim][period].value : 0,
            value1: sim >= 1 && sim < 3 ? lumpSumPathSamples[sim][period].value : 0,
            value2: sim >= 2 && sim < 3 ? lumpSumPathSamples[sim][period].value : 0
          });
        }
      }
    }
    
    // Calculate average, median, min, max for Lump Sum
    lumpSumEndValues.sort((a, b) => a - b);
    const lumpSumAvg = lumpSumEndValues.reduce((sum, val) => sum + val, 0) / numSimulations;
    const lumpSumMedian = lumpSumEndValues[Math.floor(numSimulations / 2)];
    const lumpSumMin = lumpSumEndValues[0];
    const lumpSumMax = lumpSumEndValues[numSimulations - 1];
    
    // Calculate probabilities
    const dcaWinCount = lumpSumEndValues.filter((lumpVal, i) => dcaEndValues[i] > lumpVal).length;
    const lumpSumWinCount = numSimulations - dcaWinCount;
    
    const dcaWinProb = (dcaWinCount / numSimulations) * 100;
    const lumpSumWinProb = (lumpSumWinCount / numSimulations) * 100;
    
    // Calculate DCA conversion plan
    const conversionPlanData = [];
    for (let period = 1; period <= investmentPeriod; period++) {
      conversionPlanData.push({
        period,
        date: getDateString(period, investmentFrequency),
        amount: investmentAmount,
        cumulative: investmentAmount * period
      });
    }
    
    // Update state with results
    setDcaResults(dcaData);
    setLumpSumResults(lumpSumData);
    
    setDcaReturnMetrics({
      finalValue: dcaMedian,
      totalInvested: dcaInvested,
      gain: dcaMedian - dcaInvested,
      returnPercentage: ((dcaMedian / dcaInvested) - 1) * 100,
      average: dcaAvg,
      median: dcaMedian,
      min: dcaMin,
      max: dcaMax
    });
    
    setLumpSumReturnMetrics({
      finalValue: lumpSumMedian,
      totalInvested: lumpSum,
      gain: lumpSumMedian - lumpSum,
      returnPercentage: ((lumpSumMedian / lumpSum) - 1) * 100,
      average: lumpSumAvg,
      median: lumpSumMedian, 
      min: lumpSumMin,
      max: lumpSumMax
    });
    
    setProbabilityAnalysis({
      dcaWinProb,
      lumpSumWinProb,
      dcaOutperformance: dcaMedian - lumpSumMedian,
      outperformancePercentage: ((dcaMedian / lumpSumMedian) - 1) * 100
    });
    
    setConversionPlan(conversionPlanData);
    setHasCalculated(true);
  };
  
  // Helper function to generate random returns based on expected return and volatility
  const generateRandomReturn = (meanReturn, stdDev) => {
    // Box-Muller transform for normally distributed random numbers
    const u1 = Math.random();
    const u2 = Math.random();
    const z0 = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
    
    // Apply mean and standard deviation
    return meanReturn + z0 * stdDev;
  };
  
  // Helper function to get date string based on period and frequency
  const getDateString = (period, frequency) => {
    const today = new Date();
    let futureDate = new Date(today);
    
    if (frequency === 'monthly') {
      futureDate.setMonth(today.getMonth() + period);
    } else if (frequency === 'quarterly') {
      futureDate.setMonth(today.getMonth() + (period * 3));
    } else {
      futureDate.setFullYear(today.getFullYear() + period);
    }
    
    return futureDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
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
  
  // Format percentage
  const formatPercentage = (value) => {
    return `${value.toFixed(1)}%`;
  };
  
  // Save current scenario
  const saveScenario = () => {
    const newScenario = {
      id: Date.now(),
      name: scenarioName,
      lumpSum,
      regularInvestment,
      investmentPeriod,
      investmentFrequency,
      expectedReturn,
      volatility,
      annualFees,
      dcaReturnMetrics,
      lumpSumReturnMetrics,
      probabilityAnalysis
    };
    
    setSavedScenarios([...savedScenarios, newScenario]);
  };
  
  // Export results
  const exportResults = () => {
    alert("PDF export feature would generate a detailed report of your dollar cost averaging plan");
  };
  
  // Share results
  const shareResults = () => {
    alert("Share feature would allow you to send these results via email or social media");
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-gray-800">Dollar Cost Averaging Calculator</h2>
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
          placeholder="e.g., My DCA Strategy"
        />
      </div>
      
      <div className="grid md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div>
            <label htmlFor="lumpSum" className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
              Available Lump Sum
              <button 
                className="ml-1 text-gray-400 hover:text-gray-600 focus:outline-none"
                onClick={() => setShowTooltip('lumpSum')}
              >
                <LucideIcons.HelpCircle size={16} />
              </button>
              {showTooltip === 'lumpSum' && (
                <div className="absolute z-10 mt-2 w-64 p-3 bg-gray-800 text-white text-xs rounded shadow-lg">
                  {tooltipContent.lumpSum}
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
                id="lumpSum"
                className="focus:ring-black focus:border-black block w-full pl-7 pr-12 sm:text-sm border-gray-300 rounded-md p-2 border"
                value={lumpSum}
                onChange={(e) => setLumpSum(Number(e.target.value))}
                min="1000"
              />
            </div>
          </div>
          
          <div>
            <label htmlFor="regularInvestment" className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
              Regular Investment Amount
              <button 
                className="ml-1 text-gray-400 hover:text-gray-600 focus:outline-none"
                onClick={() => setShowTooltip('regularInvestment')}
              >
                <LucideIcons.HelpCircle size={16} />
              </button>
              {showTooltip === 'regularInvestment' && (
                <div className="absolute z-10 mt-2 w-64 p-3 bg-gray-800 text-white text-xs rounded shadow-lg">
                  {tooltipContent.regularInvestment}
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
                id="regularInvestment"
                className="focus:ring-black focus:border-black block w-full pl-7 pr-12 sm:text-sm border-gray-300 rounded-md p-2 border"
                value={regularInvestment}
                onChange={(e) => setRegularInvestment(Number(e.target.value))}
                min="100"
              />
            </div>
          </div>
          
          <div>
            <label htmlFor="investmentPeriod" className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
              Investment Period
              <button 
                className="ml-1 text-gray-400 hover:text-gray-600 focus:outline-none"
                onClick={() => setShowTooltip('investmentPeriod')}
              >
                <LucideIcons.HelpCircle size={16} />
              </button>
              {showTooltip === 'investmentPeriod' && (
                <div className="absolute z-10 mt-2 w-64 p-3 bg-gray-800 text-white text-xs rounded shadow-lg">
                  {tooltipContent.investmentPeriod}
                  <button 
                    className="absolute top-1 right-1 text-white hover:text-gray-300"
                    onClick={() => setShowTooltip(null)}
                  >
                    <LucideIcons.X size={14} />
                  </button>
                </div>
              )}
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="number"
                id="investmentPeriod"
                className="focus:ring-black focus:border-black block w-full sm:text-sm border-gray-300 rounded-md p-2 border"
                value={investmentPeriod}
                onChange={(e) => setInvestmentPeriod(Number(e.target.value))}
                min="2"
                max="60"
              />
              <select
                id="investmentFrequency"
                className="focus:ring-black focus:border-black block w-full sm:text-sm border-gray-300 rounded-md p-2 border"
                value={investmentFrequency}
                onChange={(e) => setInvestmentFrequency(e.target.value)}
              >
                <option value="monthly">Months</option>
                <option value="quarterly">Quarters</option>
                <option value="annually">Years</option>
              </select>
            </div>
          </div>
          
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
                min="-20"
                max="30"
                step="0.1"
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <span className="text-gray-500 sm:text-sm">%</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="space-y-6">
          <div>
            <label htmlFor="volatility" className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
              Expected Volatility (%)
              <button 
                className="ml-1 text-gray-400 hover:text-gray-600 focus:outline-none"
                onClick={() => setShowTooltip('volatility')}
              >
                <LucideIcons.HelpCircle size={16} />
              </button>
              {showTooltip === 'volatility' && (
                <div className="absolute z-10 mt-2 w-64 p-3 bg-gray-800 text-white text-xs rounded shadow-lg">
                  {tooltipContent.volatility}
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
                id="volatility"
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                min="1"
                max="50"
                value={volatility}
                onChange={(e) => setVolatility(Number(e.target.value))}
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>Low (1%)</span>
                <span>{volatility}%</span>
                <span>High (50%)</span>
              </div>
            </div>
          </div>
          
          <div>
            <label htmlFor="annualFees" className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
              Annual Fees (%)
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
                className="focus:ring-black focus:border-black block w-full pr-12 sm:text-sm border-gray-300 rounded-md p-2 border"
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
          
          <div className="bg-gray-50 p-4 rounded-lg mt-4">
            <h3 className="font-medium text-gray-700 mb-2">Investment Characteristics</h3>
            <p className="text-sm text-gray-600 mb-4">
              Select parameters that match your expected investment:
            </p>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-500">Low Volatility (1-10%)</p>
                <ul className="list-disc pl-5 text-gray-600 space-y-1">
                  <li>Short-term bonds</li>
                  <li>Money market funds</li>
                  <li>Stable value funds</li>
                </ul>
              </div>
              <div>
                <p className="text-gray-500">Medium Volatility (10-20%)</p>
                <ul className="list-disc pl-5 text-gray-600 space-y-1">
                  <li>Balanced funds</li>
                  <li>Large-cap stocks</li>
                  <li>Investment-grade bonds</li>
                </ul>
              </div>
              <div>
                <p className="text-gray-500">High Volatility (20-30%)</p>
                <ul className="list-disc pl-5 text-gray-600 space-y-1">
                  <li>Small-cap stocks</li>
                  <li>International stocks</li>
                  <li>Real estate</li>
                </ul>
              </div>
              <div>
                <p className="text-gray-500">Very High Volatility (30%+)</p>
                <ul className="list-disc pl-5 text-gray-600 space-y-1">
                  <li>Emerging markets</li>
                  <li>Sector funds</li>
                  <li>Cryptocurrencies</li>
                </ul>
              </div>
            </div>
          </div>
          
          <div className="pt-4">
            <button
              onClick={calculateDCA}
              className="w-full bg-black hover:bg-gray-800 text-white font-bold py-3 px-4 rounded focus:outline-none focus:shadow-outline transition-colors"
            >
              Calculate DCA vs Lump Sum
            </button>
          </div>
        </div>
      </div>
      
      {hasCalculated && (
        <div className="bg-white rounded-lg shadow-lg p-6 mt-8">
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
                <h3 className="text-xl font-medium text-gray-700 mb-4">Strategy Comparison</h3>
                
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-white rounded-lg p-4 shadow-sm border-t-4 border-blue-500">
                    <h4 className="font-medium text-gray-700 mb-2">Dollar Cost Averaging</h4>
                    <p className="text-xs text-gray-500 mb-2">
                      {formatCurrency(regularInvestment)} {investmentFrequency} for {investmentPeriod} periods
                    </p>
                    <p className="text-2xl font-semibold text-gray-800 mb-1">{formatCurrency(dcaReturnMetrics.finalValue)}</p>
                    <p className="text-sm text-gray-600">
                      Return: {formatPercentage(dcaReturnMetrics.returnPercentage)}
                      {dcaReturnMetrics.returnPercentage > 0 ? 
                        <span className="text-green-500 ml-1">↑</span> : 
                        <span className="text-red-500 ml-1">↓</span>}
                    </p>
                  </div>
                  
                  <div className="bg-white rounded-lg p-4 shadow-sm border-t-4 border-purple-500">
                    <h4 className="font-medium text-gray-700 mb-2">Lump Sum</h4>
                    <p className="text-xs text-gray-500 mb-2">
                      {formatCurrency(lumpSum)} invested immediately
                    </p>
                    <p className="text-2xl font-semibold text-gray-800 mb-1">{formatCurrency(lumpSumReturnMetrics.finalValue)}</p>
                    <p className="text-sm text-gray-600">
                      Return: {formatPercentage(lumpSumReturnMetrics.returnPercentage)}
                      {lumpSumReturnMetrics.returnPercentage > 0 ? 
                        <span className="text-green-500 ml-1">↑</span> : 
                        <span className="text-red-500 ml-1">↓</span>}
                    </p>
                  </div>
                </div>
                
                <div className={`bg-${probabilityAnalysis.dcaWinProb > probabilityAnalysis.lumpSumWinProb ? 'blue' : 'purple'}-50 p-4 rounded-md mb-6`}>
                  <h4 className="font-medium text-gray-700 mb-2">Which Strategy Performed Better?</h4>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">DCA</span>
                    <span className="text-sm font-medium">Lump Sum</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div 
                      className="bg-blue-500 h-2.5 rounded-full" 
                      style={{ width: `${probabilityAnalysis.dcaWinProb}%` }}
                    ></div>
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-xs text-gray-500">{formatPercentage(probabilityAnalysis.dcaWinProb)}</span>
                    <span className="text-xs text-gray-500">{formatPercentage(probabilityAnalysis.lumpSumWinProb)}</span>
                  </div>
                  <p className="text-sm text-gray-600 mt-3">
                    {probabilityAnalysis.dcaWinProb > probabilityAnalysis.lumpSumWinProb ? 
                      `Dollar cost averaging outperformed lump sum investing by ${formatCurrency(probabilityAnalysis.dcaOutperformance)} (${formatPercentage(probabilityAnalysis.outperformancePercentage)}).` : 
                      `Lump sum investing outperformed dollar cost averaging by ${formatCurrency(-probabilityAnalysis.dcaOutperformance)} (${formatPercentage(-probabilityAnalysis.outperformancePercentage)}).`}
                  </p>
                </div>
                
                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <h4 className="font-medium text-gray-700 mb-2">Risk Assessment</h4>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Metric</th>
                          <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">DCA</th>
                          <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Lump Sum</th>
                          <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Difference</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        <tr>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">Median Outcome</td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">{formatCurrency(dcaReturnMetrics.median)}</td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">{formatCurrency(lumpSumReturnMetrics.median)}</td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                            {formatCurrency(dcaReturnMetrics.median - lumpSumReturnMetrics.median)}
                          </td>
                        </tr>
                        <tr>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">Worst Case</td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">{formatCurrency(dcaReturnMetrics.min)}</td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">{formatCurrency(lumpSumReturnMetrics.min)}</td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                            {formatCurrency(dcaReturnMetrics.min - lumpSumReturnMetrics.min)}
                          </td>
                        </tr>
                        <tr>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">Best Case</td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">{formatCurrency(dcaReturnMetrics.max)}</td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">{formatCurrency(lumpSumReturnMetrics.max)}</td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                            {formatCurrency(dcaReturnMetrics.max - lumpSumReturnMetrics.max)}
                          </td>
                        </tr>
                        <tr>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">Risk Range</td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">{formatCurrency(dcaReturnMetrics.max - dcaReturnMetrics.min)}</td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">{formatCurrency(lumpSumReturnMetrics.max - lumpSumReturnMetrics.min)}</td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                            {formatPercentage(((dcaReturnMetrics.max - dcaReturnMetrics.min) / (lumpSumReturnMetrics.max - lumpSumReturnMetrics.min) - 1) * 100)}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-xl font-medium text-gray-700 mb-4">DCA Implementation Plan</h3>
                
                <div className="overflow-y-auto max-h-64 mb-4">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50 sticky top-0">
                      <tr>
                        <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Period</th>
                        <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                        <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                        <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cumulative</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {conversionPlan.map((period) => (
                        <tr key={period.period}>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{period.period}</td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">{period.date}</td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">{formatCurrency(period.amount)}</td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">{formatCurrency(period.cumulative)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <h4 className="font-medium text-gray-700 mb-2">Key Insights</h4>
                  <ul className="text-sm text-gray-600 space-y-2">
                    <li className="flex items-start">
                      <LucideIcons.TrendingUp size={16} className="text-blue-500 mr-2 mt-0.5" />
                      {expectedReturn > volatility ? 
                        "In markets with higher returns than volatility, lump sum investing often outperforms DCA." : 
                        "In volatile markets with modest returns, DCA can help reduce risk and timing issues."}
                    </li>
                    <li className="flex items-start">
                      <LucideIcons.DollarSign size={16} className="text-green-500 mr-2 mt-0.5" />
                      Total amount to be invested through DCA: {formatCurrency(totalInvested)} over {investmentPeriod} {investmentFrequency === 'monthly' ? 'months' : investmentFrequency === 'quarterly' ? 'quarters' : 'years'}.
                    </li>
                    <li className="flex items-start">
                      <LucideIcons.AlertTriangle size={16} className="text-yellow-500 mr-2 mt-0.5" />
                      {probabilityAnalysis.lumpSumWinProb > 70 ? 
                        "Historically, lump sum investing has outperformed DCA about two-thirds of the time in rising markets." : 
                        "DCA provides psychological benefits by reducing the impact of market timing and volatility."}
                    </li>
                    <li className="flex items-start">
                      <LucideIcons.Heart size={16} className="text-red-500 mr-2 mt-0.5" />
                      The best strategy depends not just on math, but also on your emotional comfort with investment decisions.
                    </li>
                  </ul>
                </div>
              </div>
            </div>
            
            <div>
              <div className="bg-gray-50 rounded-lg p-6 mb-6">
                <h3 className="text-xl font-medium text-gray-700 mb-4">Performance Comparison</h3>
                
                <div className="h-64 md:h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={[...dcaResults].map((item, index) => ({
                        ...item,
                        lumpSumValue: lumpSumResults[index]?.value
                      }))}
                      margin={{
                        top: 5,
                        right: 30,
                        left: 20,
                        bottom: 5,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="period" 
                        label={{ value: 'Period', position: 'insideBottomRight', offset: -10 }} 
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
                        labelFormatter={(label) => `Period ${label}`}
                      />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="value" 
                        name="DCA" 
                        stroke="#3b82f6" 
                        strokeWidth={3} 
                        activeDot={{ r: 8 }} 
                      />
                      <Line 
                        type="monotone" 
                        dataKey="value1" 
                        name="DCA (Sim 2)" 
                        stroke="#93c5fd" 
                        strokeWidth={1} 
                        strokeDasharray="5 5"
                      />
                      <Line 
                        type="monotone" 
                        dataKey="value2" 
                        name="DCA (Sim 3)" 
                        stroke="#bfdbfe" 
                        strokeWidth={1} 
                        strokeDasharray="3 3"
                      />
                      <Line 
                        type="monotone" 
                        dataKey="lumpSumValue" 
                        name="Lump Sum" 
                        stroke="#8b5cf6" 
                        strokeWidth={3} 
                      />
                      <Line 
                        type="monotone" 
                        dataKey="invested" 
                        name="Amount Invested" 
                        stroke="#10b981" 
                        strokeWidth={2} 
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                
                <p className="text-xs text-gray-500 mt-2 italic">
                  Chart shows the projected performance of each strategy over time. Multiple DCA simulations are shown to illustrate potential variation.
                </p>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-xl font-medium text-gray-700 mb-4">Risk/Return Analysis</h3>
                
                <div className="h-64 md:h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={[
                        {
                          name: 'Worst Case',
                          dca: dcaReturnMetrics.min,
                          lumpSum: lumpSumReturnMetrics.min
                        },
                        {
                          name: 'Median',
                          dca: dcaReturnMetrics.median,
                          lumpSum: lumpSumReturnMetrics.median
                        },
                        {
                          name: 'Best Case',
                          dca: dcaReturnMetrics.max,
                          lumpSum: lumpSumReturnMetrics.max
                        }
                      ]}
                      margin={{
                        top: 5,
                        right: 30,
                        left: 20,
                        bottom: 5,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
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
                      />
                      <Legend />
                      <Bar dataKey="dca" name="Dollar Cost Averaging" fill="#3b82f6" />
                      <Bar dataKey="lumpSum" name="Lump Sum" fill="#8b5cf6" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                
                <div className="bg-white rounded-lg p-4shadow-sm mt-6">
                  <h4 className="font-medium text-gray-700 mb-2">Making Your Decision</h4>
                  <div className="space-y-4 text-sm text-gray-600">
                    <p>
                      Based on your inputs and our simulations, here are recommendations for your specific situation:
                    </p>
                    
                    <div className={`p-3 border-l-4 ${
                      probabilityAnalysis.dcaWinProb > probabilityAnalysis.lumpSumWinProb ? 
                        'border-blue-400 bg-blue-50' : 
                        'border-purple-400 bg-purple-50'}`}>
                      <p className="font-medium">
                        {probabilityAnalysis.dcaWinProb > probabilityAnalysis.lumpSumWinProb ? 
                          'Dollar Cost Averaging is recommended for your scenario' : 
                          'Lump Sum investing is recommended for your scenario'}
                      </p>
                      <p className="mt-1">
                        {probabilityAnalysis.dcaWinProb > probabilityAnalysis.lumpSumWinProb ? 
                          `With the specific parameters you've entered, DCA outperforms in ${formatPercentage(probabilityAnalysis.dcaWinProb)} of scenarios, likely due to the relatively high volatility.` : 
                          `With the specific parameters you've entered, lump sum investing outperforms in ${formatPercentage(probabilityAnalysis.lumpSumWinProb)} of scenarios, likely due to the expected upward trend of the market.`}
                      </p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="border rounded-md p-3">
                        <h5 className="font-medium text-gray-700 mb-1">Consider DCA if:</h5>
                        <ul className="list-disc pl-5 space-y-1">
                          <li>You're concerned about short-term volatility</li>
                          <li>You're worried about investing at market peaks</li>
                          <li>You prefer the psychological comfort of gradual investing</li>
                          <li>You believe markets may decline in the near term</li>
                        </ul>
                      </div>
                      <div className="border rounded-md p-3">
                        <h5 className="font-medium text-gray-700 mb-1">Consider Lump Sum if:</h5>
                        <ul className="list-disc pl-5 space-y-1">
                          <li>You're focused on maximizing long-term returns</li>
                          <li>You have a long investment horizon</li>
                          <li>You're comfortable with short-term volatility</li>
                          <li>You believe markets will rise over time</li>
                        </ul>
                      </div>
                    </div>
                    
                    <p>
                      Remember: Your comfort with your investment strategy is as important as the mathematical optimum. 
                      Choose the approach that allows you to sleep well at night and stick to your long-term plan.
                    </p>
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
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Lump Sum</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Regular Amount</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Period</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">DCA Final</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Lump Sum Final</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Better Strategy</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {savedScenarios.map((scenario) => (
                      <tr key={scenario.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{scenario.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatCurrency(scenario.lumpSum)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatCurrency(scenario.regularInvestment)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{scenario.investmentPeriod} {scenario.investmentFrequency}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatCurrency(scenario.dcaReturnMetrics.finalValue)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatCurrency(scenario.lumpSumReturnMetrics.finalValue)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            scenario.probabilityAnalysis.dcaWinProb > scenario.probabilityAnalysis.lumpSumWinProb ? 
                              'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
                          }`}>
                            {scenario.probabilityAnalysis.dcaWinProb > scenario.probabilityAnalysis.lumpSumWinProb ? 'DCA' : 'Lump Sum'}
                          </span>
                        </td>
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
        <h2 className="text-2xl font-semibold text-gray-800 mb-6">Understanding Dollar Cost Averaging</h2>
        
        <div className="prose max-w-none">
          <p>
            Dollar Cost Averaging (DCA) is an investment strategy where you divide your total investment amount into periodic
            purchases to reduce the impact of volatility and the risk of making poorly timed investment decisions.
          </p>
          
          <h3>How Dollar Cost Averaging Works</h3>
          <p>
            Instead of investing a large amount all at once (lump sum), you invest equal smaller amounts at regular intervals,
            regardless of market conditions. This approach means you'll naturally buy more shares when prices are lower and
            fewer shares when prices are higher, potentially reducing your average cost per share over time.
          </p>
          
          <h3>Advantages of Dollar Cost Averaging</h3>
          <ul>
            <li><strong>Reduces Timing Risk:</strong> Helps avoid the regret of investing just before a market downturn</li>
            <li><strong>Emotionally Easier:</strong> Less stressful than committing a large sum all at once</li>
            <li><strong>Enforces Discipline:</strong> Creates a regular investing habit regardless of market conditions</li>
            <li><strong>Potentially Lower Average Cost:</strong> Can lower your average purchase price in volatile markets</li>
            <li><strong>Reduces Impact of Volatility:</strong> Smooths out the effect of market ups and downs</li>
          </ul>
          
          <h3>Limitations of Dollar Cost Averaging</h3>
          <ul>
            <li><strong>Historically Underperforms Lump Sum:</strong> In rising markets, investing everything immediately tends to produce better returns</li>
            <li><strong>Cash Drag:</strong> Money waiting to be invested may earn little or no return</li>
            <li><strong>Higher Transaction Costs:</strong> Multiple purchases may incur more fees (though many brokers now offer free trades)</li>
            <li><strong>Tax Considerations:</strong> May create more tax events and reporting requirements</li>
          </ul>
          
          <h3>When to Consider Dollar Cost Averaging</h3>
          <ul>
            <li>When investing a windfall or significant amount relative to your net worth</li>
            <li>During periods of high market volatility or uncertainty</li>
            <li>If you're concerned about investing at market peaks</li>
            <li>When you receive regular income that you want to invest systematically</li>
            <li>If the psychological benefits of gradual investing are important to you</li>
          </ul>
          
          <h3>Key Factors to Consider</h3>
          <p>
            When deciding between dollar cost averaging and lump sum investing, consider these factors:
          </p>
          <ul>
            <li><strong>Market Outlook:</strong> In steadily rising markets, lump sum typically outperforms; in volatile or declining markets, DCA may be better</li>
            <li><strong>Risk Tolerance:</strong> Your comfort with potential short-term losses</li>
            <li><strong>Time Horizon:</strong> How long until you need the money</li>
            <li><strong>Investment Amount:</strong> The significance of the amount relative to your overall portfolio</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default DollarCostAveragingCalculator;