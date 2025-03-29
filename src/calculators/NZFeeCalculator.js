import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from 'recharts';
import * as LucideIcons from 'lucide-react';
import { useRegion } from '../RegionContext';

const NZFeeCalculator = () => {
  const { formatCurrency, formatPercentage } = useRegion();

  // State for form inputs
  const [initialInvestment, setInitialInvestment] = useState(10000);
  const [annualContribution, setAnnualContribution] = useState(5000);
  const [investmentPeriod, setInvestmentPeriod] = useState(30);
  const [expectedReturn, setExpectedReturn] = useState(7);
  const [managementFee, setManagementFee] = useState(0.7);
  const [advisoryFee, setAdvisoryFee] = useState(0.5);
  const [tradingCosts, setTradingCosts] = useState(0.1);
  const [advancedMode, setAdvancedMode] = useState(false);
  const [showTooltip, setShowTooltip] = useState(null);
  
  // NZ Specific settings
  const [accountType, setAccountType] = useState('KiwiSaver');
  const [includeTaxOnFunds, setIncludeTaxOnFunds] = useState(true);
  const [pieTaxRate, setPieTaxRate] = useState('28');
  const [includeEmployerContribution, setIncludeEmployerContribution] = useState(true);
  const [contributionRate, setContributionRate] = useState(3);
  const [employerContributionRate, setEmployerContributionRate] = useState(3);
  const [salary, setSalary] = useState(60000);
  
  // Selected fund/provider preset
  const [selectedProvider, setSelectedProvider] = useState(null);
  
  // New Zealand Provider presets
  const providerPresets = [
    { name: "Simplicity", managementFee: 0.31, tradingCosts: 0, advisoryFee: 0 },
    { name: "Kernel", managementFee: 0.35, tradingCosts: 0, advisoryFee: 0 },
    { name: "SuperLife", managementFee: 0.50, tradingCosts: 0, advisoryFee: 0 },
    { name: "BNZ", managementFee: 0.45, tradingCosts: 0, advisoryFee: 0 },
    { name: "Milford", managementFee: 0.95, tradingCosts: 0, advisoryFee: 0 },
    { name: "Fisher Funds", managementFee: 1.10, tradingCosts: 0, advisoryFee: 0 },
    { name: "ANZ", managementFee: 0.80, tradingCosts: 0, advisoryFee: 0 },
    { name: "Westpac", managementFee: 0.65, tradingCosts: 0, advisoryFee: 0 },
    { name: "NZ ETFs", managementFee: 0.45, tradingCosts: 0.2, advisoryFee: 0 },
  ];
  
  // State for calculation results
  const [withoutFeesResult, setWithoutFeesResult] = useState(0);
  const [withFeesResult, setWithFeesResult] = useState(0);
  const [feesTotal, setFeesTotal] = useState(0);
  const [feePercentage, setFeePercentage] = useState(0);
  const [tRexScore, setTRexScore] = useState(0);
  const [chartData, setChartData] = useState([]);
  const [hasCalculated, setHasCalculated] = useState(false);
  const [scenarioName, setScenarioName] = useState('My NZ Investment');
  const [savedScenarios, setSavedScenarios] = useState([]);
  
  // Tax rates on PIE (Portfolio Investment Entity) funds in NZ
  const pieTaxRates = {
    '10.5': 10.5,
    '17.5': 17.5,
    '28': 28,
    '30': 30, // FDR for foreign shares in non-PIE investments
    '33': 33 // Top marginal tax rate for direct investments
  };

  // Apply provider preset
  const applyProviderPreset = (provider) => {
    setManagementFee(provider.managementFee);
    setTradingCosts(provider.tradingCosts);
    setAdvisoryFee(provider.advisoryFee);
    setSelectedProvider(provider.name);
  };

  // Calculate investment growth
  const calculateGrowth = () => {
    // Calculate total fee percentage
    let totalFeePercentage = managementFee;
    
    if (advancedMode) {
      totalFeePercentage += advisoryFee + tradingCosts;
    }
    
    // Tax drag calculations for PIE funds
    let taxDrag = 0;
    
    if (includeTaxOnFunds) {
      // In NZ, PIE funds are taxed at the investor's PIR (Prescribed Investor Rate)
      // This is different from most countries where funds grow tax-free until withdrawal
      const pieRate = parseFloat(pieTaxRate);

        // Assume only a portion of returns are taxable in a typical year
  // This accounts for unrealized gains and the tax efficiency of PIE funds
      const taxablePortionOfReturns = 0.4; // 40% of returns are typically taxable
      
      // Simplified tax drag calculation (assuming all returns are taxable)
      taxDrag = (expectedReturn * taxablePortionOfReturns * pieRate / 100);
      
      // Add the tax drag to the total fee percentage
      totalFeePercentage += taxDrag;
    }
    
    // Calculate annual contributions including employer contribution for KiwiSaver
    let yearlyContribution = annualContribution;
    
    if (accountType === 'KiwiSaver' && includeEmployerContribution) {
      const employerAmount = (salary * employerContributionRate / 100);
      const employeeAmount = (salary * contributionRate / 100);
      yearlyContribution = employeeAmount + employerAmount;
    }
    
    const withoutFees = calculateInvestmentGrowth(initialInvestment, yearlyContribution, investmentPeriod, expectedReturn, 0);
    const withFees = calculateInvestmentGrowth(initialInvestment, yearlyContribution, investmentPeriod, expectedReturn, totalFeePercentage);
    
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
      const withoutFeesAtYear = calculateInvestmentGrowth(initialInvestment, yearlyContribution, year, expectedReturn, 0);
      const withFeesAtYear = calculateInvestmentGrowth(initialInvestment, yearlyContribution, year, expectedReturn, totalFeePercentage);
      const feesAtYear = withoutFeesAtYear - withFeesAtYear;
      
      data.push({
        year,
        withoutFees: Math.round(withoutFeesAtYear),
        withFees: Math.round(withFeesAtYear),
        feesLost: Math.round(feesAtYear),
        cumulativeFees: Math.round(feesAtYear)
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
  
  // Save current scenario
  const saveScenario = () => {
    const newScenario = {
      id: Date.now(),
      name: scenarioName,
      accountType,
      initialInvestment,
      annualContribution,
      investmentPeriod,
      expectedReturn,
      managementFee,
      advisoryFee: advancedMode ? advisoryFee : 0,
      tradingCosts: advancedMode ? tradingCosts : 0,
      pieTaxRate,
      includeTaxOnFunds,
      includeEmployerContribution: accountType === 'KiwiSaver' ? includeEmployerContribution : false,
      tRexScore,
      totalValue: withFeesResult,
      feesTotal
    };
    
    setSavedScenarios([...savedScenarios, newScenario]);
  };
  
  // Export results as PDF
  const exportResults = () => {
    // In a real implementation, this would use a library like jsPDF
    alert("PDF export feature would generate a detailed report of your calculations");
  };
  
  // Share results
  const shareResults = () => {
    // In a real implementation, this would use the Web Share API
    alert("Share feature would allow you to send these results via email or social media");
  };

  // Effect to update scenario name when account type changes
  useEffect(() => {
    setScenarioName(`My NZ ${accountType} Investment`);
  }, [accountType]);

  // Calculate the approximate yearly contribution for KiwiSaver
  useEffect(() => {
    if (accountType === 'KiwiSaver' && includeEmployerContribution) {
      const employerAmount = (salary * employerContributionRate / 100);
      const employeeAmount = (salary * contributionRate / 100);
      setAnnualContribution(employeeAmount);
    }
  }, [accountType, salary, contributionRate, employerContributionRate, includeEmployerContribution]);

  // Tooltip content for NZ calculator
  const tooltipContent = {
    managementFee: "The annual management fee charged by funds to cover operating expenses, expressed as a percentage of assets.",
    advisoryFee: "Fee charged by financial advisors for investment management and advice.",
    tradingCosts: "Costs associated with buying and selling securities, including brokerage fees and spreads.",
    accountType: "Different investment types in New Zealand have different fee structures and tax treatment. KiwiSaver is NZ's retirement savings scheme with employer contributions.",
    pieTaxRate: "In New Zealand, PIE (Portfolio Investment Entity) funds are taxed at your Prescribed Investor Rate (PIR), which is based on your income.",
    contributionRate: "The percentage of your salary that you contribute to your KiwiSaver account.",
    employerContributionRate: "The percentage of your salary that your employer contributes to your KiwiSaver account (minimum 3%).",
    trex: "The T-Rex Score, developed by Larry Bates, shows what percentage of your potential returns you keep after fees. Higher is better!"
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-gray-800">New Zealand Investment Fee Calculator</h2>
        
        <div className="flex items-center">
          <span className="mr-2 text-sm text-gray-600">Simple</span>
          <button 
            onClick={() => setAdvancedMode(!advancedMode)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-1 ${advancedMode ? 'bg-black' : 'bg-gray-200'}`}
          >
            <span
              className={`${
                advancedMode ? 'translate-x-6' : 'translate-x-1'
              } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
            />
          </button>
          <span className="ml-2 text-sm text-gray-600">Advanced</span>
        </div>
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
          placeholder="e.g., My KiwiSaver Plan"
        />
      </div>
      
      {/* NZ Account Type Selector */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
          Account Type
          <button 
            className="ml-1 text-gray-400 hover:text-gray-600 focus:outline-none"
            onClick={() => setShowTooltip('accountType')}
          >
            <LucideIcons.HelpCircle size={16} />
          </button>
        </label>
        {showTooltip === 'accountType' && (
          <div className="absolute z-10 mt-2 w-64 p-3 bg-gray-800 text-white text-xs rounded shadow-lg">
            {tooltipContent.accountType}
            <button 
              className="absolute top-1 right-1 text-white hover:text-gray-300"
              onClick={() => setShowTooltip(null)}
            >
              <LucideIcons.X size={14} />
            </button>
          </div>
        )}
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => setAccountType('KiwiSaver')}
            className={`p-2 text-sm border rounded-md ${
              accountType === 'KiwiSaver'
                ? 'border-black bg-gray-100'
                : 'border-gray-300 hover:border-gray-400'
            }`}
          >
            KiwiSaver
          </button>
          <button
            onClick={() => setAccountType('PIE Fund')}
            className={`p-2 text-sm border rounded-md ${
              accountType === 'PIE Fund'
                ? 'border-black bg-gray-100'
                : 'border-gray-300 hover:border-gray-400'
            }`}
          >
            PIE Fund
          </button>
          <button
            onClick={() => setAccountType('Personal')}
            className={`p-2 text-sm border rounded-md ${
              accountType === 'Personal'
                ? 'border-black bg-gray-100'
                : 'border-gray-300 hover:border-gray-400'
            }`}
          >
            Personal Investment
          </button>
        </div>
      </div>
      
      {/* Fund/Provider Presets */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select Fund Provider
        </label>
        <div className="grid grid-cols-3 gap-2">
          {providerPresets.map((provider) => (
            <button
              key={provider.name}
              onClick={() => applyProviderPreset(provider)}
              className={`p-2 text-sm border rounded-md ${
                selectedProvider === provider.name
                  ? 'border-black bg-gray-100'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              {provider.name}
            </button>
          ))}
          <button
            onClick={() => {
              setManagementFee(0.7);
              setAdvisoryFee(0.5);
              setTradingCosts(0.1);
              setSelectedProvider(null);
            }}
            className={`p-2 text-sm border rounded-md ${
              selectedProvider === null
                ? 'border-black bg-gray-100'
                : 'border-gray-300 hover:border-gray-400'
            }`}
          >
            Custom
          </button>
        </div>
      </div>
      
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
                className="focus:ring-black focus:border-black block w-full pl-7 pr-12 sm:text-sm border-gray-300 rounded-md p-2 border"
                value={initialInvestment}
                onChange={(e) => setInitialInvestment(Number(e.target.value))}
                min="0"
                step="1000"
              />
            </div>
          </div>
          
          {accountType === 'KiwiSaver' ? (
            <>
              <div>
                <label htmlFor="salary" className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                  Annual Salary
                </label>
                <div className="relative mt-1 rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 sm:text-sm">$</span>
                  </div>
                  <input
                    type="number"
                    id="salary"
                    className="focus:ring-black focus:border-black block w-full pl-7 pr-12 sm:text-sm border-gray-300 rounded-md p-2 border"
                    value={salary}
                    onChange={(e) => setSalary(Number(e.target.value))}
                    min="0"
                    step="1000"
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="contributionRate" className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                  Your Contribution Rate (%)
                  <button 
                    className="ml-1 text-gray-400 hover:text-gray-600 focus:outline-none"
                    onClick={() => setShowTooltip('contributionRate')}
                  >
                    <LucideIcons.HelpCircle size={16} />
                  </button>
                </label>
                {showTooltip === 'contributionRate' && (
                  <div className="absolute z-10 mt-2 w-64 p-3 bg-gray-800 text-white text-xs rounded shadow-lg">
                    {tooltipContent.contributionRate}
                    <button 
                      className="absolute top-1 right-1 text-white hover:text-gray-300"
                      onClick={() => setShowTooltip(null)}
                    >
                      <LucideIcons.X size={14} />
                    </button>
                  </div>
                )}
                <select
                  id="contributionRate"
                  className="focus:ring-black focus:border-black block w-full sm:text-sm border-gray-300 rounded-md p-2 border"
                  value={contributionRate}
                  onChange={(e) => setContributionRate(Number(e.target.value))}
                >
                  <option value="3">3% (Minimum)</option>
                  <option value="4">4%</option>
                  <option value="6">6%</option>
                  <option value="8">8%</option>
                  <option value="10">10% (Maximum)</option>
                </select>
              </div>
              
              <div className="flex items-center">
                <input
                  id="includeEmployerContribution"
                  type="checkbox"
                  className="h-4 w-4 text-black focus:ring-black border-gray-300 rounded"
                  checked={includeEmployerContribution}
                  onChange={(e) => setIncludeEmployerContribution(e.target.checked)}
                />
                <label htmlFor="includeEmployerContribution" className="ml-2 block text-sm text-gray-700 flex items-center">
                  Include Employer Contribution
                  <button 
                    className="ml-1 text-gray-400 hover:text-gray-600 focus:outline-none"
                    onClick={() => setShowTooltip('employerContributionRate')}
                  >
                    <LucideIcons.HelpCircle size={16} />
                  </button>
                </label>
              </div>
              
              {includeEmployerContribution && (
                <div>
                  <label htmlFor="employerContributionRate" className="block text-sm font-medium text-gray-700 mb-1">
                    Employer Contribution Rate (%)
                  </label>
                  <select
                    id="employerContributionRate"
                    className="focus:ring-black focus:border-black block w-full sm:text-sm border-gray-300 rounded-md p-2 border"
                    value={employerContributionRate}
                    onChange={(e) => setEmployerContributionRate(Number(e.target.value))}
                  >
                    <option value="3">3% (Minimum)</option>
                    <option value="4">4%</option>
                    <option value="6">6%</option>
                    <option value="8">8%</option>
                    <option value="10">10%</option>
                  </select>
                </div>
              )}
              
              <div className="bg-blue-50 border-l-4 border-blue-400 p-4">
                <div className="flex">
                  <div className="ml-3">
                    <p className="text-sm text-blue-700">
                      Your annual KiwiSaver contribution will be {formatCurrency(salary * contributionRate / 100)}
                      {includeEmployerContribution && ` plus ${formatCurrency(salary * employerContributionRate / 100)} from your employer`}.
                    </p>
                  </div>
                </div>
              </div>
            </>
          ) : (
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
                  className="focus:ring-black focus:border-black block w-full pl-7 pr-12 sm:text-sm border-gray-300 rounded-md p-2 border"
                  value={annualContribution}
                  onChange={(e) => setAnnualContribution(Number(e.target.value))}
                  min="0"
                  step="100"
                />
              </div>
            </div>
          )}
          
          <div>
            <label htmlFor="investmentPeriod" className="block text-sm font-medium text-gray-700 mb-1">
              Investment Period (years)
            </label>
            <input
              type="range"
              id="investmentPeriod"
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              min="1"
              max="50"
              value={investmentPeriod}
              onChange={(e) => setInvestmentPeriod(Number(e.target.value))}
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>1</span>
              <span>{investmentPeriod} years</span>
              <span>50</span>
            </div>
          </div>
          
          <div>
            <label htmlFor="expectedReturn" className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
              Expected Annual Return (%)
            </label>
            <div className="relative mt-1 rounded-md shadow-sm">
              <input
                type="number"
                id="expectedReturn"
                className="focus:ring-black focus:border-black block w-full pr-12 sm:text-sm border-gray-300 rounded-md p-2 border"
                value={expectedReturn}
                onChange={(e) => setExpectedReturn(Number(e.target.value))}
                min="0"
                max="30"
                step="0.1"
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <span className="text-gray-500 sm:text-sm">%</span>
              </div>
            </div>
          </div>
          
          {/* NZ-specific PIE tax settings */}
          {(accountType === 'KiwiSaver' || accountType === 'PIE Fund') && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-md font-medium text-gray-700 mb-3">PIE Tax Settings</h3>
              
              <div className="space-y-3">
                <div className="flex items-center">
                  <input
                    id="includeTaxOnFunds"
                    type="checkbox"
                    className="h-4 w-4 text-black focus:ring-black border-gray-300 rounded"
                    checked={includeTaxOnFunds}
                    onChange={(e) => setIncludeTaxOnFunds(e.target.checked)}
                  />
                  <label htmlFor="includeTaxOnFunds" className="ml-2 block text-sm text-gray-700 flex items-center">
                    Include PIE Tax Impact
                    <button 
                      className="ml-1 text-gray-400 hover:text-gray-600 focus:outline-none"
                      onClick={() => setShowTooltip('pieTaxRate')}
                    >
                      <LucideIcons.HelpCircle size={16} />
                    </button>
                  </label>
                </div>
                
                {includeTaxOnFunds && (
                  <div>
                    <label htmlFor="pieTaxRate" className="block text-sm font-medium text-gray-700 mb-1">
                      PIR (Prescribed Investor Rate)
                    </label>
                    <select
                      id="pieTaxRate"
                      className="focus:ring-black focus:border-black block w-full sm:text-sm border-gray-300 rounded-md p-2 border"
                      value={pieTaxRate}
                      onChange={(e) => setPieTaxRate(e.target.value)}
                    >
                      <option value="10.5">10.5% (Income ≤ $14,000)</option>
                      <option value="17.5">17.5% (Income $14,001 - $48,000)</option>
                      <option value="28">28% (Income &gt; $48,000)</option>
                    </select>
                  </div>
                )}
                
                <div className="pt-2 text-xs text-gray-500">
                  <p>New Zealand's PIE taxation:</p>
                  <ul className="list-disc pl-5 space-y-1 mt-1">
                    <li>KiwiSaver and PIE funds are taxed annually at your PIR rate</li>
                    <li>This is unlike many countries where retirement investments grow tax-free</li>
                    <li>PIR rates are capped at 28% (lower than the top income tax rate of 39%)</li>
                  </ul>
                </div>
              </div>
            </div>
          )}
          
          {/* Account type benefits summary */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-md font-medium text-gray-700 mb-2">NZ Account Type Benefits</h3>
            
            <div className="space-y-2 text-sm">
              {accountType === 'KiwiSaver' && (
                <>
                  <p className="flex items-center">
                    <LucideIcons.Check className="text-green-500 mr-2" size={16} />
                    Employer contributions (minimum 3% of salary)
                  </p>
                  <p className="flex items-center">
                    <LucideIcons.Check className="text-green-500 mr-2" size={16} />
                    Government contribution of up to $521.43 per year
                  </p>
                  <p className="flex items-center">
                    <LucideIcons.Check className="text-green-500 mr-2" size={16} />
                    First Home Withdrawal option
                  </p>
                  <p className="flex items-center">
                    <LucideIcons.Minus className="text-red-500 mr-2" size={16} />
                    Cannot access until age 65 (except for first home or hardship)
                  </p>
                </>
              )}
              
              {accountType === 'PIE Fund' && (
                <>
                  <p className="flex items-center">
                    <LucideIcons.Check className="text-green-500 mr-2" size={16} />
                    Tax advantages with PIR capped at 28% (vs 39% top income rate)
                  </p>
                  <p className="flex items-center">
                    <LucideIcons.Check className="text-green-500 mr-2" size={16} />
                    No capital gains tax
                  </p>
                  <p className="flex items-center">
                    <LucideIcons.Check className="text-green-500 mr-2" size={16} />
                    More access flexibility than KiwiSaver
                  </p>
                  <p className="flex items-center">
                    <LucideIcons.Minus className="text-red-500 mr-2" size={16} />
                    No employer or government contributions
                  </p>
                </>
              )}
              
              {accountType === 'Personal' && (
                <>
                  <p className="flex items-center">
                    <LucideIcons.Check className="text-green-500 mr-2" size={16} />
                    Complete flexibility and control
                  </p>
                  <p className="flex items-center">
                    <LucideIcons.Check className="text-green-500 mr-2" size={16} />
                    No contribution limits
                  </p>
                  <p className="flex items-center">
                    <LucideIcons.Check className="text-green-500 mr-2" size={16} />
                    No capital gains tax in New Zealand
                  </p>
                  <p className="flex items-center">
                    <LucideIcons.Minus className="text-red-500 mr-2" size={16} />
                    No tax advantages on income/dividends
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
        <div className="space-y-6">
          {/* Fee Inputs */}
          <div>
            <div className="flex items-center justify-between">
              <label htmlFor="managementFee" className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                Management Fee (%)
                <button 
                  className="ml-1 text-gray-400 hover:text-gray-600 focus:outline-none"
                  onClick={() => setShowTooltip('managementFee')}
                >
                  <LucideIcons.HelpCircle size={16} />
                </button>
              </label>
              {showTooltip === 'managementFee' && (
                <div className="absolute z-10 mt-2 w-64 p-3 bg-gray-800 text-white text-xs rounded shadow-lg">
                  {tooltipContent.managementFee}
                  <button 
                    className="absolute top-1 right-1 text-white hover:text-gray-300"
                    onClick={() => setShowTooltip(null)}
                  >
                    <LucideIcons.X size={14} />
                  </button>
                </div>
              )}
            </div>
            <div className="relative mt-1 rounded-md shadow-sm">
              <input
                type="number"
                id="managementFee"
                className="focus:ring-black focus:border-black block w-full pr-12 sm:text-sm border-gray-300 rounded-md p-2 border"
                value={managementFee}
                onChange={(e) => setManagementFee(Number(e.target.value))}
                min="0"
                max="3"
                step="0.01"
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <span className="text-gray-500 sm:text-sm">%</span>
              </div>
            </div>
          </div>
          
          {advancedMode && (
            <>
              <div>
                <div className="flex items-center justify-between">
                  <label htmlFor="advisoryFee" className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                    Advisory Fee (%)
                    <button 
                      className="ml-1 text-gray-400 hover:text-gray-600 focus:outline-none"
                      onClick={() => setShowTooltip('advisoryFee')}
                    >
                      <LucideIcons.HelpCircle size={16} />
                    </button>
                  </label>
                  {showTooltip === 'advisoryFee' && (
                    <div className="absolute z-10 mt-2 w-64 p-3 bg-gray-800 text-white text-xs rounded shadow-lg">
                      {tooltipContent.advisoryFee}
                      <button 
                        className="absolute top-1 right-1 text-white hover:text-gray-300"
                        onClick={() => setShowTooltip(null)}
                      >
                        <LucideIcons.X size={14} />
                      </button>
                    </div>
                  )}
                </div>
                <div className="relative mt-1 rounded-md shadow-sm">
                  <input
                    type="number"
                    id="advisoryFee"
                    className="focus:ring-black focus:border-black block w-full pr-12 sm:text-sm border-gray-300 rounded-md p-2 border"
                    value={advisoryFee}
                    onChange={(e) => setAdvisoryFee(Number(e.target.value))}
                    min="0"
                    max="2"
                    step="0.01"
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 sm:text-sm">%</span>
                  </div>
                </div>
              </div>
              
              <div>
                <div className="flex items-center justify-between">
                  <label htmlFor="tradingCosts" className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                    Trading Costs (%)
                    <button 
                      className="ml-1 text-gray-400 hover:text-gray-600 focus:outline-none"
                      onClick={() => setShowTooltip('tradingCosts')}
                    >
                      <LucideIcons.HelpCircle size={16} />
                    </button>
                  </label>
                  {showTooltip === 'tradingCosts' && (
                    <div className="absolute z-10 mt-2 w-64 p-3 bg-gray-800 text-white text-xs rounded shadow-lg">
                      {tooltipContent.tradingCosts}
                      <button 
                        className="absolute top-1 right-1 text-white hover:text-gray-300"
                        onClick={() => setShowTooltip(null)}
                      >
                        <LucideIcons.X size={14} />
                      </button>
                    </div>
                  )}
                </div>
                <div className="relative mt-1 rounded-md shadow-sm">
                  <input
                    type="number"
                    id="tradingCosts"
                    className="focus:ring-black focus:border-black block w-full pr-12 sm:text-sm border-gray-300 rounded-md p-2 border"
                    value={tradingCosts}
                    onChange={(e) => setTradingCosts(Number(e.target.value))}
                    min="0"
                    max="2"
                    step="0.01"
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 sm:text-sm">%</span>
                  </div>
                </div>
              </div>
            </>
          )}
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-md font-medium text-gray-700 mb-4">New Zealand Fund Fee Benchmarks</h3>
            
            <div className="space-y-3 text-sm">
              <div className="flex justify-between items-center">
                <span>Low-cost Index Funds:</span>
                <span className="font-medium">0.20% - 0.40%</span>
              </div>
              <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden">
                <div className="bg-green-500 h-1.5 rounded-full" style={{ width: '15%' }}></div>
              </div>
              
              <div className="flex justify-between items-center">
                <span>KiwiSaver Default Funds:</span>
                <span className="font-medium">0.30% - 0.60%</span>
              </div>
              <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden">
                <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: '25%' }}></div>
              </div>
              
              <div className="flex justify-between items-center">
                <span>KiwiSaver Growth Funds:</span>
                <span className="font-medium">0.60% - 1.20%</span>
              </div>
              <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden">
                <div className="bg-yellow-500 h-1.5 rounded-full" style={{ width: '45%' }}></div>
              </div>
              
              <div className="flex justify-between items-center">
                <span>Actively Managed Funds:</span>
                <span className="font-medium">1.20% - 2.00%</span>
              </div>
              <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden">
                <div className="bg-red-500 h-1.5 rounded-full" style={{ width: '75%' }}></div>
              </div>
              
              <div className="flex justify-between items-center">
                <span>Your Management Fee:</span>
                <span className={`font-medium ${
                  managementFee <= 0.4 ? 'text-green-600' : 
                  managementFee <= 0.6 ? 'text-blue-600' : 
                  managementFee <= 1.2 ? 'text-yellow-600' : 'text-red-600'
                }`}>{managementFee}%</span>
              </div>
              <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden">
                <div className={`h-1.5 rounded-full ${
                  managementFee <= 0.4 ? 'bg-green-500' : 
                  managementFee <= 0.6 ? 'bg-blue-500' : 
                  managementFee <= 1.2 ? 'bg-yellow-500' : 'bg-red-500'
                }`} style={{ width: `${Math.min(managementFee * 100 / 2, 100)}%` }}></div>
              </div>
              
              <p className="text-xs text-gray-500 mt-2">
                <strong>Note:</strong> In recent years, New Zealand has seen significant fee decreases in KiwiSaver funds due to regulatory pressure and increased competition.
              </p>
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
      
      {hasCalculated && (
        <div className="mt-8 border-t border-gray-200 pt-6">
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

          {/* Key results boxes */}
          <div className="grid md:grid-cols-4 gap-4 mb-6">
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <p className="text-sm text-gray-500 mb-1">Investment Value</p>
              <p className="text-2xl font-bold">{formatCurrency(withFeesResult)}</p>
              <p className="text-xs text-gray-500 mt-2">Without fees: {formatCurrency(withoutFeesResult)}</p>
            </div>
            
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <p className="text-sm text-gray-500 mb-1">Total Fees Paid</p>
              <p className="text-2xl font-bold text-red-600">{formatCurrency(feesTotal)}</p>
              <p className="text-xs text-gray-500 mt-2">{formatPercentage(feePercentage)} of potential returns</p>
            </div>
            
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <div className="flex items-center">
                <p className="text-sm text-gray-500 mb-1">T-Rex Score</p>
                <button 
                  className="ml-1 text-gray-400 hover:text-gray-600 focus:outline-none"
                  onClick={() => setShowTooltip('trex')}
                >
                  <LucideIcons.HelpCircle size={12} />
                </button>
                {showTooltip === 'trex' && (
                  <div className="absolute z-10 mt-2 w-64 p-3 bg-gray-800 text-white text-xs rounded shadow-lg">
                    {tooltipContent.trex}
                    <button 
                      className="absolute top-1 right-1 text-white hover:text-gray-300"
                      onClick={() => setShowTooltip(null)}
                    >
                      <LucideIcons.X size={14} />
                    </button>
                  </div>
                )}
              </div>
              <p className="text-2xl font-bold">{formatPercentage(tRexScore)}</p>
              <p className="text-xs text-gray-500 mt-2">Portion of returns you keep</p>
            </div>
            
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <p className="text-sm text-gray-500 mb-1">Annual Fee Impact</p>
              <p className="text-2xl font-bold">{formatCurrency(feesTotal / investmentPeriod)}</p>
              <p className="text-xs text-gray-500 mt-2">Average per year</p>
            </div>
          </div>
          
          {/* Charts */}
          <div className="mt-8">
            <h3 className="text-xl font-semibold text-gray-700 mb-4">Investment Growth Over Time</h3>
            <div className="w-full h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={chartData}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="year" label={{ value: 'Years', position: 'insideBottomRight', offset: -10 }} />
                  <YAxis tickFormatter={(value) => `$${value.toLocaleString()}`} />
                  <Tooltip 
                    formatter={(value) => [`$${value.toLocaleString()}`, ""]}
                    labelFormatter={(label) => `Year ${label}`}
                  />
                  <Legend />
                  <Area type="monotone" dataKey="withoutFees" name="Without Fees" stroke="#4F46E5" fill="#C7D2FE" />
                  <Area type="monotone" dataKey="withFees" name="With Fees" stroke="#047857" fill="#D1FAE5" />
                  <Area type="monotone" dataKey="feesLost" name="Fees Paid" stroke="#DC2626" fill="#FEE2E2" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {savedScenarios.length > 0 && (
            <div className="mt-8">
              <h3 className="text-xl font-semibold text-gray-700 mb-4">Saved Scenarios</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Account</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Investment</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Period</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Fees</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">T-Rex Score</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Final Value</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {savedScenarios.map((scenario) => (
                      <tr key={scenario.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{scenario.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{scenario.accountType}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatCurrency(scenario.initialInvestment)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{scenario.investmentPeriod} years</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatCurrency(scenario.feesTotal)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatPercentage(scenario.tRexScore)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatCurrency(scenario.totalValue)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          
          {/* New Zealand-specific investment info */}
          <div className="mt-8 bg-gray-50 p-6 rounded-lg">
            <h3 className="text-lg font-medium text-gray-700 mb-4">New Zealand Tax-Efficient Investing</h3>
            
            <div className="space-y-4">
              <p>
                Understanding New Zealand's unique investment landscape and tax structure can help you optimize your long-term returns:
              </p>
              
              <div className="grid md:grid-cols-3 gap-4">
                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <h4 className="font-medium text-gray-800 mb-2">KiwiSaver</h4>
                  <ul className="text-sm text-gray-600 space-y-1 list-disc pl-5">
                    <li>Employer matching (minimum 3% of salary)</li>
                    <li>Annual government contribution up to $521.43</li>
                    <li>First home withdrawal benefits</li>
                    <li>Limited fund choices compared to other options</li>
                    <li>Locked in until retirement age (65) with exceptions</li>
                  </ul>
                </div>
                
                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <h4 className="font-medium text-gray-800 mb-2">PIE Funds</h4>
                  <ul className="text-sm text-gray-600 space-y-1 list-disc pl-5">
                    <li>Tax advantages - PIR rates capped at 28% vs 39% top rate</li>
                    <li>Wide range of fund options available</li>
                    <li>Access to your money when needed</li>
                    <li>No employer or government contributions</li>
                    <li>Still taxed within the fund (unlike some countries' tax-free accounts)</li>
                  </ul>
                </div>
                
                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <h4 className="font-medium text-gray-800 mb-2">Direct Investments</h4>
                  <ul className="text-sm text-gray-600 space-y-1 list-disc pl-5">
                    <li>No capital gains tax in New Zealand</li>
                    <li>Complete control over investment choices</li>
                    <li>Foreign investments may be subject to FIF tax rules</li>
                    <li>Dividend income taxed at marginal rates</li>
                    <li>May pay higher tax than PIE investments for high earners</li>
                  </ul>
                </div>
              </div>
              
              <p className="text-sm text-gray-600">
                <strong>Investment Strategy Tip:</strong> For most New Zealanders, maximizing KiwiSaver contributions to get employer and government benefits, then investing additional savings in low-cost PIE funds is an efficient approach to building wealth.
              </p>
              
              <div className="bg-white p-4 rounded-lg border border-gray-200 mt-4">
                <h4 className="font-medium text-gray-800 mb-2">New Zealand Low-Cost Investment Options</h4>
                <div className="text-sm text-gray-600 space-y-1">
                  <p>Consider these low-cost New Zealand investment options to minimize your fees:</p>
                  <ul className="list-disc pl-5 mt-2">
                    <li><strong>Simplicity:</strong> One of the lowest-cost KiwiSaver and investment fund providers (0.31% for Growth Fund)</li>
                    <li><strong>Kernel:</strong> Low-cost index funds with fees from 0.29% to 0.39%</li>
                    <li><strong>SuperLife:</strong> Diversified set of low-cost passive options</li>
                    <li><strong>InvestNow:</strong> Platform offering Vanguard funds with no platform fees</li>
                    <li><strong>Sharesies:</strong> Good for beginning investors with fractional shares (but watch transaction costs)</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      
      <div className="mt-8 bg-white p-6 rounded-lg">
        <h3 className="text-xl font-semibold text-gray-700 mb-4">Understanding Investment Fees in New Zealand</h3>
        
        <div className="prose max-w-none">
          <p>
            Investment fees in New Zealand, particularly for KiwiSaver funds, have been under increasing scrutiny and have generally decreased in recent years. Here's what you need to know about common fees in New Zealand:
          </p>
          
          <h4>Types of Investment Fees in New Zealand</h4>
          <ul>
            <li><strong>Management Fees:</strong> The primary fee charged by fund managers, typically ranging from 0.30% to 1.50% annually.</li>
            <li><strong>Administration Fees:</strong> Some providers charge a separate admin fee, often a fixed dollar amount (e.g., $30 per year).</li>
            <li><strong>Performance Fees:</strong> Some active funds charge additional fees for exceeding their benchmarks (typically 10-15% of outperformance).</li>
            <li><strong>Transaction Costs:</strong> The costs of buying and selling securities within the fund, not always explicitly disclosed.</li>
            <li><strong>Platform Fees:</strong> Charges for using investment platforms like InvestNow, Sharesies, or Hatch.</li>
            <li><strong>PIE Tax Costs:</strong> While not a fee, PIE taxation does reduce your effective returns.</li>
          </ul>
          
          <h4>The Impact of KiwiSaver Fees</h4>
          <p>
            The Financial Markets Authority (FMA) estimates that a difference of 0.5% in fees can reduce a KiwiSaver balance by approximately $100,000 over a 45-year working life. For a fund of $50,000, this represents around $250 per year in additional fees.
          </p>
          
          <h4>How to Minimize Investment Fees in New Zealand</h4>
          <ul>
            <li>Compare KiwiSaver providers using Sorted's KiwiSaver comparison tool</li>
            <li>Consider low-cost index fund providers like Simplicity, Kernel, or SuperLife</li>
            <li>Check your PIR rate is correct to avoid overpaying tax</li>
            <li>For larger investments, platforms with fixed dollar fees may be more cost-effective than percentage-based fees</li>
            <li>Be wary of financial advisors who recommend high-fee products that may pay them commissions</li>
            <li>Review and potentially switch KiwiSaver funds if you're paying high fees for underperforming funds</li>
          </ul>
          
          <h4>Recent Changes in New Zealand's Investment Fee Landscape</h4>
          <ul>
            <li><strong>KiwiSaver Fee Reductions:</strong> Many providers have reduced fees in response to regulatory pressure and competition</li>
            <li><strong>Default Provider Changes:</strong> The 2021 changes to default KiwiSaver providers enforced lower fees</li>
            <li><strong>Fee Disclosure:</strong> Increased transparency requirements make it easier to compare true costs</li>
            <li><strong>Value for Money:</strong> The FMA now requires KiwiSaver providers to demonstrate how their fees represent good value</li>
          </ul>
          
          <p>
            By making fee-conscious decisions when selecting your KiwiSaver and other investment providers, you can significantly increase your long-term returns and achieve a more comfortable retirement.
          </p>
        </div>
      </div>
      
      {/* Add the info box inside the component structure */}
      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0 pt-0.5">
            <LucideIcons.Info size={20} className="text-blue-500" />
          </div>
          <div className="ml-3">
            <h4 className="text-sm font-medium text-blue-800">About the New Zealand Calculator</h4>
            <div className="mt-2 text-sm text-blue-700">
              <p className="mb-2">
                This calculator incorporates New Zealand-specific features such as PIE taxation, KiwiSaver employer contributions, and local fund benchmarks.
              </p>
              <p>
                Disclaimer: This is a simulation tool and not financial advice. Actual results may vary due to market conditions, tax law changes, and other factors.
              </p>
            </div>
            <div className="mt-4">
              <a
                href="https://sorted.org.nz/guides/saving-and-investing/manage-your-kiwisaver/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-medium text-blue-600 hover:text-blue-500"
              >
                Learn more about KiwiSaver on Sorted.org.nz →
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NZFeeCalculator;