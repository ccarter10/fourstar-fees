import React, { useState } from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import * as LucideIcons from 'lucide-react';

const PortfolioRebalancingCalculator = () => {
  // State for form inputs
  const [portfolioValue, setPortfolioValue] = useState(100000);
  const [taxableAccount, setTaxableAccount] = useState(false);
  const [rebalancingThreshold, setRebalancingThreshold] = useState(5);
  const [includeNewContributions, setIncludeNewContributions] = useState(true);
  const [annualContribution, setAnnualContribution] = useState(6000);
  const [rebalancingFrequency, setRebalancingFrequency] = useState('annually');
  const [showTooltip, setShowTooltip] = useState(null);
  const [scenarioName, setScenarioName] = useState('My Rebalancing Plan');
  
  // State for asset classes
  const [assetClasses, setAssetClasses] = useState([
    { id: 1, name: 'US Stocks', currentAllocation: 60, targetAllocation: 60, value: 60000, expectedReturn: 8.0, color: '#4f46e5' },
    { id: 2, name: 'International Stocks', currentAllocation: 15, targetAllocation: 15, value: 15000, expectedReturn: 7.5, color: '#3b82f6' },
    { id: 3, name: 'US Bonds', currentAllocation: 20, targetAllocation: 20, value: 20000, expectedReturn: 3.0, color: '#10b981' },
    { id: 4, name: 'Cash', currentAllocation: 5, targetAllocation: 5, value: 5000, expectedReturn: 1.0, color: '#6b7280' },
  ]);
  
  // State for calculation results
  const [currentAllocationData, setCurrentAllocationData] = useState([]);
  const [targetAllocationData, setTargetAllocationData] = useState([]);
  const [rebalancingActions, setRebalancingActions] = useState([]);
  const [rebalancedPortfolioValue, setRebalancedPortfolioValue] = useState(0);
  const [driftAmount, setDriftAmount] = useState(0);
  const [taxImpact, setTaxImpact] = useState(0);
  const [projectedPerformance, setProjectedPerformance] = useState([]);
  const [hasCalculated, setHasCalculated] = useState(false);
  const [savedScenarios, setSavedScenarios] = useState([]);
  
  // Add asset class
  const addAssetClass = () => {
    // Create a new ID
    const newId = assetClasses.length > 0 ? Math.max(...assetClasses.map(a => a.id)) + 1 : 1;
    
    // Define colors for asset classes
    const colors = ['#8b5cf6', '#f59e0b', '#ec4899', '#14b8a6', '#f43f5e', '#84cc16', '#6366f1'];
    
    // Add new asset class with default values
    const newAssetClass = {
      id: newId,
      name: `Asset Class ${newId}`,
      currentAllocation: 0,
      targetAllocation: 0,
      value: 0,
      expectedReturn: 5.0,
      color: colors[newId % colors.length]
    };
    
    setAssetClasses([...assetClasses, newAssetClass]);
  };
  
  // Remove asset class
  const removeAssetClass = (id) => {
    if (assetClasses.length <= 2) {
      alert("You must have at least two asset classes.");
      return;
    }
    
    // Remove the asset class
    const updatedAssetClasses = assetClasses.filter(assetClass => assetClass.id !== id);
    setAssetClasses(updatedAssetClasses);
  };
  
  // Handle asset class name change
  const handleNameChange = (id, name) => {
    const updatedAssetClasses = assetClasses.map(assetClass => {
      if (assetClass.id === id) {
        return { ...assetClass, name };
      }
      return assetClass;
    });
    
    setAssetClasses(updatedAssetClasses);
  };
  
  // Handle asset class allocation change
  const handleAllocationChange = (id, allocation) => {
    // Ensure allocation is a number between 0 and 100
    const newAllocation = Math.max(0, Math.min(100, Number(allocation)));
    
    const updatedAssetClasses = assetClasses.map(assetClass => {
      if (assetClass.id === id) {
        // Update the target allocation
        return { 
          ...assetClass, 
          targetAllocation: newAllocation
        };
      }
      return assetClass;
    });
    
    setAssetClasses(updatedAssetClasses);
  };
  
  // Handle asset class current allocation change
  const handleCurrentAllocationChange = (id, allocation) => {
    // Ensure allocation is a number between 0 and 100
    const newAllocation = Math.max(0, Math.min(100, Number(allocation)));
    
    const updatedAssetClasses = assetClasses.map(assetClass => {
      if (assetClass.id === id) {
        // Update the current allocation and value
        return { 
          ...assetClass, 
          currentAllocation: newAllocation,
          value: (newAllocation / 100) * portfolioValue
        };
      }
      return assetClass;
    });
    
    setAssetClasses(updatedAssetClasses);
  };
  
  // Handle asset class expected return change
  const handleReturnChange = (id, returnRate) => {
    const updatedAssetClasses = assetClasses.map(assetClass => {
      if (assetClass.id === id) {
        return { ...assetClass, expectedReturn: Number(returnRate) };
      }
      return assetClass;
    });
    
    setAssetClasses(updatedAssetClasses);
  };
  
  // Normalize target allocations to ensure they sum to 100%
  const normalizeTargetAllocations = () => {
    // Get total of all target allocations
    const totalAllocation = assetClasses.reduce((sum, assetClass) => sum + assetClass.targetAllocation, 0);
    
    // If the total is not 100, normalize the allocations
    if (totalAllocation !== 100) {
      const updatedAssetClasses = assetClasses.map(assetClass => {
        // Avoid division by zero
        if (totalAllocation === 0) {
          return { ...assetClass, targetAllocation: 100 / assetClasses.length };
        }
        
        // Normalize allocation
        const normalizedAllocation = (assetClass.targetAllocation / totalAllocation) * 100;
        return { ...assetClass, targetAllocation: Math.round(normalizedAllocation * 10) / 10 };
      });
      
      setAssetClasses(updatedAssetClasses);
    }
  };
  
  // Normalize current allocations to ensure they sum to 100%
  const normalizeCurrentAllocations = () => {
    // Get total of all current allocations
    const totalAllocation = assetClasses.reduce((sum, assetClass) => sum + assetClass.currentAllocation, 0);
    
    // If the total is not 100, normalize the allocations
    if (totalAllocation !== 100) {
      const updatedAssetClasses = assetClasses.map(assetClass => {
        // Avoid division by zero
        if (totalAllocation === 0) {
          const evenAllocation = 100 / assetClasses.length;
          return { 
            ...assetClass, 
            currentAllocation: evenAllocation,
            value: (evenAllocation / 100) * portfolioValue 
          };
        }
        
        // Normalize allocation
        const normalizedAllocation = (assetClass.currentAllocation / totalAllocation) * 100;
        const roundedAllocation = Math.round(normalizedAllocation * 10) / 10;
        return { 
          ...assetClass, 
          currentAllocation: roundedAllocation,
          value: (roundedAllocation / 100) * portfolioValue 
        };
      });
      
      setAssetClasses(updatedAssetClasses);
    }
  };
  
  // Update asset class values based on portfolio value
  const updateAssetValues = (newPortfolioValue) => {
    const updatedAssetClasses = assetClasses.map(assetClass => {
      return {
        ...assetClass,
        value: (assetClass.currentAllocation / 100) * newPortfolioValue
      };
    });
    
    setAssetClasses(updatedAssetClasses);
  };
  
  // Handle portfolio value change
  const handlePortfolioValueChange = (value) => {
    const newValue = Number(value);
    setPortfolioValue(newValue);
    updateAssetValues(newValue);
  };
  
  // Calculate rebalancing
  const calculateRebalancing = () => {
    // Normalize allocations to ensure they sum to 100%
    normalizeTargetAllocations();
    normalizeCurrentAllocations();
    
    // Calculate current allocation data for charts
    const currentData = assetClasses.map(assetClass => ({
      name: assetClass.name,
      value: assetClass.currentAllocation,
      color: assetClass.color,
      dollarValue: assetClass.value
    }));
    
    // Calculate target allocation data for charts
    const targetData = assetClasses.map(assetClass => ({
      name: assetClass.name,
      value: assetClass.targetAllocation,
      color: assetClass.color,
      dollarValue: (assetClass.targetAllocation / 100) * portfolioValue
    }));
    
    // Calculate rebalancing actions
    const actions = assetClasses.map(assetClass => {
      const targetValue = (assetClass.targetAllocation / 100) * portfolioValue;
      const difference = targetValue - assetClass.value;
      const percentDifference = assetClass.targetAllocation - assetClass.currentAllocation;
      
      return {
        id: assetClass.id,
        name: assetClass.name,
        currentValue: assetClass.value,
        targetValue: targetValue,
        difference: difference,
        percentDifference: percentDifference,
        action: difference > 0 ? 'Buy' : difference < 0 ? 'Sell' : 'Hold',
        color: assetClass.color
      };
    });
    
    // Calculate total drift (sum of absolute percent differences)
    const totalDrift = actions.reduce((sum, action) => sum + Math.abs(action.percentDifference), 0) / 2;
    
    // Calculate tax impact for taxable accounts (simplified)
    let estimatedTaxImpact = 0;
    if (taxableAccount) {
      // Estimate capital gains tax on sells (assuming 15% long-term capital gains rate)
      const totalSellAmount = actions
        .filter(action => action.action === 'Sell')
        .reduce((sum, action) => sum + Math.abs(action.difference), 0);
      
      // Assume 50% of the sell amount is capital gains
      estimatedTaxImpact = totalSellAmount * 0.5 * 0.15;
    }
    
    // Generate simplified projection data for 5 years
    const projectionData = [];
    
    // Calculate weighted expected return for the portfolio
    const weightedReturn = assetClasses.reduce(
      (sum, assetClass) => sum + (assetClass.targetAllocation / 100) * assetClass.expectedReturn,
      0
    );
    
    // Calculate weighted return for current unbalanced portfolio
    const currentWeightedReturn = assetClasses.reduce(
      (sum, assetClass) => sum + (assetClass.currentAllocation / 100) * assetClass.expectedReturn,
      0
    );
    
    // Project both rebalanced and non-rebalanced portfolios for comparison
    let rebalancedValue = portfolioValue;
    let nonRebalancedValue = portfolioValue;
    
    for (let year = 0; year <= 5; year++) {
      // Start with the initial values in year 0
      if (year === 0) {
        projectionData.push({
          year,
          rebalanced: rebalancedValue,
          nonRebalanced: nonRebalancedValue
        });
        continue;
      }
      
      // Apply annual return
      rebalancedValue = rebalancedValue * (1 + weightedReturn / 100);
      nonRebalancedValue = nonRebalancedValue * (1 + currentWeightedReturn / 100);
      
      // Add annual contribution if selected
      if (includeNewContributions) {
        rebalancedValue += annualContribution;
        nonRebalancedValue += annualContribution;
      }
      
      // Add data point for this year
      projectionData.push({
        year,
        rebalanced: Math.round(rebalancedValue),
        nonRebalanced: Math.round(nonRebalancedValue)
      });
    }
    
    // Update state with results
    setCurrentAllocationData(currentData);
    setTargetAllocationData(targetData);
    setRebalancingActions(actions);
    setRebalancedPortfolioValue(portfolioValue);
    setDriftAmount(totalDrift);
    setTaxImpact(estimatedTaxImpact);
    setProjectedPerformance(projectionData);
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
  
  // Format percentage
  const formatPercentage = (value) => {
    return `${value.toFixed(1)}%`;
  };
  
  // Save current scenario
  const saveScenario = () => {
    const newScenario = {
      id: Date.now(),
      name: scenarioName,
      portfolioValue,
      taxableAccount,
      rebalancingThreshold,
      includeNewContributions,
      annualContribution,
      rebalancingFrequency,
      assetClasses: [...assetClasses],
      driftAmount,
      taxImpact
    };
    
    setSavedScenarios([...savedScenarios, newScenario]);
  };
  
  // Export results
  const exportResults = () => {
    alert("PDF export feature would generate a detailed report of your rebalancing plan");
  };
  
  // Share results
  const shareResults = () => {
    alert("Share feature would allow you to send these results via email or social media");
  };
  
  // Tooltip content
  const tooltipContent = {
    portfolioValue: "The total current value of your investment portfolio.",
    taxableAccount: "Check this if your investments are in a taxable account (not a retirement account like an IRA or 401(k)).",
    rebalancingThreshold: "The percentage drift from target allocation that will trigger a rebalancing action.",
    includeNewContributions: "Whether to include new regular contributions as part of your rebalancing strategy.",
    annualContribution: "The total amount you plan to contribute to your portfolio each year.",
    rebalancingFrequency: "How often you plan to review and rebalance your portfolio.",
  };

  // Custom tooltip for pie chart
  const AllocationTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-4 border border-gray-200 rounded shadow-lg">
          <p className="font-medium">{data.name}</p>
          <p className="text-sm text-gray-700">Allocation: {data.value}%</p>
          <p className="text-sm text-gray-700">Value: {formatCurrency(data.dollarValue)}</p>
        </div>
      );
    }
    return null;
  };
  
  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-gray-800">Portfolio Rebalancing Calculator</h2>
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
          placeholder="e.g., Annual Rebalance Plan"
        />
      </div>
      
      <div className="grid md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div>
            <label htmlFor="portfolioValue" className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
              Portfolio Value
              <button 
                className="ml-1 text-gray-400 hover:text-gray-600 focus:outline-none"
                onClick={() => setShowTooltip('portfolioValue')}
              >
                <LucideIcons.HelpCircle size={16} />
              </button>
              {showTooltip === 'portfolioValue' && (
                <div className="absolute z-10 mt-2 w-64 p-3 bg-gray-800 text-white text-xs rounded shadow-lg">
                  {tooltipContent.portfolioValue}
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
                id="portfolioValue"
                className="focus:ring-black focus:border-black block w-full pl-7 pr-12 sm:text-sm border-gray-300 rounded-md p-2 border"
                value={portfolioValue}
                onChange={(e) => handlePortfolioValueChange(e.target.value)}
                min="1000"
              />
            </div>
          </div>
          
          <div className="flex items-center">
            <input
              id="taxableAccount"
              type="checkbox"
              className="h-4 w-4 text-black focus:ring-black border-gray-300 rounded"
              checked={taxableAccount}
              onChange={(e) => setTaxableAccount(e.target.checked)}
            />
            <label htmlFor="taxableAccount" className="ml-2 block text-sm text-gray-700 flex items-center">
              Taxable Account (not IRA/401k)
              <button 
                className="ml-1 text-gray-400 hover:text-gray-600 focus:outline-none"
                onClick={() => setShowTooltip('taxableAccount')}
              >
                <LucideIcons.HelpCircle size={16} />
              </button>
              {showTooltip === 'taxableAccount' && (
                <div className="absolute z-10 mt-2 w-64 p-3 bg-gray-800 text-white text-xs rounded shadow-lg">
                  {tooltipContent.taxableAccount}
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
          
          <div>
            <label htmlFor="rebalancingThreshold" className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
              Rebalancing Threshold (%)
              <button 
                className="ml-1 text-gray-400 hover:text-gray-600 focus:outline-none"
                onClick={() => setShowTooltip('rebalancingThreshold')}
              >
                <LucideIcons.HelpCircle size={16} />
              </button>
              {showTooltip === 'rebalancingThreshold' && (
                <div className="absolute z-10 mt-2 w-64 p-3 bg-gray-800 text-white text-xs rounded shadow-lg">
                  {tooltipContent.rebalancingThreshold}
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
              id="rebalancingThreshold"
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              min="1"
              max="10"
              value={rebalancingThreshold}
              onChange={(e) => setRebalancingThreshold(Number(e.target.value))}
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>1%</span>
              <span>{rebalancingThreshold}%</span>
              <span>10%</span>
            </div>
          </div>
          
          <div className="flex items-center">
            <input
              id="includeNewContributions"
              type="checkbox"
              className="h-4 w-4 text-black focus:ring-black border-gray-300 rounded"
              checked={includeNewContributions}
              onChange={(e) => setIncludeNewContributions(e.target.checked)}
            />
            <label htmlFor="includeNewContributions" className="ml-2 block text-sm text-gray-700 flex items-center">
              Include New Contributions in Rebalancing
              <button 
                className="ml-1 text-gray-400 hover:text-gray-600 focus:outline-none"
                onClick={() => setShowTooltip('includeNewContributions')}
              >
                <LucideIcons.HelpCircle size={16} />
              </button>
              {showTooltip === 'includeNewContributions' && (
                <div className="absolute z-10 mt-2 w-64 p-3 bg-gray-800 text-white text-xs rounded shadow-lg">
                  {tooltipContent.includeNewContributions}
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
          
          {includeNewContributions && (
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
          )}
          
          <div>
            <label htmlFor="rebalancingFrequency" className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
              Rebalancing Frequency
              <button 
                className="ml-1 text-gray-400 hover:text-gray-600 focus:outline-none"
                onClick={() => setShowTooltip('rebalancingFrequency')}
              >
                <LucideIcons.HelpCircle size={16} />
              </button>
              {showTooltip === 'rebalancingFrequency' && (
                <div className="absolute z-10 mt-2 w-64 p-3 bg-gray-800 text-white text-xs rounded shadow-lg">
                  {tooltipContent.rebalancingFrequency}
                  <button 
                    className="absolute top-1 right-1 text-white hover:text-gray-300"
                    onClick={() => setShowTooltip(null)}
                  >
                    <LucideIcons.X size={14} />
                  </button>
                </div>
              )}
            </label>
            <select
              id="rebalancingFrequency"
              className="focus:ring-black focus:border-black block w-full sm:text-sm border-gray-300 rounded-md p-2 border"
              value={rebalancingFrequency}
              onChange={(e) => setRebalancingFrequency(e.target.value)}
            >
              <option value="monthly">Monthly</option>
              <option value="quarterly">Quarterly</option>
              <option value="semi-annually">Semi-Annually</option>
              <option value="annually">Annually</option>
              <option value="threshold">Threshold-Based Only</option>
            </select>
          </div>
        </div>
        
        <div className="space-y-6">
          <div className="bg-gray-50 p-6 rounded-lg">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-700">Portfolio Allocation</h3>
              <button
                onClick={addAssetClass}
                className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
              >
                <LucideIcons.Plus size={16} className="mr-1" />
                Add Asset Class
              </button>
            </div>
            
            <div className="space-y-4">
              {assetClasses.map((assetClass) => (
                <div key={assetClass.id} className="bg-white p-4 rounded-md shadow-sm">
                  <div className="flex justify-between items-center mb-3">
                    <div className="flex items-center">
                      <div 
                        className="w-4 h-4 rounded-full mr-2" 
                        style={{ backgroundColor: assetClass.color }}
                      ></div>
                      <input
                        type="text"
                        className="text-sm font-medium border-0 border-b border-gray-200 focus:ring-0 focus:border-black p-0"
                        value={assetClass.name}
                        onChange={(e) => handleNameChange(assetClass.id, e.target.value)}
                        placeholder="Asset Class Name"
                      />
                    </div>
                    <button
                      onClick={() => removeAssetClass(assetClass.id)}
                      className="text-gray-400 hover:text-red-500 focus:outline-none"
                    >
                      <LucideIcons.Trash2 size={16} />
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Current Allocation (%)</label>
                      <input
                        type="number"
                        className="w-full text-sm border-gray-300 rounded-md p-1.5"
                        value={assetClass.currentAllocation}
                        onChange={(e) => handleCurrentAllocationChange(assetClass.id, e.target.value)}
                        min="0"
                        max="100"
                        step="0.1"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Current Value</label>
                      <div className="text-sm font-medium">{formatCurrency(assetClass.value)}</div>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Target Allocation (%)</label>
                      <input
                        type="number"
                        className="w-full text-sm border-gray-300 rounded-md p-1.5"
                        value={assetClass.targetAllocation}
                        onChange={(e) => handleAllocationChange(assetClass.id, e.target.value)}
                        min="0"
                        max="100"
                        step="0.1"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Expected Return (%)</label>
                      <input
                        type="number"
                        className="w-full text-sm border-gray-300 rounded-md p-1.5"
                        value={assetClass.expectedReturn}
                        onChange={(e) => handleReturnChange(assetClass.id, e.target.value)}
                        min="-20"
                        max="30"
                        step="0.1"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="pt-4">
            <button
              onClick={calculateRebalancing}
              className="w-full bg-black hover:bg-gray-800 text-white font-bold py-3 px-4 rounded focus:outline-none focus:shadow-outline transition-colors"
            >
              Calculate Rebalancing
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
                <h3 className="text-xl font-medium text-gray-700 mb-4">Current vs Target Allocation</h3>
                
                <div className="grid md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2 text-center">Current Allocation</h4>
                    <div className="h-48">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={currentAllocationData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={60}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {currentAllocationData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip content={<AllocationTooltip />} />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2 text-center">Target Allocation</h4>
                    <div className="h-48">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={targetAllocationData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={60}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {targetAllocationData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip content={<AllocationTooltip />} />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
                
                <div className="bg-yellow-50 p-4 rounded-md border-l-4 border-yellow-400">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <LucideIcons.AlertTriangle className="h-5 w-5 text-yellow-400" />
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-yellow-800">Portfolio Drift: {formatPercentage(driftAmount)}</h3>
                      <div className="mt-2 text-sm text-yellow-700">
                        <p>
                          Your portfolio has drifted {formatPercentage(driftAmount)} from your target allocation.
                          {driftAmount > rebalancingThreshold ? 
                            ` This exceeds your ${rebalancingThreshold}% threshold and should be rebalanced.` : 
                            ` This is below your ${rebalancingThreshold}% threshold and doesn't require immediate rebalancing.`}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-xl font-medium text-gray-700 mb-4">Rebalancing Actions</h3>
                
                {taxImpact > 0 && (
                  <div className="mb-4 bg-blue-50 p-4 rounded-md border-l-4 border-blue-400">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <LucideIcons.Info className="h-5 w-5 text-blue-400" />
                      </div>
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-blue-800">Estimated Tax Impact: {formatCurrency(taxImpact)}</h3>
                        <div className="mt-2 text-sm text-blue-700">
                          <p>
                            Since this is a taxable account, selling assets may trigger capital gains taxes.
                            Consider tax-efficient rebalancing strategies like using new contributions.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Asset Class</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Current</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Target</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {rebalancingActions.map((action) => (
                        <tr key={action.id} className={action.action === 'Hold' ? 'bg-gray-50' : ''}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div 
                                className="h-3 w-3 rounded-full mr-2" 
                                style={{ backgroundColor: action.color }}
                              ></div>
                              <div className="text-sm font-medium text-gray-900">{action.name}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{formatCurrency(action.currentValue)}</div>
                            <div className="text-xs text-gray-500">({formatPercentage(action.currentValue / portfolioValue * 100)})</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{formatCurrency(action.targetValue)}</div>
                            <div className="text-xs text-gray-500">({formatPercentage(action.targetValue / portfolioValue * 100)})</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              action.action === 'Buy' ? 'bg-green-100 text-green-800' : 
                              action.action === 'Sell' ? 'bg-red-100 text-red-800' : 
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {action.action}
                            </span>
                            <div className="text-sm text-gray-900 mt-1">
                              {action.action !== 'Hold' && formatCurrency(Math.abs(action.difference))}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
            <div>
              <div className="bg-gray-50 rounded-lg p-6 mb-6">
                <h3 className="text-xl font-medium text-gray-700 mb-4">Projected Performance Impact</h3>
                
                <div className="h-64 md:h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={projectedPerformance}
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
                        }), '']} 
                        labelFormatter={(label) => `Year ${label}`}
                      />
                      <Legend />
                      <Bar dataKey="rebalanced" name="Rebalanced Portfolio" fill="#4f46e5" />
                      <Bar dataKey="nonRebalanced" name="Non-Rebalanced Portfolio" fill="#a5b4fc" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                
                <p className="text-xs text-gray-500 mt-2 italic">
                  Projection based on expected returns for each asset class. Actual results may vary.
                </p>
                
                <div className="bg-green-50 p-4 rounded-md border-l-4 border-green-400 mt-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <LucideIcons.TrendingUp className="h-5 w-5 text-green-400" />
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-green-800">
                        Rebalancing Benefit: {formatCurrency(projectedPerformance[projectedPerformance.length - 1]?.rebalanced - projectedPerformance[projectedPerformance.length - 1]?.nonRebalanced)}
                      </h3>
                      <div className="mt-2 text-sm text-green-700">
                        <p>
                          Based on your asset allocations and expected returns, regular rebalancing could 
                          {projectedPerformance[projectedPerformance.length - 1]?.rebalanced > projectedPerformance[projectedPerformance.length - 1]?.nonRebalanced ? 
                            ' increase' : ' decrease'} your portfolio value by approximately 
                          {formatCurrency(Math.abs(projectedPerformance[projectedPerformance.length - 1]?.rebalanced - projectedPerformance[projectedPerformance.length - 1]?.nonRebalanced))} 
                          over {projectedPerformance.length - 1} years.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-xl font-medium text-gray-700 mb-4">Rebalancing Strategy</h3>
                
                <div className="bg-white rounded-lg p-4 shadow-sm mb-4">
                  <h4 className="font-medium text-gray-700 mb-2">Recommended Approach</h4>
                  <div className="space-y-3 text-sm text-gray-600">
                    <p className="flex items-start">
                      <LucideIcons.Calendar className="h-5 w-5 text-gray-400 mr-2 flex-shrink-0" />
                      Rebalance {rebalancingFrequency}, or whenever your portfolio drifts more than {rebalancingThreshold}% from your target allocation.
                    </p>
                    
                    {includeNewContributions && (
                      <p className="flex items-start">
                        <LucideIcons.PlusCircle className="h-5 w-5 text-gray-400 mr-2 flex-shrink-0" />
                        Use new contributions of {formatCurrency(annualContribution)} per year to rebalance by directing them toward underweight assets.
                      </p>
                    )}
                    
                    {taxableAccount && (
                      <p className="flex items-start">
                        <LucideIcons.DollarSign className="h-5 w-5 text-gray-400 mr-2 flex-shrink-0" />
                        For this taxable account, prioritize tax-efficient rebalancing methods like using new contributions, dividend reinvestment, or tax-loss harvesting.
                      </p>
                    )}
                    
                    <p className="flex items-start">
                      <LucideIcons.TrendingUp className="h-5 w-5 text-gray-400 mr-2 flex-shrink-0" />
                      {driftAmount > rebalancingThreshold ? 
                        'Your portfolio currently needs rebalancing to align with your target allocation.' : 
                        'Your portfolio is currently within your rebalancing threshold and doesn\'t need immediate action.'}
                    </p>
                  </div>
                </div>
                
                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <h4 className="font-medium text-gray-700 mb-2">Tax-Efficient Rebalancing Methods</h4>
                  <ul className="list-disc pl-5 text-sm text-gray-600 space-y-2">
                    <li>Direct new contributions to underweight asset classes</li>
                    <li>Reinvest dividends and interest into underweight asset classes</li>
                    <li>Rebalance within tax-advantaged accounts first when possible</li>
                    <li>Combine rebalancing with tax-loss harvesting opportunities</li>
                    <li>Consider using asset location strategies (holding tax-inefficient assets in tax-advantaged accounts)</li>
                    <li>Make charitable donations using appreciated securities from overweight asset classes</li>
                  </ul>
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
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Portfolio Value</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Taxable</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Frequency</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Threshold</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Drift</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {savedScenarios.map((scenario) => (
                      <tr key={scenario.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{scenario.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatCurrency(scenario.portfolioValue)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{scenario.taxableAccount ? 'Yes' : 'No'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{scenario.rebalancingFrequency}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{scenario.rebalancingThreshold}%</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatPercentage(scenario.driftAmount)}</td>
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
        <h2 className="text-2xl font-semibold text-gray-800 mb-6">Understanding Portfolio Rebalancing</h2>
        
        <div className="prose max-w-none">
          <p>
            Portfolio rebalancing is the process of realigning the weightings of your portfolio's assets to maintain your
            original desired level of asset allocation and risk. As market movements cause your investments to drift from
            their target allocations, rebalancing helps keep your investment strategy on track.
          </p>
          
          <h3>Why Rebalance Your Portfolio?</h3>
          <ul>
            <li><strong>Maintain Risk Level:</strong> Over time, your portfolio's asset allocation will drift due to different returns from various assets, potentially increasing risk beyond your comfort level</li>
            <li><strong>Enforces Discipline:</strong> Rebalancing encourages you to sell high and buy low, removing emotion from the investment process</li>
            <li><strong>Potentially Improves Returns:</strong> Regular rebalancing can enhance long-term returns through systematic buying of undervalued assets</li>
            <li><strong>Maintains Diversification:</strong> Prevents your portfolio from becoming too concentrated in a single asset class or security</li>
          </ul>
          
          <h3>Rebalancing Strategies</h3>
          <p>
            There are several approaches to rebalancing your portfolio:
          </p>
          <ul>
            <li><strong>Calendar Rebalancing:</strong> Reviewing and rebalancing your portfolio on a regular schedule (monthly, quarterly, annually)</li>
            <li><strong>Threshold Rebalancing:</strong> Rebalancing when any asset class drifts from its target allocation by a predetermined percentage (e.g., 5%)</li>
            <li><strong>New Contribution Method:</strong> Directing new investments toward underweight asset classes to bring the portfolio back in balance</li>
            <li><strong>Dividend/Income Reinvestment:</strong> Reinvesting dividends and income into underweight asset classes</li>
          </ul>
          
          <h3>Tax Considerations</h3>
          <p>
            In taxable accounts, rebalancing can trigger capital gains taxes. Consider these tax-efficient rebalancing strategies:
          </p>
          <ul>
            <li>Rebalance within tax-advantaged accounts (IRAs, 401(k)s) when possible</li>
            <li>Use new contributions to rebalance without selling existing investments</li>
            <li>Coordinate rebalancing with tax-loss harvesting opportunities</li>
            <li>Consider the impact of transaction costs when making rebalancing decisions</li>
          </ul>
          
          <h3>Finding the Right Balance</h3>
          <p>
            The optimal rebalancing frequency and threshold depend on your specific situation:
          </p>
          <ul>
            <li>More frequent rebalancing helps maintain your target allocation but can increase costs and taxes</li>
            <li>Higher thresholds reduce trading costs but allow more drift from your target allocation</li>
            <li>Different asset classes may require different rebalancing approaches due to their volatility and correlation</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default PortfolioRebalancingCalculator;