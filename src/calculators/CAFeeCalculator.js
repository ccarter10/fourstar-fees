import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from 'recharts';
import * as LucideIcons from 'lucide-react';
import { useRegion } from '../RegionContext';

const CAFeeCalculator = () => {
  const { formatCurrency, formatPercentage } = useRegion();

  // State for form inputs
  const [initialInvestment, setInitialInvestment] = useState(10000);
  const [annualContribution, setAnnualContribution] = useState(5000);
  const [investmentPeriod, setInvestmentPeriod] = useState(30);
  const [expectedReturn, setExpectedReturn] = useState(7);
  const [merFee, setMerFee] = useState(0.5);
  const [advisoryFee, setAdvisoryFee] = useState(1);
  const [tradingCosts, setTradingCosts] = useState(0.1);
  const [advancedMode, setAdvancedMode] = useState(false);
  const [showTooltip, setShowTooltip] = useState(null);
  
  // Canada Specific settings
  const [accountType, setAccountType] = useState('TFSA');
  const [includeCapitalGainsTax, setIncludeCapitalGainsTax] = useState(false);
  const [includeDividendTax, setIncludeDividendTax] = useState(false);
  const [taxBracket, setTaxBracket] = useState('medium'); // low, medium, high
  const [contributionRRSPLimit, setContributionRRSPLimit] = useState(31250); // 2025 estimate
  const [contributionTFSALimit, setContributionTFSALimit] = useState(7000); // 2025 estimate
  const [contributionFHSALimit, setContributionFHSALimit] = useState(8000); // First Home Savings Account limit
  
  // Selected fund/provider preset
  const [selectedProvider, setSelectedProvider] = useState(null);
  
  // Canada Provider presets
  const providerPresets = [
    { name: "Vanguard Canada ETFs", merFee: 0.09, tradingCosts: 0.1, advisoryFee: 0 },
    { name: "BlackRock iShares ETFs", merFee: 0.10, tradingCosts: 0.1, advisoryFee: 0 },
    { name: "BMO ETFs", merFee: 0.12, tradingCosts: 0.1, advisoryFee: 0 },
    { name: "Horizons ETFs", merFee: 0.15, tradingCosts: 0.1, advisoryFee: 0 },
    { name: "TD e-Series Funds", merFee: 0.35, tradingCosts: 0, advisoryFee: 0 },
    { name: "Robo-Advisor", merFee: 0.20, tradingCosts: 0, advisoryFee: 0.50 },
    { name: "Big Bank Mutual Funds", merFee: 1.5, tradingCosts: 0, advisoryFee: 0.50 },
    { name: "Financial Advisor", merFee: 1.0, tradingCosts: 0, advisoryFee: 1.25 },
    { name: "Average Canadian Mutual Fund", merFee: 2.0, tradingCosts: 0, advisoryFee: 0 },
  ];
  
  // State for calculation results
  const [withoutFeesResult, setWithoutFeesResult] = useState(0);
  const [withFeesResult, setWithFeesResult] = useState(0);
  const [feesTotal, setFeesTotal] = useState(0);
  const [feePercentage, setFeePercentage] = useState(0);
  const [tRexScore, setTRexScore] = useState(0);
  const [chartData, setChartData] = useState([]);
  const [hasCalculated, setHasCalculated] = useState(false);
  const [scenarioName, setScenarioName] = useState('My Canadian Investment');
  const [savedScenarios, setSavedScenarios] = useState([]);
  
  // Tax rates based on Canadian tax brackets (2025 estimates)
  const taxRates = {
    low: { income: 20.5, dividendEligible: 7.56, capitalGains: 10.25 },
    medium: { income: 30.5, dividendEligible: 17.39, capitalGains: 15.25 },
    high: { income: 45, dividendEligible: 29.52, capitalGains: 22.5 }
  };

  // Apply provider preset
  const applyProviderPreset = (provider) => {
    setMerFee(provider.merFee);
    setTradingCosts(provider.tradingCosts);
    setAdvisoryFee(provider.advisoryFee);
    setSelectedProvider(provider.name);
  };

  // Calculate investment growth
  const calculateGrowth = () => {
    // Calculate total fee percentage
    let totalFeePercentage = merFee;
    
    if (advancedMode) {
      totalFeePercentage += advisoryFee + tradingCosts;
    }
    
    // Tax drag calculations for non-registered accounts
    let taxDrag = 0;
    
    if (accountType === 'Non-Registered' && (includeDividendTax || includeCapitalGainsTax)) {
      // Simplified tax drag calculation for non-registered accounts
      
      if (includeDividendTax) {
        // Assume 2.5% dividend yield taxed at dividend rate
        const dividendYield = 2.5;
        const dividendTaxRate = taxRates[taxBracket].dividendEligible / 100;
        const dividendTaxDrag = dividendYield * dividendTaxRate;
        taxDrag += dividendTaxDrag;
      }
      
      if (includeCapitalGainsTax) {
        // In Canada, only 50% of capital gains are taxable
        // Assume 20% of portfolio is sold each year with 50% being gains
        const turnoverRate = 0.2;
        const gainPercentage = 0.5;
        const inclusionRate = 0.5; // 50% of capital gains are taxable
        const capitalGainsTaxRate = taxRates[taxBracket].income / 100;
        const cgtDrag = turnoverRate * gainPercentage * inclusionRate * capitalGainsTaxRate * expectedReturn;
        taxDrag += cgtDrag;
      }
      
      totalFeePercentage += taxDrag;
    }
    
    // Check contribution limits for tax-advantaged accounts
    let yearlyContribution = annualContribution;
    if (accountType === 'RRSP') {
      yearlyContribution = Math.min(annualContribution, contributionRRSPLimit);
    } else if (accountType === 'TFSA') {
      yearlyContribution = Math.min(annualContribution, contributionTFSALimit);
    } else if (accountType === 'FHSA') {
      yearlyContribution = Math.min(annualContribution, contributionFHSALimit);
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
      merFee,
      advisoryFee: advancedMode ? advisoryFee : 0,
      tradingCosts: advancedMode ? tradingCosts : 0,
      taxBracket: accountType === 'Non-Registered' ? taxBracket : null,
      includeDividendTax: accountType === 'Non-Registered' ? includeDividendTax : false,
      includeCapitalGainsTax: accountType === 'Non-Registered' ? includeCapitalGainsTax : false,
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
    setScenarioName(`My Canadian ${accountType} Investment`);
  }, [accountType]);

  // Tooltip content for Canadian calculator
  const tooltipContent = {
    merFee: "Management Expense Ratio (MER) is the annual fee charged by funds to cover operating expenses, expressed as a percentage of assets.",
    advisoryFee: "Annual fee charged by financial advisors or robo-advisors for investment management and advice.",
    tradingCosts: "Costs associated with buying and selling securities, including commissions and bid-ask spreads.",
    accountType: "Different account types have different tax treatment in Canada. TFSA and RRSP accounts offer tax advantages, while non-registered accounts are subject to capital gains and dividend taxes.",
    rrspLimit: "The maximum annual contribution allowed to RRSP plans. For 2025, this is estimated at 18% of your previous year's earned income up to a maximum of $31,250.",
    tfsaLimit: "The maximum annual contribution allowed to TFSA accounts. For 2025, this is estimated at $7,000.",
    fhsaLimit: "The maximum annual contribution allowed to First Home Savings Account. For 2025, this is $8,000 with a lifetime limit of $40,000.",
    capitalGainsTax: "In Canada, 50% of capital gains are taxable at your marginal income tax rate.",
    dividendTax: "Dividend tax applied to Canadian dividends, with a dividend tax credit that reduces the effective tax rate.",
    taxBracket: "Your income tax bracket affects the rate of tax you pay on dividends and capital gains.",
    trex: "The T-Rex Score, developed by Larry Bates, shows what percentage of your potential returns you keep after fees. Higher is better!"
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-gray-800">Canadian Investment Fee Calculator</h2>
        
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
          placeholder="e.g., My TFSA Plan"
        />
      </div>
      
      {/* Canadian Account Type Selector */}
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
            onClick={() => setAccountType('TFSA')}
            className={`p-2 text-sm border rounded-md ${
              accountType === 'TFSA'
                ? 'border-black bg-gray-100'
                : 'border-gray-300 hover:border-gray-400'
            }`}
          >
            TFSA
          </button>
          <button
            onClick={() => setAccountType('RRSP')}
            className={`p-2 text-sm border rounded-md ${
              accountType === 'RRSP'
                ? 'border-black bg-gray-100'
                : 'border-gray-300 hover:border-gray-400'
            }`}
          >
            RRSP
          </button>
          <button
            onClick={() => setAccountType('Non-Registered')}
            className={`p-2 text-sm border rounded-md ${
              accountType === 'Non-Registered'
                ? 'border-black bg-gray-100'
                : 'border-gray-300 hover:border-gray-400'
            }`}
          >
            Non-Registered
          </button>
          <button
            onClick={() => setAccountType('FHSA')}
            className={`p-2 text-sm border rounded-md ${
              accountType === 'FHSA'
                ? 'border-black bg-gray-100'
                : 'border-gray-300 hover:border-gray-400'
            }`}
          >
            FHSA
          </button>
          <button
            onClick={() => setAccountType('RESP')}
            className={`p-2 text-sm border rounded-md ${
              accountType === 'RESP'
                ? 'border-black bg-gray-100'
                : 'border-gray-300 hover:border-gray-400'
            }`}
          >
            RESP
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
              setMerFee(0.5);
              setAdvisoryFee(1);
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
              {(accountType === 'RRSP' || accountType === 'TFSA' || accountType === 'FHSA') && (
                <button 
                  className="ml-1 text-gray-400 hover:text-gray-600 focus:outline-none"
                  onClick={() => setShowTooltip(
                    accountType === 'RRSP' ? 'rrspLimit' : 
                    accountType === 'TFSA' ? 'tfsaLimit' : 'fhsaLimit'
                  )}
                >
                  <LucideIcons.HelpCircle size={16} />
                </button>
              )}
            </label>
            {(showTooltip === 'rrspLimit' || showTooltip === 'tfsaLimit' || showTooltip === 'fhsaLimit') && (
              <div className="absolute z-10 mt-2 w-64 p-3 bg-gray-800 text-white text-xs rounded shadow-lg">
                {tooltipContent[showTooltip]}
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
            {accountType === 'RRSP' && annualContribution > contributionRRSPLimit && (
              <p className="mt-1 text-xs text-yellow-600">
                Contribution exceeds annual RRSP limit of {formatCurrency(contributionRRSPLimit)}. Calculations will use the maximum allowed contribution.
              </p>
            )}
            {accountType === 'TFSA' && annualContribution > contributionTFSALimit && (
              <p className="mt-1 text-xs text-yellow-600">
                Contribution exceeds annual TFSA limit of {formatCurrency(contributionTFSALimit)}. Calculations will use the maximum allowed contribution.
              </p>
            )}
            {accountType === 'FHSA' && annualContribution > contributionFHSALimit && (
              <p className="mt-1 text-xs text-yellow-600">
                Contribution exceeds annual FHSA limit of {formatCurrency(contributionFHSALimit)}. Calculations will use the maximum allowed contribution.
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
          
          {/* Non-Registered specific tax settings */}
          {accountType === 'Non-Registered' && advancedMode && (
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
                    <option value="low">Low (20.5% bracket)</option>
                    <option value="medium">Medium (30.5% bracket)</option>
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
                  <p>Canadian Tax Rates:</p>
                  <ul className="list-disc pl-5 space-y-1 mt-1">
                    <li>Eligible Dividends: {taxRates[taxBracket].dividendEligible}% (effective rate after dividend tax credit)</li>
                    <li>Capital Gains: {taxRates[taxBracket].capitalGains}% (only 50% of gains are taxable)</li>
                  </ul>
                </div>
              </div>
            </div>
          )}
          
          {/* Account type benefits summary */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-md font-medium text-gray-700 mb-2">Canadian Account Type Benefits</h3>
            
            <div className="space-y-2 text-sm">
              {accountType === 'TFSA' && (
                <>
                  <p className="flex items-center">
                    <LucideIcons.Check className="text-green-500 mr-2" size={16} />
                    Tax-free growth and withdrawals
                  </p>
                  <p className="flex items-center">
                    <LucideIcons.Check className="text-green-500 mr-2" size={16} />
                    Flexible withdrawals without tax penalties
                  </p>
                  <p className="flex items-center">
                    <LucideIcons.Check className="text-green-500 mr-2" size={16} />
                    Withdrawn amounts add back to contribution room
                  </p>
                  <p className="flex items-center">
                    <LucideIcons.Minus className="text-red-500 mr-2" size={16} />
                    Contributions are not tax-deductible
                  </p>
                </>
              )}
              
              {accountType === 'RRSP' && (
                <>
                  <p className="flex items-center">
                    <LucideIcons.Check className="text-green-500 mr-2" size={16} />
                    Tax-deductible contributions reduce taxable income
                  </p>
                  <p className="flex items-center">
                    <LucideIcons.Check className="text-green-500 mr-2" size={16} />
                    Tax-deferred growth until withdrawal
                  </p>
                  <p className="flex items-center">
                    <LucideIcons.Check className="text-green-500 mr-2" size={16} />
                    First-time Home Buyers' Plan and Lifelong Learning Plan options
                  </p>
                  <p className="flex items-center">
                    <LucideIcons.Minus className="text-red-500 mr-2" size={16} />
                    Withdrawals are fully taxable as income
                  </p>
                </>
              )}
              
              {accountType === 'Non-Registered' && (
                <>
                  <p className="flex items-center">
                    <LucideIcons.Check className="text-green-500 mr-2" size={16} />
                    No contribution limits
                  </p>
                  <p className="flex items-center">
                    <LucideIcons.Check className="text-green-500 mr-2" size={16} />
                    Complete liquidity and flexibility
                  </p>
                  <p className="flex items-center">
                    <LucideIcons.Check className="text-green-500 mr-2" size={16} />
                    Capital losses can offset capital gains for tax purposes
                  </p>
                  <p className="flex items-center">
                    <LucideIcons.Minus className="text-red-500 mr-2" size={16} />
                    No tax advantages for contributions or growth
                  </p>
                  <p className="flex items-center">
                    <LucideIcons.Minus className="text-red-500 mr-2" size={16} />
                    Dividends and capital gains are taxable
                  </p>
                </>
              )}
              
              {accountType === 'FHSA' && (
                <>
                  <p className="flex items-center">
                    <LucideIcons.Check className="text-green-500 mr-2" size={16} />
                    Tax-deductible contributions (like an RRSP)
                  </p>
                  <p className="flex items-center">
                    <LucideIcons.Check className="text-green-500 mr-2" size={16} />
                    Tax-free withdrawals for first home purchase (like a TFSA)
                  </p>
                  <p className="flex items-center">
                    <LucideIcons.Check className="text-green-500 mr-2" size={16} />
                    Option to transfer to RRSP or RRIF if not used for home purchase
                  </p>
                  <p className="flex items-center">
                    <LucideIcons.Minus className="text-red-500 mr-2" size={16} />
                    $40,000 lifetime contribution limit
                  </p>
                </>
              )}
              
              {accountType === 'RESP' && (
                <>
                  <p className="flex items-center">
                    <LucideIcons.Check className="text-green-500 mr-2" size={16} />
                    Government grants of 20% on contributions (CESG) up to $500/year
                  </p>
                  <p className="flex items-center">
                    <LucideIcons.Check className="text-green-500 mr-2" size={16} />
                    Tax-deferred growth until withdrawal
                  </p>
                  <p className="flex items-center">
                    <LucideIcons.Check className="text-green-500 mr-2" size={16} />
                    Withdrawals taxed in the student's hands (typically low or no tax)
                  </p>
                  <p className="flex items-center">
                    <LucideIcons.Minus className="text-red-500 mr-2" size={16} />
                    Contributions are not tax-deductible
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
              <label htmlFor="merFee" className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                Management Expense Ratio (%)
                <button 
                  className="ml-1 text-gray-400 hover:text-gray-600 focus:outline-none"
                  onClick={() => setShowTooltip('merFee')}
                >
                  <LucideIcons.HelpCircle size={16} />
                </button>
              </label>
              {showTooltip === 'merFee' && (
                <div className="absolute z-10 mt-2 w-64 p-3 bg-gray-800 text-white text-xs rounded shadow-lg">
                  {tooltipContent.merFee}
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
                id="merFee"
                className="focus:ring-black focus:border-black block w-full pr-12 sm:text-sm border-gray-300 rounded-md p-2 border"
                value={merFee}
                onChange={(e) => setMerFee(Number(e.target.value))}
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
            <h3 className="text-md font-medium text-gray-700 mb-4">Canadian Fund Fee Benchmarks</h3>
            
            <div className="space-y-3 text-sm">
              <div className="flex justify-between items-center">
                <span>Index ETFs:</span>
                <span className="font-medium">0.05% - 0.25%</span>
              </div>
              <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden">
                <div className="bg-green-500 h-1.5 rounded-full" style={{ width: '10%' }}></div>
              </div>
              
              <div className="flex justify-between items-center">
                <span>e-Series Funds:</span>
                <span className="font-medium">0.25% - 0.50%</span>
              </div>
              <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden">
                <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: '20%' }}></div>
              </div>
              
              <div className="flex justify-between items-center">
                <span>Robo-Advisors:</span>
                <span className="font-medium">0.50% - 0.80%</span>
              </div>
              <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden">
                <div className="bg-yellow-500 h-1.5 rounded-full" style={{ width: '30%' }}></div>
              </div>
              
              <div className="flex justify-between items-center">
                <span>Actively Managed Funds:</span>
                <span className="font-medium">1.00% - 2.50%</span>
              </div>
              <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden">
                <div className="bg-red-500 h-1.5 rounded-full" style={{ width: '80%' }}></div>
              </div>
              
              <div className="flex justify-between items-center">
                <span>Your MER:</span>
                <span className={`font-medium ${
                  merFee <= 0.25 ? 'text-green-600' : 
                  merFee <= 0.50 ? 'text-blue-600' : 
                  merFee <= 1.00 ? 'text-yellow-600' : 'text-red-600'
                }`}>{merFee}%</span>
              </div>
              <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden">
                <div className={`h-1.5 rounded-full ${
                  merFee <= 0.25 ? 'bg-green-500' : 
                  merFee <= 0.50 ? 'bg-blue-500' : 
                  merFee <= 1.00 ? 'bg-yellow-500' : 'bg-red-500'
                }`} style={{ width: `${Math.min(merFee * 100 / 2.5, 100)}%` }}></div>
              </div>
              
              <p className="text-xs text-gray-500 mt-2">
                <strong>Note:</strong> The average Canadian mutual fund MER is approximately 2%, among the highest in the developed world.
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
          
          {/* Canadian-specific tax benefits info */}
          <div className="mt-8 bg-gray-50 p-6 rounded-lg">
            <h3 className="text-lg font-medium text-gray-700 mb-4">Canadian Tax-Efficient Investing</h3>
            
            <div className="space-y-4">
              <p>
                Making the most of Canadian tax-advantaged accounts can significantly improve your long-term investment returns:
              </p>
              
              <div className="grid md:grid-cols-3 gap-4">
                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <h4 className="font-medium text-gray-800 mb-2">TFSA (Tax-Free Savings Account)</h4>
                  <ul className="text-sm text-gray-600 space-y-1 list-disc pl-5">
                    <li>Annual contribution limit: {formatCurrency(contributionTFSALimit)}</li>
                    <li>Contribution room accumulates from age 18</li>
                    <li>Tax-free growth and withdrawals</li>
                    <li>Withdrawals add back contribution room</li>
                    <li>No tax deduction for contributions</li>
                  </ul>
                </div>
                
                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <h4 className="font-medium text-gray-800 mb-2">RRSP (Registered Retirement Savings Plan)</h4>
                  <ul className="text-sm text-gray-600 space-y-1 list-disc pl-5">
                  <li>18% of previous year's income (max {formatCurrency(contributionRRSPLimit)})</li>
                    <li>Tax-deferred growth</li>
                    <li>Tax deduction for contributions</li>
                    <li>Withdrawals taxed as income</li>
                    <li>Home Buyers' Plan allows tax-free borrowing</li>
                  </ul>
                </div>
                
                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <h4 className="font-medium text-gray-800 mb-2">FHSA (First Home Savings Account)</h4>
                  <ul className="text-sm text-gray-600 space-y-1 list-disc pl-5">
                    <li>Annual contribution limit: {formatCurrency(contributionFHSALimit)}</li>
                    <li>Lifetime limit: $40,000</li>
                    <li>Tax-deductible contributions (like RRSP)</li>
                    <li>Tax-free withdrawals for first home (like TFSA)</li>
                    <li>Unused amounts can transfer to RRSP/RRIF</li>
                  </ul>
                </div>
              </div>
              
              <p className="text-sm text-gray-600">
                <strong>Investment Strategy Tip:</strong> To maximize tax efficiency, consider prioritizing your accounts in this order: TFSA, RRSP (or FHSA if saving for a first home), and then non-registered accounts. Within non-registered accounts, focus on tax-efficient investments like Canadian dividend stocks and ETFs.
              </p>
              
              <div className="bg-white p-4 rounded-lg border border-gray-200 mt-4">
                <h4 className="font-medium text-gray-800 mb-2">Canadian Tax-Efficient ETF Options</h4>
                <div className="text-sm text-gray-600 space-y-1">
                  <p>Consider these low-cost Canadian ETFs to minimize your investment fees:</p>
                  <ul className="list-disc pl-5 mt-2">
                    <li><strong>Vanguard Canada:</strong> VEQT (All-Equity, 0.24% MER), VGRO (Growth, 0.24% MER), VBAL (Balanced, 0.24% MER)</li>
                    <li><strong>iShares:</strong> XEQT (All-Equity, 0.20% MER), XGRO (Growth, 0.20% MER), XBAL (Balanced, 0.20% MER)</li>
                    <li><strong>BMO:</strong> ZEQT (All-Equity, 0.20% MER), ZGRO (Growth, 0.20% MER), ZBAL (Balanced, 0.20% MER)</li>
                    <li><strong>Horizons:</strong> Tax-efficient ETFs with total return swaps for non-registered accounts (HXCN, HXDM, HXUS)</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <div className="mt-8 bg-white p-6 rounded-lg">
        <h3 className="text-xl font-semibold text-gray-700 mb-4">Understanding Investment Fees in Canada</h3>
        
        <div className="prose max-w-none">
          <p>
            Canadians pay some of the highest investment fees in the developed world, which can significantly impact long-term returns. Here's what you need to know about the common fees in Canadian investment accounts:
          </p>
          
          <h4>Types of Investment Fees in Canada</h4>
          <ul>
            <li><strong>Management Expense Ratio (MER):</strong> The annual fee charged by mutual funds and ETFs, ranging from as low as 0.05% for index ETFs to over 2.5% for some actively managed mutual funds. The average Canadian mutual fund MER is approximately 2%.</li>
            <li><strong>Trading Expense Ratio (TER):</strong> The costs associated with a fund's trading activities, typically 0.01% to 0.2% annually.</li>
            <li><strong>Front-Load and Back-Load Fees:</strong> Some mutual funds charge an upfront commission (front-load) or a redemption fee (back-load/deferred sales charge).</li>
            <li><strong>Advisory Fees:</strong> Additional fees charged by financial advisors or robo-advisors, typically 0.5% to 1.5% annually.</li>
            <li><strong>Trading Commissions:</strong> Fees for buying and selling stocks or ETFs, ranging from $0 to $10 per trade at major brokerages.</li>
            <li><strong>Account Fees:</strong> Annual administration fees charged by some brokerages, particularly for registered accounts like RRSPs.</li>
          </ul>
          
          <h4>The Impact of Canadian Investment Fees</h4>
          <p>
            A 2% MER may seem small, but over a 25-year period, it can reduce your portfolio value by 40% or more compared to a low-cost alternative. Canadian investors who switch from high-fee mutual funds to low-cost ETFs often see dramatic improvements in their long-term returns.
          </p>
          
          <h4>How to Minimize Investment Fees in Canada</h4>
          <ul>
            <li>Choose low-cost index ETFs instead of actively managed mutual funds</li>
            <li>Consider DIY investing through discount brokerages instead of full-service advisors</li>
            <li>If you need advice, consider a fee-based advisor or robo-advisor instead of commission-based ones</li>
            <li>Use all-in-one ETFs to reduce trading costs and simplify portfolio management</li>
            <li>Take advantage of no-commission ETF trading offered by some brokerages</li>
            <li>Consider Horizons swap-based ETFs for tax-efficient non-registered investing</li>
          </ul>
          
          <h4>Major Canadian Discount Brokerages</h4>
          <ul>
            <li><strong>Questrade:</strong> Free ETF purchases, $4.95-$9.95 for stock trades</li>
            <li><strong>Wealthsimple Trade:</strong> Commission-free stock and ETF trading</li>
            <li><strong>National Bank Direct Brokerage:</strong> Commission-free stock and ETF trading</li>
            <li><strong>TD Direct Investing:</strong> $9.99 per trade, free TD e-Series mutual funds</li>
            <li><strong>RBC Direct Investing:</strong> $9.95 per trade</li>
            <li><strong>BMO InvestorLine:</strong> $9.95 per trade</li>
          </ul>
          
          <p>
            By being fee-conscious and making informed choices, you can potentially add hundreds of thousands of dollars to your retirement savings over your lifetime.
          </p>
        </div>
      </div>
    </div>
  );
};

export default CAFeeCalculator;