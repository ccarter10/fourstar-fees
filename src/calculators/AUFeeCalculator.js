import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from 'recharts';
import * as LucideIcons from 'lucide-react';
import { useRegion } from '../RegionContext';

const AUFeeCalculator = () => {
  const { formatCurrency, formatPercentage } = useRegion();

  // State for form inputs
  const [initialInvestment, setInitialInvestment] = useState(10000);
  const [annualContribution, setAnnualContribution] = useState(5000);
  const [investmentPeriod, setInvestmentPeriod] = useState(30);
  const [expectedReturn, setExpectedReturn] = useState(7);
  const [icr, setIcr] = useState(0.8); // Investment Cost Ratio
  const [adviceFee, setAdviceFee] = useState(0.5);
  const [tradingCosts, setTradingCosts] = useState(0.1);
  const [advancedMode, setAdvancedMode] = useState(false);
  const [showTooltip, setShowTooltip] = useState(null);

  // Australia Specific settings
  const [accountType, setAccountType] = useState('Super');
  const [includeCapitalGainsTax, setIncludeCapitalGainsTax] = useState(false);
  const [includeDividendTax, setIncludeDividendTax] = useState(false);
  const [taxBracket, setTaxBracket] = useState('medium'); // low, medium, high
  const [contributionSuperLimit, setContributionSuperLimit] = useState(27500); // 2025 estimate for concessional
  const [contributionNonConcessionalLimit, setContributionNonConcessionalLimit] = useState(110000); // 2025 estimate
  
  // Selected fund/provider preset
  const [selectedProvider, setSelectedProvider] = useState(null);
  
  // Australia Provider presets
  const providerPresets = [
    { name: "Vanguard Australia ETFs", icr: 0.15, tradingCosts: 0.1, adviceFee: 0 },
    { name: "BetaShares ETFs", icr: 0.25, tradingCosts: 0.1, adviceFee: 0 },
    { name: "iShares Australia", icr: 0.2, tradingCosts: 0.1, adviceFee: 0 },
    { name: "Perpetual", icr: 0.5, tradingCosts: 0.1, adviceFee: 0.8 },
    { name: "AMP", icr: 0.9, tradingCosts: 0, adviceFee: 0.5 },
    { name: "Industry Super Fund", icr: 0.7, tradingCosts: 0, adviceFee: 0 },
    { name: "Retail Super Fund", icr: 1.5, tradingCosts: 0, adviceFee: 0.5 },
    { name: "SMSF", icr: 0.2, tradingCosts: 0.2, adviceFee: 0.5 },
    { name: "Financial Advisor", icr: 0.7, tradingCosts: 0.1, adviceFee: 1.1 },
  ];
  
  // State for calculation results
  const [withoutFeesResult, setWithoutFeesResult] = useState(0);
  const [withFeesResult, setWithFeesResult] = useState(0);
  const [feesTotal, setFeesTotal] = useState(0);
  const [feePercentage, setFeePercentage] = useState(0);
  const [tRexScore, setTRexScore] = useState(0);
  const [chartData, setChartData] = useState([]);
  const [hasCalculated, setHasCalculated] = useState(false);
  const [scenarioName, setScenarioName] = useState('My Australian Investment');
  const [savedScenarios, setSavedScenarios] = useState([]);
  
  // Tax rates based on Australian tax brackets (2025 estimates)
  const taxRates = {
    low: { income: 19, frankedDividends: 4.5, capitalGains: 9.5 },
    medium: { income: 32.5, frankedDividends: 16.3, capitalGains: 16.3 },
    high: { income: 45, frankedDividends: 30, capitalGains: 22.5 }
  };

  // Apply provider preset
  const applyProviderPreset = (provider) => {
    setIcr(provider.icr);
    setTradingCosts(provider.tradingCosts);
    setAdviceFee(provider.adviceFee);
    setSelectedProvider(provider.name);
  };

  // Calculate investment growth
  const calculateGrowth = () => {
    // Calculate total fee percentage
    let totalFeePercentage = icr;
    
    if (advancedMode) {
      totalFeePercentage += adviceFee + tradingCosts;
    }
    
    // Tax drag calculations for non-super accounts
    let taxDrag = 0;
    
    if (accountType === 'Personal' && (includeDividendTax || includeCapitalGainsTax)) {
      // Simplified tax drag calculation for non-registered accounts
      
      if (includeDividendTax) {
        // Assume 4% dividend yield with 100% franking credits
        const dividendYield = 4;
        const frankedPortion = 0.8; // 80% of dividends are franked
        const dividendTaxRate = taxRates[taxBracket].frankedDividends / 100;
        const dividendTaxDrag = dividendYield * frankedPortion * dividendTaxRate;
        taxDrag += dividendTaxDrag;
      }
      
      if (includeCapitalGainsTax) {
        // In Australia, 50% discount on capital gains for assets held > 12 months
        // Assume 20% of portfolio is sold each year with 50% being gains
        const turnoverRate = 0.2;
        const gainPercentage = 0.5;
        const discountRate = 0.5; // 50% CGT discount
        const capitalGainsTaxRate = taxRates[taxBracket].income / 100;
        const cgtDrag = turnoverRate * gainPercentage * discountRate * capitalGainsTaxRate * expectedReturn;
        taxDrag += cgtDrag;
      }
      
      totalFeePercentage += taxDrag;
    }
    
    // Check contribution limits for superannuation
    let yearlyContribution = annualContribution;
    if (accountType === 'Super') {
      yearlyContribution = Math.min(annualContribution, contributionSuperLimit);
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
      icr,
      adviceFee: advancedMode ? adviceFee : 0,
      tradingCosts: advancedMode ? tradingCosts : 0,
      taxBracket: accountType === 'Personal' ? taxBracket : null,
      includeDividendTax: accountType === 'Personal' ? includeDividendTax : false,
      includeCapitalGainsTax: accountType === 'Personal' ? includeCapitalGainsTax : false,
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
    setScenarioName(`My Australian ${accountType} Investment`);
  }, [accountType]);

  // Tooltip content for Australian calculator
  const tooltipContent = {
    icr: "Investment Cost Ratio (ICR) is the annual fee charged by funds to cover operating expenses, expressed as a percentage of assets.",
    adviceFee: "Fee charged by financial advisors for investment management and advice.",
    tradingCosts: "Costs associated with buying and selling securities, including brokerage fees and spreads.",
    accountType: "Different account types have different tax treatment in Australia. Superannuation offers tax advantages, while personal investments are subject to capital gains and dividend taxes.",
    superLimit: "The maximum annual concessional contribution allowed to Super funds. For 2025, this is estimated at $27,500.",
    nonConcessionalLimit: "The maximum annual non-concessional (after-tax) contribution allowed to Super funds. For 2025, this is estimated at $110,000.",
    capitalGainsTax: "In Australia, assets held longer than 12 months receive a 50% discount on capital gains tax.",
    dividendTax: "Franked dividends include tax credits (franking credits) that offset the tax you pay on the dividend income.",
    taxBracket: "Your income tax bracket affects the rate of tax you pay on dividends and capital gains.",
    trex: "The T-Rex Score, developed by Larry Bates, shows what percentage of your potential returns you keep after fees. Higher is better!"
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-gray-800">Australian Investment Fee Calculator</h2>
        
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
          placeholder="e.g., My Super Plan"
        />
      </div>
      
      {/* Australian Account Type Selector */}
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
            onClick={() => setAccountType('Super')}
            className={`p-2 text-sm border rounded-md ${
              accountType === 'Super'
                ? 'border-black bg-gray-100'
                : 'border-gray-300 hover:border-gray-400'
            }`}
          >
            Superannuation
          </button>
          <button
            onClick={() => setAccountType('SMSF')}
            className={`p-2 text-sm border rounded-md ${
              accountType === 'SMSF'
                ? 'border-black bg-gray-100'
                : 'border-gray-300 hover:border-gray-400'
            }`}
          >
            SMSF
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
          Select Fund Provider or Type
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
              setIcr(0.8);
              setAdviceFee(0.5);
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
          <div>
            <label htmlFor="annualContribution" className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
              Annual Contribution
              {(accountType === 'Super' || accountType === 'SMSF') && (
                <button 
                  className="ml-1 text-gray-400 hover:text-gray-600 focus:outline-none"
                  onClick={() => setShowTooltip('superLimit')}
                >
                  <LucideIcons.HelpCircle size={16} />
                </button>
              )}
            </label>
            {showTooltip === 'superLimit' && (
              <div className="absolute z-10 mt-2 w-64 p-3 bg-gray-800 text-white text-xs rounded shadow-lg">
                {tooltipContent.superLimit}
                <button 
                  className="absolute top-1 right-1 text-white hover:text-gray-300"
                  onClick={() => setShowTooltip(null)}
                >
                  <LucideIcons.X size={14} />
                </button>
              </div>
            )}
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
            {(accountType === 'Super' || accountType === 'SMSF') && annualContribution > contributionSuperLimit && (
              <p className="mt-1 text-xs text-yellow-600">
                Contribution exceeds annual Super concessional limit of {formatCurrency(contributionSuperLimit)}. Calculations will use the maximum allowed contribution.
              </p>
            )}
          </div>
          
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
          
          {/* Personal investment specific tax settings */}
          {accountType === 'Personal' && advancedMode && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-md font-medium text-gray-700 mb-3">Tax Settings</h3>
              
              <div className="space-y-3">
                <div>
                  <label htmlFor="taxBracket" className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                    Tax Bracket
                    <button 
                      className="ml-1 text-gray-400 hover:text-gray-600 focus:outline-none"
                      onClick={() => setShowTooltip('taxBracket')}
                    >
                      <LucideIcons.HelpCircle size={16} />
                    </button>
                  </label>
                  {showTooltip === 'taxBracket' && (
                    <div className="absolute z-10 mt-2 w-64 p-3 bg-gray-800 text-white text-xs rounded shadow-lg">
                      {tooltipContent.taxBracket}
                      <button 
                        className="absolute top-1 right-1 text-white hover:text-gray-300"
                        onClick={() => setShowTooltip(null)}
                      >
                        <LucideIcons.X size={14} />
                      </button>
                    </div>
                  )}
                  <select
                    id="taxBracket"
                    className="focus:ring-black focus:border-black block w-full sm:text-sm border-gray-300 rounded-md p-2 border"
                    value={taxBracket}
                    onChange={(e) => setTaxBracket(e.target.value)}
                  >
                    <option value="low">Low (19% bracket)</option>
                    <option value="medium">Medium (32.5% bracket)</option>
                    <option value="high">High (45% bracket)</option>
                  </select>
                </div>
                
                <div className="flex items-center">
                  <input
                    id="includeDividendTax"
                    type="checkbox"
                    className="h-4 w-4 text-black focus:ring-black border-gray-300 rounded"
                    checked={includeDividendTax}
                    onChange={(e) => setIncludeDividendTax(e.target.checked)}
                  />
                  <label htmlFor="includeDividendTax" className="ml-2 block text-sm text-gray-700 flex items-center">
                    Include Dividend Tax Impact
                    <button 
                      className="ml-1 text-gray-400 hover:text-gray-600 focus:outline-none"
                      onClick={() => setShowTooltip('dividendTax')}
                    >
                      <LucideIcons.HelpCircle size={16} />
                    </button>
                  </label>
                </div>
                
                <div className="flex items-center">
                  <input
                    id="includeCapitalGainsTax"
                    type="checkbox"
                    className="h-4 w-4 text-black focus:ring-black border-gray-300 rounded"
                    checked={includeCapitalGainsTax}
                    onChange={(e) => setIncludeCapitalGainsTax(e.target.checked)}
                  />
                  <label htmlFor="includeCapitalGainsTax" className="ml-2 block text-sm text-gray-700 flex items-center">
                    Include Capital Gains Tax Impact
                    <button 
                      className="ml-1 text-gray-400 hover:text-gray-600 focus:outline-none"
                      onClick={() => setShowTooltip('capitalGainsTax')}
                    >
                      <LucideIcons.HelpCircle size={16} />
                    </button>
                  </label>
                </div>
                
                <div className="pt-2 text-xs text-gray-500">
                  <p>Australian Tax Rates:</p>
                  <ul className="list-disc pl-5 space-y-1 mt-1">
                    <li>Franked Dividends (effective): {taxRates[taxBracket].frankedDividends}% (after franking credits)</li>
                    <li>Capital Gains: {taxRates[taxBracket].capitalGains}% (with 50% discount for assets held &gt;12 months)</li>
                  </ul>
                </div>
              </div>
            </div>
          )}
          
          {/* Account type benefits summary */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-md font-medium text-gray-700 mb-2">Australian Account Type Benefits</h3>
            
            <div className="space-y-2 text-sm">
              {accountType === 'Super' && (
                <>
                  <p className="flex items-center">
                    <LucideIcons.Check className="text-green-500 mr-2" size={16} />
                    15% tax on concessional contributions (instead of marginal rate)
                  </p>
                  <p className="flex items-center">
                    <LucideIcons.Check className="text-green-500 mr-2" size={16} />
                    15% tax on investment earnings
                  </p>
                  <p className="flex items-center">
                    <LucideIcons.Check className="text-green-500 mr-2" size={16} />
                    Tax-free withdrawals after age 60
                  </p>
                  <p className="flex items-center">
                    <LucideIcons.Minus className="text-red-500 mr-2" size={16} />
                    Cannot access until preservation age (typically 60)
                  </p>
                </>
              )}
              
              {accountType === 'SMSF' && (
                <>
                  <p className="flex items-center">
                    <LucideIcons.Check className="text-green-500 mr-2" size={16} />
                    Same tax benefits as regular super funds
                  </p>
                  <p className="flex items-center">
                    <LucideIcons.Check className="text-green-500 mr-2" size={16} />
                    Complete control over investment choices
                  </p>
                  <p className="flex items-center">
                    <LucideIcons.Check className="text-green-500 mr-2" size={16} />
                    Potential for lower fees with larger balances
                  </p>
                  <p className="flex items-center">
                    <LucideIcons.Minus className="text-red-500 mr-2" size={16} />
                    Annual compliance and administrative costs
                  </p>
                </>
              )}
              
              {accountType === 'Personal' && (
                <>
                  <p className="flex items-center">
                    <LucideIcons.Check className="text-green-500 mr-2" size={16} />
                    No contribution limits
                  </p>
                  <p className="flex items-center">
                    <LucideIcons.Check className="text-green-500 mr-2" size={16} />
                    Complete liquidity and accessibility
                  </p>
                  <p className="flex items-center">
                    <LucideIcons.Check className="text-green-500 mr-2" size={16} />
                    50% capital gains discount for assets held &gt;12 months
                  </p>
                  <p className="flex items-center">
                    <LucideIcons.Minus className="text-red-500 mr-2" size={16} />
                    Income and gains taxed at marginal rates
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
              <label htmlFor="icr" className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                Investment Cost Ratio (%)
                <button 
                  className="ml-1 text-gray-400 hover:text-gray-600 focus:outline-none"
                  onClick={() => setShowTooltip('icr')}
                >
                  <LucideIcons.HelpCircle size={16} />
                </button>
              </label>
              {showTooltip === 'icr' && (
                <div className="absolute z-10 mt-2 w-64 p-3 bg-gray-800 text-white text-xs rounded shadow-lg">
                  {tooltipContent.icr}
                  <button 
                    className="absolute top-1 right-1 text-white hover:text-gray-300"
                    onClick={() => setShowTooltip(null)}
                  >
                    <LucideIcons.X size={14} />
                  </button>
                </div>
              )}
              <div className="absolute z-10 mt-2 w-64 p-3 bg-gray-800 text-white text-xs rounded shadow-lg">
                  {tooltipContent.icr}
                  <button 
                    className="absolute top-1 right-1 text-white hover:text-gray-300"
                    onClick={() => setShowTooltip(null)}
                  >
                    <LucideIcons.X size={14} />
                  </button>
                </div>
              
            </div>
            <div className="relative mt-1 rounded-md shadow-sm">
              <input
                type="number"
                id="icr"
                className="focus:ring-black focus:border-black block w-full pr-12 sm:text-sm border-gray-300 rounded-md p-2 border"
                value={icr}
                onChange={(e) => setIcr(Number(e.target.value))}
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
                  <label htmlFor="adviceFee" className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                    Advice Fee (%)
                    <button 
                      className="ml-1 text-gray-400 hover:text-gray-600 focus:outline-none"
                      onClick={() => setShowTooltip('adviceFee')}
                    >
                      <LucideIcons.HelpCircle size={16} />
                    </button>
                  </label>
                  {showTooltip === 'adviceFee' && (
                    <div className="absolute z-10 mt-2 w-64 p-3 bg-gray-800 text-white text-xs rounded shadow-lg">
                      {tooltipContent.adviceFee}
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
                    id="adviceFee"
                    className="focus:ring-black focus:border-black block w-full pr-12 sm:text-sm border-gray-300 rounded-md p-2 border"
                    value={adviceFee}
                    onChange={(e) => setAdviceFee(Number(e.target.value))}
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
            <h3 className="text-md font-medium text-gray-700 mb-4">Australian Fund Fee Benchmarks</h3>
            
            <div className="space-y-3 text-sm">
              <div className="flex justify-between items-center">
                <span>Low-cost ETFs:</span>
                <span className="font-medium">0.05% - 0.25%</span>
              </div>
              <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden">
                <div className="bg-green-500 h-1.5 rounded-full" style={{ width: '10%' }}></div>
              </div>
              
              <div className="flex justify-between items-center">
                <span>Industry Super Funds:</span>
                <span className="font-medium">0.6% - 1.0%</span>
              </div>
              <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden">
                <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: '30%' }}></div>
              </div>
              
              <div className="flex justify-between items-center">
                <span>Retail Super Funds:</span>
                <span className="font-medium">1.0% - 2.0%</span>
              </div>
              <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden">
                <div className="bg-yellow-500 h-1.5 rounded-full" style={{ width: '60%' }}></div>
              </div>
              
              <div className="flex justify-between items-center">
                <span>Actively Managed Funds:</span>
                <span className="font-medium">1.5% - 2.5%</span>
              </div>
              <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden">
                <div className="bg-red-500 h-1.5 rounded-full" style={{ width: '80%' }}></div>
              </div>
              
              <div className="flex justify-between items-center">
                <span>Your ICR:</span>
                <span className={`font-medium ${
                  icr <= 0.25 ? 'text-green-600' : 
                  icr <= 0.8 ? 'text-blue-600' : 
                  icr <= 1.5 ? 'text-yellow-600' : 'text-red-600'
                }`}>{icr}%</span>
              </div>
              <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden">
                <div className={`h-1.5 rounded-full ${
                  icr <= 0.25 ? 'bg-green-500' : 
                  icr <= 0.8 ? 'bg-blue-500' : 
                  icr <= 1.5 ? 'bg-yellow-500' : 'bg-red-500'
                }`} style={{ width: `${Math.min(icr * 100 / 2.5, 100)}%` }}></div>
              </div>
              
              <p className="text-xs text-gray-500 mt-2">
                <strong>Note:</strong> Australia's superannuation system has some of the highest fees in the OECD. Low-cost options can significantly boost your retirement savings.
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
          
          {/* Australian-specific investment info */}
          <div className="mt-8 bg-gray-50 p-6 rounded-lg">
            <h3 className="text-lg font-medium text-gray-700 mb-4">Australian Tax-Efficient Investing</h3>
            
            <div className="space-y-4">
              <p>
                Making the most of Australia's tax-advantaged accounts and understanding superannuation can significantly improve your long-term investment returns:
              </p>
              
              <div className="grid md:grid-cols-3 gap-4">
                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <h4 className="font-medium text-gray-800 mb-2">Superannuation</h4>
                  <ul className="text-sm text-gray-600 space-y-1 list-disc pl-5">
                    <li>Concessional (pre-tax) contributions: ${contributionSuperLimit} annually</li>
                    <li>Non-concessional contributions: ${contributionNonConcessionalLimit} annually</li>
                    <li>15% tax on contributions and earnings (vs. marginal rates)</li>
                    <li>Tax-free withdrawals after age 60</li>
                    <li>Employer contributions of 11.5% (Superannuation Guarantee)</li>
                  </ul>
                </div>
                
                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <h4 className="font-medium text-gray-800 mb-2">SMSF (Self-Managed Super Fund)</h4>
                  <ul className="text-sm text-gray-600 space-y-1 list-disc pl-5">
                    <li>Same contribution limits as regular super</li>
                    <li>Full control over investments</li>
                    <li>Potentially cost-effective for balances &gt;$200,000</li>
                    <li>Annual compliance and audit requirements</li>
                    <li>Can invest in property, shares, or managed funds</li>
                  </ul>
                </div>
                
                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <h4 className="font-medium text-gray-800 mb-2">Personal Investments</h4>
                  <ul className="text-sm text-gray-600 space-y-1 list-disc pl-5">
                    <li>50% CGT discount for assets held &gt;12 months</li>
                    <li>Franking credits on Australian dividends</li>
                    <li>No contribution limits</li>
                    <li>Full access to funds at any time</li>
                    <li>Capital losses can offset capital gains</li>
                  </ul>
                </div>
              </div>
              
              <p className="text-sm text-gray-600">
                <strong>Investment Strategy Tip:</strong> In Australia, it's generally most tax-efficient to maximize your superannuation contributions (especially concessional contributions) before investing in personal accounts. Consider salary sacrificing to super to reduce your taxable income.
              </p>
              
              <div className="bg-white p-4 rounded-lg border border-gray-200 mt-4">
                <h4 className="font-medium text-gray-800 mb-2">Australian Low-Cost Investment Options</h4>
                <div className="text-sm text-gray-600 space-y-1">
                  <p>Consider these low-cost Australian investment options to minimize your fees:</p>
                  <ul className="list-disc pl-5 mt-2">
                    <li><strong>ETFs:</strong> Vanguard Australian Shares (VAS, 0.10% ICR), Vanguard International Shares (VGS, 0.18% ICR)</li>
                    <li><strong>LICs:</strong> Australian Foundation Investment Company (AFIC, 0.14% ICR), Argo Investments (0.15% ICR)</li>
                    <li><strong>Industry Super Funds:</strong> Australian Super (0.6-0.7% ICR), Hostplus (0.7-0.8% ICR), REST Super (0.7-0.9% ICR)</li>
                    <li><strong>Index Funds:</strong> Vanguard Index Funds, direct indexing platforms like Stockspot (0.5-0.9% total fees)</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <div className="mt-8 bg-white p-6 rounded-lg">
        <h3 className="text-xl font-semibold text-gray-700 mb-4">Understanding Investment Fees in Australia</h3>
        
        <div className="prose max-w-none">
          <p>
            Investment fees in Australia, especially in superannuation, can significantly impact your long-term returns. Here's what you need to know about common fees in Australian investment accounts:
          </p>
          
          <h4>Types of Investment Fees in Australia</h4>
          <ul>
            <li><strong>Investment Cost Ratio (ICR):</strong> The annual fee charged by super funds and managed funds, ranging from as low as 0.10% for index ETFs to over 2% for some retail super funds.</li>
            <li><strong>Administration Fees:</strong> Charged by super funds to cover account maintenance, often as a fixed dollar amount plus a percentage-based fee.</li>
            <li><strong>Advice Fees:</strong> Additional fees charged by financial advisors, typically 0.5% to 1.1% annually.</li>
            <li><strong>Brokerage Fees:</strong> Trading commissions when buying or selling shares, typically $10 to $30 per trade or 0.1% to 0.5% for larger trades.</li>
            <li><strong>Performance Fees:</strong> Additional fees charged by some funds when they exceed certain performance benchmarks, often 15-20% of outperformance.</li>
            <li><strong>Insurance Premiums:</strong> Many super funds include default insurance that reduces your balance over time.</li>
          </ul>
          
          <h4>The Impact of Australian Super Fees</h4>
          <p>
            The Productivity Commission has found that a 0.5% difference in fees can reduce a typical Australian's retirement balance by approximately 12% over their working life. For someone with a $500,000 super balance, this could mean $60,000 less in retirement.
          </p>
          
          <h4>How to Minimize Investment Fees in Australia</h4>
          <ul>
            <li>Compare super funds using the ATO's YourSuper comparison tool to find low-fee options</li>
            <li>Consider industry super funds, which typically have lower fees than retail funds</li>
            <li>For personal investments, use low-cost ETFs or LICs instead of actively managed funds</li>
            <li>Consider an SMSF only if your balance is large enough (typically &gt;$200,000) to justify the fixed costs</li>
            <li>Review your insurance coverage within super and adjust or opt-out if inappropriate</li>
            <li>Consolidate multiple super accounts to avoid paying duplicate fees</li>
          </ul>
          
          <h4>Major Australian Low-Cost Investment Platforms</h4>
          <ul>
            <li><strong>SelfWealth:</strong> Flat $9.50 brokerage fee for ASX trades</li>
            <li><strong>Superhero:</strong> $5 brokerage for ASX-listed securities</li>
            <li><strong>Pearler:</strong> $9.50 per trade with free ETF purchases in autoinvest</li>
            <li><strong>CommSec Pocket:</strong> $2 brokerage for trades up to $1,000 on selected ETFs</li>
            <li><strong>Stake:</strong> $3 brokerage for ASX trades</li>
          </ul>
          
          <p>
            By being fee-conscious and making informed choices, you can significantly increase your retirement savings and investment returns over your lifetime.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AUFeeCalculator;