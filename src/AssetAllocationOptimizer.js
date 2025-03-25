import React, { useState } from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, AreaChart, Area } from 'recharts';
import * as LucideIcons from 'lucide-react';

const AssetAllocationOptimizer = () => {
  // State for form inputs
  const [riskTolerance, setRiskTolerance] = useState(5); // 1-10 scale
  const [investmentHorizon, setInvestmentHorizon] = useState(20); // years
  const [age, setAge] = useState(35);
  const [retirementAge, setRetirementAge] = useState(65);
  const [includeInternational, setIncludeInternational] = useState(true);
  const [includeBonds, setIncludeBonds] = useState(true);
  const [includeREIT, setIncludeREIT] = useState(false);
  const [includeCommodities, setIncludeCommodities] = useState(false);
  const [includeAlternatives, setIncludeAlternatives] = useState(false);
  const [investmentAmount, setInvestmentAmount] = useState(100000);
  const [scenarioName, setScenarioName] = useState('My Asset Allocation');
  
  // State for calculation results
  const [allocationData, setAllocationData] = useState([]);
  const [expectedReturn, setExpectedReturn] = useState(0);
  const [expectedRisk, setExpectedRisk] = useState(0);
  const [historicalPerformance, setHistoricalPerformance] = useState([]);
  const [hasCalculated, setHasCalculated] = useState(false);
  const [savedAllocations, setSavedAllocations] = useState([]);
  const [showTooltip, setShowTooltip] = useState(null);
  
  // Asset classes and their characteristics (simplified)
  const assetClasses = {
    usDomesticStocks: { name: "US Stocks", expectedReturn: 8.0, risk: 16.0, color: "#4f46e5" },
    internationalStocks: { name: "International Stocks", expectedReturn: 7.5, risk: 18.0, color: "#3b82f6" },
    usBonds: { name: "US Bonds", expectedReturn: 3.0, risk: 6.0, color: "#10b981" },
    internationalBonds: { name: "International Bonds", expectedReturn: 2.5, risk: 7.0, color: "#059669" },
    reit: { name: "REITs", expectedReturn: 7.0, risk: 17.0, color: "#f59e0b" },
    commodities: { name: "Commodities", expectedReturn: 4.0, risk: 20.0, color: "#d97706" },
    alternatives: { name: "Alternatives", expectedReturn: 6.0, risk: 12.0, color: "#8b5cf6" },
    cash: { name: "Cash", expectedReturn: 1.5, risk: 1.0, color: "#6b7280" }
  };
  
  // Tooltip content
  const tooltipContent = {
    riskTolerance: "Your comfort level with investment volatility. Higher risk tolerance typically allows for more aggressive allocations.",
    investmentHorizon: "How long you plan to keep your money invested before needing it.",
    age: "Your current age, used to help determine appropriate asset allocation.",
    retirementAge: "The age at which you plan to retire, helps determine time horizon.",
    includeInternational: "Whether to include international stocks and bonds in your allocation.",
    includeBonds: "Whether to include bond investments in your allocation.",
    includeREIT: "Real Estate Investment Trusts (REITs) provide exposure to real estate markets.",
    includeCommodities: "Commodities include physical goods like gold, oil, and agricultural products.",
    includeAlternatives: "Alternative investments include private equity, hedge funds, and other non-traditional assets."
  };

  // Calculate optimal asset allocation based on inputs
  const calculateAllocation = () => {
    // Base allocation changes with risk tolerance (1-10 scale)
    // Higher risk tolerance = more stocks, less bonds/cash
    let stockAllocation = 30 + (riskTolerance * 7); // 37% to 100%
    
    // Age-based adjustment (traditional rule of 100 minus age for stocks)
    const ageFactor = Math.max(0, Math.min(30, 100 - age - (10 - riskTolerance)));
    stockAllocation = Math.min(100, stockAllocation + ageFactor);
    
    // Horizon adjustment
    if (investmentHorizon < 5) {
      stockAllocation = Math.max(20, stockAllocation - 20);
    } else if (investmentHorizon < 10) {
      stockAllocation = Math.max(30, stockAllocation - 10);
    }
    
    // Calculate bond/cash allocation
    let bondAllocation = Math.max(0, 100 - stockAllocation);
    
    // Initialize allocations with 0
    let allocation = {
      usDomesticStocks: 0,
      internationalStocks: 0,
      usBonds: 0,
      internationalBonds: 0,
      reit: 0,
      commodities: 0,
      alternatives: 0,
      cash: 0
    };
    
    // Allocate stocks
    if (includeInternational) {
      // Split stocks between domestic and international (60/40 typical)
      allocation.usDomesticStocks = stockAllocation * 0.6;
      allocation.internationalStocks = stockAllocation * 0.4;
    } else {
      // All stocks domestic
      allocation.usDomesticStocks = stockAllocation;
    }
    
    // Allocate bonds
    let remainingBondAllocation = bondAllocation;
    
    // Allocate to alternatives, REITs, commodities if selected
    if (includeAlternatives) {
      allocation.alternatives = Math.min(15, remainingBondAllocation * 0.3);
      remainingBondAllocation -= allocation.alternatives;
    }
    
    if (includeREIT) {
      allocation.reit = Math.min(15, remainingBondAllocation * 0.3);
      remainingBondAllocation -= allocation.reit;
    }
    
    if (includeCommodities) {
      allocation.commodities = Math.min(10, remainingBondAllocation * 0.2);
      remainingBondAllocation -= allocation.commodities;
    }
    
    // Allocate remaining to bonds and cash
    if (includeBonds) {
      // Keep some cash (more for shorter horizons)
      const cashPercentage = investmentHorizon < 5 ? 0.4 : investmentHorizon < 10 ? 0.2 : 0.1;
      allocation.cash = remainingBondAllocation * cashPercentage;
      remainingBondAllocation -= allocation.cash;
      
      // Split bonds between domestic and international if selected
      if (includeInternational) {
        allocation.usBonds = remainingBondAllocation * 0.7;
        allocation.internationalBonds = remainingBondAllocation * 0.3;
      } else {
        allocation.usBonds = remainingBondAllocation;
      }
    } else {
      // No bonds, just cash
      allocation.cash = remainingBondAllocation;
    }
    
    // Round all allocations to 1 decimal place
    for (const key in allocation) {
      allocation[key] = Math.round(allocation[key] * 10) / 10;
    }
    
    // Ensure allocations sum to 100%
    let totalAllocation = Object.values(allocation).reduce((sum, val) => sum + val, 0);
    if (totalAllocation != 100) {
      // Adjust cash to make it 100%
      allocation.cash += (100 - totalAllocation);
      allocation.cash = Math.max(0, Math.round(allocation.cash * 10) / 10);
    }
    
    // Calculate expected return and risk based on allocation
    let weightedReturn = 0;
    let weightedRisk = 0;
    
    for (const key in allocation) {
      if (allocation[key] > 0) {
        weightedReturn += (allocation[key] / 100) * assetClasses[key].expectedReturn;
        weightedRisk += Math.pow((allocation[key] / 100) * assetClasses[key].risk, 2);
      }
    }
    
    // Square root for portfolio standard deviation (simplified)
    weightedRisk = Math.sqrt(weightedRisk);
    
    // Round to 2 decimal places
    weightedReturn = Math.round(weightedReturn * 100) / 100;
    weightedRisk = Math.round(weightedRisk * 100) / 100;
    
    // Format data for pie chart
    const allocationChartData = [];
    
    for (const key in allocation) {
      if (allocation[key] > 0) {
        allocationChartData.push({
          name: assetClasses[key].name,
          value: allocation[key],
          color: assetClasses[key].color,
          expectedReturn: assetClasses[key].expectedReturn,
          risk: assetClasses[key].risk,
          amount: (allocation[key] / 100) * investmentAmount
        });
      }
    }
    
    // Generate historical performance simulation (simplified)
    const performanceData = [];
    const monteCarlo = [];
    const currentYear = new Date().getFullYear();
    
    // Base value at year 0
    performanceData.push({
      year: currentYear,
      value: investmentAmount,
      lowerBound: investmentAmount,
      upperBound: investmentAmount
    });
    
    // Run 5 monte carlo simulations
    for (let sim = 0; sim < 5; sim++) {
      let simValue = investmentAmount;
      const simData = [{year: currentYear, value: simValue}];
      
      for (let year = 1; year <= investmentHorizon; year++) {
        // Add random variation to return (simplified monte carlo)
        const randomFactor = (Math.random() - 0.5) * weightedRisk * 2;
        const yearReturn = weightedReturn + randomFactor;
        simValue = simValue * (1 + yearReturn / 100);
        
        simData.push({
          year: currentYear + year,
          value: Math.round(simValue)
        });
      }
      
      monteCarlo.push(simData);
    }
    
    // Calculate median performance
    for (let year = 1; year <= investmentHorizon; year++) {
      const yearValues = monteCarlo.map(sim => sim[year].value).sort((a, b) => a - b);
      const medianValue = yearValues[Math.floor(yearValues.length / 2)];
      const lowerValue = yearValues[0];
      const upperValue = yearValues[yearValues.length - 1];
      
      performanceData.push({
        year: currentYear + year,
        value: medianValue,
        lowerBound: lowerValue,
        upperBound: upperValue
      });
    }
    
    // Update state with results
    setAllocationData(allocationChartData);
    setExpectedReturn(weightedReturn);
    setExpectedRisk(weightedRisk);
    setHistoricalPerformance(performanceData);
    setHasCalculated(true);
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
  
  // Save current allocation
  const saveAllocation = () => {
    const newAllocation = {
      id: Date.now(),
      name: scenarioName,
      riskTolerance,
      investmentHorizon,
      age,
      retirementAge,
      includeInternational,
      includeBonds,
      includeREIT,
      includeCommodities,
      includeAlternatives,
      investmentAmount,
      allocationData,
      expectedReturn,
      expectedRisk
    };
    
    setSavedAllocations([...savedAllocations, newAllocation]);
  };
  
  // Export results
  const exportResults = () => {
    alert("PDF export feature would generate a detailed report of your asset allocation");
  };
  
  // Share results
  const shareResults = () => {
    alert("Share feature would allow you to send these results via email or social media");
  };

  // Custom tooltip for pie chart
  const AllocationTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-4 border border-gray-200 rounded shadow-lg">
          <p className="font-medium">{data.name}</p>
          <p className="text-sm text-gray-700">Allocation: {data.value}%</p>
          <p className="text-sm text-gray-700">Amount: {formatCurrency(data.amount)}</p>
          <p className="text-sm text-gray-700">Expected Return: {data.expectedReturn}%</p>
          <p className="text-sm text-gray-700">Risk Level: {data.risk}%</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-gray-800">Asset Allocation Optimizer</h2>
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
          placeholder="e.g., My Retirement Portfolio"
        />
      </div>
      
      <div className="grid md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div>
            <label htmlFor="investmentAmount" className="block text-sm font-medium text-gray-700 mb-1">
              Investment Amount
            </label>
            <div className="relative mt-1 rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-500 sm:text-sm">$</span>
              </div>
              <input
                type="number"
                id="investmentAmount"
                className="focus:ring-black focus:border-black block w-full pl-7 pr-12 sm:text-sm border-gray-300 rounded-md p-2 border"
                value={investmentAmount}
                onChange={(e) => setInvestmentAmount(Number(e.target.value))}
                min="1000"
              />
            </div>
          </div>
          
          <div>
            <label htmlFor="age" className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
              Current Age
              <button 
                className="ml-1 text-gray-400 hover:text-gray-600 focus:outline-none"
                onClick={() => setShowTooltip('age')}
              >
                <LucideIcons.HelpCircle size={16} />
              </button>
              {showTooltip === 'age' && (
                <div className="absolute z-10 mt-2 w-64 p-3 bg-gray-800 text-white text-xs rounded shadow-lg">
                  {tooltipContent.age}
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
              id="age"
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              min="18"
              max="85"
              value={age}
              onChange={(e) => setAge(Number(e.target.value))}
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>18</span>
              <span>{age} years</span>
              <span>85</span>
            </div>
          </div>
          
          <div>
            <label htmlFor="retirementAge" className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
              Retirement Age
              <button 
                className="ml-1 text-gray-400 hover:text-gray-600 focus:outline-none"
                onClick={() => setShowTooltip('retirementAge')}
              >
                <LucideIcons.HelpCircle size={16} />
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
              min={age + 1}
              max="90"
              value={retirementAge}
              onChange={(e) => setRetirementAge(Number(e.target.value))}
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>{age + 1}</span>
              <span>{retirementAge} years</span>
              <span>90</span>
            </div>
          </div>
          
          <div>
            <label htmlFor="riskTolerance" className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
              Risk Tolerance
              <button 
                className="ml-1 text-gray-400 hover:text-gray-600 focus:outline-none"
                onClick={() => setShowTooltip('riskTolerance')}
              >
                <LucideIcons.HelpCircle size={16} />
              </button>
              {showTooltip === 'riskTolerance' && (
                <div className="absolute z-10 mt-2 w-64 p-3 bg-gray-800 text-white text-xs rounded shadow-lg">
                  {tooltipContent.riskTolerance}
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
              id="riskTolerance"
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              min="1"
              max="10"
              value={riskTolerance}
              onChange={(e) => setRiskTolerance(Number(e.target.value))}
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Conservative (1)</span>
              <span>{riskTolerance}</span>
              <span>Aggressive (10)</span>
            </div>
          </div>
          
          <div>
            <label htmlFor="investmentHorizon" className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
              Investment Horizon (years)
              <button 
                className="ml-1 text-gray-400 hover:text-gray-600 focus:outline-none"
                onClick={() => setShowTooltip('investmentHorizon')}
              >
                <LucideIcons.HelpCircle size={16} />
              </button>
              {showTooltip === 'investmentHorizon' && (
                <div className="absolute z-10 mt-2 w-64 p-3 bg-gray-800 text-white text-xs rounded shadow-lg">
                  {tooltipContent.investmentHorizon}
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
              id="investmentHorizon"
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              min="1"
              max="40"
              value={investmentHorizon}
              onChange={(e) => setInvestmentHorizon(Number(e.target.value))}
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>1</span>
              <span>{investmentHorizon} years</span>
              <span>40</span>
            </div>
          </div>
        </div>
        
        <div className="space-y-6">
          <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="text-lg font-medium text-gray-700 mb-4">Investment Preferences</h3>
            
            <div className="space-y-4">
              <div className="flex items-center">
                <input
                  id="includeInternational"
                  type="checkbox"
                  className="h-4 w-4 text-black focus:ring-black border-gray-300 rounded"
                  checked={includeInternational}
                  onChange={(e) => setIncludeInternational(e.target.checked)}
                />
                <label htmlFor="includeInternational" className="ml-2 block text-sm text-gray-700 flex items-center">
                  Include International Investments
                  <button 
                    className="ml-1 text-gray-400 hover:text-gray-600 focus:outline-none"
                    onClick={() => setShowTooltip('includeInternational')}
                  >
                    <LucideIcons.HelpCircle size={16} />
                  </button>
                  {showTooltip === 'includeInternational' && (
                    <div className="absolute z-10 mt-2 w-64 p-3 bg-gray-800 text-white text-xs rounded shadow-lg">
                      {tooltipContent.includeInternational}
                      <button 
                        className="absolute top-1 right-1 text-white hover:text-gray-300"
                        onClick={() => setShowTooltip(null)}
                      >
                        <LucideIcons.X size={14} />
                      </button>
                    </div>
                  )}
                </label>
              </div>
              
              <div className="flex items-center">
                <input
                  id="includeBonds"
                  type="checkbox"
                  className="h-4 w-4 text-black focus:ring-black border-gray-300 rounded"
                  checked={includeBonds}
                  onChange={(e) => setIncludeBonds(e.target.checked)}
                />
                <label htmlFor="includeBonds" className="ml-2 block text-sm text-gray-700 flex items-center">
                  Include Bonds
                  <button 
                    className="ml-1 text-gray-400 hover:text-gray-600 focus:outline-none"
                    onClick={() => setShowTooltip('includeBonds')}
                  >
                    <LucideIcons.HelpCircle size={16} />
                  </button>
                  {showTooltip === 'includeBonds' && (
                    <div className="absolute z-10 mt-2 w-64 p-3 bg-gray-800 text-white text-xs rounded shadow-lg">
                      {tooltipContent.includeBonds}
                      <button 
                        className="absolute top-1 right-1 text-white hover:text-gray-300"
                        onClick={() => setShowTooltip(null)}
                      >
                        <LucideIcons.X size={14} />
                      </button>
                    </div>
                  )}
                </label>
              </div>
              
              <div className="flex items-center">
                <input
                  id="includeREIT"
                  type="checkbox"
                  className="h-4 w-4 text-black focus:ring-black border-gray-300 rounded"
                  checked={includeREIT}
                  onChange={(e) => setIncludeREIT(e.target.checked)}
                />
                <label htmlFor="includeREIT" className="ml-2 block text-sm text-gray-700 flex items-center">
                  Include Real Estate (REITs)
                  <button 
                    className="ml-1 text-gray-400 hover:text-gray-600 focus:outline-none"
                    onClick={() => setShowTooltip('includeREIT')}
                  >
                    <LucideIcons.HelpCircle size={16} />
                  </button>
                  {showTooltip === 'includeREIT' && (
                    <div className="absolute z-10 mt-2 w-64 p-3 bg-gray-800 text-white text-xs rounded shadow-lg">
                      {tooltipContent.includeREIT}
                      <button 
                        className="absolute top-1 right-1 text-white hover:text-gray-300"
                        onClick={() => setShowTooltip(null)}
                      >
                        <LucideIcons.X size={14} />
                      </button>
                    </div>
                  )}
                </label>
              </div>
              
              <div className="flex items-center">
                <input
                  id="includeCommodities"
                  type="checkbox"
                  className="h-4 w-4 text-black focus:ring-black border-gray-300 rounded"
                  checked={includeCommodities}
                  onChange={(e) => setIncludeCommodities(e.target.checked)}
                />
                <label htmlFor="includeCommodities" className="ml-2 block text-sm text-gray-700 flex items-center">
                  Include Commodities
                  <button 
                    className="ml-1 text-gray-400 hover:text-gray-600 focus:outline-none"
                    onClick={() => setShowTooltip('includeCommodities')}
                  >
                    <LucideIcons.HelpCircle size={16} />
                  </button>
                  {showTooltip === 'includeCommodities' && (
                    <div className="absolute z-10 mt-2 w-64 p-3 bg-gray-800 text-white text-xs rounded shadow-lg">
                      {tooltipContent.includeCommodities}
                      <button 
                        className="absolute top-1 right-1 text-white hover:text-gray-300"
                        onClick={() => setShowTooltip(null)}
                      >
                        <LucideIcons.X size={14} />
                      </button>
                    </div>
                  )}
                </label>
              </div>
              
              <div className="flex items-center">
                <input
                  id="includeAlternatives"
                  type="checkbox"
                  className="h-4 w-4 text-black focus:ring-black border-gray-300 rounded"
                  checked={includeAlternatives}
                  onChange={(e) => setIncludeAlternatives(e.target.checked)}
                />
                <label htmlFor="includeAlternatives" className="ml-2 block text-sm text-gray-700 flex items-center">
                  Include Alternative Investments
                  <button 
                    className="ml-1 text-gray-400 hover:text-gray-600 focus:outline-none"
                    onClick={() => setShowTooltip('includeAlternatives')}
                  >
                    <LucideIcons.HelpCircle size={16} />
                  </button>
                  {showTooltip === 'includeAlternatives' && (
                    <div className="absolute z-10 mt-2 w-64 p-3 bg-gray-800 text-white text-xs rounded shadow-lg">
                      {tooltipContent.includeAlternatives}
                      <button 
                        className="absolute top-1 right-1 text-white hover:text-gray-300"
                        onClick={() => setShowTooltip(null)}
                      >
                        <LucideIcons.X size={14} />
                      </button>
                    </div>
                  )}
                </label>
              </div>
            </div>
          </div>
          
          <div className="pt-4">
            <button
              onClick={calculateAllocation}
              className="w-full bg-black hover:bg-gray-800 text-white font-bold py-3 px-4 rounded focus:outline-none focus:shadow-outline transition-colors"
            >
              Optimize Allocation
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
                onClick={saveAllocation}
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
                <h3 className="text-xl font-medium text-gray-700 mb-4">Optimal Asset Allocation</h3>
                
                <div className="h-64 md:h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={allocationData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({name, percent}) => `${name}: ${(percent * 100).toFixed(1)}%`}
                      >
                        {allocationData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip content={<AllocationTooltip />} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-700 mb-4">Allocation Details</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Asset Class</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Allocation</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {allocationData.map((asset, index) => (
                        <tr key={index}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="h-3 w-3 rounded-full mr-2" style={{ backgroundColor: asset.color }}></div>
                              <div className="text-sm font-medium text-gray-900">{asset.name}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{asset.value}%</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatCurrency(asset.amount)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
            
            <div>
              <div className="bg-gray-50 rounded-lg p-6 mb-6">
                <h3 className="text-xl font-medium text-gray-700 mb-4">Portfolio Characteristics</h3>
                
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-white rounded-lg p-4 shadow-sm">
                  <p className="text-sm text-gray-500 mb-1">Expected Annual Return</p>
                    <p className="text-2xl font-semibold text-gray-800">{expectedReturn}%</p>
                  </div>
                  <div className="bg-white rounded-lg p-4 shadow-sm">
                    <p className="text-sm text-gray-500 mb-1">Risk Level (Volatility)</p>
                    <p className="text-2xl font-semibold text-gray-800">{expectedRisk}%</p>
                  </div>
                  <div className="bg-white rounded-lg p-4 shadow-sm">
                    <p className="text-sm text-gray-500 mb-1">Time Horizon</p>
                    <p className="text-2xl font-semibold text-gray-800">{investmentHorizon} years</p>
                  </div>
                  <div className="bg-white rounded-lg p-4 shadow-sm">
                    <p className="text-sm text-gray-500 mb-1">Risk Tolerance</p>
                    <p className="text-2xl font-semibold text-gray-800">{riskTolerance}/10</p>
                  </div>
                </div>
                
                <div className="bg-white rounded-lg p-4 shadow-sm mb-4">
                  <h4 className="font-medium text-gray-700 mb-2">Sharpe Ratio</h4>
                  <p className="text-2xl font-semibold text-gray-800">
                    {((expectedReturn - 1.5) / expectedRisk).toFixed(2)}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Measures risk-adjusted return (higher is better)
                  </p>
                </div>
                
                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <h4 className="font-medium text-gray-700 mb-2">Key Insights</h4>
                  <ul className="text-sm text-gray-600 space-y-2">
                    <li className="flex items-start">
                      <LucideIcons.TrendingUp size={16} className="text-green-500 mr-2 mt-0.5" />
                      {expectedReturn > 6 ? 
                        `Your allocation is growth-oriented with an expected return of ${expectedReturn}%.` : 
                        `Your allocation is conservative with a modest expected return of ${expectedReturn}%.`}
                    </li>
                    <li className="flex items-start">
                      <LucideIcons.AlertTriangle size={16} className="text-yellow-500 mr-2 mt-0.5" />
                      {expectedRisk > 12 ? 
                        `This portfolio has higher volatility (${expectedRisk}%) which may lead to larger short-term fluctuations.` : 
                        `This portfolio has moderate volatility (${expectedRisk}%) providing a balance of growth and stability.`}
                    </li>
                    <li className="flex items-start">
                      <LucideIcons.Clock size={16} className="text-blue-500 mr-2 mt-0.5" />
                      {investmentHorizon > 15 ? 
                        `Your long time horizon (${investmentHorizon} years) supports taking on higher risk for potential rewards.` : 
                        `Your shorter time horizon (${investmentHorizon} years) suggests a more conservative approach to protect capital.`}
                    </li>
                    <li className="flex items-start">
                      <LucideIcons.PieChart size={16} className="text-purple-500 mr-2 mt-0.5" />
                      Your portfolio includes {allocationData.length} different asset classes for diversification.
                    </li>
                  </ul>
                </div>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-xl font-medium text-gray-700 mb-4">Projected Performance</h3>
                <div className="h-64 md:h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={historicalPerformance}
                      margin={{
                        top: 10,
                        right: 30,
                        left: 0,
                        bottom: 0,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="year" 
                        label={{ value: 'Year', position: 'insideBottomRight', offset: -10 }} 
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
                        }), 'Value']} 
                        labelFormatter={(label) => `Year ${label}`}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="upperBound" 
                        stroke="#8884d8" 
                        fillOpacity={0.1}
                        fill="#8884d8" 
                        name="Optimistic"
                      />
                      <Area 
                        type="monotone" 
                        dataKey="value" 
                        stroke="#4f46e5" 
                        fillOpacity={0.3}
                        fill="#4f46e5" 
                        name="Expected"
                      />
                      <Area 
                        type="monotone" 
                        dataKey="lowerBound" 
                        stroke="#82ca9d" 
                        fillOpacity={0.1}
                        fill="#82ca9d" 
                        name="Conservative"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
                <p className="text-xs text-gray-500 mt-2 italic">
                  Projection based on expected returns and historical volatility. Actual results may vary significantly.
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-6 mt-8 border border-gray-200">
            <h3 className="text-xl font-medium text-gray-700 mb-4">Recommended ETFs for Implementation</h3>
            
            <p className="text-gray-600 mb-4">
              Based on your optimal asset allocation, here are some low-cost ETFs you could consider for implementation.
              These suggestions aim to provide broad market exposure with minimal fees.
            </p>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Asset Class</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Suggested ETFs</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Expense Ratio</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Allocation</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {allocationData.map((asset, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-3 w-3 rounded-full mr-2" style={{ backgroundColor: asset.color }}></div>
                          <div className="text-sm font-medium text-gray-900">{asset.name}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {asset.name === "US Stocks" && "VTI, ITOT, SCHB"}
                        {asset.name === "International Stocks" && "VXUS, IXUS, SCHF"}
                        {asset.name === "US Bonds" && "BND, AGG, SCHZ"}
                        {asset.name === "International Bonds" && "BNDX, IAGG"}
                        {asset.name === "REITs" && "VNQ, SCHH, USRT"}
                        {asset.name === "Commodities" && "PDBC, DBC, COMT"}
                        {asset.name === "Alternatives" && "BTAL, QAI, MNA"}
                        {asset.name === "Cash" && "SHV, BIL, GBIL"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {asset.name === "US Stocks" && "0.03% - 0.10%"}
                        {asset.name === "International Stocks" && "0.08% - 0.15%"}
                        {asset.name === "US Bonds" && "0.04% - 0.15%"}
                        {asset.name === "International Bonds" && "0.08% - 0.20%"}
                        {asset.name === "REITs" && "0.07% - 0.25%"}
                        {asset.name === "Commodities" && "0.25% - 0.85%"}
                        {asset.name === "Alternatives" && "0.75% - 1.20%"}
                        {asset.name === "Cash" && "0.03% - 0.15%"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{asset.value}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-xs text-gray-500 mt-4 italic">
              Note: ETF expense ratios are approximate and may change. Evaluate each fund's details before investing.
              This is not personalized investment advice. Consider consulting a financial advisor for specific recommendations.
            </p>
          </div>
          
          {/* Saved Allocations Section */}
          {savedAllocations.length > 0 && (
            <div className="mt-8 border-t border-gray-200 pt-6">
              <h3 className="text-lg font-medium text-gray-700 mb-4">Saved Allocations</h3>
              <div className="overflow-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Risk Level</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Horizon</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Return</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Risk</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {savedAllocations.map((allocation) => (
                      <tr key={allocation.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{allocation.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{allocation.riskTolerance}/10</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{allocation.investmentHorizon} yrs</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{allocation.expectedReturn}%</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{allocation.expectedRisk}%</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatCurrency(allocation.investmentAmount)}</td>
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
        <h2 className="text-2xl font-semibold text-gray-800 mb-6">Understanding Asset Allocation</h2>
        
        <div className="prose max-w-none">
          <p>
            Asset allocation is one of the most important investment decisions you'll make. Research shows that asset
            allocation determines more than 90% of your portfolio's volatility and long-term performance.
          </p>
          
          <h3>What is Asset Allocation?</h3>
          <p>
            Asset allocation refers to how your investment is divided among different asset classes, such as stocks, bonds,
            real estate, and cash. Each asset class has different levels of risk and return potential, and they often
            perform differently under various economic conditions.
          </p>
          
          <h3>Key Factors in Asset Allocation</h3>
          <ul>
            <li><strong>Risk Tolerance:</strong> Your ability and willingness to endure market volatility</li>
            <li><strong>Time Horizon:</strong> How long you plan to invest before needing the money</li>
            <li><strong>Investment Goals:</strong> What you're trying to achieve (growth, income, preservation)</li>
            <li><strong>Age:</strong> Generally, younger investors can take on more risk</li>
          </ul>
          
          <h3>Diversification Benefits</h3>
          <p>
            A well-diversified portfolio aims to maximize returns for a given level of risk by combining assets that don't
            always move in the same direction. When one asset class is performing poorly, another may be doing well,
            helping to reduce overall portfolio volatility.
          </p>
          
          <h3>Common Asset Allocation Models</h3>
          <p>
            While each investor's situation is unique, some common allocation models include:
          </p>
          <ul>
            <li><strong>Aggressive Growth:</strong> 80-100% stocks, 0-20% bonds, 0-10% cash</li>
            <li><strong>Growth:</strong> 60-80% stocks, 20-30% bonds, 5-10% cash</li>
            <li><strong>Moderate:</strong> 40-60% stocks, 30-50% bonds, 5-15% cash</li>
            <li><strong>Conservative:</strong> 20-40% stocks, 40-60% bonds, 10-20% cash</li>
            <li><strong>Income:</strong> 10-30% stocks, 50-70% bonds, 10-20% cash</li>
          </ul>
          
          <h3>Rebalancing Your Portfolio</h3>
          <p>
            Over time, some investments will grow faster than others, causing your portfolio to drift away from your
            target allocation. Regular rebalancing (typically annually) helps maintain your desired risk level and
            can potentially improve returns by systematically "buying low and selling high."
          </p>
        </div>
      </div>
    </div>
  );
};

export default AssetAllocationOptimizer;